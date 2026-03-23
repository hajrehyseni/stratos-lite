import { useState, useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { getJournalEntries } from "@/lib/journal";
import type { JournalEntry } from "@/lib/types";
import { ArrowRight, BarChart3 } from "lucide-react";

const verdictColors: Record<string, string> = {
  "PROCEED": "hsl(var(--success))",
  "CONDITIONAL PROCEED": "hsl(var(--warning))",
  "DO NOT PROCEED": "hsl(var(--destructive))",
  "DEFER — INFORMATION NEEDED": "hsl(221, 83%, 53%)",
};

const mockAudits = [
  { id: "1", decision: "Should we acquire our competitor?", date: "2026-03-20", score: 72, verdict: "CONDITIONAL PROCEED" },
  { id: "2", decision: "Should we pivot our product strategy?", date: "2026-03-18", score: 85, verdict: "PROCEED" },
  { id: "3", decision: "Should I restructure my team?", date: "2026-03-15", score: 45, verdict: "DO NOT PROCEED" },
  { id: "4", decision: "Should we expand into the European market?", date: "2026-03-12", score: 68, verdict: "CONDITIONAL PROCEED" },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const entries = getJournalEntries();
  const [expanded, setExpanded] = useState<string | null>(null);

  // Use mock data for demo, real data when available
  const displayAudits = entries.length > 0 ? entries.map(e => ({
    id: e.id, decision: e.decision, date: e.createdAt, score: e.result.confidence_score, verdict: e.result.verdict,
  })) : mockAudits;

  const count = displayAudits.length;
  const avgScore = count ? Math.round(displayAudits.reduce((s, e) => s + e.score, 0) / count) : 0;

  if (loading) return null;
  if (!user) return <Navigate to="/login?redirect=dashboard" replace />;

  return (
    <>
      <NavBar journalCount={entries.length} />
      <div className="min-h-screen px-4 sm:px-6 pb-16 pt-24 page-enter" style={{ background: "hsl(var(--background))" }}>
        <div className="max-w-[960px] mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "hsl(var(--text-primary))" }}>Dashboard</h1>
            <Link to="/" className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
              New Audit <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { val: count, label: "Total Audits" },
              { val: avgScore, label: "Avg Readiness" },
            ].map(m => (
              <div key={m.label} className="rounded-xl p-6" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                <span className="text-4xl font-extrabold" style={{ color: "hsl(var(--text-primary))" }}>{m.val}</span>
                <p className="mt-1.5 text-sm" style={{ color: "hsl(var(--text-secondary))" }}>{m.label}</p>
              </div>
            ))}
          </div>

          {/* Audits list */}
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ color: "hsl(var(--text-primary))" }}>Recent Decisions</h2>
            <div className="space-y-3">
              {displayAudits.map(audit => (
                <Link
                  key={audit.id}
                  to={`/audit-results?decision=${encodeURIComponent(audit.decision)}`}
                  className="block rounded-xl p-5 transition-all duration-200 hover:shadow-md"
                  style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold truncate" style={{ color: "hsl(var(--text-primary))" }}>{audit.decision}</p>
                      <p className="text-sm mt-1" style={{ color: "hsl(var(--text-tertiary))" }}>
                        {new Date(audit.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="rounded-full px-3 py-1 text-sm font-bold" style={{ color: "hsl(var(--primary))", background: "hsla(221, 83%, 53%, 0.1)" }}>{audit.score}</span>
                      <span className="inline-block rounded-full" style={{ width: 10, height: 10, background: verdictColors[audit.verdict] || "hsl(var(--text-tertiary))" }} />
                      <ArrowRight className="w-4 h-4" style={{ color: "hsl(var(--text-tertiary))" }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
