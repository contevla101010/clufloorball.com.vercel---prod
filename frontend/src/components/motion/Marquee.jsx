export const Marquee = ({ items = [], reverse = false, className = "", itemClassName = "" }) => {
  const doubled = [...items, ...items];
  return (
    <div className={`relative overflow-hidden ${className}`} data-testid="marquee">
      <div
        className={`flex w-max ${reverse ? "animate-marquee-rev" : "animate-marquee"}`}
        style={{ willChange: "transform" }}
      >
        {doubled.map((item, i) => (
          <span key={i} className={`flex items-center ${itemClassName}`}>
            {item}
            <span className="mx-6 text-brand-electric md:mx-10">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};
