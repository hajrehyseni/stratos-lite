import { useSearchParams, Link } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ArrowRight, ArrowLeft, ArrowUp, AlertTriangle, Users, Target, Shield, TrendingUp, Copy, Share2, Swords, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const mockData = {
  confidenceScore: 72,
  verdict: "CONDITIONAL PROCEED",
  verdictDescription: "Strong strategic merit but significant integration risks. Proceed only after addressing the three critical risks below and securing board alignment on the 18-month timeline.",
  meceBreakdown: [
    { dimension: "Strategic Fit", score: 85, description: "Strong product complementarity and market overlap. Combined entity would hold 34% market share in the target segment." },
    { dimension: "Financial Viability", score: 68, description: "DCF valuation suggests fair value at 1.2x premium. Cash reserves sufficient but will constrain R&D spending for 2 quarters." },
    { dimension: "Operational Readiness", score: 61, description: "Integration team identified but timeline aggressive. Key dependency on retaining target's engineering leadership." },
    { dimension: "Market Timing", score: 78, description: "Competitor consolidation accelerating. Window of opportunity narrows significantly after Q3 as regulatory landscape shifts." },
    { dimension: "Cultural Alignment", score: 55, description: "Significant differences in decision-making culture. Target operates with flat hierarchy vs. acquirer's matrix structure." },
  ],
  risks: [
    { risk: "Integration timeline exceeds 12-month window", severity: "High", mitigation: "Appoint dedicated integration PMO with weekly executive steering committee reviews. Set 90-day milestone checkpoints." },
    { risk: "Key talent attrition during transition", severity: "High", mitigation: "Implement retention packages for top 20 critical roles. Announce leadership structure within first 48 hours post-close." },
    { risk: "Customer overlap creates revenue cannibalization", severity: "Medium", mitigation: "Map customer overlap in detail pre-close. Develop unified pricing strategy and account transition plan." },
  ],
  stakeholders: [
    { name: "Board of Directors", stance: "Supportive", influence: "High", action: "Present updated financial model with integration cost sensitivity analysis at next board meeting." },
    { name: "CTO / Engineering", stance: "Cautious", influence: "High", action: "Schedule joint architecture review with target's tech team. Address platform consolidation concerns directly." },
    { name: "Sales Team", stance: "Concerned", influence: "Medium", action: "Communicate clear territory and compensation protection. Share cross-sell opportunity sizing." },
    { name: "Target's Employees", stance: "Uncertain", influence: "Medium", action: "Prepare Day 1 communication plan. Clarify reporting structures and role continuity within first week." },
  ],
  actions: [
    { action: "Commission independent due diligence on target's tech stack and technical debt", priority: "Immediate", feasibility: "Feasible" },
    { action: "Develop detailed 18-month integration roadmap with resource allocation", priority: "This week", feasibility: "Feasible" },
    { action: "Negotiate retention agreements with target's top 5 engineering leaders", priority: "Before close", feasibility: "Complex" },
    { action: "Model three scenarios: aggressive, base, conservative integration timelines", priority: "Immediate", feasibility: "Feasible" },
  ],
  devilsAdvocate: "You're assuming the competitor's technology is worth the premium. But what if their engineering talent — the real asset — leaves within 6 months? You'd be left with a codebase you don't fully understand and a market position that could have been achieved organically in 18 months at half the cost. The acquisition creates urgency that may not actually exist.",
  reframeQuestion: "Instead of 'Should we acquire them?', ask: 'What would it cost us to build this capability internally, and can we afford the 18-month delay?'",
  rapidAssignment: {
    recommend: "VP Corporate Development",
    agree: "CFO, General Counsel",
    perform: "Integration PMO, combined engineering teams",
    input: "CTO, VP Sales, HR Director",
    decide: "CEO with Board approval",
  },
};

const NAV_TABS = [
  { id: "verdict-section", label: "Verdict" },
  { id: "mece", label: "Breakdown" },
  { id: "risks", label: "Risks" },
  { id: "stakeholders", label: "Stakeholders" },
  { id: "actions", label: "Actions" },
  { id: "devils-advocate", label: "Devil's Advocate" },
  { id: "rapid", label: "RAPID" },
];

function ScoreGauge({ score }: { score: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = 70;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const getColor = (s: number) => s <= 30 ? "hsl(0, 84%, 60%)" : s <= 60 ? "hsl(38, 92%, 50%)" : s <= 80 ? "hsl(173, 58%, 39%)" : "hsl(142, 71%, 45%)";

  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    let raf: number;
    const animate = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimatedScore(Math.round(eased * score));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
        <circle cx="80" cy="80" r={radius} fill="none" stroke={getColor(animatedScore)} strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={circumference - progress} strokeLinecap="round" transform="rotate(-90 80 80)" style={{ transition: "stroke 0.3s ease" }} />
        <text x="80" y="75" textAnchor="middle" fill="hsl(var(--text-primary))" fontSize="42" fontWeight="800" style={{ fontFamily: "Inter" }}>{animatedScore}</text>
        <text x="80" y="98" textAnchor="middle" fill="hsl(var(--text-tertiary))" fontSize="14">/100</text>
      </svg>
    </div>
  );
}

