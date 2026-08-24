import { Reveal } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/site/SectionLabel";

export const PartnerWall = ({ sponsors = [] }) => {
  if (!sponsors.length) return null;
  return (
    <section className="relative border-t border-white/10 bg-brand-ink px-5 py-20 md:px-12 md:py-28">
      <Reveal>
        <SectionLabel>Partner</SectionLabel>
        <h2 className="mt-6 font-anton text-4xl uppercase text-brand-off md:text-6xl">
          They play with <span className="text-brand-electric">us.</span>
        </h2>
      </Reveal>
      <div className="mt-12 grid grid-cols-2 items-center gap-8 md:grid-cols-4 lg:grid-cols-5" data-testid="partner-wall">
        {sponsors.map((sp, i) => (
          <Reveal key={sp.id} delay={i * 0.06}>
            <a
              href={sp.link || "#"}
              target={sp.link ? "_blank" : undefined}
              rel="noreferrer"
              data-cursor
              className="group flex items-center justify-center"
            >
              <img
                src={sp.logo_url}
                alt={sp.nome}
                className="max-h-14 w-auto opacity-60 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0"
              />
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
