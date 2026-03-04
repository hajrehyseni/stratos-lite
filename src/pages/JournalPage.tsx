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

  const completedCount = entries.length;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  return (
    <>
      <NavBar journalCount={entries.length} />
      <div className="min-h-screen px-4 pt-20 pb-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="font-display text-2xl text-foreground">My Decision Journal</h1>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              {completedCount} decision{completedCount !== 1 ? "s" : ""} audited · Private · Zero server storage
            </p>
          </div>

          {/* Pattern teaser */}
          {completedCount >= 3 && (
            <div className="border border-border rounded-lg p-4 opacity-70">
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                🔒 Decision Pattern Analysis
              </p>
              <p className="text-sm text-muted-foreground">
                You've completed {completedCount} audit{completedCount !== 1 ? "s" : ""}. Patterns emerge at 5.
              </p>
              <p className="text-xs text-gold mt-1">Your decision DNA is building.</p>
              <div className="flex gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-sm ${i < completedCount ? "bg-gold" : "bg-secondary"}`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {completedCount}/5 audits to unlock pattern analysis
              </p>
            </div>
          )}

          {entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No decisions saved yet.</p>
              <Link to="/" className="text-gold text-sm hover:underline mt-2 inline-block">
                Start your first audit →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => {
                const createdDate = new Date(entry.createdAt);
                const isOlderThan30Days = createdDate.getTime() < thirtyDaysAgo;
                const needsOutcome = entry.followUp && !entry.outcome && isOlderThan30Days;

                return (
                  <div key={entry.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${verdictColors[entry.result.verdict] || "bg-secondary text-foreground"}`}>
                          {entry.result.verdict}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {entry.result.decision_type}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                        {createdDate.toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm text-foreground">
                      "{entry.decision.slice(0, 80)}{entry.decision.length > 80 ? "..." : ""}"
                    </p>

                    <div className="flex gap-3 text-[10px] font-mono text-muted-foreground">
                      <span>Confidence: {entry.result.confidence_score}/100</span>
                      <span>Lens: {entry.diagnostic.focus}</span>
                      <span>Scale: {entry.diagnostic.scale}</span>
                    </div>

                    {entry.outcome ? (
                      <div className="border-t border-border pt-2">
                        <p className="text-[10px] font-mono text-gold uppercase">Outcome recorded</p>
                        <p className="text-xs text-foreground mt-1">{entry.outcome}</p>
                      </div>
                    ) : needsOutcome ? (
                      <div className="border-t border-border pt-3 space-y-2">
                        <p className="text-xs text-gold">
                          ⏱ 30 days ago you audited this decision. What actually happened?
                        </p>
                        <textarea
                          rows={3}
                          value={outcomeText[entry.id] || ""}
                          onChange={(e) => setOutcomeText({ ...outcomeText, [entry.id]: e.target.value })}
                          className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold resize-none"
                          placeholder="What happened..."
                        />
                        <button
                          onClick={() => handleRecordOutcome(entry.id)}
                          disabled={!outcomeText[entry.id]?.trim()}
                          className="text-xs font-mono bg-gold text-accent-foreground px-3 py-1.5 rounded hover:opacity-90 disabled:opacity-30 transition-opacity"
                        >
                          Record Outcome
                        </button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground">
                        Outcome: pending
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