function getScoreMicrocopy(score: number) {
  if (score < 40) return "This decision needs more work before you proceed.";
  if (score <= 65) return "You're getting closer — address the key risks first.";
  if (score <= 85) return "Strong foundation. Fine-tune the details.";
  return "High confidence. You're ready to move.";
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    High: { bg: "hsla(0, 84%, 60%, 0.1)", text: "hsl(0, 84%, 50%)" },
    Medium: { bg: "hsla(38, 92%, 50%, 0.1)", text: "hsl(38, 80%, 40%)" },
    Low: { bg: "hsla(221, 83%, 53%, 0.1)", text: "hsl(221, 83%, 53%)" },
  };
  const c = colors[severity] || colors.Medium;
  return <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: c.bg, color: c.text }}>{severity}</span>;
}

function FeasibilityBadge({ feasibility }: { feasibility: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    Feasible: { bg: "hsla(160, 84%, 39%, 0.1)", text: "hsl(160, 84%, 30%)" },
    Complex: { bg: "hsla(38, 92%, 50%, 0.1)", text: "hsl(38, 80%, 40%)" },
    Blocked: { bg: "hsla(0, 84%, 60%, 0.1)", text: "hsl(0, 84%, 50%)" },
  };
  const c = colors[feasibility] || colors.Feasible;
  return <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: c.bg, color: c.text }}>{feasibility}</span>;
}

