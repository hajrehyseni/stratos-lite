import { useState, useEffect, useRef, useCallback } from "react";
import { Copy, Download, Check, BookmarkPlus, ChevronDown, ChevronUp, Share2, ArrowUp, Volume2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import type { AuditResult } from "@/lib/types";
import { generateBrief } from "@/lib/copy-brief";
import { generatePDF } from "@/lib/generate-pdf";
import { getJournalCount } from "@/lib/journal";
import { useAuth } from "@/contexts/AuthContext";
import { ConfidenceGauge } from "@/components/ConfidenceGauge";
import { toast } from "sonner";
import { useTTS } from "@/hooks/use-tts";

interface ScorecardProps {
  decision: string;
  result: AuditResult;
  auditId: string;
  onReset: (prefill?: string) => void;
  onSaveToJournal?: () => void;
  journalSaved?: boolean;
  readOnly?: boolean;
  remainingAudits?: number;
  planName?: string;
}

function getReadinessInterpretation(score: number): string {
  if (score >= 80) return "Strong foundation. Ready for board presentation.";
  if (score >= 60) return "Good basis. Address the gaps below before committing.";
  if (score >= 40) return "Significant gaps. More work needed before deciding.";
  return "Not ready. Critical assumptions need validation first.";
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

const cardStyle: React.CSSProperties = {
  background: "hsl(var(--secondary))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  padding: 24,
};

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "hsl(var(--primary))", marginBottom: 10, fontWeight: 600 }}>
      {children}
    </p>
  );
}

interface CollapsibleSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  preview?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  forceOpen?: boolean;
}

function CollapsibleSection({ id, title, subtitle, preview, children, defaultOpen = false, forceOpen }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = forceOpen !== undefined ? forceOpen : open;

  return (
    <div id={id} className="scroll-mt-28">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
        style={{ background: "none", border: "none", minHeight: 48 }}
      >
        <div>
          <span className="text-xs uppercase font-semibold" style={{ letterSpacing: "0.1em", color: "hsl(var(--primary))" }}>
            {title}
          </span>
          {subtitle && (
            <span className="ml-2 text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>{subtitle}</span>
          )}
          {!isOpen && preview && (
            <p className="mt-1 text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>{preview}</p>
          )}
        </div>
        <span className="flex-shrink-0 ml-3 transition-transform duration-300" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
          <ChevronDown className="w-5 h-5" style={{ color: "hsl(var(--text-tertiary))" }} />
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ maxHeight: isOpen ? 5000 : 0, opacity: isOpen ? 1 : 0 }}
      >
        <div className="pb-6">{children}</div>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { id: "section-verdict", label: "Verdict" },
  { id: "section-risks", label: "Risks" },
  { id: "section-stakeholders", label: "Stakeholders" },
  { id: "section-actions", label: "Actions" },
  { id: "section-rapid", label: "RAPID" },
];

