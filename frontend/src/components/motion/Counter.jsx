import { useEffect, useState } from "react";

// Animated counter driven by an external `start` flag (one trigger for the whole row).
// Parses a leading number and keeps any suffix (e.g. "80+"); non-numeric values (e.g. "A2") render as-is.
export const Counter = ({ value = "0", start = false, duration = 1800, className = "" }) => {
  const [display, setDisplay] = useState(0);

  const match = String(value).match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : String(value);
  const isNumeric = !!match;

  useEffect(() => {
    if (!start || !isNumeric) return;
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration, isNumeric]);

  return <span className={className}>{isNumeric ? `${display}${suffix}` : value}</span>;
};
