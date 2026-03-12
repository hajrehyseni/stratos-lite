import { useState, useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { getJournalEntries } from "@/lib/journal";
import type { JournalEntry } from "@/lib/types";
import { ArrowRight } from "lucide-react";

const verdictColors: Record<string, string> = {
  "PROCEED": "hsl(160, 84%, 39%)",
  "CONDITIONAL PROCEED": "hsl(38, 92%, 50%)",
  "DO NOT PROCEED": "hsl(0, 84%, 60%)",
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
  const cardBase = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };

  if (loading) return null;
  if (!user) return <Navigate to="/login?redirect=dashboard" replace />;

  return (
    <>
      <NavBar journalCount={count} />
      <div className="min-h-screen px-4 sm:px-6 pb-16 pt-20 page-enter">
        <div className="max-w-[960px] mx-auto space-y-8">
          {count === 0 ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "50vh" }}>
              <p className="text-xl font-semibold" style={{ color: "#FFFFFF" }}>Run a few audits to unlock your decision intelligence</p>
              <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>Your dashboard will show confidence trends, risk patterns, and more.</p>
              <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-full font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" style={{ height: 44, padding: "0 24px", fontSize: 14, background: "hsl(16, 100%, 62%)", color: "#FFFFFF" }}>
                Run your first audit <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { val: count, label: "Total Audits" },
                  { val: avgScore, label: "Avg Readiness" },
                ].map(m => (
                  <div key={m.label} className="rounded-xl p-5" style={cardBase}>
                    <span className="text-3xl font-bold" style={{ color: "#FFFFFF" }}>{m.val}</span>
                    <p className="mt-1 text-xs" style={{ color: "#6B7280" }}>{m.label}</p>
                  </div>
                ))}
              </div>

              {totalVerdicts > 0 && (
                <div className="rounded-xl p-6" style={cardBase}>
                  <p className="text-xs font-medium mb-4" style={{ color: "#6B7280" }}>Verdict Distribution</p>
                  <div className="flex rounded-full overflow-hidden" style={{ height: 8, background: "rgba(255,255,255,0.06)" }}>
                    {verdictLabels.map(v => { const c = verdictDist[v] || 0; if (!c) return null; return <div key={v} style={{ flexGrow: c, minWidth: 4, background: verdictColors[v] }} />; })}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    {verdictLabels.map(v => (
                      <div key={v} className="flex items-center gap-2">
                        <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: verdictColors[v] }} />
                        <span className="text-xs" style={{ color: "#6B7280" }}>{v.split(" ").slice(0, 2).join(" ")}: {verdictDist[v]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl" style={cardBase}>
                <div className="p-6 pb-0"><p className="text-xs font-medium mb-3" style={{ color: "#6B7280" }}>Recent Decisions</p></div>
                {entries.slice(0, 10).map(entry => {
                  const isOpen = expanded === entry.id;
                  return (
                    <div key={entry.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <button onClick={() => setExpanded(isOpen ? null : entry.id)} className="w-full px-6 py-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors" style={{ minHeight: 44 }}>
                        <span className="hidden sm:inline text-xs" style={{ color: "#6B7280", flexShrink: 0, width: 80 }}>{new Date(entry.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                        <span className="flex-1 truncate text-sm" style={{ color: "#FFFFFF" }}>{entry.decision.slice(0, 60)}{entry.decision.length > 60 ? "..." : ""}</span>
                        <span className="flex-shrink-0 rounded-full text-center text-xs px-2 py-0.5" style={{ color: "hsl(16, 100%, 62%)", border: "1px solid hsla(16, 100%, 62%, 0.3)" }}>{entry.result.confidence_score}</span>
                        <span className="hidden sm:inline-block rounded-full flex-shrink-0" style={{ width: 8, height: 8, background: verdictColors[entry.result.verdict] || "#6B7280" }} />
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-6">
                          <div className="space-y-3 pt-2">
                            {[["Verdict", entry.result.verdict], ["Biggest Risk", entry.result.biggest_risk], ["The Reframe", entry.result.better_question], ["Devil's Advocate", entry.result.devils_advocate]].filter(([, v]) => v).map(([label, value]) => (
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
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
