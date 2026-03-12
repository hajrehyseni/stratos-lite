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
    <div className="rounded-2xl p-5 opacity-50" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", maxWidth: 280 }}>
      <div className="grid grid-cols-2 gap-2">
        {cards.map((c) => (
          <div key={c} className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.04)", borderLeft: "3px solid hsl(16, 100%, 62%)" }}>
            <span className="text-xs" style={{ color: "#FFFFFF" }}>{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssessMockup() {
  const risks = [
    { text: "Integration timeline exceeds 12-month window", color: "hsl(0, 84%, 60%)" },
    { text: "Target's engineering team will stay post-acquisition", color: "hsl(38, 92%, 50%)" },
    { text: "CTO opposes but hasn't voiced it yet", color: "hsl(217, 91%, 60%)" },
  ];
  return (
    <div className="space-y-2 opacity-50" style={{ maxWidth: 280 }}>
      {risks.map((r, i) => (
        <div
          key={i}
          className="rounded-lg px-4 py-3"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderLeft: `3px solid ${r.color}` }}
        >
          <span className="text-xs" style={{ color: "#6B7280" }}>{r.text}</span>
        </div>
      ))}
    </div>
  );
}

function DecideMockup() {
  return (
    <div className="rounded-2xl p-5 opacity-50" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", maxWidth: 280 }}>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-3xl font-bold" style={{ color: "hsl(16, 100%, 62%)" }}>72</span>
        <span className="text-sm" style={{ color: "#6B7280" }}>/100</span>
      </div>
      <div className="w-full h-1.5 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full" style={{ width: "72%", background: "hsl(16, 100%, 62%)" }} />
      </div>
      <div
        className="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold"
        style={{ background: "hsla(38, 92%, 50%, 0.12)", border: "1px solid hsla(38, 92%, 50%, 0.3)", color: "hsl(38, 92%, 50%)" }}
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
    <div style={{ maxWidth: 1120 }} className="mx-auto px-4 sm:px-6">
      {sections.map((s, i) => {
        const ref = useRef<HTMLDivElement>(null);
        useFadeIn(ref);
        const reversed = i % 2 === 1;

        return (
          <div
            key={s.num}
            ref={ref}
            className="py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center"
          >
            <div className={reversed ? "md:order-2" : ""}>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{ background: "hsla(16, 100%, 62%, 0.12)", color: "hsl(16, 100%, 62%)" }}
                >
                  {s.num}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ letterSpacing: "0.1em", color: "hsl(16, 100%, 62%)" }}
                >
                  {s.tag}
                </span>
              </div>
              <h2
                className="text-2xl md:text-3xl mb-4"
                style={{ fontWeight: 600, color: "#FFFFFF", lineHeight: 1.2 }}
              >
                {s.heading}
              </h2>
              <p className="text-base leading-relaxed" style={{ color: "#6B7280", lineHeight: 1.6 }}>
                {s.body}
              </p>
            </div>
            <div className={`${reversed ? "md:order-1" : ""} flex justify-center md:justify-start`}>
              {s.visual}
            </div>
          </div>
        );
      })}
    </div>
  );
}
