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
      <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-2" style={{ color: "hsl(var(--text-primary))", letterSpacing: "-0.03em" }}>How it works</h2>
      <p className="text-center text-sm mb-12" style={{ color: "hsl(var(--text-tertiary))" }}>3 steps, 30 seconds</p>

      {/* Desktop: horizontal row */}
      <div className="hidden sm:flex items-start justify-center gap-16 mx-auto" style={{ maxWidth: 720 }}>
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex flex-col items-center text-center" style={{ width: 160, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: `opacity 400ms ease-out ${i * 150}ms, transform 400ms ease-out ${i * 150}ms` }}>
              <div className="flex items-center justify-center rounded-full mb-4" style={{ width: 56, height: 56, border: "1.5px solid hsl(var(--border))", color: "hsl(var(--text-primary))" }}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-base font-semibold mb-1" style={{ color: "hsl(var(--text-primary))" }}>{s.label}</span>
              <span className="text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>{s.desc}</span>
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical stack */}
      <div className="sm:hidden flex flex-col items-center gap-8 mx-auto">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex flex-col items-center text-center" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transition: `opacity 400ms ease-out ${i * 150}ms, transform 400ms ease-out ${i * 150}ms` }}>
              <div className="flex items-center justify-center rounded-full mb-3" style={{ width: 56, height: 56, border: "1.5px solid hsl(var(--border))", color: "hsl(var(--text-primary))" }}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-base font-semibold mb-1" style={{ color: "hsl(var(--text-primary))" }}>{s.label}</span>
              <span className="text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>{s.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
