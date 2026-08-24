import { useState } from "react";
import { Reveal, MaskLines } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/site/SectionLabel";
import { CTA } from "@/components/site/CTA";
import { scrollToId } from "@/lib/scroll";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const TeamCard = ({ team, onOpen, className = "" }) => (
  <div
    onClick={() => onOpen(team)}
    data-cursor
    data-cursor-label="View"
    data-testid={`team-card-${team.id}`}
    className={`group relative w-[78vw] shrink-0 cursor-pointer snap-start overflow-hidden bg-brand-ink2 sm:w-auto ${className}`}
  >
    <div className="relative h-full w-full overflow-hidden">
      <img
        src={team.image_url}
        alt={`Squadra ${team.nome}`}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/10 to-transparent" />
    </div>
    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 md:p-6">
      <div>
        <p className="font-manrope text-[10px] font-bold uppercase tracking-[0.25em] text-brand-electric">
          {team.categoria}
        </p>
        <h3 className="mt-1 font-anton text-3xl uppercase leading-none text-brand-off md:text-4xl">{team.nome}</h3>
      </div>
      <span className="font-anton text-sm uppercase text-brand-off/80 transition-transform duration-500 group-hover:translate-x-1">
        Scopri →
      </span>
    </div>
  </div>
);

export const Squadre = ({ teams = [] }) => {
  const [active, setActive] = useState(null);
  const spans = ["md:row-span-2 md:h-full", "", "", "md:row-span-2 md:h-full"];

  return (
    <section id="squadre" className="relative bg-brand-ink px-5 py-24 md:px-12 md:py-40">
      <Reveal>
        <SectionLabel>Teams / 02</SectionLabel>
      </Reveal>
      <MaskLines
        lines={["One club.", <span key="l2" className="text-brand-electric">Many stories.</span>]}
        className="mt-8 font-anton uppercase leading-[0.85] text-brand-off text-5xl sm:text-7xl md:text-8xl"
      />

      {/* Mobile: horizontal swipe */}
      <div className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:hidden" data-testid="teams-swipe">
        {teams.map((t) => (
          <TeamCard key={t.id} team={t} onOpen={setActive} className="aspect-[3/4]" />
        ))}
      </div>

      {/* Desktop: asymmetric editorial grid */}
      <div className="mt-14 hidden auto-rows-[300px] grid-cols-3 gap-5 md:grid" data-testid="teams-grid">
        {teams.map((t, i) => (
          <TeamCard key={t.id} team={t} onOpen={setActive} className={spans[i % spans.length]} />
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl overflow-hidden border-white/10 bg-brand-ink2 p-0 text-brand-off">
          {active && (
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-square md:aspect-auto">
                <img src={active.image_url} alt={active.nome} className="h-full w-full object-cover" />
              </div>
              <div className="p-7">
                <p className="font-manrope text-[10px] font-bold uppercase tracking-[0.25em] text-brand-electric">
                  {active.categoria}
                </p>
                <h3 className="mt-1 font-anton text-4xl uppercase text-brand-off">{active.nome}</h3>
                <p className="mt-4 font-manrope text-sm leading-relaxed text-brand-off/70">{active.descrizione}</p>
                <dl className="mt-6 space-y-3 border-t border-white/10 pt-6 font-manrope text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-brand-off/50">Allenatore</dt>
                    <dd className="text-right">{active.allenatore || "Da definire"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-brand-off/50">Allenamenti</dt>
                    <dd className="text-right">{active.allenamenti || "Da definire"}</dd>
                  </div>
                </dl>
                <CTA
                  onClick={() => {
                    setActive(null);
                    setTimeout(() => scrollToId("gioca"), 200);
                  }}
                  className="mt-7 w-full"
                  data-testid="team-dialog-cta"
                >
                  Prenota una prova
                </CTA>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
