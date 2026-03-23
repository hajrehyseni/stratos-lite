import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { getJournalEntries } from "@/lib/journal";
import { ArrowRight, TrendingUp, Search } from "lucide-react";

const mockAudits = [
  { id: "1", decision: "Should we acquire our competitor?", date: "2026-03-20", score: 72, verdict: "CONDITIONAL PROCEED" },
  { id: "2", decision: "Should we pivot our product strategy?", date: "2026-03-18", score: 85, verdict: "PROCEED" },
  { id: "3", decision: "Should I restructure my team?", date: "2026-03-15", score: 45, verdict: "DO NOT PROCEED" },
  { id: "4", decision: "Should we expand into the European market?", date: "2026-03-12", score: 68, verdict: "CONDITIONAL PROCEED" },
];

function getScoreColor(score: number) {
  if (score <= 40) return "hsl(0, 84%, 50%)";
  if (score <= 65) return "hsl(38, 80%, 45%)";
  if (score <= 85) return "hsl(160, 84%, 35%)";
  return "hsl(142, 71%, 40%)";
}

function getScoreBg(score: number) {
  if (score <= 40) return "hsla(0, 84%, 50%, 0.1)";
  if (score <= 65) return "hsla(38, 80%, 45%, 0.1)";
  if (score <= 85) return "hsla(160, 84%, 35%, 0.1)";
  return "hsla(142, 71%, 40%, 0.1)";
}

function getVerdictColor(verdict: string) {
  if (verdict === "PROCEED") return { bg: "hsla(160, 84%, 35%, 0.1)", text: "hsl(160, 84%, 35%)" };
  if (verdict.includes("CONDITIONAL")) return { bg: "hsla(38, 80%, 45%, 0.1)", text: "hsl(38, 80%, 45%)" };
  return { bg: "hsla(0, 84%, 50%, 0.1)", text: "hsl(0, 84%, 50%)" };
}

function MiniSparkline() {
  const points = [8, 14, 12, 18];
  const h = 24, w = 48;
  const maxY = 20;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${(i / (points.length - 1)) * w},${h - (p / maxY) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="ml-2">
      <path d={path} fill="none" stroke="hsl(var(--success))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl p-6 animate-pulse" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
      <div className="h-10 w-24 rounded-lg" style={{ background: "hsl(var(--border))" }} />
      <div className="h-4 w-20 rounded mt-2" style={{ background: "hsl(var(--border))" }} />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="rounded-xl p-5 animate-pulse" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
      <div className="flex items-center gap-4">
        <div className="flex-1"><div className="h-5 w-3/4 rounded" style={{ background: "hsl(var(--border))" }} /></div>
        <div className="h-8 w-10 rounded-full" style={{ background: "hsl(var(--border))" }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const entries = getJournalEntries();

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const displayAudits = entries.length > 0 ? entries.map(e => ({
    id: e.id, decision: e.decision, date: e.createdAt, score: e.result.confidence_score, verdict: e.result.verdict,
  })) : mockAudits;

  const count = displayAudits.length;
  const avgScore = count ? Math.round(displayAudits.reduce((s, e) => s + e.score, 0) / count) : 0;
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  if (loading) return null;
  if (!user) return <Navigate to="/login?redirect=dashboard" replace />;

  return (
    <>
      <NavBar />
      <div className="min-h-screen px-4 sm:px-6 pb-16 pt-24 page-enter" style={{ background: "hsl(var(--background))" }}>
        {/* Gradient header */}
        <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none" style={{ background: "linear-gradient(to bottom, hsla(221, 83%, 53%, 0.03), transparent)" }} />

        <div className="max-w-[960px] mx-auto space-y-8 relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base mb-1" style={{ color: "hsl(var(--text-secondary))" }}>Welcome back, {firstName}</p>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "hsl(var(--text-primary))" }}>Dashboard</h1>
            </div>
            <Link to="/" className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
              New Audit <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stats with sparklines */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4"><SkeletonCard /><SkeletonCard /></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { val: count, label: "Total Audits" },
                { val: avgScore, label: "Avg Readiness" },
              ].map(m => (
                <div key={m.label} className="rounded-xl p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, hsla(221, 83%, 53%, 0.04), hsl(0, 0%, 100%))", border: "1px solid hsl(var(--border))" }}>
                  <div className="flex items-center gap-1">
                    <span className="text-4xl font-extrabold" style={{ color: "hsl(var(--text-primary))" }}>{m.val}</span>
                    <MiniSparkline />
                  </div>
                  <p className="mt-1.5 text-sm" style={{ color: "hsl(var(--text-secondary))" }}>{m.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Audits list with verdict tags */}
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ color: "hsl(var(--text-primary))" }}>Recent Decisions</h2>
            {isLoading ? (
              <div className="space-y-3"><SkeletonRow /><SkeletonRow /><SkeletonRow /></div>
            ) : (
              <div className="space-y-3">
                {displayAudits.map(audit => {
                  const vc = getVerdictColor(audit.verdict);
                  return (
                    <Link
                      key={audit.id}
                      to={`/audit-results?decision=${encodeURIComponent(audit.decision)}`}
                      className="group block rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:bg-[hsla(221,83%,53%,0.02)]"
                      style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold truncate" style={{ color: "hsl(var(--text-primary))" }}>{audit.decision}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <p className="text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>
                              {new Date(audit.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                            </p>
                            <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: vc.bg, color: vc.text }}>
                              {audit.verdict.replace("CONDITIONAL ", "COND. ")}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="rounded-full px-3 py-1 text-sm font-bold flex items-center justify-center" style={{ color: getScoreColor(audit.score), background: getScoreBg(audit.score), minWidth: 36 }}>{audit.score}</span>
                          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" style={{ color: "hsl(var(--text-tertiary))" }} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
