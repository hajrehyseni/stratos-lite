import { useState } from "react";
import { ChevronDown, Copy, Check } from "lucide-react";
import type { DiagnosticAnswers } from "@/lib/types";
import { getFocusLabel, getScaleLabel } from "@/lib/prompt-builder";
import { toast } from "sonner";

interface Props {
  prompt: string;
  diagnostic: DiagnosticAnswers;
}

export function BuiltPromptAccordion({ prompt, diagnostic }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success("Prompt copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>◆ See the expert prompt StratOS built from your answers</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="bg-background border-t border-border p-4">
          <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground overflow-x-auto">
            {formatPromptHighlighted(prompt, diagnostic)}
          </pre>
          <button
            onClick={handleCopy}
            className="mt-3 flex items-center gap-1.5 text-xs font-mono text-gold hover:underline"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            Copy prompt
          </button>
        </div>
      )}
    </div>
  );
}

function formatPromptHighlighted(prompt: string, _diagnostic: DiagnosticAnswers): string {
  return prompt;
}
