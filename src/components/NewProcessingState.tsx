import { useState, useEffect, useRef } from "react";
import type { FocusLens, DecisionScale } from "@/lib/types";

interface Props {
  lens: FocusLens;
  scale: DecisionScale;
  onMinTimeReached: () => void;
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

export function NewProcessingState({ lens, scale, onMinTimeReached }: Props) {
  const [phase, setPhase] = useState<"terminal" | "skeleton">("terminal");
  const [lines, setLines] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);
  const minTimeRef = useRef(false);

  const terminalLines = [
    "> Analysing decision context...",
    `> Applying ${lensLabels[lens]} framework...`,
    `> Calibrating for ${scaleLabels[scale]} impact...`,
    "> Assembling McKinsey-grade audit...",
  ];

  // Fade in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Type terminal lines
  useEffect(() => {
    let i = 0;
    const addLine = () => {
      if (i < terminalLines.length) {
        setLines((prev) => [...prev, terminalLines[i]]);
        i++;
        setTimeout(addLine, 400);
      } else {
        // After all lines typed, transition to skeleton
        setTimeout(() => setPhase("skeleton"), 500);
      }
    };
    setTimeout(addLine, 300);
  }, []);

  // Minimum 3s skeleton display
  useEffect(() => {
    if (phase === "skeleton") {
      const t = setTimeout(() => {
        minTimeRef.current = true;
        onMinTimeReached();
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [phase, onMinTimeReached]);

  return (
    <div
      className="flex flex-col items-center justify-center px-4"
      style={{
        minHeight: "90vh",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 400ms ease 200ms, transform 400ms ease 200ms",
      }}
    >
      <div className="w-full" style={{ maxWidth: 640 }}>
        {phase === "terminal" && (
          <div
            style={{
              animation: "fadeInSimple 300ms ease forwards",
            }}
          >
            <h3
              className="text-center mb-6"
              style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}
            >
              Building your expert prompt...
            </h3>
            <div
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8,
                padding: 20,
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 12,
                color: "rgba(201,168,76,0.7)",
                minHeight: 120,
              }}
            >
              {lines.map((line, i) => (
                <div
                  key={i}
                  className="mb-1"
                  style={{
                    animation: "fadeInSimple 200ms ease forwards",
                  }}
                >
                  {line}
                  {i === lines.length - 1 && (
                    <span className="terminal-cursor">▊</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === "skeleton" && (
          <div
            style={{
              animation: "fadeInSimple 300ms ease forwards",
            }}
          >
            <h3
              className="text-center mb-6"
              style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}
            >
              Running your decision audit...
            </h3>
            <div className="space-y-4">
              {[80, 80, 80].map((h, i) => (
                <div
                  key={i}
                  className="skeleton-shimmer"
                  style={{
                    height: h,
                    borderRadius: 12,
                    background:
                      "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    animationDelay: `${i * 200}ms`,
                  }}
                />
              ))}
            </div>
            <p
              className="text-center mt-6"
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.25)",
              }}
            >
              This usually takes 5–10 seconds
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
