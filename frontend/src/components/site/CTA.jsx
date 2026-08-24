import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Signature sharp-edged CTA with sliding fill + translating arrow.
export const CTA = forwardRef(
  ({ children, variant = "solid", className = "", withArrow = true, as = "button", ...props }, ref) => {
    const Comp = motion[as] || motion.button;
    const base =
      "group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-none px-8 py-4 font-anton text-sm uppercase tracking-[0.15em] transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-electric focus-visible:ring-offset-2 focus-visible:ring-offset-brand-ink";
    const variants = {
      solid: "bg-brand-electric text-white hover:text-white",
      outline: "border border-white/25 text-brand-off hover:text-brand-ink",
      ghost: "text-brand-off hover:text-white",
    };
    const fill = {
      solid: "bg-white",
      outline: "bg-brand-off",
      ghost: "bg-brand-electric",
    };
    return (
      <Comp ref={ref} data-cursor className={cn(base, variants[variant], className)} {...props}>
        <span
          className={cn(
            "absolute inset-0 -z-0 origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100",
            fill[variant]
          )}
        />
        <span className={cn("relative z-10", variant === "solid" && "group-hover:text-brand-ink")}>{children}</span>
        {withArrow && (
          <span className="relative z-10 transition-transform duration-500 group-hover:translate-x-1.5 group-hover:text-brand-ink">
            →
          </span>
        )}
      </Comp>
    );
  }
);
CTA.displayName = "CTA";
