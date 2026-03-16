import { useEffect, useRef } from "react";

function useFadeIn(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(16px)";
    el.style.transition = "opacity 400ms ease, transform 400ms ease";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
}

function DiagnoseMockup() {
  const cards = ["Market Opportunity", "Financial Risk", "Team Readiness", "Competitive Timing"];
  return (
    <div className="rounded-2xl p-5" style={{ background: "hsla(0, 0%, 100%, 0.04)", border: "1px solid hsla(0, 0%, 100%, 0.08)", maxWidth: 300 }}>
      <div className="grid grid-cols-2 gap-2.5">
        {cards.map((c) => (
          <div key={c} className="rounded-lg px-3 py-2.5" style={{ background: "hsla(0, 0%, 100%, 0.04)", borderLeft: "3px solid hsl(var(--primary))" }}>
            <span className="text-sm" style={{ color: "hsl(var(--text-primary))" }}>{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssessMockup() {
  const risks = [
    { text: "Integration timeline exceeds 12-month window", color: "hsl(var(--destructive))" },
    { text: "Target's engineering team will stay post-acquisition", color: "hsl(var(--warning))" },
    { text: "CTO opposes but hasn't voiced it yet", color: "hsl(217, 91%, 60%)" },
  ];
  return (
    <div className="space-y-2.5" style={{ maxWidth: 300 }}>
      {risks.map((r, i) => (
        <div
          key={i}
          className="rounded-lg px-4 py-3"
          style={{ background: "hsla(0, 0%, 100%, 0.04)", border: "1px solid hsla(0, 0%, 100%, 0.08)", borderLeft: `3px solid ${r.color}` }}
        >
          <span className="text-sm" style={{ color: "hsl(var(--text-secondary))" }}>{r.text}</span>
        </div>
      ))}
    </div>
  );
}

function DecideMockup() {
  return (
    <div className="rounded-2xl p-5" style={{ background: "hsla(0, 0%, 100%, 0.04)", border: "1px solid hsla(0, 0%, 100%, 0.08)", maxWidth: 300 }}>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-4xl font-extrabold" style={{ color: "hsl(var(--primary))" }}>72</span>
        <span className="text-base" style={{ color: "hsl(var(--text-tertiary))" }}>/100</span>
      </div>
      <div className="w-full h-2 rounded-full mb-3" style={{ background: "hsla(0, 0%, 100%, 0.06)" }}>
        <div className="h-full rounded-full" style={{ width: "72%", background: "hsl(var(--primary))" }} />
      </div>
      <div
        className="inline-flex rounded-full px-3 py-1 text-xs font-bold"
        style={{ background: "hsla(38, 92%, 50%, 0.12)", border: "1px solid hsla(38, 92%, 50%, 0.3)", color: "hsl(var(--warning))" }}
      >
        Conditional Proceed
      </div>
    </div>
  );
}

const sections = [
  {
    num: "01",
    tag: "Diagnose",
    heading: "Break any decision into its complete parts",
    body: "Our AI applies MECE logic to map every angle of your decision — the same framework McKinsey uses. No blind spots.",
    visual: <DiagnoseMockup />,
  },
  {
    num: "02",
    tag: "Assess",
    heading: "See what could go wrong — before it does",
    body: "Surface the three risks most likely to derail you, with specific action steps to neutralise each one.",
    visual: <AssessMockup />,
  },
  {
    num: "03",
    tag: "Decide",
    heading: "Get a confidence score, not just a gut feeling",
    body: "Get a calibrated confidence score out of 100, a clear verdict, and a devil's advocate challenge.",
    visual: <DecideMockup />,
  },
];

export function SystemSections() {
  return (
    <div id="features" style={{ maxWidth: 1120 }} className="mx-auto px-4 sm:px-6 scroll-mt-20">
      {sections.map((s, i) => {
        const ref = useRef<HTMLDivElement>(null);
        useFadeIn(ref);
        const reversed = i % 2 === 1;

        return (
          <div
            key={s.num}
            ref={ref}
            className="py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center"
          >
            <div className={reversed ? "md:order-2" : ""}>
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="inline-flex items-center justify-center rounded-lg font-extrabold"
                  style={{ width: 36, height: 36, background: "hsla(16, 100%, 62%, 0.12)", color: "hsl(var(--primary))", fontSize: 14 }}
                >
                  {s.num}
                </span>
                <span
                  className="text-sm font-semibold uppercase"
                  style={{ letterSpacing: "0.1em", color: "hsl(var(--primary))" }}
                >
                  {s.tag}
                </span>
              </div>
              <h2
                className="text-2xl sm:text-3xl font-bold mb-4"
                style={{ color: "hsl(var(--text-primary))", lineHeight: 1.2 }}
              >
                {s.heading}
              </h2>
              <p className="text-base leading-relaxed" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.7 }}>
                {s.body}
              </p>
            </div>
            {/* Mockup visuals — hidden on mobile to save space */}
            <div className={`${reversed ? "md:order-1" : ""} hidden md:flex justify-center`}>
              {s.visual}
            </div>
          </div>
        );
      })}
    </div>
  );
}
