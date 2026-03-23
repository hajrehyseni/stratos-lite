import { Search, ShieldAlert, CheckCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const steps = [
  { icon: Search, label: "Diagnose", desc: "Every angle mapped" },
  { icon: ShieldAlert, label: "Assess", desc: "Risks surfaced" },
  { icon: CheckCircle, label: "Decide", desc: "Verdict delivered" },
];

export function SystemSections() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div id="features" ref={ref} className="scroll-mt-20 py-16 md:py-24 px-4 sm:px-6">
      <h2 className="font-serif text-2xl sm:text-3xl text-center mb-2" style={{ color: "hsl(var(--text-primary))" }}>How it works</h2>
      <p className="text-center text-sm mb-12" style={{ color: "hsl(var(--text-tertiary))" }}>3 steps, 30 seconds</p>

      {/* Desktop: horizontal row */}
      <div className="hidden sm:flex items-start justify-center gap-0 mx-auto" style={{ maxWidth: 720 }}>
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-start" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: `opacity 400ms ease-out ${i * 150}ms, transform 400ms ease-out ${i * 150}ms` }}>
              <div className="flex flex-col items-center text-center" style={{ width: 160 }}>
                <div className="flex items-center justify-center rounded-full mb-4" style={{ width: 56, height: 56, background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-base font-bold mb-1" style={{ color: "hsl(var(--text-primary))" }}>{s.label}</span>
                <span className="text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>{s.desc}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex items-center mt-7" style={{ width: 80 }}>
                  <div className="w-full" style={{ height: 0, borderTop: "2px dashed hsla(221, 83%, 53%, 0.25)" }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical stack with connecting line */}
      <div className="sm:hidden flex flex-col items-center gap-0 mx-auto">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transition: `opacity 400ms ease-out ${i * 150}ms, transform 400ms ease-out ${i * 150}ms` }}>
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center rounded-full mb-3" style={{ width: 56, height: 56, background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-base font-bold mb-1" style={{ color: "hsl(var(--text-primary))" }}>{s.label}</span>
                <span className="text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>{s.desc}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex justify-center py-3">
                  <div style={{ width: 0, height: 40, borderLeft: "2px dashed hsla(221, 83%, 53%, 0.25)" }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
