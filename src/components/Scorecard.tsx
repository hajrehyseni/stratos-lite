import { useState } from "react";
import { Copy, Download, Share2, Check } from "lucide-react";
import type { AuditResult, DiagnosticAnswers } from "@/lib/types";
import { generateBrief } from "@/lib/copy-brief";
import { generatePDF } from "@/lib/generate-pdf";
import { toast } from "sonner";
import { PromptQualityBadge } from "./PromptQualityBadge";
import { BuiltPromptAccordion } from "./BuiltPromptAccordion";
import { ConfidenceRing } from "./ConfidenceRing";

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

function getReadinessInterpretation(score: number): string {
  if (score >= 80) return "Strong foundation — ready for board presentation";
  if (score >= 60) return "Good basis — address the gaps below before committing";
  if (score >= 40) return "Significant gaps — more work needed before deciding";
  return "Not ready — critical assumptions need validation first";
}

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

  const fields = [
    { label: "Decision Type", value: result.decision_type },
    { label: "Biggest Risk", value: result.biggest_risk },
    { label: "Hidden Assumption", value: result.hidden_assumption },
    { label: "Better Question", value: result.better_question },
    { label: "Stakeholder Gap", value: result.stakeholder_gap, borderColor: "border-l-purple-accent" },
    { label: "30-Day Test", value: result.thirty_day_test },
    { label: "Devil's Argument", value: result.devils_argument },
  ];

  return (
    <div className="min-h-screen px-4 sm:px-6 py-16">
      <div className="max-w-[640px] mx-auto space-y-12">
        {/* Brand header */}
        <div className="text-center space-y-1">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
            London Royal Academy
          </p>
          <p className="text-sm font-medium text-gold">StratOS Lite</p>
        </div>

        {/* Decision Readiness Score — the FIRST thing the exec sees */}
        <div className="text-center space-y-3 card-stagger" style={{ animationDelay: "0ms" }}>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Decision Readiness Score</p>
          <div className="flex justify-center">
            <ConfidenceRing score={result.confidence_score} size={120} />
          </div>
          <p className="text-sm text-muted-foreground font-manrope max-w-md mx-auto">
            {getReadinessInterpretation(result.confidence_score)}
          </p>
        </div>

        {/* Prompt Quality Badge */}
        {diagnostic && (
          <div className="card-stagger" style={{ animationDelay: "100ms" }}>
            <PromptQualityBadge diagnostic={diagnostic} depth={depth} />
          </div>
        )}

        {/* Decision */}
        <div className="border-b border-border pb-4 card-stagger" style={{ animationDelay: "200ms" }}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Decision</p>
          <p className="text-foreground font-body">{decision}</p>
        </div>

        {/* Verdict — visually dominant */}
        <div
          className="text-center space-y-2 py-6 rounded-lg card-stagger"
          style={{
            animationDelay: "300ms",
            borderLeft: "4px solid #FFB800",
            paddingLeft: "24px",
            paddingRight: "24px",
            backgroundColor: "rgba(255,184,0,0.03)",
          }}
        >
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Verdict</p>
          <p className={`font-display text-4xl sm:text-5xl font-bold ${verdictColor[result.verdict] || "text-foreground"}`}>
            {result.verdict}
          </p>
          <p className="text-muted-foreground text-sm">
            {result.confidence_rationale}
          </p>
        </div>

        {/* Scorecard fields with staggered entrance */}
        <div className="grid gap-4">
          {fields.map((field, i) => (
            <div
              key={field.label}
              className="card-stagger"
              style={{ animationDelay: `${400 + i * 100}ms` }}
            >
              <Field label={field.label} value={field.value} borderColor={field.borderColor} />
            </div>
          ))}
        </div>

        {/* Built prompt accordion */}
        {builtPrompt && diagnostic && (
          <div className="card-stagger" style={{ animationDelay: "1100ms" }}>
            <BuiltPromptAccordion prompt={builtPrompt} diagnostic={diagnostic} />
          </div>
        )}

        {/* Share buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 card-stagger" style={{ animationDelay: "1200ms" }}>
          <button onClick={handleCopyBrief} className="flex-1 flex items-center justify-center gap-2 border border-border rounded-lg py-2.5 text-sm font-body text-foreground hover:bg-secondary hover:border-gold/30 transition-all duration-200">
            {copied ? <Check className="h-4 w-4 text-success-foreground" /> : <Copy className="h-4 w-4" />}
            Copy Board Brief
          </button>
          <button onClick={handleDownloadPDF} className="flex-1 flex items-center justify-center gap-2 border border-border rounded-lg py-2.5 text-sm font-body text-foreground hover:bg-secondary hover:border-gold/30 transition-all duration-200">
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 border border-border rounded-lg py-2.5 text-sm font-body text-foreground hover:bg-secondary hover:border-gold/30 transition-all duration-200">
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
    <div
      className={`bg-card border border-border rounded-lg px-5 py-4 transition-all duration-200 hover:border-gold/20 ${borderColor ? `border-l-2 ${borderColor}` : ""}`}
      style={{
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,184,0,0.08)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <p className="text-xs uppercase tracking-wider text-gold mb-1.5 font-body">{label}</p>
      <p className="text-sm text-foreground font-body leading-relaxed">{value}</p>
    </div>
  );
}

function computeDepth(d: DiagnosticAnswers): number {
  let depth = 3;
  if (d.budget) depth++;
  if (d.timeline) depth++;
  if (d.constraint) depth++;
  return depth;
}
