import { useEffect, useRef } from "react";

function useFadeIn(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 600ms ease, transform 600ms ease";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
}

function DiagnoseMockup() {
  const cards = ["Market Opportunity", "Financial Risk", "Team Readiness", "Competitive Timing"];
  return (
    <div className="rounded-2xl p-5 opacity-60" style={{ background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.1)", maxWidth: 280 }}>
      <div className="grid grid-cols-2 gap-2">
        {cards.map((c) => (
          <div key={c} className="rounded-lg px-3 py-2" style={{ background: "#0F0F0F", borderLeft: "3px solid hsl(var(--primary))" }}>
            <span className="text-xs" style={{ color: "hsl(var(--foreground))" }}>{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssessMockup() {
  const risks = [
    { text: "Integration timeline exceeds 12-month window", color: "#ef4444" },
    { text: "Target's engineering team will stay post-acquisition", color: "hsl(var(--primary))" },
    { text: "CTO opposes but hasn't voiced it yet", color: "#3b82f6" },
  ];
  return (
    <div className="space-y-2 opacity-60" style={{ maxWidth: 280 }}>
      {risks.map((r, i) => (
        <div
          key={i}
          className="rounded-lg px-4 py-3"
          style={{ background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.1)", borderLeft: `3px solid ${r.color}` }}
        >
          <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{r.text}</span>
        </div>
      ))}
    </div>
  );
}

function DecideMockup() {
  return (
    <div className="rounded-2xl p-5 opacity-60" style={{ background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.1)", maxWidth: 280 }}>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-3xl font-bold" style={{ color: "hsl(var(--primary))" }}>72</span>
        <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>/100</span>
      </div>
      <div className="w-full h-1.5 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full" style={{ width: "72%", background: "hsl(var(--primary))" }} />
      </div>
      <div
        className="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold"
        style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", color: "hsl(var(--primary))" }}
      >
        Conditional Proceed
      </div>
    </div>
  );
}

function ScrollToInput() {
  const handleClick = () => {
    const input = document.querySelector<HTMLInputElement>("#hero-input");
    if (input) {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => input.focus(), 400);
    }
  };
  return (
    <button
      onClick={handleClick}
      className="mt-4 text-sm font-semibold transition-opacity hover:opacity-80"
      style={{ color: "hsl(var(--primary))", background: "none", border: "none", padding: 0 }}
    >
      Try it free →
    </button>
  );
}

const sections = [
  {
    num: "1.0",
    tag: "Diagnose",
    heading: "Break any decision into its complete parts",
    body: "Our AI applies MECE logic to map every angle of your decision — the same framework McKinsey uses. No blind spots.",
    visual: <DiagnoseMockup />,
    showCTA: false,
  },
  {
    num: "2.0",
    tag: "Assess",
    heading: "See what could go wrong — before it does",
    body: "Surface the three risks most likely to derail you, with specific action steps to neutralise each one.",
    visual: <AssessMockup />,
    showCTA: false,
  },
  {
    num: "3.0",
    tag: "Decide",
    heading: "Get a confidence score, not just a gut feeling",
    body: "Get a calibrated confidence score out of 100, a clear verdict, and a devil's advocate challenge.",
    visual: <DecideMockup />,
    showCTA: true,
  },
];

export function SystemSections() {
  return (
    <div style={{ maxWidth: 1152 }} className="mx-auto px-4 sm:px-6">
      {sections.map((s, i) => {
        const ref = useRef<HTMLDivElement>(null);
        useFadeIn(ref);
        const reversed = i % 2 === 1;

        return (
          <div
            key={s.num}
            ref={ref}
            className="py-20 md:py-28 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center"
          >
            <div className={reversed ? "md:order-2" : ""}>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{ background: "rgba(201,168,76,0.12)", color: "hsl(var(--primary))" }}
                >
                  {s.num}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ letterSpacing: "0.15em", color: "hsl(var(--primary))" }}
                >
                  {s.tag}
                </span>
              </div>
              <h2
                className="text-3xl font-semibold mb-4"
                style={{ color: "hsl(var(--foreground))", lineHeight: 1.2 }}
              >
                {s.heading}
              </h2>
              <p className="text-base leading-relaxed" style={{ color: "hsl(var(--muted-foreground))", lineHeight: 1.65 }}>
                {s.body}
              </p>
              {s.showCTA && <ScrollToInput />}
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
