import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { getJournalEntries, deleteJournal } from "@/lib/journal";
import type { JournalEntry } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { NavBar } from "@/components/NavBar";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const verdictColors: Record<string, string> = {
  "PROCEED": "#22C55E",
  "CONDITIONAL PROCEED": "#C9A84C",
  "DO NOT PROCEED": "#EF4444",
  "DEFER — INFORMATION NEEDED": "#3B82F6",
};

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(getJournalEntries());
  const [showClear, setShowClear] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleClearJournal = () => {
    deleteJournal();
    setEntries([]);
    setShowClear(false);
    toast.success("Journal cleared");
  };

  const cardBase = { background: "#0F0F0F", border: "1px solid #1A1A1A" };

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
                {entries.length > 0 && (
                  <p style={{ fontSize: 14, color: "rgba(232,228,223,0.5)" }}>
                    Average Readiness: <span style={{ color: "#C9A84C", fontWeight: 600 }}>
                      {Math.round(entries.reduce((sum, e) => sum + e.result.confidence_score, 0) / entries.length)}
                    </span>/100
                  </p>
                )}
              </div>

              {/* Dashboard banner */}
              <div
                className="rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3"
                style={{ ...cardBase, padding: "16px 24px" }}
              >
                <span style={{ fontSize: 14, color: "#E8E4DF" }}>
                  You have {entries.length} tracked decision{entries.length !== 1 ? "s" : ""}
                </span>
                {entries.length >= 5 && (
                  <Link to="/dashboard" style={{ fontSize: 14, color: "#C9A84C" }}>
                    View Dashboard →
                  </Link>
                )}
              </div>

              {/* Decision list */}
              <div className="rounded-xl overflow-hidden" style={cardBase}>
                {entries.map(entry => {
                  const isOpen = expanded === entry.id;
                  return (
                    <div key={entry.id} style={{ borderTop: "1px solid #1A1A1A" }}>
                      <button
                        onClick={() => setExpanded(isOpen ? null : entry.id)}
                        className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
                      >
                        <span style={{ fontSize: 12, color: "#555", flexShrink: 0, width: 70 }}>
                          {new Date(entry.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </span>
                        <span className="flex-1 truncate" style={{ fontSize: 14, color: "#E8E4DF" }}>
                          {entry.decision.slice(0, 60)}{entry.decision.length > 60 ? "..." : ""}
                        </span>
                        <span
                          className="flex-shrink-0 rounded-full text-center"
                          style={{ fontSize: 12, color: "#C9A84C", border: "1px solid #C9A84C", padding: "2px 8px" }}
                        >
                          {entry.result.confidence_score}
                        </span>
                        <span
                          className="inline-block rounded-full flex-shrink-0"
                          style={{ width: 8, height: 8, background: verdictColors[entry.result.verdict] || "#888" }}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5" style={{ maxHeight: 600, overflowY: "auto" }}>
                          <div className="space-y-3 pt-2">
                            {[
                              ["Verdict", entry.result.verdict],
                              ["Biggest Risk", entry.result.biggest_risk],
                              ["The Reframe", entry.result.better_question],
                              ["Devil's Advocate", entry.result.devils_advocate],
                              ["Stakeholder Gap", entry.result.stakeholder_gap],
                            ].filter(([, v]) => v).map(([label, value]) => (
                              <div key={label as string}>
                                <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(201,168,76,0.5)", marginBottom: 4 }}>
                                  {label}
                                </p>
                                <p style={{ fontSize: 13, color: "rgba(232,228,223,0.7)", lineHeight: 1.6 }}>{value}</p>
                              </div>
                            ))}
                          </div>
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
                  <div className="rounded-lg p-4" style={cardBase}>
                    <p style={{ fontSize: 14, color: "#E8E4DF", marginBottom: 12 }}>
                      This will permanently delete all saved audits. This cannot be undone.
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
