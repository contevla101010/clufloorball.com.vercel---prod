import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

export const Reveal = ({ children, delay = 0, y = 40, className = "", once = true, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once, margin: "-10% 0px -10% 0px" }}
    transition={{ duration: 0.9, ease: EASE, delay }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Masked line-by-line reveal for large headlines (uses useInView for reliability).
export const MaskLines = ({ lines = [], className = "", lineClassName = "", delay = 0, stagger = 0.12 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px -8% 0px" });
  return (
    <div ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className={`block ${lineClassName}`}
            initial={{ y: "110%" }}
            animate={inView ? { y: "0%" } : { y: "110%" }}
            transition={{ duration: 1, ease: EASE, delay: delay + i * stagger }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </div>
  );
};
