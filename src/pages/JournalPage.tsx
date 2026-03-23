import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { getJournalEntries, deleteJournal } from "@/lib/journal";
import type { JournalEntry } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { Trash2, ArrowRight, BookOpen, Search } from "lucide-react";

const verdictColors: Record<string, string> = {
  "PROCEED": "hsl(var(--success))",
  "CONDITIONAL PROCEED": "hsl(var(--warning))",
  "DO NOT PROCEED": "hsl(var(--destructive))",
  "DEFER — INFORMATION NEEDED": "hsl(221, 83%, 53%)",
};

export default function JournalPage() {
  const { user, loading } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>(getJournalEntries());
  const [showClear, setShowClear] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (loading) return null;
  if (!user) return <Navigate to="/login?redirect=journal" replace />;

  const handleClearJournal = () => { deleteJournal(); setEntries([]); setShowClear(false); toast.success("Journal cleared"); };

  return (
    <>
      <NavBar />
      <div className="min-h-screen px-4 pt-24 pb-12 page-enter" style={{ background: "hsl(var(--background))" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "60vh" }}>
              <div className="rounded-full flex items-center justify-center mb-6" style={{ width: 80, height: 80, background: "hsla(221, 83%, 53%, 0.08)" }}>
                <BookOpen className="w-10 h-10" style={{ color: "hsl(var(--text-tertiary))" }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: "hsl(var(--text-primary))" }}>No audits saved yet</p>
              <p className="mt-3 text-lg" style={{ color: "hsl(var(--text-secondary))" }}>Your first strategic audit is just 30 seconds away.</p>
              <Link to="/" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" style={{ height: 52, padding: "0 28px", fontSize: 16, background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                Run your first audit <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--text-primary))" }}>Decision Journal</h1>
                <p className="text-base" style={{ color: "hsl(var(--text-secondary))" }}>
                  Average Readiness: <span style={{ color: "hsl(var(--primary))", fontWeight: 700 }}>{Math.round(entries.reduce((sum, e) => sum + e.result.confidence_score, 0) / entries.length)}</span>/100
                </p>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                {entries.map(entry => {
                  const isOpen = expanded === entry.id;
                  return (
                    <div key={entry.id} style={{ borderTop: "1px solid hsl(var(--border))" }}>
                      <button onClick={() => setExpanded(isOpen ? null : entry.id)} className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-black/[0.02] transition-colors" style={{ minHeight: 52 }}>
                        <span className="text-sm" style={{ color: "hsl(var(--text-tertiary))", flexShrink: 0, width: 70 }}>{new Date(entry.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                        <span className="flex-1 truncate text-base" style={{ color: "hsl(var(--text-primary))" }}>{entry.decision.slice(0, 60)}{entry.decision.length > 60 ? "..." : ""}</span>
                        <span className="flex-shrink-0 rounded-full text-center text-sm px-2.5 py-0.5 font-semibold" style={{ color: "hsl(var(--primary))", background: "hsla(221, 83%, 53%, 0.1)" }}>{entry.result.confidence_score}</span>
                        <span className="inline-block rounded-full flex-shrink-0" style={{ width: 10, height: 10, background: verdictColors[entry.result.verdict] || "hsl(var(--text-tertiary))" }} />
                      </button>
                      <div className="overflow-hidden transition-all duration-300 ease-out" style={{ maxHeight: isOpen ? 500 : 0, opacity: isOpen ? 1 : 0 }}>
                        <div className="px-5 pb-5">
                          <div className="space-y-3 pt-2">
                            {[["Verdict", entry.result.verdict], ["Biggest Risk", entry.result.biggest_risk], ["The Reframe", entry.result.better_question], ["Devil's Advocate", entry.result.devils_advocate]].filter(([, v]) => v).map(([label, value]) => (
                              <div key={label as string}>
                                <p className="text-xs uppercase font-semibold" style={{ letterSpacing: "0.1em", color: "hsl(var(--primary))", marginBottom: 4 }}>{label}</p>
                                <p className="text-base" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.6 }}>{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-center pt-6">
                {!showClear ? (
                  <button onClick={() => setShowClear(true)} className="text-sm" style={{ color: "hsl(var(--text-tertiary))", minHeight: 44 }}>Clear Journal</button>
                ) : (
                  <div className="rounded-xl p-4" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                    <p className="text-base mb-3" style={{ color: "hsl(var(--text-primary))" }}>This will permanently delete all saved audits.</p>
                    <div className="flex justify-center gap-3">
                      <button onClick={() => setShowClear(false)} className="rounded-full px-5 py-2 text-base" style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--text-secondary))", minHeight: 44 }}>Cancel</button>
                      <button onClick={handleClearJournal} className="rounded-full px-5 py-2 text-base flex items-center gap-1.5" style={{ background: "hsl(var(--destructive))", color: "hsl(var(--primary-foreground))", fontWeight: 600, minHeight: 44 }}><Trash2 className="w-4 h-4" />Delete All</button>
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
