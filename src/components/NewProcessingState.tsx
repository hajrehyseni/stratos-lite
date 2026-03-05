import { useState, useEffect, useRef, useCallback } from "react";
import type { FocusLens, DecisionScale } from "@/lib/types";

interface Props {
  lens: FocusLens;
  scale: DecisionScale;
  onApiReady: () => void;
  apiResolved: boolean;
}

const lensLabels: Record<FocusLens, string> = {
  risk: "Risk",
  speed: "Speed",
  board: "Board Alignment",
  confidence: "Confidence",
};

const scaleLabels: Record<DecisionScale, string> = {
  tactical: "Startup / Small Team",
  operational: "Department",
  strategic: "Organisation",
  existential: "Market / Industry",
};

const analysisSteps = (lens: FocusLens, scale: DecisionScale) => [
  "Parsing decision context...",
  "Mapping stakeholder landscape...",
  "Identifying hidden assumptions...",
  "Stress-testing the inverse position...",
  "Building risk register...",
  "Generating strategic recommendation...",
];

export function NewProcessingState({ lens, scale, onApiReady, apiResolved }: Props) {
  const [visible, setVisible] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [completedLines, setCompletedLines] = useState<Set<number>>(new Set());
  const [fadingOut, setFadingOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lines = analysisSteps(lens, scale);

  // Fade in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Reveal lines one by one, 800ms apart
  useEffect(() => {
    if (visibleLines < lines.length && !apiResolved) {
      timerRef.current = setTimeout(() => {
        setVisibleLines((v) => v + 1);
        // Mark previous line as complete
        if (visibleLines > 0) {
          setCompletedLines((prev) => new Set(prev).add(visibleLines - 1));
        }
      }, visibleLines === 0 ? 300 : 800);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
  }, [visibleLines, apiResolved, lines.length]);

  // When API resolves: rapidly show remaining lines, then transition
  useEffect(() => {
    if (!apiResolved) return;

    // Show all remaining lines rapidly
    const remaining = lines.length - visibleLines;
    if (remaining > 0) {
      let i = 0;
      const rapid = setInterval(() => {
        setVisibleLines((v) => v + 1);
        setCompletedLines((prev) => {
          const next = new Set(prev);
          // complete all shown lines
          for (let j = 0; j <= visibleLines + i; j++) next.add(j);
          return next;
        });
        i++;
        if (i >= remaining) {
          clearInterval(rapid);
          // Mark all complete
          setTimeout(() => {
            setCompletedLines(new Set(lines.map((_, idx) => idx)));
            setTimeout(() => {
              setFadingOut(true);
              setTimeout(onApiReady, 200);
            }, 400);
          }, 100);
        }
      }, 100);
      return () => clearInterval(rapid);
    } else {
      // All lines already shown
      setCompletedLines(new Set(lines.map((_, idx) => idx)));
      setTimeout(() => {
        setFadingOut(true);
        setTimeout(onApiReady, 200);
      }, 400);
    }
  }, [apiResolved]);

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
        <div
          className="rounded-xl"
          style={{
            background: "#0F0F0F",
            border: "1px solid #1A1A1A",
            padding: "28px 24px",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <span
              className="inline-block rounded-full"
              style={{
                width: 8,
                height: 8,
                background: "#C9A84C",
                animation: "pulse-dot 1.5s ease-in-out infinite",
              }}
            />
            <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "#666" }}>
              ANALYSING
            </span>
          </div>

          {/* Analysis lines */}
          <div className="space-y-3">
            {lines.slice(0, visibleLines).map((line, i) => {
              const isComplete = completedLines.has(i);
              const isLast = i === visibleLines - 1 && !isComplete;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3"
                  style={{ animation: "fadeInSimple 400ms ease forwards" }}
                >
                  <span style={{ fontSize: 13, color: isComplete ? "#C9A84C" : "transparent", width: 16, flexShrink: 0, textAlign: "center" }}>
                    {isComplete ? "✓" : " "}
                  </span>
                  <span
                    className="processing-line-text"
                    style={{ fontSize: 14, color: isComplete ? "#666" : "#555" }}
                  >
                    {line}
                    {isLast && (
                      <span className="terminal-cursor" style={{ color: "#C9A84C" }}>│</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
