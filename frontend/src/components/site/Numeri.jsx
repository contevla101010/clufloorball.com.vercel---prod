import { Reveal } from "@/components/motion/Reveal";
import { Counter } from "@/components/motion/Counter";

export const Numeri = ({ settings }) => {
  const stats = settings.stats || [];
  return (
    <section className="relative border-y border-white/10 bg-brand-ink px-5 py-20 md:px-12 md:py-28">
      <div className="grid grid-cols-2 gap-y-12 md:grid-cols-4 md:gap-x-8">
        {stats.map((s, i) => (
          <Reveal key={i} delay={i * 0.1} className="border-l border-white/10 pl-5 md:pl-8">
            <div className="font-anton text-6xl leading-none text-brand-off md:text-8xl">
              <Counter value={s.value} />
            </div>
            <div className="mt-3 font-manrope text-xs font-bold uppercase tracking-[0.25em] text-brand-electric md:text-sm">
              {s.label}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
