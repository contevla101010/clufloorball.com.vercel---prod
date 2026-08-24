import { useScroll, useSpring, motion } from "framer-motion";

// THE BALL TRAIL — signature glowing SVG line drawn as the user scrolls.
export const BallTrail = () => {
  const { scrollYProgress } = useScroll();
  const pathLength = useSpring(scrollYProgress, { stiffness: 90, damping: 30, mass: 0.5 });

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] hidden md:block" aria-hidden="true">
      <svg
        className="h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
        style={{ filter: "drop-shadow(0 0 6px rgba(124,58,237,0.9))" }}
      >
        <motion.path
          d="M 96 -2 C 70 12, 88 26, 60 34 C 30 43, 72 54, 40 63 C 8 72, 60 82, 30 92 C 12 98, 20 104, 8 110"
          stroke="#7C3AED"
          strokeWidth="0.35"
          strokeLinecap="round"
          style={{ pathLength }}
        />
      </svg>
    </div>
  );
};
