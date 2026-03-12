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
  "Parsing decision context...",
  "Mapping stakeholder landscape...",
  "Identifying hidden assumptions...",
  "Stress-testing the inverse position...",
  "Building risk register...",
  "Generating strategic recommendation...",
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
        {/* Decision text preview */}
        {truncated && (
          <div className="flex justify-center mb-6">
            <span
              className="inline-block rounded-full px-5 py-2 text-sm italic truncate"
              style={{
                maxWidth: 448,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#6B7280",
              }}
            >
              {truncated}
            </span>
          </div>
        )}

        <div
          className="rounded-xl processing-glow"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "28px 24px",
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <span
              className="inline-block rounded-full"
              style={{
                width: 8, height: 8,
                background: "hsl(16, 100%, 62%)",
                animation: "pulse-dot 1.5s ease-in-out infinite",
              }}
            />
            <span className="text-xs font-medium" style={{ letterSpacing: "0.1em", color: "#6B7280" }}>
              Analysing
            </span>
          </div>

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
                  <span style={{ fontSize: 13, color: isComplete ? "hsl(160, 84%, 39%)" : "transparent", width: 16, flexShrink: 0, textAlign: "center" }}>
                    {isComplete ? "✓" : " "}
                  </span>
                  <span
                    className="processing-line-text text-sm"
                    style={{ color: isComplete ? "#6B7280" : "rgba(255,255,255,0.3)" }}
                  >
                    {line}
                    {isLast && (
                      <span className="terminal-cursor" style={{ color: "hsl(16, 100%, 62%)" }}>│</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center mt-4 text-sm" style={{ color: "#6B7280" }}>
          Applying 6 strategic frameworks...
        </p>
      </div>
    </div>
  );
}
