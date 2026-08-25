from dotenv import load_dotenv
load_dotenv()

import os
import re
import logging
import uuid
import asyncio
import ipaddress
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import List, Optional
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse

import bcrypt
import jwt
import httpx
import requests
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, UploadFile, File
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pydantic import BaseModel, Field, EmailStr

ROOT_DIR = Path(__file__).parent

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_ALGORITHM = "HS256"

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI()
api = APIRouter(prefix="/api")

# --------------------------------------------------------------------------- #
#  AUTH HELPERS
# --------------------------------------------------------------------------- #

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(hours=12), "type": "access"}
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)

def set_auth_cookie(response: Response, token: str):
    response.set_cookie(key="access_token", value=token, httponly=True, secure=True,
                        samesite="none", max_age=43200, path="/")

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Non autenticato")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token non valido")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="Utente non trovato")
        return {"id": str(user["_id"]), "email": user["email"], "name": user.get("name"), "role": user.get("role")}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sessione scaduta")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token non valido")

# --------------------------------------------------------------------------- #
#  EMAIL (Emergent-managed Resend) — guardrail gate + async send
# --------------------------------------------------------------------------- #

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "Centro Lombardia Unihockey")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)

def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)

def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)

class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []
    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []
    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)
    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []

def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan(); scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")

async def send_email(*, to: str, subject: str, html: str) -> Optional[str]:
    if not EMAIL_KEY:
        logger.warning("EMERGENT_EMAIL_KEY not set — skipping email send")
        return None
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    try:
        async with httpx.AsyncClient(timeout=30) as c:
            resp = await c.post(f"{EMAIL_BASE_URL}/api/v1/email/send",
                                headers={"X-Email-Key": EMAIL_KEY}, json=payload)
        resp.raise_for_status()
        return resp.json().get("id")
    except Exception as e:
        logger.error(f"Email send error: {e}")
        return None

def _notify_html(title: str, rows: List[tuple]) -> str:
    cells = "".join(
        f'<tr><td style="padding:6px 12px;color:#888;font-family:Arial,sans-serif;font-size:13px">{escape(str(k))}</td>'
        f'<td style="padding:6px 12px;color:#111;font-family:Arial,sans-serif;font-size:14px"><strong>{escape(str(v))}</strong></td></tr>'
        for k, v in rows)
    return (f'<table role="presentation" width="100%"><tr><td style="padding:24px;font-family:Arial,sans-serif">'
            f'<h2 style="color:#4C1D95;margin:0 0 4px">{escape(title)}</h2>'
            f'<p style="color:#666;font-size:14px;margin:0 0 16px">Nuova richiesta dal sito.</p>'
            f'<table role="presentation" style="border-collapse:collapse;background:#f7f7f9;border-radius:8px">{cells}</table>'
            f'<p style="font-size:12px;color:#999;margin-top:20px">Inviata da {escape(EMAIL_FROM_NAME)}. '
            f'Non chiediamo mai password o dati di pagamento via email.</p></td></tr></table>')

async def notification_recipient() -> Optional[str]:
    settings = await db.site_settings.find_one({"key": "main"}, {"_id": 0})
    email = (settings or {}).get("notification_email", "").strip() if settings else ""
    return email or None

# --------------------------------------------------------------------------- #
#  OBJECT STORAGE (Emergent-managed)
# --------------------------------------------------------------------------- #

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "clu"
_storage_key = None

MIME_TYPES = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
              "gif": "image/gif", "webp": "image/webp", "svg": "image/svg+xml"}

def init_storage(force: bool = False):
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type},
                        data=data, timeout=120)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                            headers={"X-Storage-Key": key, "Content-Type": content_type},
                            data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# --------------------------------------------------------------------------- #
#  MODELS
# --------------------------------------------------------------------------- #

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TrialRequestIn(BaseModel):
    nome: str
    eta: str
    telefono: str
    email: EmailStr
    corso: str
    privacy: bool = True

class SponsorLeadIn(BaseModel):
    nome: str
    azienda: str
    email: EmailStr
    telefono: str
    pacchetto: str
    messaggio: Optional[str] = ""

