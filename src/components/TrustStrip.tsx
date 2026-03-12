import { useEffect, useRef, useState } from "react";

const metrics = [
  { target: 2400, suffix: "+", label: "DECISIONS AUDITED" },
  { target: 28, suffix: "s", label: "AVERAGE AUDIT TIME" },
  { target: 4.8, suffix: "★", label: "USER RATING", decimals: 1 },
  { target: 6, suffix: "", label: "FRAMEWORKS APPLIED" },
  { target: 0, suffix: "", label: "DATA STORED ON SERVERS", static: true },
];

function useCountUp(target: number, duration: number, start: boolean, decimals = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (target === 0) { setValue(0); return; }
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [start, target, duration, decimals]);
  return value;
}

export function TrustStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    /* <!-- PLACEHOLDER METRICS — update with real analytics --> */
    <div
      ref={ref}
      className="w-full overflow-x-auto scrollbar-hide"
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="flex items-center justify-between gap-8 px-4 py-8 mx-auto" style={{ maxWidth: 1152, minWidth: 640 }}>
        {metrics.map((m) => {
          const count = useCountUp(m.target, 1500, visible, m.decimals || 0);
          return (
            <div key={m.label} className="flex flex-col items-center text-center flex-1">
              <span className="text-2xl font-bold" style={{ color: "hsl(var(--primary))" }}>
                {m.static ? "0" : (m.decimals ? count.toFixed(m.decimals) : Math.round(count).toLocaleString())}
                {m.suffix}
              </span>
              <span
                className="mt-1 text-xs uppercase"
                style={{ letterSpacing: "0.12em", color: "hsl(var(--muted-foreground))" }}
              >
                {m.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
