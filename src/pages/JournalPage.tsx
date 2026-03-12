import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { getJournalEntries, deleteJournal } from "@/lib/journal";
import type { JournalEntry } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { Trash2, ArrowRight } from "lucide-react";

const verdictColors: Record<string, string> = {
  "PROCEED": "hsl(160, 84%, 39%)",
  "CONDITIONAL PROCEED": "hsl(38, 92%, 50%)",
  "DO NOT PROCEED": "hsl(0, 84%, 60%)",
  "DEFER — INFORMATION NEEDED": "hsl(217, 91%, 60%)",
};

export default function JournalPage() {
  const { user, loading } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>(getJournalEntries());
  const [showClear, setShowClear] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (loading) return null;
  if (!user) return <Navigate to="/login?redirect=journal" replace />;

  const handleClearJournal = () => {
    deleteJournal();
    setEntries([]);
    setShowClear(false);
    toast.success("Journal cleared");
  };

  const cardBase = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };

  return (
    <>
      <NavBar journalCount={entries.length} />
      <div className="min-h-screen px-4 pt-20 pb-12 page-enter">
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "60vh" }}>
              <p className="text-xl font-semibold" style={{ color: "#FFFFFF" }}>No audits saved yet</p>
              <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>Run your first audit to start building your decision journal.</p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ height: 44, padding: "0 24px", fontSize: 14, background: "hsl(16, 100%, 62%)", color: "#FFFFFF" }}
              >
                Run your first audit
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h1 className="text-lg font-semibold" style={{ color: "#FFFFFF" }}>Decision Journal</h1>
                <p className="text-sm" style={{ color: "#6B7280" }}>
                  Average Readiness: <span style={{ color: "hsl(16, 100%, 62%)", fontWeight: 600 }}>
                    {Math.round(entries.reduce((sum, e) => sum + e.result.confidence_score, 0) / entries.length)}
                  </span>/100
                </p>
              </div>
              {entries.length >= 5 && (
                <div className="rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3" style={{ ...cardBase, padding: "16px 24px" }}>
                  <span className="text-sm" style={{ color: "#FFFFFF" }}>{entries.length} decisions tracked</span>
                  <Link to="/dashboard" className="text-sm" style={{ color: "hsl(16, 100%, 62%)" }}>View Dashboard →</Link>
                </div>
              )}
              <div className="rounded-xl overflow-hidden" style={cardBase}>
                {entries.map(entry => {
                  const isOpen = expanded === entry.id;
                  return (
                    <div key={entry.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <button onClick={() => setExpanded(isOpen ? null : entry.id)} className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors" style={{ minHeight: 44 }}>
                        <span className="text-xs" style={{ color: "#6B7280", flexShrink: 0, width: 70 }}>{new Date(entry.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                        <span className="flex-1 truncate text-sm" style={{ color: "#FFFFFF" }}>{entry.decision.slice(0, 60)}{entry.decision.length > 60 ? "..." : ""}</span>
                        <span className="flex-shrink-0 rounded-full text-center text-xs px-2 py-0.5" style={{ color: "hsl(16, 100%, 62%)", border: "1px solid hsla(16, 100%, 62%, 0.3)" }}>{entry.result.confidence_score}</span>
                        <span className="inline-block rounded-full flex-shrink-0" style={{ width: 8, height: 8, background: verdictColors[entry.result.verdict] || "#6B7280" }} />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5">
                          <div className="space-y-3 pt-2">
                            {[["Verdict", entry.result.verdict], ["Biggest Risk", entry.result.biggest_risk], ["The Reframe", entry.result.better_question], ["Devil's Advocate", entry.result.devils_advocate], ["Stakeholder Gap", entry.result.stakeholder_gap]].filter(([, v]) => v).map(([label, value]) => (
                              <div key={label as string}>
                                <p className="text-[10px] uppercase" style={{ letterSpacing: "0.1em", color: "hsla(16, 100%, 62%, 0.5)", marginBottom: 4 }}>{label}</p>
                                <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="text-center pt-6">
                {!showClear ? (
                  <button onClick={() => setShowClear(true)} className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>Clear Journal</button>
                ) : (
                  <div className="rounded-lg p-4" style={cardBase}>
                    <p className="text-sm mb-3" style={{ color: "#FFFFFF" }}>This will permanently delete all saved audits.</p>
                    <div className="flex justify-center gap-3">
                      <button onClick={() => setShowClear(false)} className="rounded-full px-4 py-1.5 text-sm" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#6B7280" }}>Cancel</button>
                      <button onClick={handleClearJournal} className="rounded-full px-4 py-1.5 text-sm flex items-center gap-1.5" style={{ background: "hsl(0, 84%, 60%)", color: "#FFFFFF", fontWeight: 600 }}><Trash2 className="w-3.5 h-3.5" />Delete All</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
