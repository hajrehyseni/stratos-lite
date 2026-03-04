import type { DiagnosticAnswers } from "@/lib/types";
import { getFocusLabel, getScaleLabel } from "@/lib/prompt-builder";

interface Props {
  diagnostic: DiagnosticAnswers;
  depth: number;
}

const focusShortLabel: Record<string, string> = {
  risk: "risk lens",
  speed: "speed lens",
  board: "board lens",
  confidence: "confidence lens",
};

export function PromptQualityBadge({ diagnostic, depth }: Props) {
  const enrichments = [diagnostic.budget, diagnostic.timeline, diagnostic.constraint].filter(Boolean).length;

  return (
    <div className="flex items-center justify-center gap-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
      <div className="flex gap-0.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className={`inline-block w-2 h-2 rounded-full ${i < depth ? "bg-gold" : "bg-secondary"}`}
          />
        ))}
      </div>
      <span>
        Expert prompt · {focusShortLabel[diagnostic.focus]} · {diagnostic.scale} scale · {enrichments} enrichment{enrichments !== 1 ? "s" : ""} · private session
      </span>
    </div>
  );
}
