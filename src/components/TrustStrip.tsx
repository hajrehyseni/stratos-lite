import { useEffect, useRef, useState } from "react";

const metrics = [
  { value: "12,400+", numericTarget: 12400, label: "Decisions audited", suffix: "+" },
  { value: "<30s", numericTarget: 30, label: "Average audit time", prefix: "<", suffix: "s" },
  { value: "4.8★", numericTarget: 4.8, label: "User rating", suffix: "★", decimals: 1 },
];

function AnimatedNumber({ target, prefix = "", suffix = "", decimals = 0, active }: { target: number; prefix?: string; suffix?: string; decimals?: number; active: boolean }) {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * target);
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [active, target]);

  const display = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString();
  return <>{prefix}{display}{suffix}</>;
}

export function TrustStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full" style={{ borderTop: "1px solid hsl(var(--border))", borderBottom: "1px solid hsl(var(--border))" }}>
      <div className="grid grid-cols-3 gap-6 px-4 sm:px-6 py-12 mx-auto" style={{ maxWidth: 720 }}>
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col items-center text-center">
            <span className="text-2xl sm:text-3xl font-extrabold" style={{ color: "hsl(var(--text-primary))" }}>
              {visible ? <AnimatedNumber target={m.numericTarget} prefix={m.prefix} suffix={m.suffix} decimals={m.decimals} active={visible} /> : m.value}
            </span>
            <span className="mt-1.5 text-xs sm:text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