class Team(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str
    categoria: str = ""
    descrizione: str = ""
    allenatore: str = ""
    allenamenti: str = ""
    contatto: str = ""
    image_url: str = ""
    order: int = 0

class Course(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    categoria: str
    eta: str = ""
    giorni: str = ""
    orari: str = ""
    luogo: str = ""
    order: int = 0

class Sponsor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str
    logo_url: str = ""
    link: str = ""
    order: int = 0

# --------------------------------------------------------------------------- #
#  DEFAULT CONTENT (placeholders — editable from CMS)
# --------------------------------------------------------------------------- #

DEFAULT_SETTINGS = {
    "key": "main",
    "logo_url": "https://customer-assets-gfyr7b9c.emergentagent.net/job_play-fast-together/artifacts/683xcuag_image.png",
    "hero": {
        "line1": "IL FLOORBALL",
        "line2": "HA UNA NUOVA",
        "line3": "CASA.",
        "subtitle": "CENTRO LOMBARDIA UNIHOCKEY",
        "microcopy": "Velocità. Tecnica. Squadra.",
        "cta_primary": "VIENI A PROVARE",
        "cta_secondary": "SCOPRI IL CLUB",
        "image_url": "https://images.pexels.com/photos/35280849/pexels-photo-35280849.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1080",
        "video_url": "",
    },
    "manifesto": {
        "line1": "NON È HOCKEY.",
        "line2": "NON È CALCIO.",
        "line3": "È FLOORBALL.",
        "body": "Uno degli sport di squadra più veloci al mondo. E in Lombardia stiamo costruendo qualcosa di nuovo.",
        "cta": "SCOPRI IL FLOORBALL",
    },
    "about": {
        "label": "WHO WE ARE / 01",
        "line1": "UNA SQUADRA.",
        "line2": "UNA COMMUNITY.",
        "line3": "UN'IDEA GRANDE.",
        "body": "Centro Lombardia Unihockey nasce per far crescere il floorball sul territorio e costruire una community aperta a bambini, ragazzi e adulti.",
        "image_url": "https://images.pexels.com/photos/29804128/pexels-photo-29804128.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1080",
    },
    "stats": [
        {"value": "5", "label": "SQUADRE"},
        {"value": "5", "label": "SEDI DI GIOCO"},
        {"value": "A2", "label": "SERIE NAZIONALE"},
        {"value": "1", "label": "COMMUNITY"},
    ],
    "gioca": {
        "line1": "LA TUA PRIMA",
        "line2": "PARTITA INIZIA QUI.",
        "body": "Non hai mai giocato a floorball? Perfetto. Vieni a provarlo.",
    },
    "emotional": {
        "line1": "UNA COMMUNITY",
        "line2": "NON SI GUARDA.",
        "line3": "SI VIVE.",
        "image_url": "https://images.pexels.com/photos/7151514/pexels-photo-7151514.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1080",
    },
    "sponsor": {
        "headline": "PLAY WITH US.",
        "subheadline": "Entra nel progetto. Cresci insieme al floorball lombardo.",
        "body": "Creiamo partnership con aziende che vogliono sostenere sport, territorio, giovani e community.",
    },
    "social": {
        "headline": "OFF THE FIELD.",
        "items": [
            {"image_url": "https://images.unsplash.com/photo-1655555044588-912861846347?crop=entropy&cs=srgb&fm=jpg&q=85&w=600", "link": ""},
            {"image_url": "https://images.pexels.com/photos/6468601/pexels-photo-6468601.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800", "link": ""},
            {"image_url": "https://images.unsplash.com/photo-1582556543861-2ffa150e771a?crop=entropy&cs=srgb&fm=jpg&q=85&w=600", "link": ""},
            {"image_url": "https://images.unsplash.com/photo-1623428454672-e9c6baec8c65?crop=entropy&cs=srgb&fm=jpg&q=85&w=600", "link": ""},
        ],
    },
    "contacts": {
        "email": "lorialefloorball@gmail.com",
        "phone": "+39 347 983 1209",
        "whatsapp": "393479831209",
        "address": "Lecco · Bergamo, Lombardia",
        "gyms": [
            {"name": "Istituto Caterina Cittadini — Calolziocorte", "address": "Ingresso da Via Volta, Calolziocorte (LC)"},
            {"name": "Palacalcetto — Brembate di Sopra", "address": "Via Bruno Locatelli 36, Brembate di Sopra (BG)"},
            {"name": "Palazzetto dello Sport — Olgiate Molgora", "address": "Via Aldo Moro 1, Olgiate Molgora (LC)"},
            {"name": "Centro Polivalente — Monte Marenzo", "address": "Via Colombara, Monte Marenzo (LC)"},
            {"name": "Palestra Scuole Medie — Cisano Bergamasco", "address": "Via S. Domenico Savio, Cisano Bergamasco (BG)"},
        ],
    },
    "socials": {
        "instagram": "https://www.instagram.com/asd_centrolombardiaunihockey",
        "tiktok": "https://www.tiktok.com/@alessandro.bonanomi",
        "youtube": "https://youtube.com/@centrolombardiaunihockey",
        "facebook": "",
    },
    "notification_email": "lorialefloorball@gmail.com",
}

DEFAULT_TEAMS = [
    {"id": str(uuid.uuid4()), "nome": "SENIOR", "categoria": "Serie A2 · Prima squadra", "descrizione": "La prima squadra del club, impegnata nel campionato nazionale di Serie A2.", "allenatore": "Da definire", "allenamenti": "Da definire", "contatto": "", "image_url": "https://images.pexels.com/photos/35280849/pexels-photo-35280849.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800", "order": 0},
    {"id": str(uuid.uuid4()), "nome": "UNDER 19", "categoria": "Giovanile", "descrizione": "Il salto verso il senior: intensità, tecnica e responsabilità. Anche 3v3 femminile.", "allenatore": "Da definire", "allenamenti": "Da definire", "contatto": "", "image_url": "https://images.pexels.com/photos/6468601/pexels-photo-6468601.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800", "order": 1},
    {"id": str(uuid.uuid4()), "nome": "UNDER 16", "categoria": "Giovanile", "descrizione": "Crescita agonistica e spirito di squadra tra le categorie giovanili.", "allenatore": "Da definire", "allenamenti": "Da definire", "contatto": "", "image_url": "https://images.unsplash.com/photo-1582556543861-2ffa150e771a?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200", "order": 2},
    {"id": str(uuid.uuid4()), "nome": "UNDER 13", "categoria": "Giovanile · 5v5 & 3v3", "descrizione": "Campionato Lombardia (5v5) e Nord Italia (3v3): il cuore del vivaio.", "allenatore": "Da definire", "allenamenti": "Da definire", "contatto": "", "image_url": "https://images.pexels.com/photos/29804128/pexels-photo-29804128.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800", "order": 3},
    {"id": str(uuid.uuid4()), "nome": "UNDER 11", "categoria": "Minifloorball · 3v3", "descrizione": "Il primo approccio al gioco: divertimento, movimento e fondamentali.", "allenatore": "Da definire", "allenamenti": "Da definire", "contatto": "", "image_url": "https://images.unsplash.com/photo-1655555044588-912861846347?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200", "order": 4},
]

DEFAULT_COURSES = [
    {"id": str(uuid.uuid4()), "categoria": "CALOLZIOCORTE", "eta": "Avviamento", "giorni": "Lunedì", "orari": "17.00–18.30", "luogo": "Istituto Caterina Cittadini · ingresso da Via Volta", "order": 0},
    {"id": str(uuid.uuid4()), "categoria": "BREMBATE DI SOPRA", "eta": "Tutti i livelli", "giorni": "Martedì", "orari": "17.30–19.00", "luogo": "Palacalcetto · Via Bruno Locatelli 36", "order": 1},
    {"id": str(uuid.uuid4()), "categoria": "OLGIATE MOLGORA", "eta": "Tutti i livelli", "giorni": "Mercoledì", "orari": "17.00–18.30", "luogo": "Palazzetto dello Sport · Via Aldo Moro 1", "order": 2},
    {"id": str(uuid.uuid4()), "categoria": "MONTE MARENZO", "eta": "Avviamento · Avanzato", "giorni": "Giovedì", "orari": "17.00–18.30 / 18.30–20.00", "luogo": "Centro Polivalente · Via Colombara", "order": 3},
    {"id": str(uuid.uuid4()), "categoria": "CISANO BERGAMASCO", "eta": "Avviamento · Avanzato", "giorni": "Venerdì", "orari": "17.00–18.30 / 18.30–20.00", "luogo": "Palestra Scuole Medie · Via S. Domenico Savio", "order": 4},
]

# --------------------------------------------------------------------------- #
#  PUBLIC ENDPOINTS
# --------------------------------------------------------------------------- #

@api.get("/")
async def root():
    return {"message": "Centro Lombardia Unihockey API"}

@api.get("/content")
async def get_content():
    settings = await db.site_settings.find_one({"key": "main"}, {"_id": 0}) or DEFAULT_SETTINGS
    settings.pop("notification_email", None)
    teams = await db.teams.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    courses = await db.courses.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    sponsors = await db.sponsors.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return {"settings": settings, "teams": teams, "courses": courses, "sponsors": sponsors}

@api.post("/trial-requests")
async def create_trial_request(payload: TrialRequestIn):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["status"] = "new"
    await db.trial_requests.insert_one(dict(doc))
    doc.pop("_id", None)
    recipient = await notification_recipient()
    if recipient:
        html = _notify_html("Nuova richiesta PROVA GRATUITA", [
            ("Nome", payload.nome), ("Età", payload.eta), ("Telefono", payload.telefono),
            ("Email", payload.email), ("Corso", payload.corso)])
        await send_email(to=recipient, subject="Nuova richiesta di prova — Centro Lombardia Unihockey", html=html)
    return {"status": "ok", "message": "Richiesta ricevuta"}

@api.post("/sponsor-leads")
async def create_sponsor_lead(payload: SponsorLeadIn):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["status"] = "new"
    await db.sponsor_leads.insert_one(dict(doc))
    doc.pop("_id", None)
    recipient = await notification_recipient()
    if recipient:
        html = _notify_html("Nuovo lead SPONSOR", [
            ("Nome", payload.nome), ("Azienda", payload.azienda), ("Email", payload.email),
            ("Telefono", payload.telefono), ("Pacchetto", payload.pacchetto),
            ("Messaggio", payload.messaggio or "-")])
        await send_email(to=recipient, subject="Nuovo lead sponsor — Centro Lombardia Unihockey", html=html)
    return {"status": "ok", "message": "Richiesta ricevuta"}

# --------------------------------------------------------------------------- #
#  AUTH ENDPOINTS
# --------------------------------------------------------------------------- #

@api.post("/auth/login")
async def login(payload: LoginIn, response: Response, request: Request):
    email = payload.email.lower().strip()
    ident = f"{request.client.host}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": ident})
    if attempt and attempt.get("count", 0) >= 5:
        locked_until = attempt.get("locked_until")
        if locked_until and datetime.fromisoformat(locked_until) > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail="Troppi tentativi. Riprova tra qualche minuto.")
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        new_count = (attempt.get("count", 0) if attempt else 0) + 1
        await db.login_attempts.update_one(
            {"identifier": ident},
            {"$set": {"count": new_count,
                      "locked_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat() if new_count >= 5 else None}},
            upsert=True)
        raise HTTPException(status_code=401, detail="Credenziali non valide")
    await db.login_attempts.delete_one({"identifier": ident})
    token = create_access_token(str(user["_id"]), email)
    set_auth_cookie(response, token)
    return {"id": str(user["_id"]), "email": email, "name": user.get("name"), "role": user.get("role")}

@api.post("/auth/logout")
async def logout(response: Response, user=Depends(get_current_user)):
    response.delete_cookie("access_token", path="/")
    return {"status": "ok"}

@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user

# --------------------------------------------------------------------------- #
#  ADMIN ENDPOINTS
# --------------------------------------------------------------------------- #

@api.get("/admin/settings")
async def admin_get_settings(user=Depends(get_current_user)):
    return await db.site_settings.find_one({"key": "main"}, {"_id": 0}) or DEFAULT_SETTINGS

@api.put("/admin/settings")
async def admin_update_settings(data: dict, user=Depends(get_current_user)):
    data["key"] = "main"
    data.pop("_id", None)
    await db.site_settings.update_one({"key": "main"}, {"$set": data}, upsert=True)
    return await db.site_settings.find_one({"key": "main"}, {"_id": 0})

@api.post("/admin/upload")
async def admin_upload(file: UploadFile = File(...), user=Depends(get_current_user)):
    ext = (file.filename.rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else "png")
    content_type = file.content_type or MIME_TYPES.get(ext, "application/octet-stream")
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Sono ammesse solo immagini")
    data = await file.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Immagine troppo grande (max 8MB)")
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    try:
        result = await asyncio.to_thread(put_object, path, data, content_type)
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=502, detail="Upload non riuscito")
    stored_path = result.get("path", path)
    await db.files.insert_one({
        "id": str(uuid.uuid4()), "storage_path": stored_path,
        "original_filename": file.filename, "content_type": content_type,
        "size": result.get("size", len(data)), "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"url": f"/api/files/{stored_path}", "path": stored_path}

@api.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    try:
        data, content_type = await asyncio.to_thread(get_object, path)
    except Exception:
        raise HTTPException(status_code=404, detail="File non trovato")
    ct = (record or {}).get("content_type") or content_type
    return Response(content=data, media_type=ct, headers={"Cache-Control": "public, max-age=31536000"})

def _crud(collection: str, model):
    r = APIRouter()

    @r.get("")
    async def list_items(user=Depends(get_current_user)):
        return await db[collection].find({}, {"_id": 0}).sort("order", 1).to_list(200)

    @r.post("")
    async def create_item(item: model, user=Depends(get_current_user)):
        doc = item.model_dump()
        await db[collection].insert_one(dict(doc))
        doc.pop("_id", None)
        return doc

    @r.put("/{item_id}")
    async def update_item(item_id: str, data: dict, user=Depends(get_current_user)):
        data.pop("_id", None)
        data.pop("id", None)
        await db[collection].update_one({"id": item_id}, {"$set": data})
        return await db[collection].find_one({"id": item_id}, {"_id": 0})

    @r.delete("/{item_id}")
    async def delete_item(item_id: str, user=Depends(get_current_user)):
        await db[collection].delete_one({"id": item_id})
        return {"status": "ok"}

    return r

api.include_router(_crud("teams", Team), prefix="/admin/teams")
api.include_router(_crud("courses", Course), prefix="/admin/courses")
api.include_router(_crud("sponsors", Sponsor), prefix="/admin/sponsors")

@api.get("/admin/trial-requests")
async def admin_trials(user=Depends(get_current_user)):
    return await db.trial_requests.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

@api.get("/admin/sponsor-leads")
async def admin_leads(user=Depends(get_current_user)):
    return await db.sponsor_leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

# --------------------------------------------------------------------------- #
#  STARTUP
# --------------------------------------------------------------------------- #

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.teams.create_index("id")
    await db.courses.create_index("id")
    await db.sponsors.create_index("id")

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({"email": admin_email, "password_hash": hash_password(admin_password),
                                   "name": "Admin", "role": "admin", "created_at": datetime.now(timezone.utc).isoformat()})
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    if await db.site_settings.find_one({"key": "main"}) is None:
        await db.site_settings.insert_one(dict(DEFAULT_SETTINGS))
    else:
        existing_settings = await db.site_settings.find_one({"key": "main"})
        if not existing_settings.get("logo_url"):
            await db.site_settings.update_one({"key": "main"}, {"$set": {"logo_url": DEFAULT_SETTINGS["logo_url"]}})
    if await db.teams.count_documents({}) == 0:
        await db.teams.insert_many([dict(t) for t in DEFAULT_TEAMS])
    if await db.courses.count_documents({}) == 0:
        await db.courses.insert_many([dict(c) for c in DEFAULT_COURSES])
    try:
        await asyncio.to_thread(init_storage)
        logger.info("Object storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    logger.info("Startup complete — admin seeded, content ready")

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
