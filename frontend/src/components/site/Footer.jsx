import { Instagram, Youtube, Facebook } from "lucide-react";
import { scrollToId } from "@/lib/scroll";

const NAV = [
  { label: "Club", id: "club" },
  { label: "Squadre", id: "squadre" },
  { label: "Gioca", id: "gioca" },
  { label: "Sponsor", id: "sponsor" },
];

export const Footer = ({ settings }) => {
  const c = settings.contacts || {};
  const s = settings.socials || {};
  return (
    <footer id="contatti" className="relative border-t border-white/10 bg-brand-ink px-5 py-16 md:px-12 md:py-24">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          {settings.logo_url && (
            <img src={settings.logo_url} alt="Centro Lombardia Unihockey" className="mb-5 h-16 w-16 rounded-full object-cover" />
          )}
          <span className="font-anton text-3xl uppercase text-brand-off">Centro Lombardia</span>
          <p className="mt-1 font-manrope text-xs uppercase tracking-[0.3em] text-brand-electric">Unihockey — Floorball</p>
          <p className="mt-6 max-w-xs font-manrope text-sm text-brand-off/60">
            Small club. Big energy. Stiamo costruendo qualcosa. E puoi entrarci adesso.
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="font-manrope text-xs uppercase tracking-widest text-brand-off/40">Menu</p>
          <ul className="mt-4 space-y-2">
            {NAV.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => scrollToId(n.id)}
                  data-testid={`footer-nav-${n.id}`}
                  className="link-underline font-manrope text-sm text-brand-off/80 hover:text-brand-off"
                >
                  {n.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <p className="font-manrope text-xs uppercase tracking-widest text-brand-off/40">Contatti</p>
          <ul className="mt-4 space-y-2 font-manrope text-sm text-brand-off/80">
            {c.email && (
              <li>
                <a href={`mailto:${c.email}`} className="link-underline" data-testid="footer-email">{c.email}</a>
              </li>
            )}
            {c.phone && (
              <li>
                <a href={`tel:${c.phone}`} className="link-underline" data-testid="footer-phone">{c.phone}</a>
              </li>
            )}
          </ul>
          <div className="mt-6 flex gap-4">
            {s.instagram && (
              <a href={s.instagram} target="_blank" rel="noreferrer" data-cursor aria-label="Instagram" data-testid="social-instagram" className="text-brand-off/60 hover:text-brand-electric">
                <Instagram size={20} />
              </a>
            )}
            {s.tiktok && (
              <a href={s.tiktok} target="_blank" rel="noreferrer" data-cursor aria-label="TikTok" data-testid="social-tiktok" className="text-brand-off/60 hover:text-brand-electric">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d="M16.5 3c.3 2.1 1.5 3.5 3.5 3.7v2.3c-1.2.1-2.4-.2-3.5-.8v5.9c0 3.2-2.4 5.6-5.5 5.6A5.4 5.4 0 0 1 5.6 14c.1-2.7 2.2-4.9 4.9-5v2.5c-.3.1-.6.2-.9.3a2.7 2.7 0 0 0-1.5 3.1 2.7 2.7 0 0 0 5.3-.7V3h3.1Z" />
                </svg>
              </a>
            )}
            {s.youtube && (
              <a href={s.youtube} target="_blank" rel="noreferrer" data-cursor aria-label="YouTube" data-testid="social-youtube" className="text-brand-off/60 hover:text-brand-electric">
                <Youtube size={20} />
              </a>
            )}
            {s.facebook && (
              <a href={s.facebook} target="_blank" rel="noreferrer" data-cursor aria-label="Facebook" data-testid="social-facebook" className="text-brand-off/60 hover:text-brand-electric">
                <Facebook size={20} />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 font-manrope text-xs text-brand-off/40 md:flex-row">
        <span>© {new Date().getFullYear()} ASD Centro Lombardia Unihockey</span>
        <span className="flex gap-6">
          <span className="cursor-default">Privacy</span>
          <span className="cursor-default">Cookie</span>
        </span>
      </div>
    </footer>
  );
};
