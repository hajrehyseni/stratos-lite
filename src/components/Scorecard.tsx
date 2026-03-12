import { useState, useEffect } from "react";
import { Copy, Download, Check, BookmarkPlus, ChevronDown, Share2 } from "lucide-react";
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

const verdictColor: Record<string, string> = {
  "PROCEED": "#22c55e",
  "CONDITIONAL PROCEED": "#C9A84C",
  "DO NOT PROCEED": "#ef4444",
  "DEFER — INFORMATION NEEDED": "#3b82f6",
};

const cynefinBadgeColors: Record<string, string> = {
  clear: "#22c55e", complicated: "#3b82f6", complex: "#C9A84C", chaotic: "#ef4444",
  CLEAR: "#22c55e", COMPLICATED: "#3b82f6", COMPLEX: "#C9A84C", CHAOTIC: "#ef4444",
};

const classificationLabels: Record<string, string> = {
  big_bet: "BIG-BET DECISION", cross_cutting: "CROSS-CUTTING", delegated: "DELEGATED",
};

const ssmRoleLabels: Record<string, string> = {
  problem_owner: "Problem Owner", problem_solver: "Problem Solver", client: "Client",
};

const ssmRoleColors: Record<string, string> = {
  problem_owner: "#C9A84C", problem_solver: "#3b82f6", client: "#22c55e",
};

const positionColors: Record<string, string> = {
  Support: "#22c55e", Oppose: "#ef4444", Neutral: "#888",
};

const cardBase = { background: "#0F0F0F", border: "1px solid #1A1A1A" };

