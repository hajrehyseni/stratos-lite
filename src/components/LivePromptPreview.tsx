import type { DiagnosticAnswers } from "@/lib/types";
import { getFocusLabel, getScaleLabel } from "@/lib/prompt-builder";

interface Props {
  answers: Partial<DiagnosticAnswers>;
}

interface PromptLine {
  key: string;
  label: string;
  value: string;
  active: boolean;
  color: "gold" | "blue" | "green";
}

export function LivePromptPreview({ answers }: Props) {
  const focusLabels: Record<string, string> = {
    risk: "RISK — Downside-first analysis",
    speed: "SPEED — Fastest validation path",
    board: "BOARD — Stakeholder presentation case",
    confidence: "CONFIDENCE — Assumption stress-test",
  };

  const scaleLabels: Record<string, string> = {
    tactical: "TACTICAL — low stakes, reversible",
    operational: "OPERATIONAL — moderate stakes",
    strategic: "STRATEGIC — full scrutiny",
    existential: "EXISTENTIAL — maximum scrutiny",
  };

  const lines: PromptLine[] = [
    { key: "role", label: "ROLE:", value: "McKinsey + VC + Board + Risk Officer", active: true, color: "gold" },
    { key: "decision", label: "DECISION:", value: answers.decision ? `"${answers.decision.slice(0, 60)}${answers.decision.length > 60 ? "..." : ""}"` : "—", active: !!answers.decision, color: "blue" },
    { key: "lens", label: "LENS:", value: answers.focus ? focusLabels[answers.focus] || answers.focus : "—", active: !!answers.focus, color: "green" },
    { key: "scale", label: "SCALE:", value: answers.scale ? scaleLabels[answers.scale] || answers.scale : "—", active: !!answers.scale, color: "green" },
    { key: "budget", label: "BUDGET:", value: answers.budget || "—", active: !!answers.budget, color: "gold" },
    { key: "timeline", label: "TIMELINE:", value: answers.timeline || "—", active: !!answers.timeline, color: "gold" },
    { key: "constraint", label: "CONSTRAINT:", value: answers.constraint || "—", active: !!answers.constraint, color: "gold" },
    { key: "frameworks", label: "FRAMEWORKS:", value: "MECE · Devil's Advocate · Pre-Mortem", active: true, color: "blue" },
    { key: "privacy", label: "PRIVACY:", value: "Session only · Zero retention · Board-safe ✓", active: true, color: "green" },
  ];

  const colorMap = {
    gold: "text-gold",
    blue: "text-blue-400",
    green: "text-emerald-400",
  };

  return (
    <div className="bg-background border border-border rounded-lg p-4 mt-4">
      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
        Your expert prompt — building live
      </p>
      <div className="space-y-1 font-mono text-xs">
        {lines.map((line) => (
          <div
            key={line.key}
            className={`flex gap-3 transition-opacity duration-300 ${
              line.active ? "opacity-80" : "opacity-20"
            }`}
          >
            <span className={`w-24 shrink-0 ${line.active ? colorMap[line.color] : "text-muted-foreground"}`}>
              {line.label}
            </span>
            <span className={line.active ? "text-foreground" : "text-muted-foreground"}>
              {line.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
