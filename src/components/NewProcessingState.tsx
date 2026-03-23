import { useState, useEffect, useRef } from "react";
import type { FocusLens, DecisionScale } from "@/lib/types";

interface Props {
  lens: FocusLens;
  scale: DecisionScale;
  onApiReady: () => void;
  apiResolved: boolean;
  decisionText?: string;
}

const analysisSteps = () => [
  "Mapping decision architecture...",
  "Modelling stakeholder dynamics...",
  "Stress-testing assumptions...",
  "Running pre-mortem analysis...",
  "Quantifying risk exposure...",
  "Synthesising strategic verdict...",
];

export function NewProcessingState({ lens, scale, onApiReady, apiResolved, decisionText }: Props) {
  const [visible, setVisible] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [completedLines, setCompletedLines] = useState<Set<number>>(new Set());
  const [fadingOut, setFadingOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lines = analysisSteps();

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    if (visibleLines < lines.length && !apiResolved) {
      timerRef.current = setTimeout(() => {
        setVisibleLines((v) => v + 1);
        if (visibleLines > 0) {
          setCompletedLines((prev) => new Set(prev).add(visibleLines - 1));
        }
      }, visibleLines === 0 ? 300 : 800);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
  }, [visibleLines, apiResolved, lines.length]);

  useEffect(() => {
    if (!apiResolved) return;
    const remaining = lines.length - visibleLines;
    if (remaining > 0) {
      let i = 0;
      const rapid = setInterval(() => {
        setVisibleLines((v) => v + 1);
        setCompletedLines((prev) => {
          const next = new Set(prev);
          for (let j = 0; j <= visibleLines + i; j++) next.add(j);
          return next;
        });
        i++;
        if (i >= remaining) {
          clearInterval(rapid);
          setTimeout(() => {
            setCompletedLines(new Set(lines.map((_, idx) => idx)));
            setTimeout(() => { setFadingOut(true); setTimeout(onApiReady, 200); }, 400);
          }, 100);
        }
      }, 100);
      return () => clearInterval(rapid);
    } else {
      setCompletedLines(new Set(lines.map((_, idx) => idx)));
      setTimeout(() => { setFadingOut(true); setTimeout(onApiReady, 200); }, 400);
    }
  }, [apiResolved]);

  const truncated = decisionText
    ? decisionText.length > 80 ? decisionText.slice(0, 80) + "…" : decisionText
    : null;

  const progressPercent = Math.round((completedLines.size / lines.length) * 100);

  return (
    <div
      className="flex flex-col items-center justify-center px-4"
      style={{
        minHeight: "90vh",
        opacity: visible && !fadingOut ? 1 : 0,
        transform: visible && !fadingOut ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 300ms ease, transform 300ms ease",
      }}
    >
      <div className="w-full" style={{ maxWidth: 720 }}>
        {truncated && (
          <div className="flex justify-center mb-8">
            <span className="inline-block rounded-full px-6 py-3 text-base italic truncate" style={{ maxWidth: 500, background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--text-secondary))" }}>
              {truncated}
            </span>
          </div>
        )}

        <div className="rounded-xl" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", padding: "32px 28px" }}>
          <div className="flex items-center gap-2.5 mb-6">
            <span className="inline-block rounded-full" style={{ width: 10, height: 10, background: "hsl(var(--primary))", animation: "pulse-dot 1.5s ease-in-out infinite", boxShadow: "0 0 8px hsla(221, 83%, 53%, 0.4)" }} />
            <span className="text-sm font-semibold" style={{ letterSpacing: "0.1em", color: "hsl(var(--text-secondary))" }}>
              Analysing — {completedLines.size} of {lines.length} frameworks applied
            </span>
          </div>

          <div className="space-y-4">
            {lines.slice(0, visibleLines).map((line, i) => {
              const isComplete = completedLines.has(i);
              const isLast = i === visibleLines - 1 && !isComplete;
              return (
                <div key={i} className="flex items-center gap-3" style={{ animation: `fadeInSimple 400ms ease forwards`, animationDelay: `${i * 200}ms` }}>
                  <span style={{ fontSize: 14, color: isComplete ? "hsl(var(--success))" : "transparent", width: 18, flexShrink: 0, textAlign: "center", transition: "color 0.3s ease" }}>
                    {isComplete ? "✓" : " "}
                  </span>
                  <span className="processing-line-text text-base" style={{ color: isComplete ? "hsl(var(--text-tertiary))" : "hsl(var(--text-primary))" }}>
                    {line}
                    {isLast && <span className="terminal-cursor" style={{ color: "hsl(var(--primary))" }}>│</span>}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-6 w-full h-1.5 rounded-full" style={{ background: "hsl(var(--border))" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%`, background: "hsl(var(--primary))" }} />
          </div>
        </div>

        <p className="text-center mt-6 text-base" style={{ color: "hsl(var(--text-secondary))" }}>
          6 frameworks · 10-step methodology
        </p>
      </div>
    </div>
  );
}
