import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { CTA } from "@/components/site/CTA";
import { scrollToId } from "@/lib/scroll";

const NAV = [
  { label: "Club", id: "club" },
  { label: "Squadre", id: "squadre" },
  { label: "Gioca", id: "gioca" },
  { label: "Sponsor", id: "sponsor" },
  { label: "Contatti", id: "contatti" },
];

export const Header = ({ settings }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    setOpen(false);
    setTimeout(() => scrollToId(id), open ? 250 : 0);
  };

  return (
    <>
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled ? "border-b border-white/10 bg-brand-ink/70 backdrop-blur-xl" : "bg-transparent"
        }`}
        data-testid="site-header"
      >
        <div className="flex items-center justify-between px-5 py-4 md:px-10">
          <button onClick={() => go("hero")} data-testid="logo-home" className="flex items-center gap-3">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Centro Lombardia Unihockey" className="h-9 w-auto md:h-10" />
            ) : (
              <span className="flex items-center gap-2 font-anton text-lg uppercase tracking-wide text-brand-off md:text-xl">
                <span className="grid h-8 w-8 place-items-center bg-brand-electric text-brand-ink">C</span>
                Centro Lombardia
              </span>
            )}
          </button>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                data-testid={`nav-${n.id}`}
                className="link-underline font-manrope text-sm font-semibold uppercase tracking-widest text-brand-off/80 hover:text-brand-off"
              >
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <CTA onClick={() => go("gioca")} className="hidden px-6 py-3 text-xs sm:inline-flex" data-testid="header-cta">
              Vieni a provare
            </CTA>
            <button
              onClick={() => setOpen(true)}
              className="text-brand-off lg:hidden"
              aria-label="Apri menu"
              data-testid="menu-open"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col bg-brand-ink px-6 py-6"
            data-testid="mobile-menu"
          >
            <div className="flex items-center justify-between">
              <span className="font-anton text-lg uppercase text-brand-off">Centro Lombardia</span>
              <button onClick={() => setOpen(false)} className="text-brand-off" aria-label="Chiudi menu" data-testid="menu-close">
                <X size={28} />
              </button>
            </div>
            <nav className="mt-16 flex flex-1 flex-col gap-2">
              {NAV.map((n, i) => (
                <motion.button
                  key={n.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i + 0.1 }}
                  onClick={() => go(n.id)}
                  data-testid={`mobile-nav-${n.id}`}
                  className="text-left font-anton text-5xl uppercase text-brand-off"
                >
                  {n.label}
                </motion.button>
              ))}
            </nav>
            <CTA onClick={() => go("gioca")} className="w-full" data-testid="mobile-cta">
              Vieni a provare
            </CTA>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
