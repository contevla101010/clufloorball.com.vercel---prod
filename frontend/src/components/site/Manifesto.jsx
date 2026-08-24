import { Reveal, MaskLines } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/site/SectionLabel";
import { CTA } from "@/components/site/CTA";
import { scrollToId } from "@/lib/scroll";

export const Manifesto = ({ settings }) => {
  const m = settings.manifesto;
  return (
    <section id="manifesto" className="relative bg-brand-ink px-5 py-24 md:px-12 md:py-44">
      <Reveal>
        <SectionLabel>Manifesto / 01</SectionLabel>
      </Reveal>
      <MaskLines
        lines={[m.line1, m.line2, <span key="l3" className="text-brand-electric">{m.line3}</span>]}
        className="mt-8 font-anton uppercase leading-[0.85] text-brand-off text-5xl sm:text-7xl md:text-8xl lg:text-[9.5rem]"
      />
      <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-12 md:gap-16">
        <Reveal className="md:col-span-7 md:col-start-6" delay={0.1}>
          <p className="max-w-2xl font-manrope text-lg leading-relaxed text-brand-off/75 md:text-2xl">{m.body}</p>
          <div className="mt-8">
            <CTA variant="outline" onClick={() => scrollToId("gioca")} data-testid="manifesto-cta">
              {m.cta}
            </CTA>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
