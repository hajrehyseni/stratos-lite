import { useState, useEffect } from "react";
import { Copy, Download, Check, BookmarkPlus, ChevronDown, Share2, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import type { AuditResult } from "@/lib/types";
import { generateBrief } from "@/lib/copy-brief";
import { generatePDF } from "@/lib/generate-pdf";
import { getJournalCount } from "@/lib/journal";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ScorecardProps {
  decision: string;
  result: AuditResult;
  auditId: string;
  onReset: (prefill?: string) => void;
  onSaveToJournal?: () => void;
  journalSaved?: boolean;
  readOnly?: boolean;
}

function getReadinessInterpretation(score: number): string {
  if (score >= 80) return "Strong foundation. Ready for board presentation.";
  if (score >= 60) return "Good basis. Address the gaps below before committing.";
  if (score >= 40) return "Significant gaps. More work needed before deciding.";
  return "Not ready. Critical assumptions need validation first.";
}

function scoreColor(score: number): string {
  if (score >= 70) return "hsl(var(--success))";
  if (score >= 40) return "hsl(var(--warning))";
  return "hsl(var(--destructive))";
}

const verdictColor: Record<string, string> = {
  "PROCEED": "hsl(var(--success))",
  "CONDITIONAL PROCEED": "hsl(var(--warning))",
  "DO NOT PROCEED": "hsl(var(--destructive))",
  "DEFER — INFORMATION NEEDED": "hsl(217, 91%, 60%)",
};

const cynefinBadgeColors: Record<string, string> = {
  clear: "hsl(var(--success))", complicated: "hsl(217, 91%, 60%)", complex: "hsl(var(--warning))", chaotic: "hsl(var(--destructive))",
  CLEAR: "hsl(var(--success))", COMPLICATED: "hsl(217, 91%, 60%)", COMPLEX: "hsl(var(--warning))", CHAOTIC: "hsl(var(--destructive))",
};

const classificationLabels: Record<string, string> = {
  big_bet: "Big-bet decision", cross_cutting: "Cross-cutting", delegated: "Delegated",
};

const ssmRoleLabels: Record<string, string> = {
  problem_owner: "Problem Owner", problem_solver: "Problem Solver", client: "Client",
};

const ssmRoleColors: Record<string, string> = {
  problem_owner: "hsl(var(--primary))", problem_solver: "hsl(217, 91%, 60%)", client: "hsl(var(--success))",
};

const positionColors: Record<string, string> = {
  Support: "hsl(var(--success))", Oppose: "hsl(var(--destructive))", Neutral: "hsl(var(--text-tertiary))",
};

const cardBase = { background: "hsla(0, 0%, 100%, 0.04)", border: "1px solid hsla(0, 0%, 100%, 0.08)" };

function SectionDivider({ label, subtitle }: { label: string; subtitle?: string }) {
  return (
    <div className="relative my-10">
      <div style={{ height: 1, background: "hsla(0, 0%, 100%, 0.08)" }} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 text-center" style={{ background: "hsl(var(--navy))" }}>
        <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: "hsl(var(--text-secondary))", fontWeight: 600 }}>
          {label}
        </span>
        {subtitle && (
          <span className="block" style={{ fontSize: 11, color: "hsl(var(--text-tertiary))", marginTop: 2 }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "hsl(var(--primary))", opacity: 0.8, marginBottom: 10, fontWeight: 600 }}>
      {children}
    </p>
  );
}