export function Scorecard({ decision, result, auditId, onReset, onSaveToJournal, journalSaved, readOnly, remainingAudits, planName }: ScorecardProps) {
  const [copied, setCopied] = useState(false);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [allExpanded, setAllExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState("section-verdict");
  const { user } = useAuth();
  const journalCount = getJournalCount();
  const tts = useTTS();

  const reframe = result.reframe_question || result.better_question || "";
  const rationale = result.verdict_rationale || result.confidence_rationale || "";
  const blindSpot = result.stakeholder_blind_spot || result.stakeholder_gap || "";
  const test30 = result.validation_test_30_day || result.thirty_day_test || "";
  const cynefinDomain = result.cynefin_domain || (result.decision_domain ? result.decision_domain.toLowerCase() : null);
  const domainApproach = result.decision_domain_approach || null;

  // Intersection Observer for active tab tracking
  useEffect(() => {
    const sectionIds = NAV_ITEMS.map(n => n.id);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Conversion modal for anon users
  useEffect(() => {
    if (user || readOnly) return;
    const timer = setTimeout(() => setShowConversionModal(true), 15000);
    const handleScroll = () => {
      const scrollH = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollH > 0 && window.scrollY / scrollH > 0.4) {
        setShowConversionModal(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener("scroll", handleScroll); };
  }, [user, readOnly]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > window.innerHeight);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToSection = (id: string) => {
    setAllExpanded(true); // auto-expand when navigating
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleCopyBrief = async () => {
    const brief = generateBrief(decision, result);
    await navigator.clipboard.writeText(brief);
    setCopied(true);
    toast.success("Brief copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySummary = async () => {
    const topActions = result.recommendations?.filter(r => r.feasible).slice(0, 3).map(r => r.action) || [];
    const summary = `Decision: ${decision}\nVerdict: ${result.verdict}\nConfidence: ${result.confidence_score}/100\n\nTop Actions:\n${topActions.map((a, i) => `${i + 1}. ${a}`).join("\n")}`;
    await navigator.clipboard.writeText(summary);
    toast.success("Summary copied to clipboard!");
  };

  const handleDownloadPDF = async () => {
    if (planName === "free" || !planName) {
      toast.error("PDF export is a Pro feature. Upgrade to download.");
      return;
    }
    try {
      toast.info("Generating PDF...");
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
    if (!user) {
      toast.error("Create an account to share audits");
      return;
    }
    try {
      const payload = { decision, result };
      const encoded = encodeURIComponent(JSON.stringify(payload));
      const url = `${window.location.origin}/r/${auditId}#${encoded}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied! Anyone with this link can view this audit.");
    } catch {
      toast.error("Failed to copy share link");
    }
  };

  const handleAuditOpposite = () => {
    const inverse = `NOT: ${decision}`;
    onReset(inverse);
  };

  // Top 3 actions for executive summary
  const topActions = result.recommendations?.filter(r => r.feasible).slice(0, 3) || [];

  const handleListen = () => {
    if (tts.isSpeaking || tts.isLoading) {
      tts.stop();
      return;
    }
    const sections: string[] = [
      `Verdict: ${result.verdict}. Confidence score: ${result.confidence_score} out of 100. ${getReadinessInterpretation(result.confidence_score)}`,
      reframe ? `The reframe question: ${reframe}` : "",
      topActions.length > 0 ? `Top recommended actions: ${topActions.map((r, i) => `${i + 1}. ${r.action}`).join(". ")}` : "",
      result.biggest_risk ? `Biggest risk: ${result.biggest_risk}` : "",
    ];
    tts.speak(sections);
  };

  return (
    <div className="min-h-screen px-4 pt-20 pb-16 page-enter">
      {/* Conversion modal */}
      {showConversionModal && !user && !readOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-10 mx-4" style={{ maxWidth: 460, background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
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
          <div className="text-center mb-8 rounded-lg py-2 px-4" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
            <span className="text-sm font-medium" style={{ letterSpacing: "0.1em", color: "hsl(var(--text-secondary))" }}>
              Shared Audit — Read Only
            </span>
          </div>
        )}

        {/* ═══ EXECUTIVE SUMMARY CARD ═══ */}
        <div className="rounded-2xl p-6 sm:p-8 mb-6" style={cardStyle}>
          {/* Gauge */}
          <div className="flex justify-center mb-6">
            <ConfidenceGauge
              score={result.confidence_score}
              size={window.innerWidth < 640 ? 120 : 160}
              verdict={result.verdict}
              rationale={getReadinessInterpretation(result.confidence_score)}
            />
          </div>

          {/* Listen button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={handleListen}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                border: "1px solid hsl(var(--border))",
                background: tts.isSpeaking ? "hsl(var(--primary))" : "transparent",
                color: tts.isSpeaking ? "hsl(var(--primary-foreground))" : "hsl(var(--text-secondary))",
              }}
            >
              {tts.isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 animate-pulse" />
                  Stop ({tts.currentSection}/{tts.totalSections})
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  Listen to Summary
                </>
              )}
            </button>
          </div>

          {/* Reframe */}
          {reframe && (
            <div className="mt-4 text-center">
              <p className="text-xs uppercase font-semibold mb-2" style={{ letterSpacing: "0.15em", color: "hsl(var(--text-tertiary))" }}>The Reframe</p>
              <p className="text-lg italic" style={{ color: "hsl(var(--primary))", lineHeight: 1.6 }}>
                "{reframe}"
              </p>
            </div>
          )}

          {/* Top 3 Actions */}
          {topActions.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase font-semibold mb-3" style={{ letterSpacing: "0.1em", color: "hsl(var(--primary))" }}>
                Top Actions
              </p>
              <div className="space-y-2">
                {topActions.map((rec, i) => (
                  <div key={i} className="flex gap-3 text-base" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.6 }}>
                    <span className="flex-shrink-0 flex items-center justify-center rounded-full font-bold" style={{ width: 24, height: 24, fontSize: 12, background: "hsla(16, 100%, 62%, 0.12)", color: "hsl(var(--primary))" }}>
                      {i + 1}
                    </span>
                    <span>{rec.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Classification badges */}
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
                style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--text-secondary))" }}
              >
                {classificationLabels[result.decision_classification]}
              </span>
            )}
          </div>
        )}
        {domainApproach && (
          <p className="mb-6 text-sm" style={{ color: "hsl(var(--text-secondary))" }}>{domainApproach}</p>
        )}

        {/* ═══ STICKY SECTION NAV ═══ */}
        <div className="sticky top-16 z-40 -mx-4 px-4 py-2 mb-6 flex items-center gap-2" style={{ background: "hsla(0, 0%, 100%, 0.95)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderBottom: "1px solid hsl(var(--border))" }}>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 relative">
            {NAV_ITEMS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleScrollToSection(s.id)}
                className="flex-shrink-0 px-3 py-2 text-xs font-medium transition-all duration-200"
                style={{
                  background: "transparent",
                  color: activeSection === s.id ? "hsl(var(--primary))" : "hsl(var(--text-secondary))",
                  border: "none",
                  borderBottom: activeSection === s.id ? "2px solid hsl(var(--primary))" : "2px solid transparent",
                  minHeight: 32,
                }}
              >
                {s.label}
              </button>
            ))}
            <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none sm:hidden" style={{ background: "linear-gradient(to right, transparent, hsla(0, 0%, 100%, 0.95))" }} />
          </div>
          <button
            onClick={() => setAllExpanded(!allExpanded)}
            className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200"
            style={{ background: "hsl(var(--secondary))", color: "hsl(var(--text-tertiary))", border: "1px solid hsl(var(--border))" }}
          >
            {allExpanded ? "Collapse" : "Expand All"}
          </button>
        </div>

        {/* ═══ COLLAPSIBLE SECTIONS ═══ */}

        {/* VERDICT */}
        <CollapsibleSection
          id="section-verdict"
          title="Verdict"
          preview={result.verdict}
          defaultOpen
          forceOpen={allExpanded || undefined}
        >
          <div className="rounded-xl p-6" style={cardStyle}>
            <p className="text-xl font-semibold" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.7 }}>{result.verdict}</p>
            {rationale && <p className="mt-2 text-base" style={{ color: "hsl(var(--text-secondary))" }}>{rationale}</p>}
          </div>

          {/* Time Horizon — Visual Timeline */}
          {result.time_horizon && (
            <div className="rounded-xl p-6 mt-3" style={cardStyle}>
              <CardLabel>Time Horizon Check</CardLabel>
              <div className="relative flex items-start justify-between gap-2 mt-4">
                {/* Connecting line */}
                <div className="absolute top-5 left-[10%] right-[10%] h-px" style={{ background: "hsl(var(--border))" }} />
                {[
                  { label: "10 min", value: result.time_horizon.ten_minutes, color: "hsl(var(--primary))" },
                  { label: "10 mo", value: result.time_horizon.ten_months, color: "hsl(var(--warning))" },
                  { label: "10 yr", value: result.time_horizon.ten_years, color: "hsl(var(--success))" },
                ].map((node) => (
                  <div key={node.label} className="relative flex flex-col items-center text-center flex-1 z-10">
                    <div
                      className="flex items-center justify-center rounded-full mb-2"
                      style={{ width: 40, height: 40, background: `${node.color}15`, border: `2px solid ${node.color}` }}
                    >
                      <span className="text-xs font-bold" style={{ color: node.color }}>{node.label}</span>
                    </div>
                    <p className="text-sm" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.5, maxWidth: 160 }}>{node.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MECE — Proportional Bars */}
          {result.mece_tree?.branches && result.mece_tree.branches.length > 0 && (() => {
            const totalFindings = result.mece_tree!.branches.reduce((sum, b) => sum + b.findings.length, 0);
            const barColors = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(217, 91%, 60%)", "hsl(var(--destructive))", "hsl(174, 60%, 45%)"];
            return (
              <div className="mt-3">
                <CardLabel>Decision Breakdown (MECE)</CardLabel>
                <div className="space-y-3">
                  {result.mece_tree!.branches.map((branch, i) => {
                    const pct = totalFindings > 0 ? Math.round((branch.findings.length / totalFindings) * 100) : 0;
                    const color = barColors[i % barColors.length];
                    return (
                      <div key={i} className="rounded-xl p-5" style={cardStyle}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold" style={{ color: "hsl(var(--text-primary))" }}>{branch.title}</p>
                          <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                        </div>
                        <div className="w-full rounded-full overflow-hidden mb-3" style={{ height: 6, background: "hsl(var(--border))" }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                        </div>
                        <ul className="space-y-1.5">
                          {branch.findings.map((f, j) => (
                            <li key={j} className="flex gap-2 text-sm" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.5 }}>
                              <span style={{ color, opacity: 0.7, flexShrink: 0 }}>•</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </CollapsibleSection>

        {/* RISKS */}
        {(result.biggest_risk || result.hidden_assumption || blindSpot || result.pre_mortem_narrative) && (
          <CollapsibleSection
            id="section-risks"
            title="What Could Go Wrong"
            subtitle="(Risk Matrix)"
            preview={result.biggest_risk ? result.biggest_risk.slice(0, 80) + "..." : undefined}
            forceOpen={allExpanded || undefined}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {[
                { label: "Biggest Risk", value: result.biggest_risk, dot: "hsl(var(--destructive))" },
                { label: "Hidden Assumption", value: result.hidden_assumption, dot: "hsl(var(--warning))" },
                { label: "Stakeholder Blind Spot", value: blindSpot, dot: "hsl(217, 91%, 60%)" },
              ].filter(c => c.value).map((card) => (
                <div key={card.label} className="rounded-xl p-5" style={cardStyle}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: card.dot, flexShrink: 0 }} />
                    <CardLabel>{card.label}</CardLabel>
                  </div>
                  <p className="text-base" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.7 }}>{card.value}</p>
                </div>
              ))}
            </div>
            {result.pre_mortem_narrative && (
              <div className="rounded-xl p-6" style={cardStyle}>
                <CardLabel>Failure Scenario (Pre-Mortem)</CardLabel>
                <p className="text-base italic" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.7 }}>
                  {result.pre_mortem_narrative}
                </p>
              </div>
            )}
          </CollapsibleSection>
        )}

        {/* STAKEHOLDERS */}
        {result.stakeholder_perspectives && result.stakeholder_perspectives.length > 0 && (
          <CollapsibleSection
            id="section-stakeholders"
            title="Who's Affected & How"
            subtitle="(Stakeholder Analysis)"
            preview={`${result.stakeholder_perspectives.length} stakeholders identified`}
            forceOpen={allExpanded || undefined}
          >
            <div className="rounded-xl overflow-hidden" style={cardStyle}>
              {result.stakeholder_perspectives.map((s, i) => (
                <div key={i} className="px-5 py-5" style={{ borderBottom: i < result.stakeholder_perspectives!.length - 1 ? "1px solid hsl(var(--border))" : "none" }}>
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
          </CollapsibleSection>
        )}

        {/* CAUSAL CLUSTERS */}
        {result.causal_clusters && result.causal_clusters.length > 0 && (
          <CollapsibleSection
            id="section-causal"
            title="Root Causes & Drivers"
            subtitle="(Causal Analysis)"
            forceOpen={allExpanded || undefined}
          >
            <div className="space-y-3">
              {result.causal_clusters.map((cluster, i) => (
                <div key={i} className="rounded-xl p-5" style={cardStyle}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center justify-center rounded-lg font-bold" style={{ width: 32, height: 32, flexShrink: 0, background: "hsla(16, 100%, 62%, 0.12)", color: "hsl(var(--primary))", fontSize: 14 }}>
                      {i + 1}
                    </span>
                    <p className="text-base font-semibold" style={{ color: "hsl(var(--text-primary))" }}>{cluster.name}</p>
                  </div>
                  <ul className="space-y-2 mb-3">
                    {cluster.concepts.map((c, j) => (
                      <li key={j} className="flex gap-2 text-base" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.6 }}>
                        <span style={{ color: "hsl(var(--primary))", opacity: 0.5, flexShrink: 0 }}>•</span><span>{c}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-base italic" style={{ color: "hsl(var(--text-tertiary))", lineHeight: 1.5 }}>{cluster.key_link}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* SECOND ORDER */}
        {(result.second_order_effects?.length || result.second_order_chain) && (
          <CollapsibleSection
            id="section-ripple"
            title="Ripple Effects"
            subtitle="(Second-Order Analysis)"
            forceOpen={allExpanded || undefined}
          >
            <div className="rounded-xl p-6" style={cardStyle}>
              {result.second_order_effects && result.second_order_effects.length > 0 ? (
                <div className="space-y-3">
                  {result.second_order_effects.map((effect, i) => (
                    <div key={i} className="flex gap-2 text-base" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.7 }}>
                      <span style={{ color: "hsl(var(--primary))", fontWeight: 700, flexShrink: 0 }}>→</span>
                      <span>{effect}</span>
                    </div>
                  ))}
                </div>
              ) : result.second_order_chain ? (
                <div className="flex flex-wrap items-center gap-2 text-base" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.7 }}>
                  {result.second_order_chain.split("→").map((part, i, arr) => (
                    <span key={i} className="flex items-center gap-2">
                      <span>{part.trim()}</span>
                      {i < arr.length - 1 && <span style={{ color: "hsl(var(--primary))", fontWeight: 700, fontSize: 18 }}>→</span>}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </CollapsibleSection>
        )}

        {/* ACTIONS */}
        {result.recommendations && result.recommendations.filter(r => r.feasible).length > 0 && (
          <CollapsibleSection
            id="section-actions"
            title="Recommended Actions"
            preview={`${result.recommendations.filter(r => r.feasible).length} feasible actions`}
            forceOpen={allExpanded || undefined}
          >
            <div className="space-y-3">
              {result.recommendations.filter(r => r.feasible).map((rec, i) => (
                <div key={i} className="rounded-xl p-5" style={cardStyle}>
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
          </CollapsibleSection>
        )}

        {/* RAPID — Horizontal Badge Row */}
        {result.rapid && (
          <CollapsibleSection
            id="section-rapid"
            title="Decision Accountability (RAPID)"
            forceOpen={allExpanded || undefined}
          >
            <div className="rounded-xl p-6" style={cardStyle}>
              {/* Badge row */}
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { letter: "R", label: "Recommend", value: result.rapid.recommend, color: "hsl(var(--primary))" },
                  { letter: "A", label: "Agree", value: result.rapid.agree, color: "hsl(var(--success))" },
                  { letter: "P", label: "Perform", value: result.rapid.perform, color: "hsl(217, 91%, 60%)" },
                  { letter: "I", label: "Input", value: result.rapid.input, color: "hsl(var(--warning))" },
                  { letter: "D", label: "Decide", value: result.rapid.decide, color: "hsl(var(--destructive))" },
                ].map((row) => (
                  <div
                    key={row.letter}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
                    style={{ background: `${row.color}12`, border: `1px solid ${row.color}30` }}
                  >
                    <span className="flex items-center justify-center rounded-full font-bold" style={{ width: 22, height: 22, fontSize: 11, background: row.color, color: "#fff" }}>
                      {row.letter}
                    </span>
                    <span className="text-sm font-medium" style={{ color: "hsl(var(--text-primary))" }}>{row.value}</span>
                  </div>
                ))}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>
                {["R = Recommend", "A = Agree", "P = Perform", "I = Input", "D = Decide"].map(l => (
                  <span key={l}>{l}</span>
                ))}
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Remaining audits banner */}
        {!readOnly && remainingAudits !== undefined && remainingAudits <= 3 && remainingAudits > 0 && (
          <div
            className="mt-8 rounded-xl px-6 py-5 flex items-center justify-between flex-wrap gap-3"
            style={{
              background: remainingAudits === 1 ? "hsla(38, 92%, 50%, 0.08)" : "hsla(0, 0%, 100%, 0.03)",
              border: remainingAudits === 1 ? "1px solid hsla(38, 92%, 50%, 0.2)" : "1px solid hsla(0, 0%, 100%, 0.06)",
            }}
          >
            <p className="text-sm" style={{ color: remainingAudits === 1 ? "hsl(var(--warning))" : "hsl(var(--text-secondary))" }}>
              {remainingAudits === 1 ? "⚡ " : ""}{remainingAudits} audit{remainingAudits !== 1 ? "s" : ""} remaining on your {planName || "free"} plan
            </p>
            <a href="/pricing" className="text-sm font-semibold transition-opacity hover:opacity-80" style={{ color: "hsl(var(--primary))" }}>
              Upgrade for more →
            </a>
          </div>
        )}

        {/* Opportunity Cost */}
        {result.opportunity_cost && result.opportunity_cost.length > 0 && (
          <CollapsibleSection id="section-opportunity" title="Opportunity Cost" forceOpen={allExpanded || undefined}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.opportunity_cost.map((cost, i) => (
                <div key={i} className="rounded-xl p-5" style={{ ...cardStyle, borderStyle: "dashed", borderColor: "hsla(0, 84%, 60%, 0.3)" }}>
                  <p className="text-xs uppercase font-semibold mb-2" style={{ letterSpacing: "0.1em", color: "hsl(var(--destructive))" }}>Sacrificed #{i + 1}</p>
                  <p className="text-base" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.7 }}>{cost}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Stakeholder Map — Visual Position Dots */}
        {result.stakeholder_map && result.stakeholder_map.length > 0 && (
          <CollapsibleSection id="section-stakeholder-map" title="Stakeholder Map" forceOpen={allExpanded || undefined}>
            <div className="rounded-xl p-6" style={cardStyle}>
              {/* Visual dot map */}
              <div className="flex flex-wrap gap-4 mb-5">
                {result.stakeholder_map.map((s, i) => {
                  const dotSize = s.influence === "High" ? 48 : s.influence === "Medium" ? 36 : 28;
                  const dotColor = positionColors[s.position] || "hsl(var(--text-tertiary))";
                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5" style={{ minWidth: 60 }}>
                      <div
                        className="rounded-full flex items-center justify-center text-xs font-bold transition-transform hover:scale-110"
                        style={{ width: dotSize, height: dotSize, background: `${dotColor}20`, border: `2px solid ${dotColor}`, color: dotColor }}
                        title={`${s.role}: ${s.position} (${s.influence} influence)`}
                      >
                        {s.role.charAt(0)}
                      </div>
                      <span className="text-xs font-medium text-center" style={{ color: "hsl(var(--text-primary))", maxWidth: 80 }}>{s.role}</span>
                      <span className="text-xs" style={{ color: dotColor }}>{s.position}</span>
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>
                {Object.entries(positionColors).map(([label, color]) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: color }} />
                    {label}
                  </span>
                ))}
                <span className="ml-2">Size = Influence</span>
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Deep Dive */}
        <CollapsibleSection id="section-deep-dive" title="Full Analysis" forceOpen={allExpanded || undefined}>
          <div className="space-y-3">
            {[
              { label: "Devil's Advocate", value: result.devils_advocate },
              { label: "30-Day Validation Test", value: test30 },
            ].filter(item => item.value).map((item) => (
              <div key={item.label} className="rounded-xl p-6" style={cardStyle}>
                <CardLabel>{item.label}</CardLabel>
                <p className="text-base" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.7 }}>{item.value}</p>
              </div>
            ))}
            {[
              { label: "Assumptions to Validate", items: result.assumptions_to_validate },
              { label: "Risk Register", items: result.risk_register },
              { label: "Information Needed", items: result.information_needed },
            ].filter(s => s.items && s.items.length > 0).map((section) => (
              <div key={section.label} className="rounded-xl p-6" style={cardStyle}>
                <CardLabel>{section.label}</CardLabel>
                <ul className="space-y-2">
                  {section.items!.map((item, j) => (
                    <li key={j} className="flex gap-2 text-base" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.7 }}>
                      <span style={{ color: "hsl(var(--primary))", opacity: 0.5 }}>•</span><span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* ═══ ACTION BAR ═══ */}
        {!readOnly && (
          <>
            {/* Quick Actions Row */}
            <div className="mt-8 rounded-xl p-5 flex flex-wrap items-center justify-center gap-3" style={cardStyle}>
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md"
                style={{ border: "1px solid hsl(var(--border))", background: "transparent", color: "hsl(var(--text-secondary))", minHeight: 44 }}
              >
                <Copy className="w-4 h-4" /> Copy Summary
              </button>
              <button
                onClick={() => onReset()}
                className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md"
                style={{ border: "1px solid hsl(var(--border))", background: "transparent", color: "hsl(var(--text-secondary))", minHeight: 44 }}
              >
                New Audit
              </button>
              {user && onSaveToJournal && !journalSaved && (
                <button
                  onClick={onSaveToJournal}
                  className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", minHeight: 44, boxShadow: "0 4px 16px hsla(16, 100%, 62%, 0.3)" }}
                >
                  <BookmarkPlus className="w-4 h-4" /> Save to Journal
                </button>
              )}
              {journalSaved && (
                <span className="flex items-center gap-2 px-5 py-3 rounded-full text-sm" style={{ color: "hsl(var(--success))" }}>
                  <Check className="w-4 h-4" /> Saved
                </span>
              )}
            </div>

            {/* Secondary actions */}
            <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
              <button
                onClick={handleCopyBrief}
                className="flex items-center gap-2 px-5 py-3 rounded-full text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ border: "1px solid hsl(var(--border))", background: "transparent", color: "hsl(var(--text-secondary))", minHeight: 44 }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copy Brief
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-5 py-3 rounded-full text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ border: "1px solid hsl(var(--border))", background: "transparent", color: "hsl(var(--text-secondary))", minHeight: 44 }}
              >
                <Download className="w-4 h-4" /> PDF
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-3 rounded-full text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ border: "1px solid hsl(var(--border))", background: "transparent", color: "hsl(var(--text-secondary))", minHeight: 44 }}
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>

            {/* Audit opposite */}
            <div className="mt-10 rounded-2xl text-center p-7" style={{ background: "hsl(var(--secondary))", border: "1px dashed hsl(var(--border))" }}>
              <h3 className="text-lg font-semibold" style={{ color: "hsl(var(--text-primary))" }}>↕ What if you chose the opposite?</h3>
              <p className="mt-2 text-base" style={{ color: "hsl(var(--text-secondary))" }}>Stress-test your thinking from the other side</p>
              <button
                onClick={handleAuditOpposite}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ height: 48, fontSize: 15, padding: "0 28px", border: "1px solid hsl(var(--border))", background: "transparent", color: "hsl(var(--text-primary))", minHeight: 48 }}
              >
                Audit the Opposite →
              </button>
            </div>

            {!user && (
              <div className="mt-10">
                <a
                  href="/signup"
                  className="w-full flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ height: 56, fontSize: 16, background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", boxShadow: "0 4px 16px hsla(16, 100%, 62%, 0.3)" }}
                >
                  Create account to save
                </a>
              </div>
            )}

            <div className="text-center mt-8">
              <button onClick={() => onReset()} className="text-base transition-opacity duration-200 hover:opacity-100" style={{ color: "hsl(var(--text-tertiary))", minHeight: 44 }}>
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

      {/* Mobile sticky bottom bar */}
      {!readOnly && (
        <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden flex items-center justify-between gap-2 px-4 py-3" style={{ background: "hsla(0, 0%, 100%, 0.95)", backdropFilter: "blur(8px)", borderTop: "1px solid hsl(var(--border))" }}>
          <button onClick={handleCopySummary} className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full text-xs font-medium" style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--text-secondary))" }}>
            <Copy className="w-3.5 h-3.5" /> Summary
          </button>
          <button onClick={() => onReset()} className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full text-xs font-medium" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
            New Audit
          </button>
          {user && onSaveToJournal && !journalSaved ? (
            <button onClick={onSaveToJournal} className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full text-xs font-medium" style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--text-secondary))" }}>
              <BookmarkPlus className="w-3.5 h-3.5" /> Save
            </button>
          ) : journalSaved ? (
            <span className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs" style={{ color: "hsl(var(--success))" }}>
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          ) : null}
        </div>
      )}

      {/* Back to top — offset for mobile bottom bar */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed z-50 flex items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-[1.05] active:scale-95 bottom-20 sm:bottom-6 right-6"
          style={{ width: 48, height: 48, background: "hsl(var(--primary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--primary-foreground))" }}
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
