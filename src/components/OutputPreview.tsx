import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="px-4 sm:px-6 py-16 md:py-24">
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
            <span className="text-2xl font-extrabold" style={{ color: "hsl(var(--primary))" }}>72</span>
          </div>
          <div>
            <span
              className="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase"
              style={{
                background: "hsla(38, 92%, 50%, 0.12)",
                border: "1px solid hsla(38, 92%, 50%, 0.3)",
                color: "hsl(var(--warning))",
                letterSpacing: "0.05em",
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
          {dimensions.map((d) => (
            <div key={d.label}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium" style={{ color: "hsl(var(--text-primary))" }}>{d.label}</span>
                <span className="text-sm font-bold" style={{ color: barColor(d.score) }}>{d.score}%</span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: "hsl(var(--border))" }}>
                <div className="h-full rounded-full" style={{ width: `${d.score}%`, background: barColor(d.score), transition: "width 600ms ease-out" }} />
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
