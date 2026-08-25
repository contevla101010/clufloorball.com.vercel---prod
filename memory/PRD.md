# PRD — ASD Centro Lombardia Unihockey (Floorball)

## Original problem statement
Build the new official website for ASD Centro Lombardia Unihockey — a young, ambitious floorball club (Lecco / Lombardia). Concept: "Small website, huge presence." Dark, cinematic, huge typography, motion-driven, mobile-first, conversion-focused. Concept words: SPEED · ENERGY · COMMUNITY. Primary color purple. Signature "ball trail" line. Simple CMS + minimal DB. No invented data — placeholders where real data is missing. Language: Italian with occasional English headlines.

## Architecture
- **Frontend**: React 19 + Tailwind + framer-motion (scroll reveals, mask line reveals, counters, parallax) + Lenis (smooth scroll). Single-page scrolling homepage with anchored nav (#club/#squadre/#gioca/#sponsor/#contatti). Custom cursor, glowing SVG ball trail, noise overlay, editorial marquee. Admin at /admin (CMS) + /admin/login.
- **Backend**: FastAPI + MongoDB (motor). JWT cookie auth (httpOnly), admin seeded from env. Resend (Emergent-managed) email notifications for trial & sponsor forms (recipient set in CMS).
- **DB collections**: users, site_settings (single "main" doc), teams, courses, sponsors, trial_requests, sponsor_leads, login_attempts.

## Auth / credentials
- Admin: admin@centrolombardia.it / Floorball2026! (see /app/memory/test_credentials.md). Seeded on startup from backend/.env.

## User personas
- Ragazzo/atleta → "voglio provarlo"; Genitore → "sembrano seri"; Azienda → "progetto interessante"; Altre società → "fanno sul serio".

## Core requirements (static)
- Hero 100svh, Manifesto, Chi siamo, Numeri (counter), Squadre (editorial grid + mobile swipe + dialog), Gioca + Trial form (<30s), Momento emozionale, Sponsor (Bronze/Silver/Gold + exclusive Diamond), Partner wall (hidden if empty), Social wall, Final CTA, Footer, floating WhatsApp. SEO (title/meta/OG/JSON-LD, local keywords Lecco/Lombardia).

## Implemented (2026-08-24)
- Full homepage experience with all sections + signature motion (mask reveals, ball trail, counters, parallax, custom cursor, marquee).
- Public APIs: GET /api/content, POST /api/trial-requests, POST /api/sponsor-leads (both save to DB + optional email notification).
- Auth APIs: login/logout/me (JWT httpOnly cookie, brute-force lockout).
- Admin CMS (tabs): Contenuti (all site text/images/stats/contacts/socials/notification email), Squadre CRUD, Corsi CRUD, Partner CRUD, Richieste prova (read), Lead sponsor (read).
- Seeded placeholder content (teams/courses/stats/images) clearly editable via CMS. No invented real data.
- Verified: backend curl (login→me→admin, public forms save & appear in CMS, 401 unauth); screenshots (hero, manifesto, gioca+trial form, squadre, sponsor, admin login, dashboard, mobile hero).

## Notes / mocked
- Email notifications: Resend integrated; recipient is EMPTY by default → set in CMS → Contenuti → "Email notifiche" to enable sending. Until set, requests are only saved to DB (no email). NOT mocked — real send once recipient is configured.
- Placeholder stock photos & example numbers/teams/courses are placeholders to be replaced by the admin. Logo not yet uploaded (temporary purple palette + "C" mark).

## Implemented (2026-08-25)
- Official logo integrated (header circular crest + footer). Real brand colors applied: purple primary, ORANGE (#F5A623) secondary used as the "ball trail" accent per brief.
- Object storage image upload in CMS: protected POST /api/admin/upload (image-only, 8MB max) + public GET /api/files/{path}. ImageUpload component (thumbnail + upload + URL fallback) wired into all image fields (logo, hero, about, emotional, social wall, team photo, sponsor logo). Verified end-to-end via curl (upload 200, serve 200, unauth 401).

## Backlog / next (P1/P2)
- P1: Replace placeholders with real logo (extract real brand colors), real photos/video, real numbers/teams/courses/gyms/WhatsApp/socials.
- P2: Instagram/TikTok live feed for social wall; image upload in CMS (object storage) instead of URLs; multi-image team galleries; cookie/privacy policy pages.
- Future (modular, not now): News, Match Center, Shop, Academy, Membership, Statistiche, Ticketing, Eventi.
