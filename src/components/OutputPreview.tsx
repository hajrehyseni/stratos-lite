import { ArrowRight } from "lucide-react";
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

  const scrollToHero = () => {
    const input = document.querySelector<HTMLInputElement>("#hero-input") || document.querySelector<HTMLInputElement>("#hero-input-mobile");
    if (input) { input.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => input.focus(), 400); }
  };

  return (
    <div ref={ref} className="px-4 sm:px-6 py-16 md:py-24">
      <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-3" style={{ color: "hsl(var(--text-primary))", letterSpacing: "-0.03em" }}>
        See what you'll get
      </h2>
      <p className="text-center text-sm mb-10" style={{ color: "hsl(var(--text-tertiary))" }}>
        Every audit delivers a full strategic breakdown
      </p>

      <div
        className="mx-auto p-6 sm:p-8"
        style={{
          maxWidth: 640,
          borderRadius: 16,
          background: "hsl(var(--background))",
          border: "1px solid hsl(var(--border))",
          boxShadow: "0 2px 20px hsla(0, 0%, 0%, 0.06)",
        }}
      >
        {/* Score + Verdict */}
        <div className="flex items-center gap-5 mb-6">
          <div
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{
              width: 80, height: 80,
              border: "3px solid hsl(var(--text-primary))",
            }}
          >
            <span className="text-3xl font-bold" style={{ color: "hsl(var(--text-primary))" }}>{animatedScore}</span>
          </div>
          <div>
            <span
              className="inline-flex rounded-lg px-3 py-1 text-xs font-semibold uppercase"
              style={{
                background: "hsl(var(--secondary))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--text-primary))",
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

        {/* MECE Bars */}
        <div className="space-y-3">
          {dimensions.map((d, i) => (
            <div key={d.label}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium" style={{ color: "hsl(var(--text-primary))" }}>{d.label}</span>
                <span className="text-sm font-semibold" style={{ color: barColor(d.score) }}>{d.score}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ background: "hsl(var(--border))" }}>
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

        {/* Links */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={scrollToHero}
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "hsl(var(--text-primary))", background: "none", border: "none" }}
          >
            Try it free <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="/audit-results"
            className="inline-flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: "hsl(var(--text-tertiary))" }}
          >
            See full example →
          </a>
        </div>
      </div>
    </div>
  );
}