function CollapsibleCard({ title, icon: Icon, label, children, id, expandedSet, onToggle, borderColor }: {
  title: string; icon: any; label: string; children: React.ReactNode; id: string;
  expandedSet: Set<string>; onToggle: (id: string) => void; borderColor?: string;
}) {
  const isOpen = expandedSet.has(id);
  return (
    <div id={id} className="rounded-xl scroll-mt-24" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", borderLeft: borderColor ? `3px solid ${borderColor}` : undefined }}>
      <button onClick={() => onToggle(id)} className="w-full flex items-center justify-between p-6 text-left transition-colors hover:bg-black/[0.01]">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: borderColor || "hsl(var(--primary))" }} />
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ letterSpacing: "0.1em", color: borderColor || "hsl(var(--primary))" }}>{label}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold" style={{ color: "hsl(var(--text-primary))" }}>{title}</span>
          <ChevronDown className="w-5 h-5 transition-transform duration-300" style={{ color: "hsl(var(--text-tertiary))", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
        </div>
      </button>
      <div className="overflow-hidden transition-all duration-300 ease-out" style={{ maxHeight: isOpen ? 2000 : 0, opacity: isOpen ? 1 : 0 }}>
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function MockAuditResults() {
  const [searchParams] = useSearchParams();
  const decision = searchParams.get("decision") || "Should we acquire our competitor?";
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["mece", "risks", "stakeholders", "actions", "devils-advocate", "rapid"]));
  const [verdictPulse, setVerdictPulse] = useState(false);
  const [activeTab, setActiveTab] = useState("verdict-section");
  const scoreRef = useRef<HTMLDivElement>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const verdictColor = mockData.verdict === "PROCEED" ? "hsl(var(--success))" : mockData.verdict.includes("CONDITIONAL") ? "hsl(var(--warning))" : "hsl(var(--destructive))";
  const verdictBgTint = mockData.confidenceScore <= 30 ? "hsla(0, 84%, 60%, 0.05)" : mockData.confidenceScore <= 60 ? "hsla(38, 92%, 50%, 0.05)" : mockData.confidenceScore <= 80 ? "hsla(173, 58%, 39%, 0.05)" : "hsla(142, 71%, 45%, 0.05)";

  useEffect(() => {
    const t = setTimeout(() => setVerdictPulse(true), 1600);
    const t2 = setTimeout(() => setVerdictPulse(false), 2200);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const h = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Intersection observer for active tab
  useEffect(() => {
    const ids = NAV_TABS.map(t => t.id);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id);
          }
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0.1 }
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Sliding underline indicator
  const updateIndicator = useCallback(() => {
    if (!tabBarRef.current || !indicatorRef.current) return;
    const activeBtn = tabBarRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    if (!activeBtn) return;
    const barRect = tabBarRef.current.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    indicatorRef.current.style.left = `${btnRect.left - barRect.left}px`;
    indicatorRef.current.style.width = `${btnRect.width}px`;
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
  }, [activeTab, updateIndicator]);

  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleTabClick = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleCopySummary = () => {
    const summary = `Decision: ${decision}\nVerdict: ${mockData.verdict}\nConfidence: ${mockData.confidenceScore}/100\n\nTop Actions:\n${mockData.actions.slice(0, 3).map((a, i) => `${i + 1}. ${a.action}`).join("\n")}`;
    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    toast.success("Copied to clipboard ✓");
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Share link copied to clipboard ✓");
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen px-4 sm:px-6 pt-24 pb-20 page-enter">
        <div className="mx-auto" style={{ maxWidth: 800 }}>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium mb-8 transition-opacity hover:opacity-70" style={{ color: "hsl(var(--text-secondary))" }}>
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <p className="text-sm font-medium uppercase tracking-wider mb-2" style={{ letterSpacing: "0.1em", color: "hsl(var(--primary))" }}>Decision Audit</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-8" style={{ color: "hsl(var(--text-primary))" }}>{decision}</h1>

          {/* Confidence Score */}
          <div id="verdict-section" ref={scoreRef} className="rounded-xl p-6 text-center mb-6 scroll-mt-24" style={{ background: verdictBgTint, border: "1px solid hsl(var(--border))" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ letterSpacing: "0.1em", color: "hsl(var(--primary))" }}>Confidence Score</p>
            <div className="mt-4"><ScoreGauge score={mockData.confidenceScore} /></div>
            <span className="inline-block mt-4 rounded-full px-4 py-1.5 text-sm font-bold transition-transform" style={{
              background: verdictColor + "15", color: verdictColor, border: `1px solid ${verdictColor}30`,
              transform: verdictPulse ? "scale(1.05)" : "scale(1)",
              transition: "transform 300ms ease",
            }}>
              {mockData.verdict}
            </span>
            <p className="mt-2 text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>{getScoreMicrocopy(mockData.confidenceScore)}</p>
            <p className="mt-4 text-base leading-relaxed" style={{ color: "hsl(var(--text-secondary))", maxWidth: 600, margin: "16px auto 0" }}>
              {mockData.verdictDescription}
            </p>
          </div>

          {/* The Reframe — styled quote block */}
          <div className="rounded-xl p-6 mb-6" style={{ background: "hsla(40, 50%, 97%, 1)", borderLeft: "3px solid hsl(var(--primary))", borderTop: "1px solid hsl(var(--border))", borderRight: "1px solid hsl(var(--border))", borderBottom: "1px solid hsl(var(--border))" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ letterSpacing: "0.1em", color: "hsl(var(--primary))" }}>The Reframe</p>
            <p className="text-base italic leading-relaxed" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.7 }}>{mockData.reframeQuestion}</p>
          </div>

          {/* Sticky Tab Navigation with sliding underline */}
          <div className="sticky top-16 z-40 -mx-4 px-4 py-2 mb-6" style={{ background: "hsla(0, 0%, 100%, 0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid hsl(var(--border))" }}>
            <div ref={tabBarRef} className="flex gap-1 overflow-x-auto scrollbar-hide relative pb-1">
              {NAV_TABS.map((tab) => (
                <button
                  key={tab.id}
                  data-tab={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className="flex-shrink-0 px-3 py-2 text-xs font-medium transition-colors duration-200 relative"
                  style={{
                    color: activeTab === tab.id ? "hsl(var(--primary))" : "hsl(var(--text-secondary))",
                    background: "transparent",
                    border: "none",
                    minHeight: 36,
                  }}
                >
                  {tab.label}
                </button>
              ))}
              {/* Sliding underline indicator */}
              <div
                ref={indicatorRef}
                className="absolute bottom-0 h-0.5 rounded-full transition-all duration-200 ease-out"
                style={{ background: "hsl(var(--primary))" }}
              />
              {/* Mobile gradient fade */}
              <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none sm:hidden" style={{ background: "linear-gradient(to right, transparent, hsla(0, 0%, 100%, 0.95))" }} />
            </div>
          </div>

          {/* Collapsible Sections */}
          <div className="space-y-4">
            <CollapsibleCard id="mece" icon={Target} label="MECE Breakdown" title="Decision Dimensions" expandedSet={expandedSections} onToggle={toggleSection}>
              <div className="space-y-4">
                {mockData.meceBreakdown.map((dim) => (
                  <div key={dim.dimension} className="rounded-lg p-4" style={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(var(--border))" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-base" style={{ color: "hsl(var(--text-primary))" }}>{dim.dimension}</span>
                      <span className="text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>{dim.score}/100</span>
                    </div>
                    <div className="w-full h-2 rounded-full mb-3" style={{ background: "hsl(var(--border))" }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${dim.score}%`, background: "hsl(var(--primary))" }} />
                    </div>
                    <p className="text-sm" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.6 }}>{dim.description}</p>
                  </div>
                ))}
              </div>
            </CollapsibleCard>

            <CollapsibleCard id="risks" icon={AlertTriangle} label="Risk Matrix" title="Key Risks" expandedSet={expandedSections} onToggle={toggleSection}>
              <div className="space-y-4">
                {mockData.risks.map((r, i) => (
                  <div key={i} className="rounded-lg p-4" style={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(var(--border))" }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="font-semibold text-base" style={{ color: "hsl(var(--text-primary))" }}>{r.risk}</span>
                      <SeverityBadge severity={r.severity} />
                    </div>
                    <p className="text-sm" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.6 }}>
                      <strong style={{ color: "hsl(var(--text-primary))" }}>Mitigation:</strong> {r.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </CollapsibleCard>

            <CollapsibleCard id="stakeholders" icon={Users} label="Stakeholder Analysis" title="Key Stakeholders" expandedSet={expandedSections} onToggle={toggleSection}>
              <div className="space-y-4">
                {mockData.stakeholders.map((s, i) => (
                  <div key={i} className="rounded-lg p-4" style={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(var(--border))" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-base" style={{ color: "hsl(var(--text-primary))" }}>{s.name}</span>
                      <div className="flex gap-2">
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: s.stance === "Supportive" ? "hsla(160, 84%, 39%, 0.1)" : s.stance === "Cautious" ? "hsla(38, 92%, 50%, 0.1)" : "hsla(221, 83%, 53%, 0.1)", color: s.stance === "Supportive" ? "hsl(160, 84%, 30%)" : s.stance === "Cautious" ? "hsl(38, 80%, 40%)" : "hsl(221, 83%, 53%)" }}>{s.stance}</span>
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "hsl(var(--secondary))", color: "hsl(var(--text-secondary))" }}>{s.influence} influence</span>
                      </div>
                    </div>
                    <p className="text-sm" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.6 }}>{s.action}</p>
                  </div>
                ))}
              </div>
            </CollapsibleCard>

            <CollapsibleCard id="actions" icon={Target} label="Recommended Actions" title="Next Steps" expandedSet={expandedSections} onToggle={toggleSection}>
              <div className="space-y-3">
                {mockData.actions.map((a, i) => (
                  <div key={i} className="rounded-lg p-4 flex items-start gap-3" style={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(var(--border))" }}>
                    <span className="flex-shrink-0 flex items-center justify-center rounded-full text-xs font-bold mt-0.5" style={{ width: 24, height: 24, background: "hsla(221, 83%, 53%, 0.1)", color: "hsl(var(--primary))" }}>{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-base font-medium" style={{ color: "hsl(var(--text-primary))" }}>{a.action}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs font-medium" style={{ color: "hsl(var(--text-tertiary))" }}>{a.priority}</span>
                        <FeasibilityBadge feasibility={a.feasibility} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleCard>

            {/* Devil's Advocate — red left border + Swords icon */}
            <CollapsibleCard
              id="devils-advocate"
              icon={Swords}
              label="Devil's Advocate"
              title="The Counterargument"
              expandedSet={expandedSections}
              onToggle={toggleSection}
              borderColor="hsla(0, 70%, 60%, 0.6)"
            >
              <p className="text-base leading-relaxed" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.7 }}>{mockData.devilsAdvocate}</p>
            </CollapsibleCard>

            <CollapsibleCard id="rapid" icon={TrendingUp} label="RAPID Framework" title="Role Assignment" expandedSet={expandedSections} onToggle={toggleSection}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(mockData.rapidAssignment).map(([role, person]) => (
                  <div key={role} className="rounded-lg p-3" style={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(var(--border))" }}>
                    <p className="text-xs font-semibold uppercase" style={{ color: "hsl(var(--primary))", letterSpacing: "0.05em" }}>{role}</p>
                    <p className="text-sm mt-1" style={{ color: "hsl(var(--text-primary))" }}>{person}</p>
                  </div>
                ))}
              </div>
            </CollapsibleCard>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <button onClick={handleCopySummary} className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--text-primary))", background: "hsl(0, 0%, 100%)" }}>
              <Copy className="w-4 h-4" /> {copiedSummary ? "Copied!" : "Copy Summary"}
            </button>
            <button onClick={handleShare} className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--text-primary))", background: "hsl(0, 0%, 100%)" }}>
              <Share2 className="w-4 h-4" /> Share Results
            </button>
            <Link to="/" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
              New Audit <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.02]" style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--text-primary))" }}>
              View Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Back to top FAB */}
      {showBackToTop && (
        <button
          onClick={() => scoreRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="fixed z-40 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-[1.05] active:scale-[0.95]"
          style={{ bottom: 24, right: 24, width: 44, height: 44, background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", boxShadow: "0 4px 16px hsla(221, 83%, 53%, 0.3)" }}
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
      <Footer />
    </>
  );
}