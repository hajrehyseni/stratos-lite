import { useState } from "react";
import { Link } from "react-router-dom";
import { getJournalEntries, recordOutcome, deleteJournal } from "@/lib/journal";
import type { JournalEntry } from "@/lib/types";
import { NavBar } from "@/components/NavBar";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

const verdictColors: Record<string, string> = {
  "PROCEED": "bg-emerald-900/50 text-emerald-300",
  "CONDITIONAL PROCEED": "bg-yellow-900/50 text-yellow-300",
  "DO NOT PROCEED": "bg-red-900/50 text-red-300",
  "DEFER — INFORMATION NEEDED": "bg-blue-900/50 text-blue-300",
  // Legacy
  "Proceed": "bg-emerald-900/50 text-emerald-300",
  "Proceed with Caution": "bg-yellow-900/50 text-yellow-300",
  "Test First": "bg-amber-900/50 text-amber-300",
  "High Risk": "bg-red-900/50 text-red-300",
};

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(getJournalEntries());
  const [outcomeText, setOutcomeText] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showClear, setShowClear] = useState(false);

  const handleRecordOutcome = (id: string) => {
    const text = outcomeText[id]?.trim();
    if (!text) return;
    recordOutcome(id, text);
    setEntries(getJournalEntries());
    toast.success("Outcome recorded");
  };

  const handleClearJournal = () => {
    deleteJournal();
    setEntries([]);
    setShowClear(false);
    toast.success("Journal cleared");
  };

  const avgScore = entries.length > 0
    ? Math.round(entries.reduce((sum, e) => sum + e.result.confidence_score, 0) / entries.length)
    : 0;

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  return (
    <>
      <NavBar journalCount={entries.length} />
      <div className="min-h-screen px-4 pt-20 pb-12">
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
              <span style={{ fontSize: 72, fontWeight: 700, color: "#C9A84C", lineHeight: 1 }}>0</span>
              <p className="mt-4 text-[18px] font-medium" style={{ color: "#E8E4DF" }}>
                No decisions audited yet.
              </p>
              <p className="mt-2 text-center" style={{ fontSize: 14, color: "rgba(232,228,223,0.5)", maxWidth: 400, lineHeight: 1.6 }}>
                Every great leader tracks their decisions. Start your first audit to begin building your decision intelligence.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center justify-center rounded-lg btn-press"
                style={{
                  height: 44, padding: "0 24px", fontSize: 14,
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  background: "#C9A84C", color: "#080808", fontWeight: 600,
                }}
              >
                Audit a Decision →
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h1 className="text-[11px] font-medium uppercase" style={{ letterSpacing: "0.1em", color: "rgba(201,168,76,0.6)" }}>
                  Decision Journal
                </h1>
                <p style={{ fontSize: 13, color: "rgba(232,228,223,0.5)" }}>
                  Your private decision history — stored only in this browser
                </p>
              </div>

              {/* Stats */}
              <div
                className="text-center py-4 rounded-lg"
                style={{ background: "#0F0F0F", border: "1px solid #1A1A1A" }}
              >
                <p style={{ fontSize: 15, color: "#E8E4DF" }}>
                  You've audited <span style={{ color: "#C9A84C", fontWeight: 600 }}>{entries.length}</span> decision{entries.length !== 1 ? "s" : ""}.{" "}
                  Average readiness score: <span style={{ color: "#C9A84C", fontWeight: 600 }}>{avgScore}/100</span>
                </p>
              </div>

              <div className="space-y-3">
                {entries.map((entry) => {
                  const createdDate = new Date(entry.createdAt);
                  const needsOutcome = entry.followUp && !entry.outcome && createdDate.getTime() < thirtyDaysAgo;
                  const isExpanded = expanded[entry.id];

                  return (
                    <div
                      key={entry.id}
                      className="rounded-lg overflow-hidden"
                      style={{ background: "#0F0F0F", border: "1px solid #1A1A1A" }}
                    >
                      {/* Summary row — always visible */}
                      <button
                        onClick={() => setExpanded(prev => ({ ...prev, [entry.id]: !prev[entry.id] }))}
                        className="w-full p-5 text-left flex items-start justify-between gap-3 transition-colors"
                        style={{ background: "transparent" }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-[11px] px-2 py-0.5 rounded ${verdictColors[entry.result.verdict] || ""}`}>
                              {entry.result.verdict}
                            </span>
                            <span style={{ fontSize: 12, color: "rgba(232,228,223,0.3)" }}>
                              {createdDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>

                          <p className="truncate" style={{ fontSize: 14, color: "#E8E4DF", maxWidth: "100%" }}>
                            {entry.decision.slice(0, 120)}{entry.decision.length > 120 ? "..." : ""}
                          </p>

                          <div className="flex items-center gap-3 mt-2" style={{ fontSize: 12, color: "rgba(232,228,223,0.3)" }}>
                            <span style={{ color: "#C9A84C", fontWeight: 600 }}>{entry.result.confidence_score}/100</span>
                            {entry.outcome && <span>• Outcome recorded</span>}
                          </div>
                        </div>

                        <div className="mt-1" style={{ color: "rgba(232,228,223,0.3)" }}>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="px-5 pb-5 space-y-3" style={{ borderTop: "1px solid #1A1A1A" }}>
                          <div className="pt-4 space-y-3">
                            {[
                              ["Biggest Risk", entry.result.biggest_risk],
                              ["Hidden Assumption", entry.result.hidden_assumption],
                              ["Better Question", entry.result.better_question],
                              ["Devil's Advocate", (entry.result as any).devils_advocate || (entry.result as any).devils_argument],
                              ["Stakeholder Gap", entry.result.stakeholder_gap],
                              ["30-Day Test", entry.result.thirty_day_test],
                            ].filter(([, v]) => v).map(([label, value]) => (
                              <div key={label as string}>
                                <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(201,168,76,0.5)", marginBottom: 4 }}>
                                  {label}
                                </p>
                                <p style={{ fontSize: 13, color: "rgba(232,228,223,0.7)", lineHeight: 1.6 }}>{value}</p>
                              </div>
                            ))}
                          </div>

                          {entry.outcome ? (
                            <div className="pt-3" style={{ borderTop: "1px solid #1A1A1A" }}>
                              <p style={{ fontSize: 11, color: "#C9A84C", textTransform: "uppercase", letterSpacing: "0.08em" }}>Outcome</p>
                              <p className="mt-1" style={{ fontSize: 13, color: "rgba(232,228,223,0.7)" }}>{entry.outcome}</p>
                            </div>
                          ) : needsOutcome ? (
                            <div className="pt-3 space-y-2" style={{ borderTop: "1px solid #1A1A1A" }}>
                              <p style={{ fontSize: 13, color: "#C9A84C" }}>
                                ⏱ 30 days have passed. What actually happened?
                              </p>
                              <textarea
                                rows={2}
                                value={outcomeText[entry.id] || ""}
                                onChange={(e) => setOutcomeText({ ...outcomeText, [entry.id]: e.target.value })}
                                className="w-full rounded-lg resize-none outline-none"
                                style={{
                                  background: "rgba(232,228,223,0.04)", border: "1px solid #1A1A1A",
                                  padding: "8px 12px", fontSize: 14, color: "#E8E4DF",
                                }}
                                placeholder="What happened..."
                              />
                              <button
                                onClick={() => handleRecordOutcome(entry.id)}
                                disabled={!outcomeText[entry.id]?.trim()}
                                className="rounded-lg btn-press disabled:opacity-30"
                                style={{ padding: "6px 16px", fontSize: 13, background: "#C9A84C", color: "#080808", fontWeight: 600 }}
                              >
                                Record Outcome
                              </button>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Clear journal */}
              <div className="text-center pt-6">
                {!showClear ? (
                  <button
                    onClick={() => setShowClear(true)}
                    className="text-[12px] transition-opacity hover:opacity-80"
                    style={{ color: "rgba(232,228,223,0.25)" }}
                  >
                    Clear Journal
                  </button>
                ) : (
                  <div className="rounded-lg p-4" style={{ background: "#0F0F0F", border: "1px solid #1A1A1A" }}>
                    <p style={{ fontSize: 14, color: "#E8E4DF", marginBottom: 12 }}>
                      This will permanently delete all saved audits from this browser. This cannot be undone.
                    </p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => setShowClear(false)}
                        className="rounded-lg transition-all duration-200"
                        style={{ padding: "6px 16px", fontSize: 13, border: "1px solid #1A1A1A", background: "transparent", color: "rgba(232,228,223,0.8)" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleClearJournal}
                        className="rounded-lg btn-press flex items-center gap-1.5"
                        style={{ padding: "6px 16px", fontSize: 13, background: "#ef4444", color: "#fff", fontWeight: 600 }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete All
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
