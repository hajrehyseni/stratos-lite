import { useState, useEffect, useRef } from "react";
import type { FocusLens, DecisionScale } from "@/lib/types";

interface Props {
  lens: FocusLens;
  scale: DecisionScale;
  onApiReady: () => void;
  apiResolved: boolean;
  decisionText?: string;
}

const analysisSteps = [
  "Mapping decision architecture...",
  "Modelling stakeholder dynamics...",
  "Stress-testing assumptions...",
  "Running pre-mortem analysis...",
  "Quantifying risk exposure...",
  "Synthesising strategic verdict...",
];

export function NewProcessingState({ onApiReady, apiResolved, decisionText }: Props) {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const [textFade, setTextFade] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Step through analysis labels
  useEffect(() => {
    if (currentStep < analysisSteps.length - 1 && !apiResolved) {
      timerRef.current = setTimeout(() => {
        setTextFade(false);
        setTimeout(() => {
          setCurrentStep(s => s + 1);
          setTextFade(true);
        }, 200);
      }, currentStep === 0 ? 400 : 1800);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
  }, [currentStep, apiResolved]);

  // When API resolves, fast-forward and exit
  useEffect(() => {
    if (!apiResolved) return;
    setCurrentStep(analysisSteps.length - 1);
    setTextFade(true);
    setTimeout(() => {
      setFadingOut(true);
      setTimeout(onApiReady, 250);
    }, 600);
  }, [apiResolved]);

  const truncated = decisionText
    ? decisionText.length > (window.innerWidth < 640 ? 50 : 80) ? decisionText.slice(0, window.innerWidth < 640 ? 47 : 77) + "…" : decisionText
    : null;

  const progressPercent = Math.round(((currentStep + 1) / analysisSteps.length) * 100);

  return (
    <div
      className="flex flex-col items-center justify-center px-4"
      style={{
        minHeight: window.innerWidth < 640 ? "80vh" : "90vh",
        opacity: visible && !fadingOut ? 1 : 0,
        transform: visible && !fadingOut ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 250ms ease, transform 250ms ease",
      }}
    >
      {truncated && (
        <div className="mb-8">
          <span className="inline-block rounded-full px-5 py-2.5 text-sm italic truncate" style={{ maxWidth: 400, background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--text-secondary))" }}>
            {truncated}
          </span>
        </div>
      )}

      {/* Pulsing concentric rings */}
      <div className="relative flex items-center justify-center mb-8" style={{ width: 160, height: 160 }}>
        <div className="absolute rounded-full shazam-ring" style={{ width: 160, height: 160, border: "2px solid hsla(221, 83%, 53%, 0.08)", animationDelay: "0s" }} />
        <div className="absolute rounded-full shazam-ring" style={{ width: 120, height: 120, border: "2px solid hsla(221, 83%, 53%, 0.15)", animationDelay: "0.3s" }} />
        <div className="absolute rounded-full shazam-ring" style={{ width: 80, height: 80, border: "2px solid hsla(221, 83%, 53%, 0.25)", animationDelay: "0.6s" }} />
        <div className="rounded-full flex items-center justify-center" style={{ width: 48, height: 48, background: "hsl(var(--primary))", boxShadow: "0 0 24px hsla(221, 83%, 53%, 0.4)" }}>
          <div className="rounded-full" style={{ width: 12, height: 12, background: "hsl(var(--primary-foreground))" }} />
        </div>
      </div>

      {/* Cross-fading step text */}
      <p className="text-base font-medium text-center" style={{
        color: "hsl(var(--text-secondary))",
        opacity: textFade ? 1 : 0,
        transition: "opacity 200ms ease",
        minHeight: 24,
      }}>
        {analysisSteps[currentStep]}
      </p>

      {/* Progress bar */}
      <div className="mt-8 w-full h-0.5 rounded-full" style={{ maxWidth: 240, background: "hsl(var(--border))" }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%`, background: "hsl(var(--primary))" }} />
      </div>

      <p className="text-center mt-4 text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>
        6 frameworks · 10-step methodology
      </p>
    </div>
  );
}
