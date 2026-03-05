import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import type { FocusLens, DecisionScale } from "@/lib/types";

interface Props {
  decision: string;
  onComplete: (lens: FocusLens, scale: DecisionScale) => void;
  onSkip: () => void;
}

const lensOptions: { key: FocusLens; emoji: string; label: string; desc: string }[] = [
  { key: "risk", emoji: "🛡️", label: "Risk", desc: "What could go wrong?" },
  { key: "speed", emoji: "⚡", label: "Speed", desc: "How fast can we move?" },
  { key: "board", emoji: "👔", label: "Board Alignment", desc: "Will stakeholders back this?" },
  { key: "confidence", emoji: "📊", label: "Confidence", desc: "Do we have enough data?" },
];

const scaleOptions: { key: DecisionScale; emoji: string; label: string; desc: string }[] = [
  { key: "tactical", emoji: "🚀", label: "Startup / Small Team", desc: "Under 20 people affected" },
  { key: "operational", emoji: "🏢", label: "Department", desc: "One business unit" },
  { key: "strategic", emoji: "🏛️", label: "Organisation", desc: "Company-wide impact" },
  { key: "existential", emoji: "🌍", label: "Market / Industry", desc: "Sector-level consequences" },
];

type Step = 2 | 3;

export function NewDiagnosticFlow({ decision, onComplete, onSkip }: Props) {
  const [step, setStep] = useState<Step>(2);
  const [lens, setLens] = useState<FocusLens | null>(null);
  const [scale, setScale] = useState<DecisionScale | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleLensSelect = (l: FocusLens) => {
    setLens(l);
    setTimeout(() => setStep(3), 500);
  };

  const handleScaleSelect = (s: DecisionScale) => {
    setScale(s);
    setTimeout(() => {
      if (lens) onComplete(lens, s);
    }, 600);
  };

  const progressSegments = [true, lens !== null, scale !== null];

  return (
    <div
      className="flex flex-col items-center justify-center px-4 transition-all duration-400"
      style={{
        minHeight: "90vh",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 400ms ease 200ms, transform 400ms ease 200ms",
      }}
    >
      <div className="w-full" style={{ maxWidth: 640 }}>
        {/* Progress bar */}
        <div className="flex gap-1 mb-10">
          {progressSegments.map((filled, i) => (
            <div
              key={i}
              className="flex-1 rounded-full transition-all duration-500"
              style={{
                height: 3,
                background: filled ? "#C9A84C" : "rgba(255,255,255,0.06)",
              }}
            />
          ))}
        </div>

        {/* Q1 - Decision summary (always shown as completed) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "#C9A84C",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              YOUR DECISION
            </span>
            <span style={{ color: "rgba(201,168,76,0.5)", fontSize: 14 }}>✓</span>
          </div>
          <p
            style={{
              fontSize: 15,
              fontWeight: 400,
              color: "rgba(255,255,255,0.7)",
              borderLeft: "2px solid rgba(201,168,76,0.3)",
              paddingLeft: 16,
            }}
          >
            {decision}
          </p>
        </div>

        {/* Skip link — only before Q2 is answered */}
        {step === 2 && lens === null && (
          <div className="mb-6">
            <button
              onClick={onSkip}
              className="transition-opacity duration-200 hover:underline"
              style={{
                fontSize: 11,
                color: "#555",
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              Skip to instant audit →
            </button>
          </div>
        )}

        {/* Q2 - Lens selection */}
        {step >= 2 && !scale && (
          <div
            className="mb-8"
            style={{ animation: "slideInFromBottom 300ms ease forwards" }}
          >
            {lens && step === 3 ? (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: 10, fontWeight: 500, color: "#C9A84C", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                    YOUR FOCUS
                  </span>
                  <span style={{ color: "rgba(201,168,76,0.5)", fontSize: 14 }}>✓</span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,0.7)", borderLeft: "2px solid rgba(201,168,76,0.3)", paddingLeft: 16 }}>
                  {lensOptions.find((o) => o.key === lens)?.emoji}{" "}
                  {lensOptions.find((o) => o.key === lens)?.label}
                </p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                  STEP 2 OF 3
                </p>
                <h2 style={{ fontSize: 22, fontWeight: 600, color: "#fff", marginTop: 8, marginBottom: 16 }}>
                  What matters most to you right now?
                </h2>
                <div className="grid grid-cols-2 gap-3 diagnostic-grid">
                  {lensOptions.map((opt) => {
                    const selected = lens === opt.key;
                    const dimmed = lens !== null && !selected;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleLensSelect(opt.key)}
                        className="text-left relative transition-all duration-200 cursor-pointer"
                        style={{
                          padding: 20,
                          borderRadius: 12,
                          background: selected ? "rgba(201,168,76,0.06)" : "rgba(255,255,255,0.03)",
                          border: selected ? "1px solid #C9A84C" : "1px solid rgba(255,255,255,0.06)",
                          opacity: dimmed ? 0.5 : 1,
                          transform: selected ? "scale(1.02)" : "scale(1)",
                          minHeight: 48,
                        }}
                      >
                        {selected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#C9A84C" }}>
                            <Check className="w-3 h-3" style={{ color: "#080808" }} />
                          </div>
                        )}
                        <span style={{ fontSize: 20 }}>{opt.emoji}</span>
                        <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginTop: 8 }}>{opt.label}</p>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Q3 - Scale selection */}
        {step === 3 && (
          <div style={{ animation: "slideInFromBottom 300ms ease forwards" }}>
            <p style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
              STEP 3 OF 3
            </p>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "#fff", marginTop: 8, marginBottom: 16 }}>
              What is the scale of this decision?
            </h2>
            <div className="grid grid-cols-2 gap-3 diagnostic-grid">
              {scaleOptions.map((opt) => {
                const selected = scale === opt.key;
                const dimmed = scale !== null && !selected;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleScaleSelect(opt.key)}
                    className="text-left relative transition-all duration-200 cursor-pointer"
                    style={{
                      padding: 20,
                      borderRadius: 12,
                      background: selected ? "rgba(201,168,76,0.06)" : "rgba(255,255,255,0.03)",
                      border: selected ? "1px solid #C9A84C" : "1px solid rgba(255,255,255,0.06)",
                      opacity: dimmed ? 0.5 : 1,
                      transform: selected ? "scale(1.02)" : "scale(1)",
                      minHeight: 48,
                    }}
                  >
                    {selected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#C9A84C" }}>
                        <Check className="w-3 h-3" style={{ color: "#080808" }} />
                      </div>
                    )}
                    <span style={{ fontSize: 20 }}>{opt.emoji}</span>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginTop: 8 }}>{opt.label}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
