import { useState } from "react";
import { Link } from "react-router-dom";
import { getJournalEntries, recordOutcome } from "@/lib/journal";
import type { JournalEntry } from "@/lib/types";
import { NavBar } from "@/components/NavBar";
import { toast } from "sonner";

const verdictColors: Record<string, string> = {
  Proceed: "bg-emerald-900/50 text-emerald-300",
  "Proceed with Caution": "bg-yellow-900/50 text-yellow-300",
  "Test First": "bg-amber-900/50 text-amber-300",
  "High Risk": "bg-red-900/50 text-red-300",
};

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(getJournalEntries());
  const [outcomeText, setOutcomeText] = useState<Record<string, string>>({});

  const handleRecordOutcome = (id: string) => {
    const text = outcomeText[id]?.trim();
    if (!text) return;
    recordOutcome(id, text);
    setEntries(getJournalEntries());
    toast.success("Outcome recorded");
  };

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  return (
    <>
      <NavBar journalCount={entries.length} />
      <div className="min-h-screen px-4 pt-20 pb-12">
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {entries.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
              <span style={{ fontSize: 72, fontWeight: 700, color: "#FFB800", lineHeight: 1 }}>
                0
              </span>
              <p className="mt-4 text-[18px] font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                Your decisions are waiting
              </p>
              <p
                className="mt-2 text-center"
                style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", maxWidth: 400, lineHeight: 1.6 }}
              >
                Every great leader tracks their decisions. Start your first audit to begin building your decision intelligence.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center justify-center rounded-lg btn-press"
                style={{
                  height: 44,
                  padding: "0 24px",
                  fontSize: 14,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.08em",
                  background: "#FFB800",
                  color: "#080808",
                  fontWeight: 600,
                }}
              >
                Audit a Decision →
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h1 className="text-[24px] font-semibold text-foreground">Decision Journal</h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                  {entries.length} decision{entries.length !== 1 ? "s" : ""} audited
                </p>
              </div>

              <div className="space-y-3">
                {entries.map((entry) => {
                  const createdDate = new Date(entry.createdAt);
                  const needsOutcome = entry.followUp && !entry.outcome && createdDate.getTime() < thirtyDaysAgo;

                  return (
                    <div
                      key={entry.id}
                      className="rounded-xl p-5"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className={`text-[11px] px-2 py-0.5 rounded ${verdictColors[entry.result.verdict] || ""}`}>
                          {entry.result.verdict}
                        </span>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                          {createdDate.toLocaleDateString()}
                        </span>
                      </div>

                      <p className="mt-2" style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
                        "{entry.decision.slice(0, 100)}{entry.decision.length > 100 ? "..." : ""}"
                      </p>

                      <div className="flex items-center gap-3 mt-2" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                        <span style={{ color: "#FFB800", fontWeight: 600 }}>{entry.result.confidence_score}/100</span>
                        {entry.outcome && <span>• Outcome recorded</span>}
                      </div>

                      {entry.outcome ? (
                        <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <p style={{ fontSize: 11, color: "#FFB800", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Outcome</p>
                          <p className="mt-1" style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{entry.outcome}</p>
                        </div>
                      ) : needsOutcome ? (
                        <div className="mt-3 pt-3 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <p style={{ fontSize: 13, color: "#FFB800" }}>
                            ⏱ 30 days have passed. What actually happened?
                          </p>
                          <textarea
                            rows={2}
                            value={outcomeText[entry.id] || ""}
                            onChange={(e) => setOutcomeText({ ...outcomeText, [entry.id]: e.target.value })}
                            className="w-full rounded-lg resize-none outline-none"
                            style={{
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              padding: "8px 12px",
                              fontSize: 14,
                              color: "rgba(255,255,255,0.9)",
                            }}
                            placeholder="What happened..."
                          />
                          <button
                            onClick={() => handleRecordOutcome(entry.id)}
                            disabled={!outcomeText[entry.id]?.trim()}
                            className="rounded-lg btn-press disabled:opacity-30"
                            style={{
                              padding: "6px 16px",
                              fontSize: 13,
                              background: "#FFB800",
                              color: "#080808",
                              fontWeight: 600,
                            }}
                          >
                            Record Outcome
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
