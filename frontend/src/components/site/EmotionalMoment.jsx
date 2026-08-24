import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MaskLines } from "@/components/motion/Reveal";

export const EmotionalMoment = ({ settings }) => {
  const e = settings.emotional;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section ref={ref} className="relative flex h-[100svh] items-center overflow-hidden bg-brand-ink">
      <motion.img
        style={{ y }}
        src={e.image_url}
        alt="La community di floorball dal vivo"
        className="absolute inset-0 h-[124%] w-full object-cover"
      />
      <div className="absolute inset-0 bg-brand-ink/65" />
      <div className="relative z-10 px-5 md:px-12">
        <MaskLines
          lines={[e.line1, <span key="l2" className="text-brand-electric">{e.line2}</span>, e.line3]}
          className="font-anton uppercase leading-[0.85] text-brand-off text-5xl sm:text-7xl md:text-8xl lg:text-[8.5rem]"
        />
      </div>
    </section>
  );
};
