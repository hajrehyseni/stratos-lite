import { useState, useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { getJournalEntries } from "@/lib/journal";
import type { JournalEntry } from "@/lib/types";
import { ArrowRight } from "lucide-react";

const verdictColors: Record<string, string> = {
  "PROCEED": "hsl(var(--success))",
  "CONDITIONAL PROCEED": "hsl(var(--warning))",
  "DO NOT PROCEED": "hsl(var(--destructive))",
  "DEFER — INFORMATION NEEDED": "hsl(217, 91%, 60%)",
};
const verdictLabels = ["PROCEED", "CONDITIONAL PROCEED", "DO NOT PROCEED", "DEFER — INFORMATION NEEDED"];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const entries = getJournalEntries();
  const count = entries.length;
  const avgScore = useMemo(() => count ? Math.round(entries.reduce((s, e) => s + e.result.confidence_score, 0) / count) : 0, [entries]);
  const verdictDist = useMemo(() => { const m: Record<string, number> = {}; verdictLabels.forEach(v => m[v] = 0); entries.forEach(e => { m[e.result.verdict] = (m[e.result.verdict] || 0) + 1; }); return m; }, [entries]);
  const totalVerdicts = Object.values(verdictDist).reduce((a, b) => a + b, 0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const cardBase = { background: "hsla(0, 0%, 100%, 0.04)", border: "1px solid hsla(0, 0%, 100%, 0.08)" };

  if (loading) return null;
  if (!user) return <Navigate to="/login?redirect=dashboard" replace />;

  return (
    <>
      <NavBar journalCount={count} />
      <div className="min-h-screen px-4 sm:px-6 pb-16 pt-20 page-enter">
        <div className="max-w-[960px] mx-auto space-y-8">
          {count === 0 ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "50vh" }}>
              <p className="text-2xl font-bold" style={{ color: "hsl(var(--text-primary))" }}>Run a few audits to unlock your decision intelligence</p>
              <p className="mt-3 text-lg" style={{ color: "hsl(var(--text-secondary))" }}>Your dashboard will show confidence trends, risk patterns, and more.</p>
              <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-full font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" style={{ height: 52, padding: "0 28px", fontSize: 16, background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", boxShadow: "0 4px 16px hsla(16, 100%, 62%, 0.3)" }}>
                Run your first audit <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { val: count, label: "Total Audits" },
                  { val: avgScore, label: "Avg Readiness" },
                ].map(m => (
                  <div key={m.label} className="rounded-xl p-6" style={cardBase}>
                    <span className="text-4xl font-extrabold" style={{ color: "hsl(var(--text-primary))" }}>{m.val}</span>
                    <p className="mt-1.5 text-sm" style={{ color: "hsl(var(--text-secondary))" }}>{m.label}</p>
                  </div>
                ))}
              </div>

              {totalVerdicts > 0 && (
                <div className="rounded-xl p-6" style={cardBase}>
                  <p className="text-sm font-semibold mb-4" style={{ color: "hsl(var(--text-secondary))" }}>Verdict Distribution</p>
                  <div className="flex rounded-full overflow-hidden" style={{ height: 10, background: "hsla(0, 0%, 100%, 0.06)" }}>
                    {verdictLabels.map(v => { const c = verdictDist[v] || 0; if (!c) return null; return <div key={v} style={{ flexGrow: c, minWidth: 4, background: verdictColors[v] }} />; })}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    {verdictLabels.map(v => (
                      <div key={v} className="flex items-center gap-2">
                        <span className="inline-block rounded-full" style={{ width: 10, height: 10, background: verdictColors[v] }} />
                        <span className="text-sm" style={{ color: "hsl(var(--text-secondary))" }}>{v.split(" ").slice(0, 2).join(" ")}: {verdictDist[v]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl" style={cardBase}>
                <div className="p-6 pb-0"><p className="text-sm font-semibold mb-3" style={{ color: "hsl(var(--text-secondary))" }}>Recent Decisions</p></div>
                {entries.slice(0, 10).map(entry => {
                  const isOpen = expanded === entry.id;
                  return (
                    <div key={entry.id} style={{ borderTop: "1px solid hsla(0, 0%, 100%, 0.06)" }}>
                      <button onClick={() => setExpanded(isOpen ? null : entry.id)} className="w-full px-6 py-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors" style={{ minHeight: 52 }}>
                        <span className="hidden sm:inline text-sm" style={{ color: "hsl(var(--text-tertiary))", flexShrink: 0, width: 80 }}>{new Date(entry.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                        <span className="flex-1 truncate text-base" style={{ color: "hsl(var(--text-primary))" }}>{entry.decision.slice(0, 60)}{entry.decision.length > 60 ? "..." : ""}</span>
                        <span className="flex-shrink-0 rounded-full text-center text-sm px-2.5 py-0.5 font-semibold" style={{ color: "hsl(var(--primary))", border: "1px solid hsla(16, 100%, 62%, 0.3)" }}>{entry.result.confidence_score}</span>
                        <span className="hidden sm:inline-block rounded-full flex-shrink-0" style={{ width: 10, height: 10, background: verdictColors[entry.result.verdict] || "hsl(var(--text-tertiary))" }} />
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-6">
                          <div className="space-y-3 pt-2">
                            {[["Verdict", entry.result.verdict], ["Biggest Risk", entry.result.biggest_risk], ["The Reframe", entry.result.better_question], ["Devil's Advocate", entry.result.devils_advocate]].filter(([, v]) => v).map(([label, value]) => (
                              <div key={label as string}>
                                <p className="text-xs uppercase font-semibold" style={{ letterSpacing: "0.1em", color: "hsla(16, 100%, 62%, 0.6)", marginBottom: 4 }}>{label}</p>
                                <p className="text-base" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.6 }}>{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