function SectionDivider({ label, subtitle }: { label: string; subtitle?: string }) {
  return (
    <div className="relative my-8">
      <div style={{ height: 1, background: "#1A1A1A" }} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-center" style={{ background: "#080808" }}>
        <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "hsl(var(--muted-foreground))" }}>
          {label}
        </span>
        {subtitle && (
          <span className="block" style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", opacity: 0.5, marginTop: 1 }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#C9A84C", opacity: 0.6, marginBottom: 8 }}>
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

  // Post-audit conversion modal for anonymous users
  useEffect(() => {
    if (!user && !readOnly) {
      const timer = setTimeout(() => setShowConversionModal(true), 5000);
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

  const btnStyle = {
    height: 44,
    fontSize: 14,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    borderRadius: 8,
  };

  return (
    <div className="min-h-screen px-4 pt-20 pb-16">
      {/* Conversion modal overlay */}
      {showConversionModal && !user && !readOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-xl p-8 mx-4" style={{ maxWidth: 440, background: "#0F0F0F", border: "1px solid rgba(201,168,76,0.3)" }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: "hsl(var(--foreground))", textAlign: "center" }}>
              Save this audit to your decision journal
            </h3>
            <p className="mt-3 text-center" style={{ fontSize: 14, color: "hsl(var(--muted-foreground))", lineHeight: 1.6 }}>
              Create a free account to keep your results, track decisions over time, and unlock 3 audits.
            </p>
            <a
              href="/signup"
              className="mt-6 w-full flex items-center justify-center gap-3 rounded-lg font-semibold transition-all duration-200"
              style={{ height: 48, fontSize: 14, background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </a>
            <a
              href="/signup"
              className="mt-3 w-full flex items-center justify-center rounded-lg transition-all duration-200"
              style={{ height: 44, fontSize: 14, border: "1px solid #1A1A1A", color: "hsl(var(--foreground))" }}
            >
              Sign up with email
            </a>
            <button
              onClick={() => setShowConversionModal(false)}
              className="mt-4 w-full text-center transition-opacity hover:opacity-80"
              style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", background: "none", border: "none" }}
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      <div className="scorecard-entrance" style={{ maxWidth: 720, margin: "0 auto" }}>
        {readOnly && (
          <div className="text-center mb-8 rounded-lg py-2 px-4" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}>
            <span className="text-[12px] uppercase" style={{ letterSpacing: "0.1em", color: "rgba(232,228,223,0.5)" }}>
              Shared Audit — Read Only
            </span>
          </div>
        )}

        {/* ═══ TIER 1: VERDICT + SCORE (first!) ═══ */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="ml-auto flex items-baseline gap-1">
            <span style={{ fontSize: 40, fontWeight: 700, color: "#C9A84C", lineHeight: 1 }}>
              {result.confidence_score}
            </span>
            <span style={{ fontSize: 16, fontWeight: 400, color: "rgba(232,228,223,0.3)" }}>/100</span>
          </div>
        </div>
        <div className="mb-4" style={{ width: "100%", height: 4, borderRadius: 2, background: "rgba(232,228,223,0.06)", overflow: "hidden" }}>
          <div className="bar-fill" style={{ height: "100%", width: `${result.confidence_score}%`, borderRadius: 2, background: "#C9A84C" }} />
        </div>
        <p className="mb-6" style={{ fontSize: 13, color: "rgba(232,228,223,0.4)" }}>
          {getReadinessInterpretation(result.confidence_score)}
        </p>

        <div className="rounded-lg px-6 py-5 mb-3" style={{ ...cardBase, borderLeft: `4px solid ${verdictColor[result.verdict] || "#C9A84C"}` }}>
          <CardLabel>Verdict</CardLabel>
          <p style={{ fontSize: 20, fontWeight: 500, color: "#E8E4DF", lineHeight: 1.7 }}>{result.verdict}</p>
          {rationale && <p className="mt-2" style={{ fontSize: 13, color: "rgba(232,228,223,0.4)" }}>{rationale}</p>}
        </div>

        {/* ═══ TIER 2: EXECUTIVE SUMMARY / REFRAME ═══ */}
        {reframe && (
          <div className="rounded-lg px-6 py-5 mb-3 reframe-glow" style={{ ...cardBase, borderTop: "1px solid rgba(201,168,76,0.3)" }}>
            <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "#666", marginBottom: 8 }}>THE REFRAME</p>
            <p style={{ fontSize: 20, fontWeight: 400, fontStyle: "italic", color: "#C9A84C", lineHeight: 1.7 }}>
              <span style={{ marginRight: 6 }}>"</span>{reframe}
            </p>
          </div>
        )}

        {/* ═══ TIER 3: CLASSIFICATION BAR (moved down) ═══ */}
        {(cynefinDomain || result.decision_classification) && (
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {cynefinDomain && (
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  background: `${cynefinBadgeColors[cynefinDomain] || "#888"}15`,
                  border: `1px solid ${cynefinBadgeColors[cynefinDomain] || "#888"}40`,
                  color: cynefinBadgeColors[cynefinDomain] || "#888",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {cynefinDomain}
              </span>
            )}
            {result.decision_classification && classificationLabels[result.decision_classification] && (
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  background: "rgba(232,228,223,0.05)",
                  border: "1px solid rgba(232,228,223,0.15)",
                  color: "rgba(232,228,223,0.7)",
                  letterSpacing: "0.05em",
                }}
              >
                {classificationLabels[result.decision_classification]}
              </span>
            )}
          </div>
        )}
        {domainApproach && (
          <p className="mb-6" style={{ fontSize: 12, color: "rgba(232,228,223,0.4)" }}>
            {domainApproach}
          </p>
        )}

        {/* Time Horizon */}
        {result.time_horizon && (
          <div className="rounded-lg px-6 py-5 mb-3" style={cardBase}>
            <CardLabel>Time Horizon Check</CardLabel>
            <div className="space-y-3">
              {[
                { icon: "⏱", label: "10 minutes", value: result.time_horizon.ten_minutes },
                { icon: "📅", label: "10 months", value: result.time_horizon.ten_months },
                { icon: "🏛", label: "10 years", value: result.time_horizon.ten_years },
              ].map((row) => (
                <div key={row.label} className="flex gap-3">
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{row.icon}</span>
                  <div>
                    <span style={{ fontSize: 11, color: "rgba(232,228,223,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{row.label}:</span>
                    <p style={{ fontSize: 14, color: "#E8E4DF", lineHeight: 1.6, marginTop: 2 }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ TIER 4: DECISION BREAKDOWN (MECE) ═══ */}
        {result.mece_tree?.branches && result.mece_tree.branches.length > 0 && (
          <>
            <SectionDivider label="Decision Breakdown" subtitle="(MECE Analysis)" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.mece_tree.branches.map((branch, i) => (
                <div key={i} className="rounded-lg px-5 py-4" style={{ ...cardBase, borderLeft: "3px solid rgba(201,168,76,0.4)" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#E8E4DF", marginBottom: 8 }}>{branch.title}</p>
                  <ul className="space-y-1.5">
                    {branch.findings.map((f, j) => (
                      <li key={j} className="flex gap-2" style={{ fontSize: 13, color: "rgba(232,228,223,0.7)", lineHeight: 1.6 }}>
                        <span style={{ color: "rgba(201,168,76,0.5)", flexShrink: 0 }}>•</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ═══ TIER 5: WHAT COULD GO WRONG (Risk Surface + Pre-Mortem) ═══ */}
        {(result.biggest_risk || result.hidden_assumption || blindSpot || result.pre_mortem_narrative) && (
          <>
            <SectionDivider label="What Could Go Wrong" subtitle="(Risk Matrix)" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              {[
                { label: "Biggest Risk", value: result.biggest_risk },
                { label: "Hidden Assumption", value: result.hidden_assumption },
                { label: "Stakeholder Blind Spot", value: blindSpot },
              ].filter(c => c.value).map((card) => (
                <div key={card.label} className="rounded-lg px-5 py-4" style={cardBase}>
                  <CardLabel>{card.label}</CardLabel>
                  <p style={{ fontSize: 14, fontWeight: 400, color: "#E8E4DF", lineHeight: 1.7 }}>{card.value}</p>
                </div>
              ))}
            </div>

            {result.pre_mortem_narrative && (
              <div className="rounded-lg px-6 py-5 mb-3" style={{ ...cardBase, borderLeft: "4px solid #ef4444" }}>
                <CardLabel>Failure Scenario</CardLabel>
                <span className="block mb-2" style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", opacity: 0.5 }}>(Pre-Mortem)</span>
                <p style={{ fontSize: 15, fontStyle: "italic", color: "#E8E4DF", lineHeight: 1.7 }}>
                  {result.pre_mortem_narrative}
                </p>
              </div>
            )}
          </>
        )}

        {/* ═══ TIER 6: WHO'S AFFECTED & HOW (Stakeholder Perspectives) ═══ */}
        {result.stakeholder_perspectives && result.stakeholder_perspectives.length > 0 && (
          <>
            <SectionDivider label="Who's Affected & How" subtitle="(Stakeholder Analysis)" />
            <div className="rounded-lg overflow-hidden" style={{ ...cardBase, borderLeft: "3px solid rgba(201,168,76,0.4)" }}>
              {result.stakeholder_perspectives.map((s, i) => (
                <div key={i} className="px-5 py-4" style={{ borderBottom: i < result.stakeholder_perspectives!.length - 1 ? "1px solid #1A1A1A" : "none" }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#E8E4DF" }}>{s.role}</span>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        background: `${ssmRoleColors[s.ssm_role] || "#888"}15`,
                        border: `1px solid ${ssmRoleColors[s.ssm_role] || "#888"}40`,
                        color: ssmRoleColors[s.ssm_role] || "#888",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {ssmRoleLabels[s.ssm_role] || s.ssm_role}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(232,228,223,0.7)", lineHeight: 1.6 }}>{s.stance}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ═══ TIER 7: ROOT CAUSES & DRIVERS (Causal Clusters) ═══ */}
        {result.causal_clusters && result.causal_clusters.length > 0 && (
          <>
            <SectionDivider label="Root Causes & Drivers" subtitle="(Causal Analysis)" />
            <div className="space-y-3">
              {result.causal_clusters.map((cluster, i) => (
                <div key={i} className="rounded-lg px-5 py-4" style={{ ...cardBase, borderLeft: "3px solid rgba(201,168,76,0.4)" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="flex items-center justify-center rounded-md font-bold"
                      style={{ width: 28, height: 28, flexShrink: 0, background: "rgba(201,168,76,0.12)", color: "#C9A84C", fontSize: 13 }}
                    >
                      {i + 1}
                    </span>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#E8E4DF" }}>{cluster.name}</p>
                  </div>
                  <ul className="space-y-1.5 mb-3">
                    {cluster.concepts.map((c, j) => (
                      <li key={j} className="flex gap-2" style={{ fontSize: 13, color: "rgba(232,228,223,0.7)", lineHeight: 1.6 }}>
                        <span style={{ color: "rgba(201,168,76,0.5)", flexShrink: 0 }}>•</span>{c}
                      </li>
                    ))}
                  </ul>
                  <p style={{ fontSize: 13, fontStyle: "italic", color: "rgba(232,228,223,0.5)", lineHeight: 1.5 }}>
                    {cluster.key_link}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ═══ TIER 8: RIPPLE EFFECTS (Second-Order) ═══ */}
        {result.second_order_effects && result.second_order_effects.length > 0 && (
          <>
            <SectionDivider label="Ripple Effects" subtitle="(Second-Order Analysis)" />
            <div className="rounded-lg px-6 py-5 mb-3" style={cardBase}>
              <div className="space-y-2">
                {result.second_order_effects.map((effect, i) => (
                  <div key={i} className="flex gap-2" style={{ fontSize: 14, color: "#E8E4DF", lineHeight: 1.7 }}>
                    <span style={{ color: "#C9A84C", fontWeight: 700, flexShrink: 0 }}>→</span>
                    <span>{effect}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Legacy second_order_chain */}
        {!result.second_order_effects?.length && result.second_order_chain && (
          <>
            <SectionDivider label="Ripple Effects" subtitle="(Second-Order Analysis)" />
            <div className="rounded-lg px-6 py-5 mb-3" style={cardBase}>
              <div className="flex flex-wrap items-center gap-2" style={{ fontSize: 14, color: "#E8E4DF", lineHeight: 1.7 }}>
                {result.second_order_chain.split("→").map((part, i, arr) => (
                  <span key={i} className="flex items-center gap-2">
                    <span>{part.trim()}</span>
                    {i < arr.length - 1 && <span style={{ color: "#C9A84C", fontWeight: 700, fontSize: 16 }}>→</span>}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ═══ TIER 9: RECOMMENDED ACTIONS ═══ */}
        {result.recommendations && result.recommendations.filter(r => r.feasible).length > 0 && (
          <>
            <SectionDivider label="Recommended Actions" />
            <div className="space-y-3">
              {result.recommendations.filter(r => r.feasible).map((rec, i) => (
                <div key={i} className="rounded-lg px-5 py-4" style={cardBase}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#E8E4DF", lineHeight: 1.5 }}>{rec.action}</p>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold flex-shrink-0"
                      style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e" }}
                    >
                      FEASIBLE
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(232,228,223,0.4)", marginBottom: 4 }}>
                    Agreed by: <span style={{ color: "rgba(232,228,223,0.6)" }}>{rec.agreed_by}</span>
                  </p>
                  <p style={{ fontSize: 13, color: "rgba(232,228,223,0.7)", lineHeight: 1.6 }}>{rec.justification}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* RAPID */}
        {result.rapid && (
          <>
            <SectionDivider label="Decision Accountability (RAPID)" />
            <div className="rounded-lg px-6 py-5" style={cardBase}>
              {[
                { letter: "R", label: "Recommend", value: result.rapid.recommend },
                { letter: "A", label: "Agree", value: result.rapid.agree },
                { letter: "P", label: "Perform", value: result.rapid.perform },
                { letter: "I", label: "Input", value: result.rapid.input },
                { letter: "D", label: "Decide", value: result.rapid.decide },
              ].map((row) => (
                <div key={row.letter} className="flex items-start gap-4 py-3" style={{ borderBottom: "1px solid #1A1A1A" }}>
                  <span
                    className="flex items-center justify-center rounded-md font-bold"
                    style={{ width: 32, height: 32, flexShrink: 0, background: "rgba(201,168,76,0.12)", color: "#C9A84C", fontSize: 14 }}
                  >
                    {row.letter}
                  </span>
                  <div>
                    <span style={{ fontSize: 11, color: "rgba(232,228,223,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{row.label}</span>
                    <p style={{ fontSize: 14, color: "#E8E4DF", lineHeight: 1.5, marginTop: 2 }}>{row.value}</p>
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
                <div key={i} className="rounded-lg px-5 py-4" style={{ ...cardBase, borderStyle: "dashed", borderColor: "rgba(239,68,68,0.3)" }}>
                  <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#ef4444", opacity: 0.6, marginBottom: 8 }}>
                    Sacrificed #{i + 1}
                  </p>
                  <p style={{ fontSize: 14, color: "#E8E4DF", lineHeight: 1.7 }}>{cost}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Stakeholder Map */}
        {result.stakeholder_map && result.stakeholder_map.length > 0 && (
          <>
            <SectionDivider label="Stakeholder Map" />
            <div className="rounded-lg overflow-hidden" style={cardBase}>
              <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_3fr] gap-2 px-5 py-3" style={{ borderBottom: "1px solid #1A1A1A" }}>
                {["Role", "Position", "Influence", "Action"].map((h) => (
                  <span key={h} style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#555" }}>{h}</span>
                ))}
              </div>
              {result.stakeholder_map.map((s, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_3fr] gap-2 px-5 py-3" style={{ borderBottom: "1px solid #1A1A1A" }}>
                  <span style={{ fontSize: 14, color: "#E8E4DF", fontWeight: 500 }}>{s.role}</span>
                  <span style={{ fontSize: 13, color: positionColors[s.position] || "#888" }}>{s.position}</span>
                  <span style={{ fontSize: 13, color: "rgba(232,228,223,0.5)" }}>{s.influence}</span>
                  <span style={{ fontSize: 13, color: "rgba(232,228,223,0.7)" }}>{s.action}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ═══ DEEP DIVE ═══ */}
        <div className="mt-6">
          <button
            onClick={() => setDeepDiveOpen(!deepDiveOpen)}
            className="flex items-center gap-2 transition-colors duration-200 hover:opacity-100"
            style={{ fontSize: 13, color: "#C9A84C", opacity: 0.8, background: "none", border: "none", padding: 0 }}
          >
            View Full Analysis
            <ChevronDown className="w-4 h-4 transition-transform duration-300" style={{ transform: deepDiveOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
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
                <div key={item.label} className="rounded-lg px-6 py-5" style={cardBase}>
                  <CardLabel>{item.label}</CardLabel>
                  <p style={{ fontSize: 15, fontWeight: 400, color: "#E8E4DF", lineHeight: 1.7 }}>{item.value}</p>
                </div>
              ))}
              {[
                { label: "Assumptions to Validate", items: result.assumptions_to_validate },
                { label: "Risk Register", items: result.risk_register },
                { label: "Information Needed", items: result.information_needed },
              ].filter(s => s.items && s.items.length > 0).map((section) => (
                <div key={section.label} className="rounded-lg px-6 py-5" style={cardBase}>
                  <CardLabel>{section.label}</CardLabel>
                  <ul className="space-y-2">
                    {section.items!.map((item, j) => (
                      <li key={j} className="flex gap-2" style={{ fontSize: 15, color: "#E8E4DF", lineHeight: 1.7 }}>
                        <span style={{ color: "rgba(201,168,76,0.5)" }}>•</span>{item}
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
            {/* PRIMARY CTA */}
            {onSaveToJournal && !journalSaved ? (
              <div className="mt-10">
                <button
                  onClick={onSaveToJournal}
                  className="w-full flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 hover:scale-[1.01] active:scale-[0.98]"
                  style={{
                    height: 48, fontSize: 15,
                    background: "#C9A84C", color: "#080808",
                  }}
                >
                  <BookmarkPlus className="w-4 h-4" />
                  Save to Your Decision Journal →
                </button>
                <p className="text-center mt-2" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                  Track this. Get reminded in 30 days.
                </p>
              </div>
            ) : journalSaved ? (
              <div className="mt-10">
                <div
                  className="w-full flex items-center justify-center gap-2 rounded-xl"
                  style={{ height: 48, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}
                >
                  <Check className="w-4 h-4" style={{ color: "#22c55e" }} />
                  <span style={{ fontSize: 14, color: "#22c55e" }}>Saved — review in 30 days</span>
                </div>
                <button
                  onClick={() => onReset()}
                  className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 hover:scale-[1.01] active:scale-[0.98]"
                  style={{
                    height: 48, fontSize: 14,
                    background: "transparent", color: "#C9A84C",
                    border: "1px solid #C9A84C",
                  }}
                >
                  Audit Another Decision →
                </button>
              </div>
            ) : null}

            {/* SECONDARY ROW */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={handleCopyBrief}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                style={{ border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "hsl(var(--muted-foreground))" }}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Brief
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                style={{ border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "hsl(var(--muted-foreground))" }}
              >
                <Download className="w-3.5 h-3.5" />
                PDF
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                style={{ border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "hsl(var(--muted-foreground))" }}
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
            </div>

            {/* AUDIT THE OPPOSITE */}
            <div
              className="mt-10 rounded-2xl text-center"
              style={{
                padding: "32px 24px",
                background: "rgba(8,8,8,0.5)",
                border: "1px dashed rgba(201,168,76,0.3)",
              }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "hsl(var(--foreground))" }}>
                ↕ What if you chose the opposite?
              </h3>
              <p className="mt-2" style={{ fontSize: 14, color: "hsl(var(--muted-foreground))" }}>
                Stress-test your thinking from the other side
              </p>
              <button
                onClick={handleAuditOpposite}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  height: 44, fontSize: 14, padding: "0 28px",
                  border: "1px solid #C9A84C", background: "transparent", color: "#C9A84C",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#080808"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C9A84C"; }}
              >
                Audit the Opposite →
              </button>
            </div>

            {journalSaved && journalCount >= 3 && journalCount < 5 && (
              <div className="mt-6 rounded-xl text-center" style={{ ...cardBase, borderStyle: "dashed", padding: 24 }}>
                <p style={{ fontSize: 14, color: "#E8E4DF" }}>
                  {5 - journalCount} more audit{5 - journalCount !== 1 ? "s" : ""} to unlock your Decision Pattern Profile
                </p>
                <p className="mt-2 mx-auto" style={{ fontSize: 13, color: "#888", maxWidth: 480 }}>
                  StratOS is learning how you think. Complete 5 audits to see your decision-making blind spots.
                </p>
                <div className="mx-auto mt-3 rounded-full overflow-hidden" style={{ maxWidth: 200, height: 4, background: "#1A1A1A" }}>
                  <div className="rounded-full" style={{ height: "100%", width: `${(journalCount / 5) * 100}%`, background: "#C9A84C" }} />
                </div>
              </div>
            )}
            {journalSaved && journalCount >= 5 && (
              <div className="mt-6 rounded-xl text-center" style={{ ...cardBase, border: "1px solid rgba(201,168,76,0.3)", padding: 24 }}>
                <p style={{ fontSize: 16, color: "#E8E4DF" }}>Your Dashboard is ready</p>
                <p className="mt-2" style={{ fontSize: 13, color: "#888" }}>See your decision patterns, risk profile, and readiness trends.</p>
                <Link
                  to="/dashboard"
                  className="mt-4 inline-flex items-center justify-center transition-all duration-200"
                  style={{
                    height: 40, fontSize: 14, borderRadius: 9999,
                    border: "1px solid #C9A84C", background: "transparent", color: "#C9A84C",
                    fontWeight: 600, padding: "0 24px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#080808"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C9A84C"; }}
                >
                  Open Dashboard →
                </Link>
              </div>
            )}

            <div className="text-center mt-8">
              <button
                onClick={() => onReset()}
                className="text-[14px] transition-opacity duration-200 hover:opacity-100"
                style={{ color: "#C9A84C", opacity: 0.8 }}
              >
                ← Start another audit
              </button>
            </div>
          </>
        )}

        {readOnly && (
          <div className="text-center mt-10">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg btn-press transition-all duration-200"
              style={{ ...btnStyle, background: "#C9A84C", color: "#080808", fontWeight: 600, padding: "0 24px" }}
            >
              Run your own audit →
            </a>
          </div>
        )}

        <p className="text-center mt-12" style={{ fontSize: 12, color: "rgba(232,228,223,0.25)" }}>
          Supports decision thinking. Not legal or financial advice.
        </p>
      </div>
    </div>
  );
}
