import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Signature custom cursor — desktop only. Dot + trailing ring, expands on hover.
export const CustomCursor = () => {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState("");
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 350, damping: 30, mass: 0.4 });
  const ringY = useSpring(dotY, { stiffness: 350, damping: 30, mass: 0.4 });
  const raf = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;
    setEnabled(true);
    document.documentElement.classList.add("cursor-active");

    const move = (e) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      const t = e.target.closest("[data-cursor], a, button");
      if (t) {
        setHovering(true);
        setLabel(t.getAttribute("data-cursor-label") || "");
      } else {
        setHovering(false);
        setLabel("");
      }
    };
    window.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.classList.remove("cursor-active");
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [dotX, dotY]);

  if (!enabled) return null;

  return (
    <>
      <motion.div className="cursor-dot" style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }} />
      <motion.div
        className="cursor-ring flex items-center justify-center"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          scale: label ? 2.6 : hovering ? 1.6 : 1,
          backgroundColor: hovering ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {label && (
          <span className="font-anton text-[9px] uppercase tracking-widest text-brand-off">{label}</span>
        )}
      </motion.div>
    </>
  );
};
