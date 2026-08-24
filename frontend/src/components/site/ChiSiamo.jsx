import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal, MaskLines } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/site/SectionLabel";

export const ChiSiamo = ({ settings }) => {
  const a = settings.about;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="club" className="relative bg-brand-ink2 px-5 py-24 md:px-12 md:py-40">
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-6">
          <Reveal>
            <SectionLabel>{a.label}</SectionLabel>
          </Reveal>
          <MaskLines
            lines={[a.line1, a.line2, a.line3]}
            className="mt-8 font-anton uppercase leading-[0.85] text-brand-off text-4xl sm:text-6xl md:text-7xl"
          />
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-lg font-manrope text-lg leading-relaxed text-brand-off/70">{a.body}</p>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mt-10 font-anton text-2xl uppercase text-brand-electric md:text-3xl">
              Small club. Big energy.
            </p>
          </Reveal>
        </div>

        <div className="md:col-span-6">
          <div
            ref={ref}
            data-cursor
            data-cursor-label="Club"
            className="group relative aspect-[4/5] w-full overflow-hidden md:aspect-[3/4]"
          >
            <motion.img
              style={{ y }}
              src={a.image_url}
              alt="La community di Centro Lombardia Unihockey"
              className="absolute inset-0 h-[116%] w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};
