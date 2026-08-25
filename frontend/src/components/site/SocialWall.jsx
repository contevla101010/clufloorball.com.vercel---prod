import { useEffect, useMemo } from "react";
import { Instagram, Play } from "lucide-react";
import { Reveal, MaskLines } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/site/SectionLabel";

const loadInstagramEmbeds = () => {
  const process = () => window.instgrm && window.instgrm.Embeds.process();
  if (window.instgrm) {
    process();
    return;
  }
  const existing = document.getElementById("ig-embed-script");
  if (existing) {
    existing.addEventListener("load", process);
    return;
  }
  const s = document.createElement("script");
  s.id = "ig-embed-script";
  s.src = "https://www.instagram.com/embed.js";
  s.async = true;
  s.onload = process;
  document.body.appendChild(s);
};

export const SocialWall = ({ settings }) => {
  const items = settings.social?.items || [];
  const socials = settings.socials || {};
  const profile = socials.instagram || "";
  const reels = useMemo(() => items.filter((it) => it.ig_url && it.ig_url.trim()), [items]);
  const fallbackTiles = items.filter((it) => it.image_url);

  useEffect(() => {
    if (reels.length) loadInstagramEmbeds();
  }, [reels]);

  if (!reels.length && !fallbackTiles.length) return null;

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
        {profile && (
          <a
            href={profile}
            target="_blank"
            rel="noreferrer"
            data-cursor
            data-testid="social-follow"
            className="group inline-flex items-center gap-2 border border-white/15 px-5 py-3 font-anton text-sm uppercase tracking-widest text-brand-off transition-colors hover:border-brand-electric hover:text-brand-electric"
          >
            <Instagram size={18} /> Seguici su Instagram
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        )}
      </div>

      {reels.length > 0 ? (
        <div
          className="mt-12 grid grid-cols-1 gap-5 [&_.instagram-media]:!min-w-0 [&_.instagram-media]:!w-full sm:grid-cols-2 lg:grid-cols-3"
          data-testid="social-wall"
          key={reels.map((r) => r.ig_url).join("|")}
        >
          {reels.map((it, i) => (
            <blockquote
              key={i}
              className="instagram-media"
              data-instgrm-permalink={it.ig_url}
              data-instgrm-version="14"
              style={{ margin: 0, width: "100%", minWidth: 0, borderRadius: 0 }}
            />
          ))}
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4" data-testid="social-wall">
          {fallbackTiles.map((it, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <a
                href={it.link || profile || "#"}
                target={it.link || profile ? "_blank" : undefined}
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
      )}
    </section>
  );
};
