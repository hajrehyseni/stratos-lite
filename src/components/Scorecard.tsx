import { useState } from "react";
import { Copy, Download, Check, BookmarkPlus, ChevronDown } from "lucide-react";
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
  journalSaved?: boolean;
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

export function Scorecard({ decision, result, auditId, onReset, onSaveToJournal, journalSaved, readOnly }: ScorecardProps) {
  const [copied, setCopied] = useState(false);
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);

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
    const inverse = `NOT: ${decision}`;
    onReset(inverse);
  };

  const btnStyle = {
    height: 44,
    fontSize: 14,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    borderRadius: 8,
  };

  const cardBase = {
    background: "#0F0F0F",
    border: "1px solid #1A1A1A",
  };

  const deepDiveItems = [
    { label: "Hidden Assumption", value: result.hidden_assumption },
    { label: "30-Day Validation Test", value: result.thirty_day_test },
  ];

  const listSections = [
    { label: "Assumptions to Validate", items: result.assumptions_to_validate },
    { label: "Risk Register", items: result.risk_register },
    { label: "Information Needed", items: result.information_needed },
  ].filter(s => s.items && s.items.length > 0);

  return (
    <div className="min-h-screen px-4 pt-20 pb-16">
      <div
        className="scorecard-entrance"
        style={{ maxWidth: 720, margin: "0 auto" }}
      >
        {readOnly && (
          <div
            className="text-center mb-8 rounded-lg py-2 px-4"
            style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}
          >
            <span className="text-[12px] uppercase" style={{ letterSpacing: "0.1em", color: "rgba(232,228,223,0.5)" }}>
              Shared Audit — Read Only
            </span>
          </div>
        )}

        {/* ═══ TIER 1: The 2-Second Scan ═══ */}

        {/* Decision Readiness Score */}
        <div className="text-center mb-12">
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

        {/* Verdict */}
        <div
          className="rounded-lg px-6 py-5 mb-3"
          style={{
            ...cardBase,
            borderLeft: `4px solid ${verdictColor[result.verdict] || "#C9A84C"}`,
          }}
        >
          <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#C9A84C", opacity: 0.6, marginBottom: 8 }}>
            Verdict
          </p>
          <p style={{ fontSize: 20, fontWeight: 500, color: "#E8E4DF", lineHeight: 1.7 }}>
            {result.verdict}
          </p>
        </div>

        {/* The Reframe — promoted hero card */}
        <div
          className="rounded-lg px-6 py-5 mb-3 reframe-glow"
          style={{
            ...cardBase,
            borderTop: "1px solid rgba(201,168,76,0.3)",
          }}
        >
          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "#666", marginBottom: 8 }}>
            THE REFRAME
          </p>
          <p style={{ fontSize: 20, fontWeight: 400, fontStyle: "italic", color: "#C9A84C", lineHeight: 1.7 }}>
            <span style={{ marginRight: 6 }}>"</span>
            {result.better_question}
          </p>
        </div>

        {/* ═══ TIER 2: The 30-Second Read ═══ */}

        {/* Section divider */}
        <div className="relative my-8">
          <div style={{ height: 1, background: "#1A1A1A" }} />
          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3"
            style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "#555", background: "#080808" }}
          >
            STRATEGIC RISK SURFACE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          {[
            { label: "Biggest Risk", value: result.biggest_risk },
            { label: "Devil's Advocate", value: result.devils_advocate },
            { label: "Stakeholder Blind Spot", value: result.stakeholder_gap },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-lg px-5 py-4"
              style={cardBase}
            >
              <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#C9A84C", opacity: 0.6, marginBottom: 8 }}>
                {card.label}
              </p>
              <p style={{ fontSize: 14, fontWeight: 400, color: "#E8E4DF", lineHeight: 1.7 }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* ═══ TIER 3: The Deep Dive (collapsible) ═══ */}

        <div className="mt-6">
          <button
            onClick={() => setDeepDiveOpen(!deepDiveOpen)}
            className="flex items-center gap-2 transition-colors duration-200 hover:opacity-100"
            style={{ fontSize: 13, color: "#C9A84C", opacity: 0.8, background: "none", border: "none", padding: 0 }}
          >
            View Full Analysis
            <ChevronDown
              className="w-4 h-4 transition-transform duration-300"
              style={{ transform: deepDiveOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: deepDiveOpen ? 2000 : 0,
              opacity: deepDiveOpen ? 1 : 0,
              marginTop: deepDiveOpen ? 12 : 0,
            }}
          >
            <div className="space-y-3">
              {deepDiveItems.map((item) => (
                <div key={item.label} className="rounded-lg px-6 py-5" style={cardBase}>
                  <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#C9A84C", opacity: 0.6, marginBottom: 8 }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 400, color: "#E8E4DF", lineHeight: 1.7 }}>
                    {item.value}
                  </p>
                </div>
              ))}

              {listSections.map((section) => (
                <div key={section.label} className="rounded-lg px-6 py-5" style={cardBase}>
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
              ))}
            </div>
          </div>
        </div>

        {/* ═══ Action Bar ═══ */}
        {!readOnly && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mt-10">
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
            </div>

            {/* ═══ THE 30-DAY LOOP ═══ */}
            <div className="mt-8 rounded-xl p-6 sm:p-6 mobile-journal-pad" style={cardBase}>
              {journalSaved ? (
                <div className="flex items-center justify-center gap-3 py-2">
                  <Check className="w-5 h-5" style={{ color: "#C9A84C" }} />
                  <span style={{ fontSize: 14, color: "#888" }}>Tracking — you'll be reminded in 30 days</span>
                </div>
              ) : (
                <>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "#E8E4DF", marginBottom: 8 }}>
                    Track This Decision
                  </h3>
                  <p style={{ fontSize: 14, color: "#888", lineHeight: 1.6, maxWidth: 520, marginBottom: 16 }}>
                    In 30 days, StratOS will ask you what actually happened. After 5 tracked decisions, you'll unlock your Decision Pattern Profile — where you're sharp, where you're blind.
                  </p>
                  <button
                    onClick={onSaveToJournal}
                    className="flex items-center justify-center gap-2 transition-all duration-200 btn-press w-full sm:w-auto"
                    style={{
                      height: 44,
                      fontSize: 14,
                      borderRadius: 8,
                      border: "1px solid #C9A84C",
                      background: "transparent",
                      color: "#C9A84C",
                      fontWeight: 600,
                      padding: "0 24px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#080808"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C9A84C"; }}
                  >
                    <BookmarkPlus className="w-4 h-4" />
                    Save & Track for 30 Days
                  </button>
                  <p className="mt-3" style={{ fontSize: 11, color: "#555" }}>
                    Private. Stored locally. Only you can see this.
                  </p>
                </>
              )}
            </div>

            {/* ═══ AUDIT THE OPPOSITE ═══ */}
            <div
              className="mt-6 rounded-xl text-center mobile-opposite-pad"
              style={{
                ...cardBase,
                borderStyle: "dashed",
                padding: 32,
              }}
            >
              <span style={{ fontSize: 24, color: "rgba(201,168,76,0.5)" }}>⟳</span>
              <h3 className="mt-3" style={{ fontSize: 18, color: "#E8E4DF" }}>
                What if you're wrong?
              </h3>
              <p className="mt-2" style={{ fontSize: 14, color: "#666" }}>
                Run the same audit from the opposite position.
              </p>
              <button
                onClick={handleAuditOpposite}
                className="mt-4 inline-flex items-center justify-center gap-2 transition-all duration-200 btn-press"
                style={{
                  height: 44,
                  fontSize: 14,
                  borderRadius: 9999,
                  border: "1px solid #C9A84C",
                  background: "transparent",
                  color: "#C9A84C",
                  fontWeight: 600,
                  padding: "0 28px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#080808"; e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C9A84C"; e.currentTarget.style.transform = "scale(1)"; }}
              >
                Audit the Opposite
              </button>
            </div>

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
          <div className="text-center mt-10">
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
