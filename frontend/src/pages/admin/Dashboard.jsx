import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, Plus, Trash2, Save } from "lucide-react";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/site/ImageUpload";

const inputCls =
  "w-full rounded-none border border-white/10 bg-brand-ink px-3 py-2 font-manrope text-sm text-brand-off focus:border-brand-electric focus:outline-none";
const btn =
  "inline-flex items-center gap-2 rounded-none bg-brand-electric px-4 py-2 font-manrope text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-brand-ink";
const btnGhost =
  "inline-flex items-center gap-2 rounded-none border border-white/15 px-4 py-2 font-manrope text-xs font-bold uppercase tracking-widest text-brand-off transition-colors hover:border-brand-electric";

const Field = ({ label, value, onChange, area }) => (
  <label className="block">
    <span className="mb-1 block font-manrope text-[11px] uppercase tracking-widest text-brand-off/50">{label}</span>
    {area ? (
      <textarea rows={3} className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    ) : (
      <input className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    )}
  </label>
);

const setPath = (obj, path, value) => {
  const clone = structuredClone(obj);
  const keys = path.split(".");
  let cur = clone;
  for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
  cur[keys[keys.length - 1]] = value;
  return clone;
};

// ---------------- Settings editor ----------------
const SettingsEditor = () => {
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/admin/settings").then(({ data }) => setS(data)).catch((e) => toast.error(formatApiError(e.response?.data?.detail)));
  }, []);

  if (!s) return <p className="font-manrope text-brand-off/50">Caricamento…</p>;

  const f = (path) => (val) => setS((prev) => setPath(prev, path, val));
  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/admin/settings", s);
      setS(data);
      toast.success("Contenuti salvati");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  const Group = ({ title, children }) => (
    <div className="border border-white/10 bg-brand-ink2 p-5">
      <h3 className="mb-4 font-anton text-lg uppercase text-brand-electric">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6 pb-24">
      <Group title="Generale">
        <ImageUpload label="Logo" value={s.logo_url} onChange={f("logo_url")} />
        <Field label="Email notifiche (richieste)" value={s.notification_email} onChange={f("notification_email")} />
      </Group>

      <Group title="Hero">
        <Field label="Riga 1" value={s.hero.line1} onChange={f("hero.line1")} />
        <Field label="Riga 2" value={s.hero.line2} onChange={f("hero.line2")} />
        <Field label="Riga 3" value={s.hero.line3} onChange={f("hero.line3")} />
        <Field label="Sottotitolo" value={s.hero.subtitle} onChange={f("hero.subtitle")} />
        <Field label="Microcopy" value={s.hero.microcopy} onChange={f("hero.microcopy")} />
        <Field label="CTA primaria" value={s.hero.cta_primary} onChange={f("hero.cta_primary")} />
        <Field label="CTA secondaria" value={s.hero.cta_secondary} onChange={f("hero.cta_secondary")} />
        <ImageUpload label="Immagine hero" value={s.hero.image_url} onChange={f("hero.image_url")} />
        <Field label="Video URL (opzionale)" value={s.hero.video_url} onChange={f("hero.video_url")} />
      </Group>

      <Group title="Numeri">
        {(s.stats || []).map((st, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
            <Field label="Valore" value={st.value} onChange={f(`stats.${i}.value`)} />
            <Field label="Etichetta" value={st.label} onChange={f(`stats.${i}.label`)} />
            <button className={btnGhost} onClick={() => setS((p) => ({ ...p, stats: p.stats.filter((_, x) => x !== i) }))}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button className={btnGhost} onClick={() => setS((p) => ({ ...p, stats: [...(p.stats || []), { value: "0", label: "NUOVO" }] }))}>
          <Plus size={14} /> Aggiungi numero
        </button>
      </Group>

      <Group title="Manifesto">
        <Field label="Riga 1" value={s.manifesto.line1} onChange={f("manifesto.line1")} />
        <Field label="Riga 2" value={s.manifesto.line2} onChange={f("manifesto.line2")} />
        <Field label="Riga 3" value={s.manifesto.line3} onChange={f("manifesto.line3")} />
        <Field label="Testo" value={s.manifesto.body} onChange={f("manifesto.body")} area />
        <Field label="CTA" value={s.manifesto.cta} onChange={f("manifesto.cta")} />
      </Group>

      <Group title="Chi siamo">
        <Field label="Label" value={s.about.label} onChange={f("about.label")} />
        <Field label="Riga 1" value={s.about.line1} onChange={f("about.line1")} />
        <Field label="Riga 2" value={s.about.line2} onChange={f("about.line2")} />
        <Field label="Riga 3" value={s.about.line3} onChange={f("about.line3")} />
        <Field label="Testo" value={s.about.body} onChange={f("about.body")} area />
        <ImageUpload label="Immagine chi siamo" value={s.about.image_url} onChange={f("about.image_url")} />
      </Group>

      <Group title="Gioca">
        <Field label="Riga 1" value={s.gioca.line1} onChange={f("gioca.line1")} />
        <Field label="Riga 2" value={s.gioca.line2} onChange={f("gioca.line2")} />
        <Field label="Testo" value={s.gioca.body} onChange={f("gioca.body")} area />
      </Group>

      <Group title="Momento emozionale">
        <Field label="Riga 1" value={s.emotional.line1} onChange={f("emotional.line1")} />
        <Field label="Riga 2" value={s.emotional.line2} onChange={f("emotional.line2")} />
        <Field label="Riga 3" value={s.emotional.line3} onChange={f("emotional.line3")} />
        <ImageUpload label="Immagine emozionale" value={s.emotional.image_url} onChange={f("emotional.image_url")} />
      </Group>

      <Group title="Sponsor">
        <Field label="Headline" value={s.sponsor.headline} onChange={f("sponsor.headline")} />
        <Field label="Subheadline" value={s.sponsor.subheadline} onChange={f("sponsor.subheadline")} />
        <Field label="Testo" value={s.sponsor.body} onChange={f("sponsor.body")} area />
      </Group>

      <Group title="Social wall / Reel Instagram">
        <p className="md:col-span-2 -mt-2 font-manrope text-xs text-brand-off/50">
          Incolla l'URL di un reel/post Instagram (es. https://www.instagram.com/reel/XXXX/) per mostrarlo embeddato. Se lasci vuoto l'URL reel, viene usata l'immagine come tile cliccabile.
        </p>
        {(s.social?.items || []).map((it, i) => (
          <div key={i} className="border border-white/10 p-4 md:col-span-2">
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
              <Field label={`Reel ${i + 1} — URL Instagram`} value={it.ig_url} onChange={f(`social.items.${i}.ig_url`)} />
              <button className={`${btnGhost} md:mt-6`} onClick={() => setS((p) => ({ ...p, social: { ...p.social, items: p.social.items.filter((_, x) => x !== i) } }))}>
                <Trash2 size={14} /> Rimuovi
              </button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <ImageUpload label="Immagine cover (fallback)" value={it.image_url} onChange={f(`social.items.${i}.image_url`)} />
              <Field label="Link (se non usi embed)" value={it.link} onChange={f(`social.items.${i}.link`)} />
            </div>
          </div>
        ))}
        <button className={btnGhost} onClick={() => setS((p) => ({ ...p, social: { ...p.social, items: [...(p.social?.items || []), { ig_url: "", image_url: "", link: "" }] } }))}>
          <Plus size={14} /> Aggiungi reel / immagine
        </button>
      </Group>

      <Group title="Contatti">
        <Field label="Email" value={s.contacts.email} onChange={f("contacts.email")} />
        <Field label="Telefono" value={s.contacts.phone} onChange={f("contacts.phone")} />
        <Field label="WhatsApp (numero, es. 39...)" value={s.contacts.whatsapp} onChange={f("contacts.whatsapp")} />
        <Field label="Indirizzo" value={s.contacts.address} onChange={f("contacts.address")} />
        <div className="md:col-span-2">
          <span className="mb-2 block font-manrope text-[11px] uppercase tracking-widest text-brand-off/50">Palestre</span>
          {(s.contacts.gyms || []).map((g, i) => (
            <div key={i} className="mb-2 grid grid-cols-[1fr_1fr_auto] gap-2">
              <input className={inputCls} placeholder="Nome" value={g.name} onChange={(e) => f(`contacts.gyms.${i}.name`)(e.target.value)} />
              <input className={inputCls} placeholder="Indirizzo" value={g.address} onChange={(e) => f(`contacts.gyms.${i}.address`)(e.target.value)} />
              <button className={btnGhost} onClick={() => setS((p) => ({ ...p, contacts: { ...p.contacts, gyms: p.contacts.gyms.filter((_, x) => x !== i) } }))}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button className={btnGhost} onClick={() => setS((p) => ({ ...p, contacts: { ...p.contacts, gyms: [...(p.contacts.gyms || []), { name: "", address: "" }] } }))}>
            <Plus size={14} /> Aggiungi palestra
          </button>
        </div>
      </Group>

      <Group title="Social">
        <Field label="Instagram" value={s.socials.instagram} onChange={f("socials.instagram")} />
        <Field label="TikTok" value={s.socials.tiktok} onChange={f("socials.tiktok")} />
        <Field label="YouTube" value={s.socials.youtube} onChange={f("socials.youtube")} />
        <Field label="Facebook" value={s.socials.facebook} onChange={f("socials.facebook")} />
      </Group>

      <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-end border-t border-white/10 bg-brand-ink/90 px-5 py-4 backdrop-blur-xl md:px-8">
        <button className={btn} onClick={save} disabled={saving} data-testid="settings-save">
          <Save size={14} /> {saving ? "Salvataggio…" : "Salva contenuti"}
        </button>
      </div>
    </div>
  );
};

// ---------------- Generic CRUD ----------------
const CrudManager = ({ endpoint, fields, blank, title }) => {
  const [items, setItems] = useState([]);
  const load = useCallback(() => {
    api.get(`/admin/${endpoint}`).then(({ data }) => setItems(data)).catch((e) => toast.error(formatApiError(e.response?.data?.detail)));
  }, [endpoint]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    try {
      await api.post(`/admin/${endpoint}`, { ...blank, order: items.length });
      toast.success("Creato");
      load();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };
  const save = async (item) => {
    try {
      await api.put(`/admin/${endpoint}/${item.id}`, item);
      toast.success("Salvato");
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };
  const remove = async (id) => {
    try { await api.delete(`/admin/${endpoint}/${id}`); toast.success("Eliminato"); load(); }
    catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };
  const upd = (idx, key, val) => setItems((p) => p.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));

  return (
    <div className="space-y-5 pb-16">
      <div className="flex items-center justify-between">
        <h2 className="font-anton text-2xl uppercase text-brand-off">{title}</h2>
        <button className={btn} onClick={add} data-testid={`${endpoint}-add`}><Plus size={14} /> Aggiungi</button>
      </div>
      {items.map((item, idx) => (
        <div key={item.id} className="border border-white/10 bg-brand-ink2 p-5" data-testid={`${endpoint}-item`}>
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((fl) =>
              fl.type === "image" ? (
                <ImageUpload key={fl.key} label={fl.label} value={item[fl.key]} onChange={(v) => upd(idx, fl.key, v)} />
              ) : (
                <Field key={fl.key} label={fl.label} value={item[fl.key]} area={fl.area} onChange={(v) => upd(idx, fl.key, v)} />
              )
            )}
          </div>
          <div className="mt-4 flex gap-3">
            <button className={btn} onClick={() => save(item)}><Save size={14} /> Salva</button>
            <button className={btnGhost} onClick={() => remove(item.id)}><Trash2 size={14} /> Elimina</button>
          </div>
        </div>
      ))}
      {!items.length && <p className="font-manrope text-brand-off/50">Nessun elemento. Aggiungine uno.</p>}
    </div>
  );
};

// ---------------- Read-only leads ----------------
const LeadsTable = ({ endpoint, columns, title }) => {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api.get(`/admin/${endpoint}`).then(({ data }) => setRows(data)).catch((e) => toast.error(formatApiError(e.response?.data?.detail)));
  }, [endpoint]);
  return (
    <div className="pb-16">
      <h2 className="mb-5 font-anton text-2xl uppercase text-brand-off">{title} <span className="text-brand-electric">({rows.length})</span></h2>
      <div className="overflow-x-auto border border-white/10">
        <table className="w-full text-left font-manrope text-sm">
          <thead className="bg-brand-ink2 text-brand-off/50">
            <tr>{columns.map((c) => <th key={c.key} className="px-4 py-3 text-[11px] uppercase tracking-widest">{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-white/5 text-brand-off/85" data-testid={`${endpoint}-row`}>
                {columns.map((c) => <td key={c.key} className="px-4 py-3">{c.key === "created_at" ? new Date(r[c.key]).toLocaleString("it-IT") : r[c.key]}</td>)}
              </tr>
            ))}
            {!rows.length && <tr><td className="px-4 py-6 text-brand-off/40" colSpan={columns.length}>Nessuna richiesta.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-ink text-brand-off">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-brand-ink/80 px-5 py-4 backdrop-blur-xl md:px-8">
        <div>
          <span className="font-anton text-xl uppercase">CMS · Centro Lombardia</span>
          <span className="ml-3 font-manrope text-xs text-brand-off/40">{user?.email}</span>
        </div>
        <div className="flex gap-3">
          <a href="/" target="_blank" rel="noreferrer" className={btnGhost}>Vedi sito</a>
          <button className={btnGhost} onClick={async () => { await logout(); navigate("/admin/login"); }} data-testid="logout-btn">
            <LogOut size={14} /> Esci
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        <Tabs defaultValue="content">
          <TabsList className="mb-8 flex flex-wrap gap-2 bg-transparent p-0">
            {[
              ["content", "Contenuti"],
              ["teams", "Squadre"],
              ["courses", "Corsi"],
              ["sponsors", "Partner"],
              ["trials", "Richieste prova"],
              ["leads", "Lead sponsor"],
            ].map(([v, l]) => (
              <TabsTrigger
                key={v}
                value={v}
                data-testid={`tab-${v}`}
                className="rounded-none border border-white/10 px-4 py-2 font-manrope text-xs font-bold uppercase tracking-widest data-[state=active]:bg-brand-electric data-[state=active]:text-white"
              >
                {l}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="content"><SettingsEditor /></TabsContent>
          <TabsContent value="teams">
            <CrudManager
              endpoint="teams"
              title="Squadre"
              blank={{ nome: "NUOVA SQUADRA", categoria: "", descrizione: "", allenatore: "", allenamenti: "", contatto: "", image_url: "" }}
              fields={[
                { key: "nome", label: "Nome" },
                { key: "categoria", label: "Categoria" },
                { key: "descrizione", label: "Descrizione", area: true },
                { key: "allenatore", label: "Allenatore" },
                { key: "allenamenti", label: "Allenamenti" },
                { key: "image_url", label: "Foto squadra", type: "image" },
              ]}
            />
          </TabsContent>
          <TabsContent value="courses">
            <CrudManager
              endpoint="courses"
              title="Corsi"
              blank={{ categoria: "NUOVO CORSO", eta: "", giorni: "", orari: "", luogo: "" }}
              fields={[
                { key: "categoria", label: "Categoria" },
                { key: "eta", label: "Età" },
                { key: "giorni", label: "Giorni" },
                { key: "orari", label: "Orari" },
                { key: "luogo", label: "Luogo" },
              ]}
            />
          </TabsContent>
          <TabsContent value="sponsors">
            <CrudManager
              endpoint="sponsors"
              title="Partner attuali"
              blank={{ nome: "NUOVO PARTNER", logo_url: "", link: "" }}
              fields={[
                { key: "nome", label: "Nome" },
                { key: "logo_url", label: "Logo", type: "image" },
                { key: "link", label: "Link" },
              ]}
            />
          </TabsContent>
          <TabsContent value="trials">
            <LeadsTable
              endpoint="trial-requests"
              title="Richieste di prova"
              columns={[
                { key: "created_at", label: "Data" },
                { key: "nome", label: "Nome" },
                { key: "eta", label: "Età" },
                { key: "telefono", label: "Telefono" },
                { key: "email", label: "Email" },
                { key: "corso", label: "Corso" },
              ]}
            />
          </TabsContent>
          <TabsContent value="leads">
            <LeadsTable
              endpoint="sponsor-leads"
              title="Lead sponsor"
              columns={[
                { key: "created_at", label: "Data" },
                { key: "nome", label: "Nome" },
                { key: "azienda", label: "Azienda" },
                { key: "email", label: "Email" },
                { key: "telefono", label: "Telefono" },
                { key: "pacchetto", label: "Pacchetto" },
                { key: "messaggio", label: "Messaggio" },
              ]}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
