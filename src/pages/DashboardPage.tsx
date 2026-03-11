import { useState, useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { getJournalEntries } from "@/lib/journal";
import type { JournalEntry, AuditResult } from "@/lib/types";
import { ArrowRight } from "lucide-react";

const verdictColors: Record<string, string> = {
  "PROCEED": "#22C55E",
  "CONDITIONAL PROCEED": "#C9A84C",
  "DO NOT PROCEED": "#EF4444",
  "DEFER — INFORMATION NEEDED": "#3B82F6",
};

const verdictLabels = ["PROCEED", "CONDITIONAL PROCEED", "DO NOT PROCEED", "DEFER — INFORMATION NEEDED"];

export default function DashboardPage() {
  const entries = getJournalEntries();
  const count = entries.length;

  const avgScore = useMemo(() => {
    if (!count) return 0;
    return Math.round(entries.reduce((s, e) => s + e.result.confidence_score, 0) / count);
  }, [entries]);

  const verdictDist = useMemo(() => {
    const m: Record<string, number> = {};
    verdictLabels.forEach(v => m[v] = 0);
    entries.forEach(e => { m[e.result.verdict] = (m[e.result.verdict] || 0) + 1; });
    return m;
  }, [entries]);

  const totalVerdicts = Object.values(verdictDist).reduce((a, b) => a + b, 0);

  // Streak: consecutive weeks with at least 1 audit
  const streak = useMemo(() => {
    if (!count) return 0;
    const now = new Date();
    const weekStart = (d: Date) => {
      const s = new Date(d);
      s.setHours(0, 0, 0, 0);
      s.setDate(s.getDate() - s.getDay());
      return s.getTime();
    };
    const weeks = new Set(entries.map(e => weekStart(new Date(e.createdAt))));
    let s = 0;
    let current = weekStart(now);
    while (weeks.has(current)) {
      s++;
      current -= 7 * 24 * 60 * 60 * 1000;
    }
    return s;
  }, [entries]);

  // Top risk pattern (most common word in biggest_risk, simplified)
  const topRisk = useMemo(() => {
    if (count < 3) return null;
    const words: Record<string, number> = {};
    const stop = new Set(["the", "a", "an", "is", "are", "of", "to", "in", "and", "or", "that", "this", "it", "for", "on", "with", "be", "not", "may", "could", "would", "will", "you", "your"]);
    entries.forEach(e => {
      e.result.biggest_risk.toLowerCase().split(/\W+/).filter(w => w.length > 3 && !stop.has(w)).forEach(w => {
        words[w] = (words[w] || 0) + 1;
      });
    });
    const sorted = Object.entries(words).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? sorted[0][0].charAt(0).toUpperCase() + sorted[0][0].slice(1) : null;
  }, [entries]);

  // Decision patterns (5+ audits)
  const patterns = useMemo(() => {
    if (count < 5) return null;
    const cautious = entries.filter(e => e.result.verdict === "DO NOT PROCEED" || e.result.verdict === "DEFER — INFORMATION NEEDED").length;
    const riskPct = Math.round((cautious / count) * 100);

    // Blind spot: most common info needed
    const infoWords: Record<string, number> = {};
    entries.forEach(e => {
      (e.result.information_needed || []).forEach(item => {
        const key = item.toLowerCase().trim();
        if (key) infoWords[key] = (infoWords[key] || 0) + 1;
      });
    });
    const blindSpot = Object.entries(infoWords).sort((a, b) => b[1] - a[1]);
    const blindSpotText = blindSpot[0] ? blindSpot[0][0] : null;
    const blindSpotCount = blindSpot[0] ? blindSpot[0][1] : 0;

    // Trend
    const half = Math.floor(count / 2);
    const firstHalf = entries.slice(half);
    const secondHalf = entries.slice(0, half);
    const avgFirst = Math.round(firstHalf.reduce((s, e) => s + e.result.confidence_score, 0) / firstHalf.length);
    const avgSecond = Math.round(secondHalf.reduce((s, e) => s + e.result.confidence_score, 0) / secondHalf.length);
    const diff = avgSecond - avgFirst;

    return { riskPct, blindSpotText, blindSpotCount, avgFirst, avgSecond, diff };
  }, [entries]);

  const [expanded, setExpanded] = useState<string | null>(null);

  const cardBase = { background: "#0F0F0F", border: "1px solid #1A1A1A" };

  return (
    <>
      <NavBar journalCount={count} />

      {/* Top bar */}
      <div
        className="w-full pt-16"
        style={{ background: "#0A0A0A", borderBottom: "1px solid #1A1A1A" }}
      >
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-[18px] font-semibold" style={{ color: "#fff" }}>StratOS</Link>
          <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "#555" }}>
            DECISION INTELLIGENCE DASHBOARD
          </span>
          <span style={{ fontSize: 13, color: "#888" }}>
            {count} decision{count !== 1 ? "s" : ""} tracked
          </span>
        </div>
      </div>

      <div className="min-h-screen px-4 sm:px-6 pb-16 pt-8">
        <div className="max-w-[960px] mx-auto space-y-8">

          {/* Section B: Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl p-5" style={cardBase}>
              <span style={{ fontSize: 32, fontWeight: 700, color: "#C9A84C" }}>{count}</span>
              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#555", marginTop: 4 }}>Total Audits</p>
            </div>
            <div className="rounded-xl p-5" style={cardBase}>
              <span style={{ fontSize: 32, fontWeight: 700, color: "#C9A84C" }}>{avgScore}</span>
              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#555", marginTop: 4 }}>Avg Readiness</p>
            </div>
            <div className="rounded-xl p-5" style={cardBase}>
              {topRisk ? (
                <span style={{ fontSize: 14, fontWeight: 400, color: "#E8E4DF" }}>{topRisk}</span>
              ) : (
                <>
                  <span style={{ fontSize: 14, color: "#E8E4DF" }}>—</span>
                  <p style={{ fontSize: 11, color: "#444", marginTop: 4 }}>3+ audits needed</p>
                </>
              )}
              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#555", marginTop: topRisk ? 4 : 0 }}>Top Risk Pattern</p>
            </div>
            <div className="rounded-xl p-5" style={cardBase}>
              {streak > 0 ? (
                <span style={{ fontSize: 32, fontWeight: 700, color: "#C9A84C" }}>{streak}</span>
              ) : (
                <span style={{ fontSize: 11, color: "#C9A84C" }}>Start your streak</span>
              )}
              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#555", marginTop: 4 }}>Decision Streak</p>
            </div>
          </div>

          {/* Section C: Verdict Distribution */}
          <div className="rounded-xl p-6" style={cardBase}>
            <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "#555", marginBottom: 16 }}>
              Verdict Distribution
            </p>
            {totalVerdicts === 0 ? (
              <p style={{ fontSize: 13, color: "#555", textAlign: "center", padding: "16px 0" }}>
                Run your first audit to see patterns
              </p>
            ) : (
              <>
                <div className="flex rounded-full overflow-hidden" style={{ height: 8, background: "rgba(255,255,255,0.06)" }}>
                  {verdictLabels.map(v => {
                    const c = verdictDist[v] || 0;
                    if (c === 0) return null;
                    return (
                      <div
                        key={v}
                        style={{
                          flexGrow: c,
                          minWidth: 4,
                          background: verdictColors[v],
                        }}
                      />
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {verdictLabels.map(v => (
                    <div key={v} className="flex items-center gap-2">
                      <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: verdictColors[v] }} />
                      <span style={{ fontSize: 12, color: "#888" }}>{v.split(" ").slice(0, 2).join(" ")}: {verdictDist[v]}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Section D: Recent Decisions */}
          <div className="rounded-xl" style={cardBase}>
            <div className="p-6 pb-0">
              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "#555", marginBottom: 12 }}>
                Recent Decisions
              </p>
            </div>
            {entries.length === 0 ? (
              <p style={{ fontSize: 13, color: "#555", textAlign: "center", padding: "24px" }}>
                No decisions yet
              </p>
            ) : (
              <div>
                {entries.slice(0, 10).map(entry => {
                  const isOpen = expanded === entry.id;
                  return (
                    <div key={entry.id} style={{ borderTop: "1px solid #1A1A1A" }}>
                      <button
                        onClick={() => setExpanded(isOpen ? null : entry.id)}
                        className="w-full px-6 py-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
                      >
                        <span className="hidden sm:inline" style={{ fontSize: 12, color: "#555", flexShrink: 0, width: 80 }}>
                          {new Date(entry.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </span>
                        <span className="flex-1 truncate" style={{ fontSize: 14, color: "#E8E4DF" }}>
                          {entry.decision.slice(0, 60)}{entry.decision.length > 60 ? "..." : ""}
                        </span>
                        <span
                          className="flex-shrink-0 rounded-full text-center"
                          style={{ fontSize: 12, color: "#C9A84C", border: "1px solid #C9A84C", padding: "2px 8px", minWidth: 32 }}
                        >
                          {entry.result.confidence_score}
                        </span>
                        <span
                          className="hidden sm:inline-block rounded-full flex-shrink-0"
                          style={{ width: 8, height: 8, background: verdictColors[entry.result.verdict] || "#888" }}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-6" style={{ maxHeight: 600, overflowY: "auto" }}>
                          <div className="space-y-3 pt-2">
                            {[
                              ["Verdict", entry.result.verdict],
                              ["Biggest Risk", entry.result.biggest_risk],
                              ["The Reframe", entry.result.better_question],
                              ["Devil's Advocate", entry.result.devils_advocate],
                              ["Stakeholder Gap", entry.result.stakeholder_gap],
                              ["Hidden Assumption", entry.result.hidden_assumption],
                              ["30-Day Test", entry.result.thirty_day_test],
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
            )}
          </div>

          {/* Section E: Decision Patterns */}
          {count < 5 ? (
            <div className="rounded-xl text-center" style={{ ...cardBase, padding: 32 }}>
              <span style={{ fontSize: 24 }}>🔒</span>
              <h3 className="mt-3" style={{ fontSize: 18, fontWeight: 600, color: "#E8E4DF" }}>
                Decision Pattern Analysis
              </h3>
              <p className="mx-auto mt-2" style={{ fontSize: 14, color: "#888", maxWidth: 480, lineHeight: 1.6 }}>
                Complete 5 audits to unlock your personal decision-making profile. You'll see where you over-index, where you're blind, and how to sharpen your judgment.
              </p>
              <p className="mt-4" style={{ fontSize: 13, color: "#888" }}>{count}/5 audits completed</p>
              <div className="mx-auto mt-2 rounded-full overflow-hidden" style={{ maxWidth: 200, height: 4, background: "#1A1A1A" }}>
                <div className="rounded-full" style={{ height: "100%", width: `${(count / 5) * 100}%`, background: "#C9A84C" }} />
              </div>
            </div>
          ) : patterns && (
            <div className="space-y-3">
              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "#555" }}>
                YOUR DECISION PROFILE
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl p-5" style={cardBase}>
                  <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#555", marginBottom: 8 }}>Risk Sensitivity</p>
                  <span style={{ fontSize: 32, fontWeight: 700, color: "#C9A84C" }}>{patterns.riskPct}%</span>
                  <p className="mt-2" style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>
                    {patterns.riskPct > 50
                      ? "You lean cautious — consider whether you're avoiding necessary risk."
                      : "You lean decisive — ensure you're not underweighting downside scenarios."}
                  </p>
                </div>
                <div className="rounded-xl p-5" style={cardBase}>
                  <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#555", marginBottom: 8 }}>Blind Spot</p>
                  {patterns.blindSpotText ? (
                    <>
                      <p style={{ fontSize: 16, color: "#E8E4DF" }}>{patterns.blindSpotText}</p>
                      <p className="mt-2" style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>
                        This comes up in {patterns.blindSpotCount} of your audits — you may be systematically overlooking this area.
                      </p>
                    </>
                  ) : (
                    <p style={{ fontSize: 13, color: "#888" }}>Not enough data yet</p>
                  )}
                </div>
                <div className="rounded-xl p-5" style={cardBase}>
                  <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#555", marginBottom: 8 }}>Readiness Trend</p>
                  <div className="flex items-baseline gap-2">
                    <span style={{ fontSize: 24, fontWeight: 700, color: "#C9A84C" }}>{patterns.avgFirst}</span>
                    <span style={{ fontSize: 14, color: "#555" }}>→</span>
                    <span style={{ fontSize: 24, fontWeight: 700, color: "#C9A84C" }}>{patterns.avgSecond}</span>
                  </div>
                  <p className="mt-2" style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: patterns.diff > 0 ? "#22C55E" : patterns.diff < 0 ? "#C9A84C" : "#888"
                  }}>
                    {patterns.diff > 0
                      ? `Your decisions are getting sharper. Average readiness up ${patterns.diff} points.`
                      : patterns.diff < 0
                      ? `Watch this — your recent decisions scored lower than your earlier ones.`
                      : `Consistent. Your readiness scores are stable.`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
