import { useState } from "react";
import { Copy, Download, Share2, Check, ChevronDown } from "lucide-react";
import type { AuditResult } from "@/lib/types";
import { generateBrief } from "@/lib/copy-brief";
import { generatePDF } from "@/lib/generate-pdf";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ScorecardProps {
  decision: string;
  result: AuditResult;
  auditId: string;
  onReset: () => void;
}

const verdictColor: Record<string, string> = {
  Proceed: "text-green-400",
  "Proceed with Caution": "text-yellow-400",
  "Test First": "text-gold",
  "High Risk": "text-red-400",
};

export function Scorecard({ decision, result, auditId, onReset }: ScorecardProps) {
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
            Confidence: <span className="text-gold font-semibold">{result.confidence_score}/100</span> — {result.confidence_reason}
          </p>
        </div>

        {/* Scorecard fields */}
        <div className="grid gap-4">
          <Field label="Decision Type" value={result.decision_type} />
          <Field label="Biggest Risk" value={result.biggest_risk} />
          <Field label="Hidden Assumption" value={result.hidden_assumption} />
          <Field label="Better Question" value={result.better_question} />
          <Field label="30-Day Test" value={result.thirty_day_test} />
          <Field label="Devil's Argument" value={result.devils_argument} />
        </div>

        {/* Expandable details */}
        <Accordion type="multiple" className="border-t border-border pt-4">
          <AccordionItem value="assumptions" className="border-border">
            <AccordionTrigger className="text-sm font-body text-muted-foreground hover:text-foreground">
              Assumptions
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1.5">
                {result.assumptions.map((a, i) => (
                  <li key={i} className="text-sm text-foreground flex gap-2">
                    <span className="text-gold">•</span> {a}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="risks" className="border-border">
            <AccordionTrigger className="text-sm font-body text-muted-foreground hover:text-foreground">
              Risks & Blind Spots
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1.5">
                {result.risks_blind_spots.map((r, i) => (
                  <li key={i} className="text-sm text-foreground flex gap-2">
                    <span className="text-gold">•</span> {r}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="info" className="border-border">
            <AccordionTrigger className="text-sm font-body text-muted-foreground hover:text-foreground">
              Information Needed
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1.5">
                {result.information_needed.map((n, i) => (
                  <li key={i} className="text-sm text-foreground flex gap-2">
                    <span className="text-gold">•</span> {n}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Share buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button onClick={handleCopyBrief} className="flex-1 flex items-center justify-center gap-2 border border-border rounded-lg py-2.5 text-sm font-body text-foreground hover:bg-secondary transition-colors">
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-lg px-4 py-3">
      <p className="text-xs uppercase tracking-wider text-gold mb-1 font-body">{label}</p>
      <p className="text-sm text-foreground font-body">{value}</p>
    </div>
  );
}
