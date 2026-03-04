import { useState } from "react";
import { Copy, Download, Check } from "lucide-react";
import type { AuditResult } from "@/lib/types";
import { generateBrief } from "@/lib/copy-brief";
import { generatePDF } from "@/lib/generate-pdf";
import { toast } from "sonner";

interface ScorecardProps {
  decision: string;
  result: AuditResult;
  auditId: string;
  onReset: () => void;
  onSaveToJournal?: () => void;
}

function getReadinessInterpretation(score: number): string {
  if (score >= 80) return "Strong foundation. Ready for board presentation.";
  if (score >= 60) return "Good basis. Address the gaps below before committing.";
  if (score >= 40) return "Significant gaps. More work needed before deciding.";
  return "Not ready. Critical assumptions need validation first.";
}

export function Scorecard({ decision, result, auditId, onReset, onSaveToJournal }: ScorecardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyBrief = async () => {
    const brief = generateBrief(decision, result);
    await navigator.clipboard.writeText(brief);
    setCopied(true);
    toast.success("Brief copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    try {
      const bytes = await generatePDF(decision, result);
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "stratos-audit.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  const cards = [
    { label: "Verdict", value: result.verdict, accent: true },
    { label: "Biggest Risk", value: result.biggest_risk },
    { label: "Hidden Assumption", value: result.hidden_assumption },
    { label: "The Question You Should Be Asking", value: result.better_question, italic: true },
    { label: "30-Day Validation Test", value: result.thirty_day_test },
    { label: "Stakeholder Blind Spot", value: result.stakeholder_gap },
  ];

  return (
    <div className="min-h-screen px-4 pt-20 pb-16">
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* CARD 1 — Decision Readiness Score (no border, just content) */}
        <div
          className="text-center mb-12 card-stagger"
          style={{ animationDelay: "0ms" }}
        >
          <div className="flex items-baseline justify-center gap-1">
            <span
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: "#FFB800",
                lineHeight: 1,
              }}
            >
              {result.confidence_score}
            </span>
            <span
              style={{
                fontSize: 24,
                fontWeight: 400,
                color: "rgba(255,255,255,0.3)",
              }}
            >
              /100
            </span>
          </div>

          <p
            className="mt-3"
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.5,
            }}
          >
            {getReadinessInterpretation(result.confidence_score)}
          </p>

          {/* Score bar */}
          <div
            className="mt-4 mx-auto"
            style={{
              maxWidth: 400,
              height: 4,
              borderRadius: 2,
              background: "rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}
          >
            <div
              className="bar-fill"
              style={{
                height: "100%",
                width: `${result.confidence_score}%`,
                borderRadius: 2,
                background: "#FFB800",
              }}
            />
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {cards.map((card, i) => (
            <div
              key={card.label}
              className="card-stagger"
              style={{ animationDelay: `${100 + i * 100}ms` }}
            >
              <div
                className="rounded-xl px-6 py-5 transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: card.accent ? "4px solid #FFB800" : undefined,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#FFB800",
                    opacity: 0.6,
                    marginBottom: 8,
                  }}
                >
                  {card.label}
                </p>
                <p
                  style={{
                    fontSize: card.accent ? 20 : 15,
                    fontWeight: card.accent ? 500 : 400,
                    color: "rgba(255,255,255,0.9)",
                    lineHeight: 1.5,
                    fontStyle: card.italic ? "italic" : "normal",
                  }}
                >
                  {card.italic && (
                    <span style={{ color: "#FFB800", marginRight: 6, fontSize: 20 }}>"</span>
                  )}
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action bar */}
        <div
          className="flex flex-col sm:flex-row gap-3 mt-10 card-stagger"
          style={{ animationDelay: "800ms" }}
        >
          <button
            onClick={handleCopyBrief}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg transition-all duration-200 hover:bg-secondary"
            style={{
              height: 44,
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "transparent",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            Copy Brief
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg transition-all duration-200 hover:bg-secondary"
            style={{
              height: 44,
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "transparent",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>

          {onSaveToJournal && (
            <button
              onClick={onSaveToJournal}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg transition-all duration-200 btn-press"
              style={{
                height: 44,
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                background: "#FFB800",
                color: "#080808",
                fontWeight: 600,
                borderRadius: 8,
              }}
            >
              Save to Journal
            </button>
          )}
        </div>

        {/* New decision link */}
        <div className="text-center mt-8">
          <button
            onClick={onReset}
            className="text-[14px] transition-opacity duration-200 hover:opacity-100"
            style={{ color: "#FFB800", opacity: 0.8 }}
          >
            ← New decision
          </button>
        </div>

        {/* Disclaimer */}
        <p
          className="text-center mt-12"
          style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}
        >
          Supports decision thinking. Not legal or financial advice.
        </p>
      </div>
    </div>
  );
}
