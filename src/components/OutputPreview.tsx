import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const dimensions = [
  { label: "Strategic Fit", score: 85 },
  { label: "Financial Viability", score: 68 },
  { label: "Operational Readiness", score: 61 },
];

function barColor(score: number) {
  if (score >= 80) return "hsl(var(--success))";
  if (score >= 60) return "hsl(var(--warning))";
  return "hsl(var(--destructive))";
}

export function OutputPreview() {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Count up animation
  useEffect(() => {
    if (!visible) return;
    const target = 72;
    const duration = 1200;
    const start = performance.now();
    let raf: number;
    const animate = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimatedScore(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  return (
    <div ref={ref} className="px-4 sm:px-6 py-16 md:py-24">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3" style={{ color: "hsl(var(--text-primary))" }}>
        See what you'll get
      </h2>
      <p className="text-center text-sm mb-10" style={{ color: "hsl(var(--text-tertiary))" }}>
        Every audit delivers a full strategic breakdown
      </p>

      <div
        className="mx-auto rounded-2xl p-6 sm:p-8"
        style={{
          maxWidth: 580,
          background: "hsl(var(--secondary))",
          border: "1px solid hsl(var(--border))",
          boxShadow: "0 8px 32px hsla(221, 83%, 53%, 0.06)",
        }}
      >
        {/* Score + Verdict */}
        <div className="flex items-center gap-5 mb-6">
          <div
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{
              width: 72, height: 72,
              border: "3px solid hsl(var(--primary))",
              background: "hsla(221, 83%, 53%, 0.04)",
            }}
          >
            <span className="text-2xl font-extrabold" style={{ color: "hsl(var(--primary))" }}>{animatedScore}</span>
          </div>
          <div>
            <span
              className="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase"
              style={{
                background: "hsla(38, 92%, 50%, 0.12)",
                border: "1px solid hsla(38, 92%, 50%, 0.3)",
                color: "hsl(var(--warning))",
                letterSpacing: "0.05em",
                animation: visible ? "pulse-once 600ms ease 1.3s" : "none",
              }}
            >
              Conditional Proceed
            </span>
            <p className="text-sm mt-1.5" style={{ color: "hsl(var(--text-secondary))" }}>
              Confidence score with strategic verdict
            </p>
          </div>
        </div>

        {/* MECE Bars — staggered animation */}
        <div className="space-y-3">
          {dimensions.map((d, i) => (
            <div key={d.label}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium" style={{ color: "hsl(var(--text-primary))" }}>{d.label}</span>
                <span className="text-sm font-bold" style={{ color: barColor(d.score) }}>{d.score}%</span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: "hsl(var(--border))" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: visible ? `${d.score}%` : "0%",
                    background: barColor(d.score),
                    transition: `width 800ms ease-out ${200 + i * 200}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/audit-results")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: "hsl(var(--primary))", background: "none", border: "none" }}
          >
            See full example <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
