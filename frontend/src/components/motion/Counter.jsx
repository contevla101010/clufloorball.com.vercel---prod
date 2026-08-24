import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

// Animated counter. Parses leading number, keeps suffix (e.g. "80+").
export const Counter = ({ value = "0", duration = 1800, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const [display, setDisplay] = useState(0);

  const match = String(value).match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : String(value);
  const isNumeric = !!match;

  useEffect(() => {
    if (!inView || !isNumeric) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration, isNumeric]);

  return (
    <span ref={ref} className={className}>
      {isNumeric ? `${display}${suffix}` : value}
    </span>
  );
};
