import { useState, useEffect } from "react";

interface Props {
  onComplete: () => void;
}

const steps = [
  "Applying McKinsey MECE structure...",
  "Running devil's advocate stress test...",
  "Mapping hidden assumptions...",
  "Calibrating stakeholder gaps...",
  "Scoring decision confidence...",
  "Assembling board brief...",
];

export function ProcessingAnimation({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < steps.length) {
      const t = setTimeout(() => setCurrentStep((s) => s + 1), 460);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(onComplete, 400);
      return () => clearTimeout(t);
    }
  }, [currentStep, onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Skeleton preview of scorecard */}
        <div className="space-y-3">
          {/* Score skeleton */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full border-2 border-gold/30 skeleton-pulse" />
          </div>
          {/* Card skeletons */}
          {steps.map((s, i) => (
            <div
              key={i}
              className={`rounded-lg border px-4 py-3 transition-all duration-500 ${
                i < currentStep
                  ? "border-gold/30 bg-card"
                  : i === currentStep
                  ? "border-border bg-card"
                  : "border-border/30 bg-card/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-mono transition-all duration-300 ${
                    i < currentStep
                      ? "text-gold"
                      : i === currentStep
                      ? "text-foreground"
                      : "text-muted-foreground opacity-30"
                  }`}
                >
                  {i < currentStep ? "✓" : i === currentStep ? "●" : "○"}
                </span>
                <span
                  className={`text-sm font-mono transition-all duration-300 ${
                    i < currentStep
                      ? "text-gold"
                      : i === currentStep
                      ? "text-foreground"
                      : "text-muted-foreground opacity-30"
                  }`}
                >
                  {s}
                </span>
              </div>
              {i < currentStep && (
                <div className="mt-2 space-y-1.5">
                  <div className="h-2 bg-secondary/50 rounded w-4/5 skeleton-pulse" />
                  <div className="h-2 bg-secondary/50 rounded w-3/5 skeleton-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
