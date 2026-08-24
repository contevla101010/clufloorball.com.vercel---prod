import { Reveal, MaskLines } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/site/SectionLabel";
import { TrialForm } from "@/components/site/TrialForm";

export const Gioca = ({ settings, courses = [] }) => {
  const g = settings.gioca;
  return (
    <section
      id="gioca"
      className="relative overflow-hidden bg-gradient-to-b from-brand-deep/25 to-brand-ink px-5 py-24 md:px-12 md:py-40"
    >
      <div className="grid gap-10 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <Reveal>
            <SectionLabel>Gioca / 03</SectionLabel>
          </Reveal>
          <MaskLines
            lines={[g.line1, <span key="l2" className="text-brand-electric">{g.line2}</span>]}
            className="mt-8 font-anton uppercase leading-[0.85] text-brand-off text-4xl sm:text-6xl md:text-7xl"
          />
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-md font-manrope text-lg leading-relaxed text-brand-off/75">{g.body}</p>
          </Reveal>

          <div className="mt-10 space-y-px" data-testid="courses-list">
            {courses.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.08}>
                <div className="border-t border-white/10 py-5">
                  <div className="flex items-baseline justify-between">
                    <h4 className="font-anton text-xl uppercase text-brand-off md:text-2xl">{c.categoria}</h4>
                    <span className="font-manrope text-sm text-brand-electric">{c.eta}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 font-manrope text-xs uppercase tracking-wider text-brand-off/50">
                    <span>{c.giorni}</span>
                    <span>{c.orari}</span>
                    <span>{c.luogo}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <Reveal>
            <p className="font-manrope text-xs font-bold uppercase tracking-[0.3em] text-brand-electric">
              Prenota una prova
            </p>
            <h3 className="mt-3 font-anton text-3xl uppercase text-brand-off md:text-4xl">In meno di 30 secondi.</h3>
          </Reveal>
          <div className="mt-8">
            <TrialForm courses={courses} />
          </div>
        </div>
      </div>
    </section>
  );
};
