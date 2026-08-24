import { Play } from "lucide-react";
import { Reveal, MaskLines } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/site/SectionLabel";

export const SocialWall = ({ settings }) => {
  const items = settings.social?.items || [];
  const socials = settings.socials || {};
  const link = socials.instagram || socials.tiktok || socials.youtube || "";
  if (!items.length) return null;

  return (
    <section className="relative bg-brand-ink2 px-5 py-24 md:px-12 md:py-36">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Reveal>
            <SectionLabel>Community</SectionLabel>
          </Reveal>
          <MaskLines
            lines={[<span key="l1">Off the <span className="text-brand-electric">field.</span></span>]}
            className="mt-6 font-anton uppercase leading-[0.85] text-brand-off text-5xl sm:text-7xl md:text-8xl"
          />
        </div>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4" data-testid="social-wall">
        {items.map((it, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <a
              href={it.link || link || "#"}
              target={(it.link || link) ? "_blank" : undefined}
              rel="noreferrer"
              data-cursor
              data-cursor-label="Play"
              className="group relative block aspect-[9/16] overflow-hidden bg-brand-ink"
            >
              <img
                src={it.image_url}
                alt="Momento della community floorball"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/60 to-transparent opacity-70 transition-opacity group-hover:opacity-90" />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-14 w-14 place-items-center rounded-full border border-white/40 bg-brand-ink/40 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
                  <Play className="text-brand-off" size={20} fill="currentColor" />
                </span>
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
