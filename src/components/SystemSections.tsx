import { Search, ShieldAlert, CheckCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function DiagnoseMockup() {
  const cards = ["Market Opportunity", "Financial Risk", "Team Readiness", "Competitive Timing"];
  return (
    <div className="rounded-2xl p-5 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", maxWidth: 360 }}>
      <div className="grid grid-cols-2 gap-2.5">
        {cards.map((c) => (
          <div key={c} className="rounded-lg px-3 py-2.5" style={{ background: "hsl(0, 0%, 100%)", borderLeft: "3px solid hsl(var(--primary))" }}>
            <span className="text-sm" style={{ color: "hsl(var(--text-primary))" }}>{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssessMockup() {
  const risks = [
    { text: "Integration timeline exceeds window", color: "hsl(var(--destructive))" },
    { text: "Key talent retention at risk", color: "hsl(var(--warning))" },
    { text: "CTO opposes but hasn't voiced it", color: "hsl(221, 83%, 53%)" },
  ];
  return (
    <div className="space-y-2.5 transition-all duration-200 hover:scale-[1.03]" style={{ maxWidth: 360 }}>
      {risks.map((r, i) => (
        <div key={i} className="rounded-lg px-4 py-3" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", borderLeft: `3px solid ${r.color}` }}>
          <span className="text-sm" style={{ color: "hsl(var(--text-secondary))" }}>{r.text}</span>
        </div>
      ))}
    </div>
  );
}

function DecideMockup() {
  return (
    <div className="rounded-2xl p-5 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", maxWidth: 360 }}>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-4xl font-extrabold" style={{ color: "hsl(var(--primary))" }}>72</span>
        <span className="text-base" style={{ color: "hsl(var(--text-tertiary))" }}>/100</span>
      </div>
      <div className="w-full h-2 rounded-full mb-3" style={{ background: "hsl(var(--border))" }}>
        <div className="h-full rounded-full" style={{ width: "72%", background: "hsl(var(--primary))" }} />
      </div>
      <div className="inline-flex rounded-full px-3 py-1 text-xs font-bold" style={{ background: "hsla(38, 92%, 50%, 0.12)", border: "1px solid hsla(38, 92%, 50%, 0.3)", color: "hsl(var(--warning))" }}>
        Conditional Proceed
      </div>
    </div>
  );
}

const stepIcons = [Search, ShieldAlert, CheckCircle];

const sections = [
  { num: "01", tag: "Diagnose", heading: "Break it down", visual: <DiagnoseMockup /> },
  { num: "02", tag: "Assess", heading: "See what could go wrong", visual: <AssessMockup /> },
  { num: "03", tag: "Decide", heading: "Get your confidence score", visual: <DecideMockup /> },
];

function StepSection({ s, i, reversed, Icon }: { s: typeof sections[0]; i: number; reversed: boolean; Icon: typeof Search }) {
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

  const bgTint = i === 1 ? "hsla(221, 83%, 53%, 0.015)" : "transparent";

  return (
    <div
      ref={ref}
      className="relative"
      style={{
        background: bgTint,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 500ms ease-out ${i * 150}ms, transform 500ms ease-out ${i * 150}ms`,
      }}
    >
      <div className="py-10 md:py-14 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className={reversed ? "md:order-2" : ""}>
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex flex-col items-center">
              <span className="inline-flex items-center justify-center rounded-lg font-extrabold" style={{ width: 36, height: 36, background: "hsla(221, 83%, 53%, 0.1)", color: "hsl(var(--primary))", fontSize: 14 }}>{s.num}</span>
              {i < sections.length - 1 && (
                <div className="hidden md:block absolute" style={{ top: 44, left: "50%", transform: "translateX(-50%)", width: 0, height: 180, borderLeft: "2px dashed hsla(221, 83%, 53%, 0.35)" }} />
              )}
            </div>
            <Icon className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
            <span className="text-sm font-semibold uppercase" style={{ letterSpacing: "0.1em", color: "hsl(var(--primary))" }}>{s.tag}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.2 }}>{s.heading}</h2>
        </div>
        {/* Show on all screens — smaller on mobile */}
        <div className={`${reversed ? "md:order-1" : ""} flex justify-center`}>
          <div className="w-full" style={{ maxWidth: 280 }}>
            {s.visual}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SystemSections() {
  return (
    <div id="features" style={{ maxWidth: 1120 }} className="mx-auto px-4 sm:px-6 scroll-mt-20 py-16 md:py-24">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2" style={{ color: "hsl(var(--text-primary))" }}>How it works</h2>
      <p className="text-center text-sm mb-12" style={{ color: "hsl(var(--text-tertiary))" }}>3 steps, 30 seconds</p>
      {sections.map((s, i) => {
        const reversed = i % 2 === 1;
        const Icon = stepIcons[i];
        return <StepSection key={s.num} s={s} i={i} reversed={reversed} Icon={Icon} />;
      })}
    </div>
  );
}
