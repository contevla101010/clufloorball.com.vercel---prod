export const SectionLabel = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center gap-3 font-manrope text-xs font-bold uppercase tracking-[0.3em] text-brand-electric md:text-sm ${className}`}
  >
    <span className="h-px w-8 bg-brand-electric" />
    {children}
  </span>
);