export function Scorecard({ decision, result, auditId, onReset, onSaveToJournal, journalSaved, readOnly }: ScorecardProps) {
  const [copied, setCopied] = useState(false);
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const { user } = useAuth();
  const journalCount = getJournalCount();

  const reframe = result.reframe_question || result.better_question || "";
  const rationale = result.verdict_rationale || result.confidence_rationale || "";
  const blindSpot = result.stakeholder_blind_spot || result.stakeholder_gap || "";
  const test30 = result.validation_test_30_day || result.thirty_day_test || "";

  const cynefinDomain = result.cynefin_domain || (result.decision_domain ? result.decision_domain.toLowerCase() : null);
  const domainApproach = result.decision_domain_approach || null;

  // Show conversion modal after 3s delay for anonymous users
  useEffect(() => {
    if (!user && !readOnly) {
      const timer = setTimeout(() => setShowConversionModal(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [user, readOnly]);

  const handleCopyBrief = async () => {
    const brief = generateBrief(decision, result);
    await navigator.clipboard.writeText(brief);
    setCopied(true);
    toast.success("Brief copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    try {
      const bytes = await generatePDF(decision, result);
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "stratos-decision-audit.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  const handleShare = async () => {
    try {
      const payload = { decision, result };
      const encoded = encodeURIComponent(JSON.stringify(payload));
      const url = `${window.location.origin}/r/${auditId}#${encoded}`;
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard");
    } catch {
      toast.error("Failed to copy share link");
    }
  };

  const handleAuditOpposite = () => {
    const inverse = `NOT: ${decision}`;
    onReset(inverse);
  };

  return (
    <div className="min-h-screen px-4 pt-20 pb-16 page-enter">
      {/* Conversion modal overlay */}
      {showConversionModal && !user && !readOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-10 mx-4" style={{ maxWidth: 460, background: "hsl(228, 35%, 14%)", border: "1px solid hsla(0, 0%, 100%, 0.1)" }}>
            <h3 className="text-xl font-bold text-center" style={{ color: "hsl(var(--text-primary))" }}>
              Save this audit — create free account
            </h3>
            <p className="mt-3 text-center text-base" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.6 }}>
              Create a free account to keep your results, track decisions over time, and unlock 3 audits.
            </p>
            <a
              href="/signup"
              className="mt-8 w-full flex items-center justify-center rounded-full font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ height: 52, fontSize: 16, background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", boxShadow: "0 4px 16px hsla(16, 100%, 62%, 0.3)" }}
            >
              Save this audit — create free account
            </a>
            <button
              onClick={() => setShowConversionModal(false)}
              className="mt-4 w-full text-center transition-opacity hover:opacity-80"
              style={{ fontSize: 14, color: "hsl(var(--text-tertiary))", background: "none", border: "none", minHeight: 44 }}
            >
              Continue without saving
            </button>
          </div>
        </div>
      )}

      <div className="scorecard-entrance" style={{ maxWidth: 720, margin: "0 auto" }}>
        {readOnly && (
          <div className="text-center mb-8 rounded-lg py-2 px-4" style={{ background: "hsla(0, 0%, 100%, 0.04)", border: "1px solid hsla(0, 0%, 100%, 0.08)" }}>
            <span className="text-sm font-medium" style={{ letterSpacing: "0.1em", color: "hsl(var(--text-secondary))" }}>
              Shared Audit — Read Only
            </span>
          </div>
        )}

        {/* ═══ TIER 1: VERDICT + SCORE ═══ */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="ml-auto flex items-baseline gap-1">
            <span style={{ fontSize: 48, fontWeight: 800, color: scoreColor(result.confidence_score), lineHeight: 1 }}>
              {result.confidence_score}
            </span>
            <span style={{ fontSize: 18, fontWeight: 400, color: "hsl(var(--text-tertiary))" }}>/100</span>
          </div>
        </div>
        <div className="mb-4" style={{ width: "100%", height: 6, borderRadius: 3, background: "hsla(0, 0%, 100%, 0.06)", overflow: "hidden" }}>
          <div className="bar-fill" style={{ height: "100%", width: `${result.confidence_score}%`, borderRadius: 3, background: scoreColor(result.confidence_score) }} />
        </div>
        <p className="mb-6 text-base" style={{ color: "hsl(var(--text-secondary))" }}>
          {getReadinessInterpretation(result.confidence_score)}
        </p>

        <div className="rounded-xl px-6 py-6 mb-4" style={{ ...cardBase, borderLeft: `4px solid ${verdictColor[result.verdict] || "hsl(var(--warning))"}` }}>
          <CardLabel>Verdict</CardLabel>
          <p className="text-xl font-semibold" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.7 }}>{result.verdict}</p>
          {rationale && <p className="mt-2 text-base" style={{ color: "hsl(var(--text-secondary))" }}>{rationale}</p>}
        </div>

        {/* ═══ TIER 2: REFRAME ═══ */}
        {reframe && (
          <div className="rounded-xl px-6 py-6 mb-4" style={{ ...cardBase, borderTop: "2px solid hsla(16, 100%, 62%, 0.3)" }}>
            <p className="text-xs uppercase font-semibold mb-2" style={{ letterSpacing: "0.15em", color: "hsl(var(--text-secondary))" }}>The Reframe</p>
            <p className="text-xl italic" style={{ color: "hsl(var(--primary))", lineHeight: 1.7 }}>
              <span style={{ marginRight: 6 }}>"</span>{reframe}
            </p>
          </div>
        )}

        {/* ═══ TIER 3: CLASSIFICATION BAR ═══ */}
        {(cynefinDomain || result.decision_classification) && (
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {cynefinDomain && (
              <span
                className="inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-bold"
                style={{
                  background: `${cynefinBadgeColors[cynefinDomain] || "#888"}15`,
                  border: `1px solid ${cynefinBadgeColors[cynefinDomain] || "#888"}40`,
                  color: cynefinBadgeColors[cynefinDomain] || "#888",
                  letterSpacing: "0.05em",
                }}
              >
                {cynefinDomain.charAt(0).toUpperCase() + cynefinDomain.slice(1)}
              </span>
            )}
            {result.decision_classification && classificationLabels[result.decision_classification] && (
              <span
                className="inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-bold"
                style={{
                  background: "hsla(0, 0%, 100%, 0.05)",
                  border: "1px solid hsla(0, 0%, 100%, 0.15)",
                  color: "hsl(var(--text-secondary))",
                }}
              >
                {classificationLabels[result.decision_classification]}
              </span>
            )}
          </div>
        )}
        {domainApproach && (
          <p className="mb-6 text-sm" style={{ color: "hsl(var(--text-secondary))" }}>
            {domainApproach}
          </p>
        )}

        {/* Time Horizon */}
        {result.time_horizon && (
          <div className="rounded-xl px-6 py-6 mb-4" style={cardBase}>
            <CardLabel>Time Horizon Check</CardLabel>
            <div className="space-y-4">
              {[
                { icon: "⏱", label: "10 minutes", value: result.time_horizon.ten_minutes },
                { icon: "📅", label: "10 months", value: result.time_horizon.ten_months },
                { icon: "🏛", label: "10 years", value: result.time_horizon.ten_years },
              ].map((row) => (
                <div key={row.label} className="flex gap-3">
                  <span className="text-base" style={{ flexShrink: 0 }}>{row.icon}</span>
                  <div>
                    <span className="text-xs font-semibold uppercase" style={{ color: "hsl(var(--text-secondary))", letterSpacing: "0.05em" }}>{row.label}:</span>
                    <p className="text-base mt-1" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.6 }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ TIER 4: MECE ═══ */}
        {result.mece_tree?.branches && result.mece_tree.branches.length > 0 && (
          <>
            <SectionDivider label="Decision Breakdown" subtitle="(MECE Analysis)" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.mece_tree.branches.map((branch, i) => (
                <div key={i} className="rounded-xl px-5 py-5" style={{ ...cardBase, borderLeft: "3px solid hsla(16, 100%, 62%, 0.4)" }}>
                  <p className="text-base font-semibold mb-3" style={{ color: "hsl(var(--text-primary))" }}>{branch.title}</p>
                  <ul className="space-y-2">
                    {branch.findings.map((f, j) => (
                      <li key={j} className="flex gap-2 text-base" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.6 }}>
                        <span style={{ color: "hsla(16, 100%, 62%, 0.5)", flexShrink: 0 }}>•</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ═══ TIER 5: RISKS ═══ */}
        {(result.biggest_risk || result.hidden_assumption || blindSpot || result.pre_mortem_narrative) && (
          <>
            <SectionDivider label="What Could Go Wrong" subtitle="(Risk Matrix)" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {[
                { label: "Biggest Risk", value: result.biggest_risk },
                { label: "Hidden Assumption", value: result.hidden_assumption },
                { label: "Stakeholder Blind Spot", value: blindSpot },
              ].filter(c => c.value).map((card) => (
                <div key={card.label} className="rounded-xl px-5 py-5" style={cardBase}>
                  <CardLabel>{card.label}</CardLabel>
                  <p className="text-base" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.7 }}>{card.value}</p>
                </div>
              ))}
            </div>

            {result.pre_mortem_narrative && (
              <div className="rounded-xl px-6 py-6 mb-4" style={{ ...cardBase, borderLeft: "4px solid hsl(var(--destructive))" }}>
                <CardLabel>Failure Scenario</CardLabel>
                <span className="block mb-2 text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>(Pre-Mortem)</span>
                <p className="text-base italic" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.7 }}>
                  {result.pre_mortem_narrative}
                </p>
              </div>
            )}
          </>
        )}

        {/* ═══ TIER 6: STAKEHOLDERS ═══ */}
        {result.stakeholder_perspectives && result.stakeholder_perspectives.length > 0 && (
          <>
            <SectionDivider label="Who's Affected & How" subtitle="(Stakeholder Analysis)" />
            <div className="rounded-xl overflow-hidden" style={{ ...cardBase, borderLeft: "3px solid hsla(16, 100%, 62%, 0.4)" }}>
              {result.stakeholder_perspectives.map((s, i) => (
                <div key={i} className="px-5 py-5" style={{ borderBottom: i < result.stakeholder_perspectives!.length - 1 ? "1px solid hsla(0, 0%, 100%, 0.06)" : "none" }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-base font-semibold" style={{ color: "hsl(var(--text-primary))" }}>{s.role}</span>
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{
                        background: `${ssmRoleColors[s.ssm_role] || "#888"}15`,
                        border: `1px solid ${ssmRoleColors[s.ssm_role] || "#888"}40`,
                        color: ssmRoleColors[s.ssm_role] || "#888",
                      }}
                    >
                      {ssmRoleLabels[s.ssm_role] || s.ssm_role}
                    </span>
                  </div>
                  <p className="text-base" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.6 }}>{s.stance}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ═══ TIER 7: CAUSAL CLUSTERS ═══ */}
        {result.causal_clusters && result.causal_clusters.length > 0 && (
          <>
            <SectionDivider label="Root Causes & Drivers" subtitle="(Causal Analysis)" />
            <div className="space-y-3">
              {result.causal_clusters.map((cluster, i) => (
                <div key={i} className="rounded-xl px-5 py-5" style={{ ...cardBase, borderLeft: "3px solid hsla(16, 100%, 62%, 0.4)" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="flex items-center justify-center rounded-lg font-bold"
                      style={{ width: 32, height: 32, flexShrink: 0, background: "hsla(16, 100%, 62%, 0.12)", color: "hsl(var(--primary))", fontSize: 14 }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-base font-semibold" style={{ color: "hsl(var(--text-primary))" }}>{cluster.name}</p>
                  </div>
                  <ul className="space-y-2 mb-3">
                    {cluster.concepts.map((c, j) => (
                      <li key={j} className="flex gap-2 text-base" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.6 }}>
                        <span style={{ color: "hsla(16, 100%, 62%, 0.5)", flexShrink: 0 }}>•</span>{c}
                      </li>
                    ))}
                  </ul>
                  <p className="text-base italic" style={{ color: "hsl(var(--text-tertiary))", lineHeight: 1.5 }}>
                    {cluster.key_link}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ═══ TIER 8: SECOND ORDER ═══ */}
        {result.second_order_effects && result.second_order_effects.length > 0 && (
          <>
            <SectionDivider label="Ripple Effects" subtitle="(Second-Order Analysis)" />
            <div className="rounded-xl px-6 py-6 mb-4" style={cardBase}>
              <div className="space-y-3">
                {result.second_order_effects.map((effect, i) => (
                  <div key={i} className="flex gap-2 text-base" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.7 }}>
                    <span style={{ color: "hsl(var(--primary))", fontWeight: 700, flexShrink: 0 }}>→</span>
                    <span>{effect}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!result.second_order_effects?.length && result.second_order_chain && (
          <>
            <SectionDivider label="Ripple Effects" subtitle="(Second-Order Analysis)" />
            <div className="rounded-xl px-6 py-6 mb-4" style={cardBase}>
              <div className="flex flex-wrap items-center gap-2 text-base" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.7 }}>
                {result.second_order_chain.split("→").map((part, i, arr) => (
                  <span key={i} className="flex items-center gap-2">
                    <span>{part.trim()}</span>
                    {i < arr.length - 1 && <span style={{ color: "hsl(var(--primary))", fontWeight: 700, fontSize: 18 }}>→</span>}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ═══ TIER 9: RECOMMENDATIONS ═══ */}
        {result.recommendations && result.recommendations.filter(r => r.feasible).length > 0 && (
          <>
            <SectionDivider label="Recommended Actions" />
            <div className="space-y-3">
              {result.recommendations.filter(r => r.feasible).map((rec, i) => (
                <div key={i} className="rounded-xl px-5 py-5" style={cardBase}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-base font-semibold" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.5 }}>{rec.action}</p>
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold flex-shrink-0"
                      style={{ background: "hsla(160, 84%, 39%, 0.1)", border: "1px solid hsla(160, 84%, 39%, 0.3)", color: "hsl(var(--success))" }}
                    >
                      Feasible
                    </span>
                  </div>
                  <p className="text-sm mb-1" style={{ color: "hsl(var(--text-tertiary))" }}>
                    Agreed by: <span style={{ color: "hsl(var(--text-secondary))" }}>{rec.agreed_by}</span>
                  </p>
                  <p className="text-base" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.6 }}>{rec.justification}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* RAPID */}
        {result.rapid && (
          <>
            <SectionDivider label="Decision Accountability (RAPID)" />
            <div className="rounded-xl px-6 py-6" style={cardBase}>
              {[
                { letter: "R", label: "Recommend", value: result.rapid.recommend },
                { letter: "A", label: "Agree", value: result.rapid.agree },
                { letter: "P", label: "Perform", value: result.rapid.perform },
                { letter: "I", label: "Input", value: result.rapid.input },
                { letter: "D", label: "Decide", value: result.rapid.decide },
              ].map((row) => (
                <div key={row.letter} className="flex items-start gap-4 py-3.5" style={{ borderBottom: "1px solid hsla(0, 0%, 100%, 0.06)" }}>
                  <span
                    className="flex items-center justify-center rounded-lg font-bold"
                    style={{ width: 36, height: 36, flexShrink: 0, background: "hsla(16, 100%, 62%, 0.12)", color: "hsl(var(--primary))", fontSize: 15 }}
                  >
                    {row.letter}
                  </span>
                  <div>
                    <span className="text-xs font-semibold uppercase" style={{ color: "hsl(var(--text-tertiary))", letterSpacing: "0.05em" }}>{row.label}</span>
                    <p className="text-base mt-1" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.5 }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Opportunity Cost */}
        {result.opportunity_cost && result.opportunity_cost.length > 0 && (
          <>
            <SectionDivider label="Opportunity Cost" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.opportunity_cost.map((cost, i) => (
                <div key={i} className="rounded-xl px-5 py-5" style={{ ...cardBase, borderStyle: "dashed", borderColor: "hsla(0, 84%, 60%, 0.3)" }}>
                  <p className="text-xs uppercase font-semibold mb-2" style={{ letterSpacing: "0.1em", color: "hsl(var(--destructive))" }}>
                    Sacrificed #{i + 1}
                  </p>
                  <p className="text-base" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.7 }}>{cost}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Stakeholder Map */}
        {result.stakeholder_map && result.stakeholder_map.length > 0 && (
          <>
            <SectionDivider label="Stakeholder Map" />
            <div className="rounded-xl overflow-hidden" style={cardBase}>
              <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_3fr] gap-2 px-5 py-3" style={{ borderBottom: "1px solid hsla(0, 0%, 100%, 0.06)" }}>
                {["Role", "Position", "Influence", "Action"].map((h) => (
                  <span key={h} className="text-xs uppercase font-semibold" style={{ letterSpacing: "0.1em", color: "hsl(var(--text-tertiary))" }}>{h}</span>
                ))}
              </div>
              {result.stakeholder_map.map((s, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_3fr] gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid hsla(0, 0%, 100%, 0.06)" }}>
                  <span className="text-base font-medium" style={{ color: "hsl(var(--text-primary))" }}>{s.role}</span>
                  <span className="text-base" style={{ color: positionColors[s.position] || "hsl(var(--text-tertiary))" }}>{s.position}</span>
                  <span className="text-base" style={{ color: "hsl(var(--text-secondary))" }}>{s.influence}</span>
                  <span className="text-base" style={{ color: "hsl(var(--text-secondary))" }}>{s.action}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ═══ DEEP DIVE ═══ */}
        <div className="mt-8">
          <button
            onClick={() => setDeepDiveOpen(!deepDiveOpen)}
            className="flex items-center gap-2 transition-all duration-200 hover:opacity-100"
            style={{ fontSize: 15, color: "hsl(var(--primary))", fontWeight: 600, background: "none", border: "none", padding: 0, minHeight: 44 }}
          >
            View Full Analysis
            <ChevronDown className="w-5 h-5 transition-transform duration-300" style={{ transform: deepDiveOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxHeight: deepDiveOpen ? 2000 : 0, opacity: deepDiveOpen ? 1 : 0, marginTop: deepDiveOpen ? 12 : 0 }}
          >
            <div className="space-y-3">
              {[
                { label: "Devil's Advocate", value: result.devils_advocate },
                { label: "30-Day Validation Test", value: test30 },
              ].filter(item => item.value).map((item) => (
                <div key={item.label} className="rounded-xl px-6 py-6" style={cardBase}>
                  <CardLabel>{item.label}</CardLabel>
                  <p className="text-base" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.7 }}>{item.value}</p>
                </div>
              ))}
              {[
                { label: "Assumptions to Validate", items: result.assumptions_to_validate },
                { label: "Risk Register", items: result.risk_register },
                { label: "Information Needed", items: result.information_needed },
              ].filter(s => s.items && s.items.length > 0).map((section) => (
                <div key={section.label} className="rounded-xl px-6 py-6" style={cardBase}>
                  <CardLabel>{section.label}</CardLabel>
                  <ul className="space-y-2">
                    {section.items!.map((item, j) => (
                      <li key={j} className="flex gap-2 text-base" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.7 }}>
                        <span style={{ color: "hsla(16, 100%, 62%, 0.5)" }}>•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ TIER 10: ACTIONS ═══ */}
        {!readOnly && (
          <>
            {/* PRIMARY CTA — only ONE gets coral */}
            {user && onSaveToJournal && !journalSaved ? (
              <div className="mt-10">
                <button
                  onClick={onSaveToJournal}
                  className="w-full flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    height: 56, fontSize: 16,
                    background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))",
                    boxShadow: "0 4px 16px hsla(16, 100%, 62%, 0.3)",
                  }}
                >
                  <BookmarkPlus className="w-5 h-5" />
                  Save to Journal
                </button>
              </div>
            ) : !user ? (
              <div className="mt-10">
                <a
                  href="/signup"
                  className="w-full flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    height: 56, fontSize: 16,
                    background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))",
                    boxShadow: "0 4px 16px hsla(16, 100%, 62%, 0.3)",
                  }}
                >
                  Create account to save
                </a>
              </div>
            ) : journalSaved ? (
              <div className="mt-10">
                <div
                  className="w-full flex items-center justify-center gap-2 rounded-full"
                  style={{ height: 56, background: "hsla(160, 84%, 39%, 0.1)", border: "1px solid hsla(160, 84%, 39%, 0.3)" }}
                >
                  <Check className="w-5 h-5" style={{ color: "hsl(var(--success))" }} />
                  <span className="text-base" style={{ color: "hsl(var(--success))" }}>Saved — review in 30 days</span>
                </div>
                <button
                  onClick={() => onReset()}
                  className="w-full mt-3 flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    height: 52, fontSize: 15,
                    background: "transparent", color: "hsl(var(--primary))",
                    border: "1px solid hsla(16, 100%, 62%, 0.3)",
                  }}
                >
                  Audit Another Decision →
                </button>
              </div>
            ) : null}

            {/* SECONDARY ROW — ghost style, never coral */}
            <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
              <button
                onClick={handleCopyBrief}
                className="flex items-center gap-2 px-5 py-3 rounded-full text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ border: "1px solid hsla(0, 0%, 100%, 0.12)", background: "transparent", color: "hsl(var(--text-secondary))", minHeight: 44 }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copy Brief
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-5 py-3 rounded-full text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ border: "1px solid hsla(0, 0%, 100%, 0.12)", background: "transparent", color: "hsl(var(--text-secondary))", minHeight: 44 }}
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-3 rounded-full text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ border: "1px solid hsla(0, 0%, 100%, 0.12)", background: "transparent", color: "hsl(var(--text-secondary))", minHeight: 44 }}
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            {/* AUDIT THE OPPOSITE — subtle, not competing */}
            <div
              className="mt-10 rounded-2xl text-center"
              style={{
                padding: "28px 24px",
                background: "hsla(0, 0%, 100%, 0.02)",
                border: "1px dashed hsla(0, 0%, 100%, 0.12)",
              }}
            >
              <h3 className="text-lg font-semibold" style={{ color: "hsl(var(--text-primary))" }}>
                ↕ What if you chose the opposite?
              </h3>
              <p className="mt-2 text-base" style={{ color: "hsl(var(--text-secondary))" }}>
                Stress-test your thinking from the other side
              </p>
              <button
                onClick={handleAuditOpposite}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  height: 48, fontSize: 15, padding: "0 28px",
                  border: "1px solid hsla(0, 0%, 100%, 0.2)", background: "transparent", color: "hsl(var(--text-primary))",
                  minHeight: 48,
                }}
              >
                Audit the Opposite →
              </button>
            </div>

            {journalSaved && journalCount >= 3 && journalCount < 5 && (
              <div className="mt-6 rounded-xl text-center" style={{ ...cardBase, borderStyle: "dashed", padding: 24 }}>
                <p className="text-base" style={{ color: "hsl(var(--text-primary))" }}>
                  {5 - journalCount} more audit{5 - journalCount !== 1 ? "s" : ""} to unlock your Decision Pattern Profile
                </p>
                <div className="mx-auto mt-3 rounded-full overflow-hidden" style={{ maxWidth: 200, height: 4, background: "hsla(0, 0%, 100%, 0.06)" }}>
                  <div className="rounded-full" style={{ height: "100%", width: `${(journalCount / 5) * 100}%`, background: "hsl(var(--primary))" }} />
                </div>
              </div>
            )}
            {journalSaved && journalCount >= 5 && (
              <div className="mt-6 rounded-xl text-center" style={{ ...cardBase, padding: 24 }}>
                <p className="text-lg font-semibold" style={{ color: "hsl(var(--text-primary))" }}>Your Dashboard is ready</p>
                <p className="mt-2 text-base" style={{ color: "hsl(var(--text-secondary))" }}>See your decision patterns, risk profile, and readiness trends.</p>
                <Link
                  to="/dashboard"
                  className="mt-4 inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    height: 44, fontSize: 15,
                    border: "1px solid hsla(0, 0%, 100%, 0.2)", background: "transparent", color: "hsl(var(--text-primary))",
                    padding: "0 24px",
                  }}
                >
                  Open Dashboard →
                </Link>
              </div>
            )}

            <div className="text-center mt-8">
              <button
                onClick={() => onReset()}
                className="text-base transition-opacity duration-200 hover:opacity-100"
                style={{ color: "hsl(var(--text-tertiary))", minHeight: 44 }}
              >
                ← Run another audit
              </button>
            </div>
          </>
        )}

        {readOnly && (
          <div className="text-center mt-10">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ height: 52, padding: "0 28px", background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", boxShadow: "0 4px 16px hsla(16, 100%, 62%, 0.3)" }}
            >
              Run your own audit →
            </a>
          </div>
        )}

        <p className="text-center mt-12 text-sm" style={{ color: "hsl(var(--text-faint))" }}>
          Supports decision thinking. Not legal or financial advice.
        </p>
      </div>
    </div>
  );
}
