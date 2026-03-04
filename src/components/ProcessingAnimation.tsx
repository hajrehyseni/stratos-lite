import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

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
      <div className="w-full max-w-md space-y-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto" />
        <div className="space-y-2">
          {steps.map((s, i) => (
            <p
              key={i}
              className={`text-sm font-mono transition-all duration-300 ${
                i < currentStep
                  ? "text-gold opacity-100"
                  : i === currentStep
                  ? "text-foreground opacity-100"
                  : "text-muted-foreground opacity-30"
              }`}
            >
              {i < currentStep ? "✓" : i === currentStep ? "●" : "○"} {s}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
