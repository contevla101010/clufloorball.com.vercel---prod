import { useState } from "react";
import { motion } from "framer-motion";
import { Gem } from "lucide-react";
import { Reveal, MaskLines } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/site/SectionLabel";
import { CTA } from "@/components/site/CTA";
import { SponsorForm } from "@/components/site/SponsorForm";
import { scrollToId } from "@/lib/scroll";

const TIERS = [
  { name: "Bronze", tag: "Entry partnership", benefits: ["Logo sul sito", "Presenza partner", "Menzioni digitali", "Visibilità base"] },
  { name: "Silver", tag: "Growing partner", benefits: ["Tutto Bronze", "Maggiore visibilità", "Presenza eventi", "Contenuti social"] },
  { name: "Gold", tag: "Premium partner", benefits: ["Tutto Silver", "Posizione prioritaria", "Contenuti dedicati", "Opportunità branding"], featured: true },
];

export const Sponsor = ({ settings }) => {
  const s = settings.sponsor;
  const [pkg, setPkg] = useState("");

  const choose = (name) => {
    setPkg(name);
    setTimeout(() => scrollToId("sponsor-form"), 60);
  };

  return (
    <section id="sponsor" className="relative bg-brand-ink px-5 py-24 md:px-12 md:py-40">
      <Reveal>
        <SectionLabel>Sponsor / 04</SectionLabel>
      </Reveal>
      <MaskLines
        lines={[<span key="l1">Play with <span className="text-brand-electric">us.</span></span>]}
        className="mt-8 font-anton uppercase leading-[0.85] text-brand-off text-6xl sm:text-8xl md:text-9xl"
      />
      <Reveal delay={0.1}>
        <p className="mt-6 font-anton text-xl uppercase text-brand-off md:text-2xl">{s.subheadline}</p>
        <p className="mt-4 max-w-2xl font-manrope text-lg leading-relaxed text-brand-off/70">{s.body}</p>
      </Reveal>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {TIERS.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.1}>
            <div
              data-cursor
              data-testid={`sponsor-tier-${t.name.toLowerCase()}`}
              className={`flex h-full flex-col border p-7 transition-colors duration-500 ${
                t.featured
                  ? "border-brand-electric/60 bg-brand-electric/10"
                  : "border-white/10 bg-brand-ink2 hover:border-white/25"
              }`}
            >
              {t.featured && (
                <span className="mb-4 w-fit bg-brand-electric px-3 py-1 font-manrope text-[10px] font-bold uppercase tracking-widest text-white">
                  Premium
                </span>
              )}
              <h3 className="font-anton text-4xl uppercase text-brand-off">{t.name}</h3>
              <p className="mt-1 font-manrope text-xs uppercase tracking-widest text-brand-electric">{t.tag}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {t.benefits.map((b) => (
                  <li key={b} className="flex items-center gap-3 font-manrope text-sm text-brand-off/75">
                    <span className="h-1.5 w-1.5 shrink-0 bg-brand-electric" /> {b}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => choose(t.name)}
                data-testid={`sponsor-cta-${t.name.toLowerCase()}`}
                className="mt-8 border-t border-white/10 pt-5 text-left font-anton text-sm uppercase tracking-widest text-brand-off transition-colors hover:text-brand-electric"
              >
                Scopri {t.name} →
              </button>
            </div>
          </Reveal>
        ))}
      </div>

      {/* DIAMOND — exclusive */}
      <Reveal delay={0.1}>
        <div
          className="diamond-glow relative mt-6 overflow-hidden border border-brand-electric/40 bg-brand-ink2 p-8 md:p-14"
          data-testid="sponsor-diamond"
        >
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, #7C3AED, transparent 70%)" }}
          />
          <div className="relative grid gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <div className="flex items-center gap-3">
                <Gem className="text-brand-gold" size={20} />
                <span className="font-manrope text-[11px] font-bold uppercase tracking-[0.3em] text-brand-gold">
                  Limited / 01 available
                </span>
              </div>
              <h3 className="mt-6 font-anton text-5xl uppercase leading-[0.85] text-brand-off md:text-7xl">
                Diamond
                <br />
                <span className="text-stroke">Naming Partner</span>
              </h3>
              <p className="mt-6 font-anton text-xl uppercase leading-tight text-brand-off/90 md:text-2xl">
                Il tuo brand. Il nostro nome.
                <br />
                Una sola partnership.
              </p>
              <p className="mt-5 max-w-xl font-manrope text-sm leading-relaxed text-brand-off/65">
                Il livello più alto di partnership con Centro Lombardia Unihockey. Possibilità, secondo accordi e
                regolamenti sportivi applicabili, di costruire una collaborazione di naming dedicata alla squadra.
              </p>
              <p className="mt-4 font-anton text-lg uppercase tracking-wide text-brand-electric">
                [Brand] × Centro Lombardia
              </p>
            </div>
            <div className="flex flex-col justify-between md:col-span-5">
              <ul className="grid grid-cols-2 gap-2 font-manrope text-xs uppercase tracking-wide text-brand-off/70">
                {["Naming Partnership", "Main Partner", "Massima visibilità", "Presenza prioritaria", "Eventi", "Social Content", "Branding", "Attivazioni"].map(
                  (b) => (
                    <li key={b} className="flex items-center gap-2">
                      <span className="h-1 w-1 bg-brand-gold" /> {b}
                    </li>
                  )
                )}
              </ul>
              <div className="mt-8">
                <CTA onClick={() => choose("Diamond")} className="w-full" data-testid="sponsor-cta-diamond">
                  Parliamone
                </CTA>
                <p className="mt-3 font-manrope text-xs text-brand-off/50">1 partnership disponibile</p>
              </div>
            </div>
          </div>
          <p className="relative mt-8 border-t border-white/10 pt-5 font-manrope text-[11px] italic text-brand-off/40">
            Naming e utilizzo del marchio sono soggetti ad accordo contrattuale e ai regolamenti sportivi applicabili.
          </p>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-10 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <p className="font-manrope text-xs font-bold uppercase tracking-[0.3em] text-brand-electric">Diventa partner</p>
          <h3 className="mt-3 font-anton text-4xl uppercase leading-[0.9] text-brand-off md:text-5xl">
            Entra nel <span className="text-brand-electric">progetto.</span>
          </h3>
          <p className="mt-4 max-w-sm font-manrope text-brand-off/65">
            Bronze → ingresso. Silver → crescita. Gold → premium. Diamond → esclusivo. Il resto lo definiamo insieme.
          </p>
        </Reveal>
        <motion.div className="md:col-span-7">
          <SponsorForm pkg={pkg} onPkg={setPkg} />
        </motion.div>
      </div>
    </section>
  );
};
