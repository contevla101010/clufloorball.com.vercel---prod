import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MaskLines } from "@/components/motion/Reveal";
import { CTA } from "@/components/site/CTA";
import { scrollToId } from "@/lib/scroll";

const EASE = [0.22, 1, 0.36, 1];

export const Hero = ({ settings }) => {
  const h = settings.hero;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} id="hero" className="relative h-[100svh] w-full overflow-hidden bg-brand-ink">
      <motion.div className="absolute inset-0" style={{ y: imgY }}>
        {h.video_url ? (
          <video autoPlay muted loop playsInline className="h-full w-full object-cover" src={h.video_url} />
        ) : (
          <motion.img
            initial={{ scale: 1.14 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: EASE }}
            src={h.image_url}
            alt="Floorball Centro Lombardia Unihockey — azione di gioco"
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-brand-ink/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-transparent to-brand-ink/40" />
      </motion.div>

      <motion.div
        style={{ y: textY, opacity: fade }}
        className="relative z-10 flex h-full flex-col justify-end px-5 pb-16 md:px-12 md:pb-24"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="mb-5 font-manrope text-[11px] font-bold uppercase tracking-[0.35em] text-brand-electric md:text-xs"
        >
          {h.subtitle}
        </motion.p>
        <MaskLines
          lines={[h.line1, h.line2, h.line3]}
          delay={0.3}
          className="font-anton uppercase leading-[0.82] text-brand-off text-6xl sm:text-7xl md:text-8xl lg:text-[10.5rem]"
        />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.9 }}
          className="mt-6 max-w-md font-manrope text-base text-brand-off/75 md:text-lg"
        >
          {h.microcopy}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.9 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          <CTA onClick={() => scrollToId("gioca")} data-testid="hero-cta-primary">
            {h.cta_primary}
          </CTA>
          <CTA variant="outline" withArrow={false} onClick={() => scrollToId("club")} data-testid="hero-cta-secondary">
            {h.cta_secondary}
          </CTA>
        </motion.div>
      </motion.div>

      <motion.button
        onClick={() => scrollToId("manifesto")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-6 right-5 z-10 hidden items-center gap-2 font-manrope text-xs uppercase tracking-[0.3em] text-brand-off/70 hover:text-brand-off md:flex"
        data-testid="hero-scroll-indicator"
      >
        Scroll to play <span className="inline-block animate-bounce">↓</span>
      </motion.button>
    </section>
  );
};
