import { MaskLines } from "@/components/motion/Reveal";
import { CTA } from "@/components/site/CTA";
import { scrollToId } from "@/lib/scroll";

export const FinalCTA = () => (
  <section className="relative overflow-hidden bg-brand-deep px-5 py-28 md:px-12 md:py-48">
    <div
      className="pointer-events-none absolute inset-0 opacity-40"
      style={{ background: "radial-gradient(60% 60% at 80% 20%, rgba(124,58,237,0.55), transparent)" }}
    />
    <div className="relative">
      <MaskLines
        lines={["Ready", <span key="l2" className="text-brand-off/40">to play?</span>]}
        className="font-anton uppercase leading-[0.82] text-brand-off text-7xl sm:text-8xl md:text-[13rem]"
      />
      <div className="mt-12 flex flex-wrap gap-4">
        <CTA variant="outline" onClick={() => scrollToId("gioca")} className="border-white/40" data-testid="final-cta-primary">
          Prenota una prova
        </CTA>
        <CTA variant="ghost" withArrow={false} onClick={() => scrollToId("contatti")} data-testid="final-cta-secondary">
          Contattaci
        </CTA>
      </div>
    </div>
  </section>
);
