import { useState } from "react";
import { Copy, Download, Check, BookmarkPlus, RotateCcw } from "lucide-react";
import type { AuditResult } from "@/lib/types";
import { generateBrief } from "@/lib/copy-brief";
import { generatePDF } from "@/lib/generate-pdf";
import { toast } from "sonner";

interface ScorecardProps {
  decision: string;
  result: AuditResult;
  auditId: string;
  onReset: (prefill?: string) => void;
  onSaveToJournal?: () => void;
  readOnly?: boolean;
}

function getReadinessInterpretation(score: number): string {
  if (score >= 80) return "Strong foundation. Ready for board presentation.";
  if (score >= 60) return "Good basis. Address the gaps below before committing.";
  if (score >= 40) return "Significant gaps. More work needed before deciding.";
  return "Not ready. Critical assumptions need validation first.";
}

const verdictColor: Record<string, string> = {
  "PROCEED": "#22c55e",
  "CONDITIONAL PROCEED": "#C9A84C",
  "DO NOT PROCEED": "#ef4444",
  "DEFER — INFORMATION NEEDED": "#3b82f6",
};

export function Scorecard({ decision, result, auditId, onReset, onSaveToJournal, readOnly }: ScorecardProps) {
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
      a.download = "stratos-decision-audit.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  const handleAuditOpposite = () => {
    const inverse = `We decide NOT to: ${decision} — What are the consequences?`;
    onReset(inverse);
  };

  const cards = [
    { label: "Verdict", value: result.verdict, accent: true },
    { label: "Biggest Risk", value: result.biggest_risk },
    { label: "Hidden Assumption", value: result.hidden_assumption },
    { label: "The Question You Should Be Asking", value: result.better_question, italic: true },
    { label: "Devil's Advocate", value: result.devils_advocate },
    { label: "30-Day Validation Test", value: result.thirty_day_test },
    { label: "Stakeholder Blind Spot", value: result.stakeholder_gap },
  ];

  const listSections = [
    { label: "Assumptions to Validate", items: result.assumptions_to_validate },
    { label: "Risk Register", items: result.risk_register },
    { label: "Information Needed", items: result.information_needed },
  ].filter(s => s.items && s.items.length > 0);

  const btnStyle = {
    height: 44,
    fontSize: 14,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    borderRadius: 8,
  };

  return (
    <div className="min-h-screen px-4 pt-20 pb-16">
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {readOnly && (
          <div
            className="text-center mb-8 card-stagger rounded-lg py-2 px-4"
            style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)", animationDelay: "0ms" }}
          >
            <span className="text-[12px] uppercase" style={{ letterSpacing: "0.1em", color: "rgba(232,228,223,0.5)" }}>
              Shared Audit — Read Only
            </span>
          </div>
        )}

        {/* Decision Readiness Score */}
        <div className="text-center mb-12 card-stagger" style={{ animationDelay: "0ms" }}>
          <p
            className="mb-3"
            style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(201,168,76,0.6)" }}
          >
            Decision Readiness Score
          </p>
          <div className="flex items-baseline justify-center gap-1">
            <span style={{ fontSize: 72, fontWeight: 700, color: "#C9A84C", lineHeight: 1 }}>
              {result.confidence_score}
            </span>
            <span style={{ fontSize: 24, fontWeight: 400, color: "rgba(232,228,223,0.3)" }}>
              /100
            </span>
          </div>

          <p className="mt-3" style={{ fontSize: 16, color: "rgba(232,228,223,0.7)", lineHeight: 1.5 }}>
            {getReadinessInterpretation(result.confidence_score)}
          </p>

          <div
            className="mt-4 mx-auto"
            style={{ maxWidth: 400, height: 4, borderRadius: 2, background: "rgba(232,228,223,0.06)", overflow: "hidden" }}
          >
            <div
              className="bar-fill"
              style={{ height: "100%", width: `${result.confidence_score}%`, borderRadius: 2, background: "#C9A84C" }}
            />
          </div>

          {result.confidence_rationale && (
            <p className="mt-3" style={{ fontSize: 13, color: "rgba(232,228,223,0.4)" }}>
              {result.confidence_rationale}
            </p>
          )}
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {cards.map((card, i) => (
            <div key={card.label} className="card-stagger" style={{ animationDelay: `${100 + i * 100}ms` }}>
              <div
                className="rounded-lg px-6 py-5 transition-all duration-200"
                style={{
                  background: "#0F0F0F",
                  border: "1px solid #1A1A1A",
                  borderLeft: card.accent ? `4px solid ${verdictColor[result.verdict] || "#C9A84C"}` : undefined,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#2A2A2A";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#1A1A1A";
                  if (card.accent) e.currentTarget.style.borderLeftColor = verdictColor[result.verdict] || "#C9A84C";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#C9A84C", opacity: 0.6, marginBottom: 8 }}>
                  {card.label}
                </p>
                <p
                  style={{
                    fontSize: card.accent ? 20 : 15,
                    fontWeight: card.accent ? 500 : 400,
                    color: "#E8E4DF",
                    lineHeight: 1.7,
                    fontStyle: card.italic ? "italic" : "normal",
                  }}
                >
                  {card.italic && (
                    <span style={{ color: "#C9A84C", marginRight: 6, fontSize: 20 }}>"</span>
                  )}
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* List sections */}
        {listSections.length > 0 && (
          <div className="space-y-3 mt-3">
            {listSections.map((section, i) => (
              <div key={section.label} className="card-stagger" style={{ animationDelay: `${800 + i * 100}ms` }}>
                <div className="rounded-lg px-6 py-5" style={{ background: "#0F0F0F", border: "1px solid #1A1A1A" }}>
                  <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#C9A84C", opacity: 0.6, marginBottom: 12 }}>
                    {section.label}
                  </p>
                  <ul className="space-y-2">
                    {section.items.map((item, j) => (
                      <li key={j} className="flex gap-2" style={{ fontSize: 15, color: "#E8E4DF", lineHeight: 1.7 }}>
                        <span style={{ color: "rgba(201,168,76,0.5)" }}>•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action bar */}
        {!readOnly && (
          <>
            <div
              className="flex flex-col sm:flex-row gap-3 mt-10 card-stagger"
              style={{ animationDelay: "1000ms" }}
            >
              <button
                onClick={handleCopyBrief}
                className="flex-1 flex items-center justify-center gap-2 transition-all duration-200"
                style={{ ...btnStyle, border: "1px solid #1A1A1A", background: "transparent", color: "rgba(232,228,223,0.8)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#0F0F0F"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copy Brief
              </button>

              <button
                onClick={handleDownloadPDF}
                className="flex-1 flex items-center justify-center gap-2 transition-all duration-200"
                style={{ ...btnStyle, border: "1px solid #1A1A1A", background: "transparent", color: "rgba(232,228,223,0.8)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#0F0F0F"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>

              <button
                onClick={handleAuditOpposite}
                className="flex-1 flex items-center justify-center gap-2 transition-all duration-200"
                style={{ ...btnStyle, border: "1px solid #1A1A1A", background: "transparent", color: "rgba(232,228,223,0.8)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#0F0F0F"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <RotateCcw className="w-4 h-4" />
                Audit the Opposite
              </button>
            </div>

            {/* Save to journal */}
            {onSaveToJournal && (
              <div className="mt-4 card-stagger" style={{ animationDelay: "1100ms" }}>
                <button
                  onClick={onSaveToJournal}
                  className="w-full flex items-center justify-center gap-2 transition-all duration-200 btn-press"
                  style={{ ...btnStyle, background: "#C9A84C", color: "#080808", fontWeight: 600 }}
                >
                  <BookmarkPlus className="w-4 h-4" />
                  Save to Journal
                </button>
              </div>
            )}

            {/* Start another */}
            <div className="text-center mt-8">
              <button
                onClick={() => onReset()}
                className="text-[14px] transition-opacity duration-200 hover:opacity-100"
                style={{ color: "#C9A84C", opacity: 0.8 }}
              >
                ← Start another audit
              </button>
            </div>
          </>
        )}

        {readOnly && (
          <div className="text-center mt-10 card-stagger" style={{ animationDelay: "1000ms" }}>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg btn-press transition-all duration-200"
              style={{ ...btnStyle, background: "#C9A84C", color: "#080808", fontWeight: 600, padding: "0 24px" }}
            >
              Run your own audit →
            </a>
          </div>
        )}

        <p className="text-center mt-12" style={{ fontSize: 12, color: "rgba(232,228,223,0.25)" }}>
          Supports decision thinking. Not legal or financial advice.
        </p>
      </div>
    </div>
  );
}
