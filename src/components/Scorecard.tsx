import { useState } from "react";
import { Copy, Download, Share2, Check } from "lucide-react";
import type { AuditResult, DiagnosticAnswers } from "@/lib/types";
import { generateBrief } from "@/lib/copy-brief";
import { generatePDF } from "@/lib/generate-pdf";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { PromptQualityBadge } from "./PromptQualityBadge";
import { BuiltPromptAccordion } from "./BuiltPromptAccordion";

interface ScorecardProps {
  decision: string;
  result: AuditResult;
  auditId: string;
  onReset: () => void;
  diagnostic?: DiagnosticAnswers;
  builtPrompt?: string;
}

const verdictColor: Record<string, string> = {
  Proceed: "text-success-foreground",
  "Proceed with Caution": "text-gold",
  "Test First": "text-gold",
  "High Risk": "text-destructive",
};

export function Scorecard({ decision, result, auditId, onReset, diagnostic, builtPrompt }: ScorecardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyBrief = async () => {
    const brief = generateBrief(decision, result);
    await navigator.clipboard.writeText(brief);
    setCopied(true);
    toast.success("Board brief copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    try {
      const bytes = await generatePDF(decision, result);
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "stratos-lite-audit.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/r/${auditId}`;
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard");
  };

  const depth = diagnostic ? computeDepth(diagnostic) : 0;

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Brand header */}
        <div className="text-center space-y-1">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
            London Royal Academy
          </p>
          <p className="text-sm font-medium text-gold">StratOS Lite</p>
        </div>

        {/* Prompt Quality Badge */}
        {diagnostic && (
          <PromptQualityBadge diagnostic={diagnostic} depth={depth} />
        )}

        {/* Decision */}
        <div className="border-b border-border pb-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Decision</p>
          <p className="text-foreground font-body">{decision}</p>
        </div>

        {/* Verdict */}
        <div className="text-center space-y-2 py-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Verdict</p>
          <p className={`font-display text-3xl sm:text-4xl font-bold ${verdictColor[result.verdict] || "text-foreground"}`}>
            {result.verdict}
          </p>
          <p className="text-muted-foreground text-sm">
            Confidence: <span className="text-gold font-semibold">{result.confidence_score}/100</span> — {result.confidence_rationale}
          </p>
        </div>

        {/* Scorecard fields */}
        <div className="grid gap-4">
          <Field label="Decision Type" value={result.decision_type} />
          <Field label="Biggest Risk" value={result.biggest_risk} />
          <Field label="Hidden Assumption" value={result.hidden_assumption} />
          <Field label="Better Question" value={result.better_question} />
          <Field label="Stakeholder Gap" value={result.stakeholder_gap} borderColor="border-l-purple-accent" />
          <Field label="30-Day Test" value={result.thirty_day_test} />
          <Field label="Devil's Argument" value={result.devils_argument} />
        </div>

        {/* Built prompt accordion */}
        {builtPrompt && diagnostic && (
          <BuiltPromptAccordion prompt={builtPrompt} diagnostic={diagnostic} />
        )}

        {/* Share buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button onClick={handleCopyBrief} className="flex-1 flex items-center justify-center gap-2 border border-border rounded-lg py-2.5 text-sm font-body text-foreground hover:bg-secondary transition-colors">
            {copied ? <Check className="h-4 w-4 text-success-foreground" /> : <Copy className="h-4 w-4" />}
            Copy Board Brief
          </button>
          <button onClick={handleDownloadPDF} className="flex-1 flex items-center justify-center gap-2 border border-border rounded-lg py-2.5 text-sm font-body text-foreground hover:bg-secondary transition-colors">
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 border border-border rounded-lg py-2.5 text-sm font-body text-foreground hover:bg-secondary transition-colors">
            <Share2 className="h-4 w-4" />
            Share Link
          </button>
        </div>

        {/* New audit */}
        <div className="text-center pt-4">
          <button onClick={onReset} className="text-sm text-gold hover:underline font-body">
            Audit another decision →
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground pt-8">
          Supports decision thinking. Not legal or financial advice.
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, borderColor }: { label: string; value: string; borderColor?: string }) {
  return (
    <div className={`bg-card border border-border rounded-lg px-4 py-3 ${borderColor ? `border-l-2 ${borderColor}` : ""}`}>
      <p className="text-xs uppercase tracking-wider text-gold mb-1 font-body">{label}</p>
      <p className="text-sm text-foreground font-body">{value}</p>
    </div>
  );
}

function computeDepth(d: DiagnosticAnswers): number {
  let depth = 3; // Q1, Q2, Q3 always answered
  if (d.budget) depth++;
  if (d.timeline) depth++;
  if (d.constraint) depth++;
  return depth;
}
