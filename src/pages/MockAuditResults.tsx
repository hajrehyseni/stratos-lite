import { useSearchParams, Link } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ArrowRight, ArrowLeft, ArrowUp, AlertTriangle, Users, Target, Shield, TrendingUp, Copy, Share2, Swords, ChevronDown, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const mockData = {
  confidenceScore: 72,
  verdict: "CONDITIONAL PROCEED",
  verdictDescription: "Strong strategic merit but significant integration risks. Proceed only after addressing the three critical risks below.",
  keyRisk: "Integration timeline and talent retention",
  nextStep: "Commission independent tech due diligence this week",
  meceBreakdown: [
    { dimension: "Strategic Fit", score: 85 },
    { dimension: "Financial Viability", score: 68 },
    { dimension: "Operational Readiness", score: 61 },
    { dimension: "Market Timing", score: 78 },
    { dimension: "Cultural Alignment", score: 55 },
  ],
  risks: [
    { risk: "Integration timeline exceeds 12-month window", severity: "High", mitigation: "Appoint dedicated integration PMO with weekly executive steering committee reviews." },
    { risk: "Key talent attrition during transition", severity: "High", mitigation: "Implement retention packages for top 20 critical roles. Announce leadership within 48 hours." },
    { risk: "Customer overlap creates revenue cannibalization", severity: "Medium", mitigation: "Map customer overlap pre-close. Develop unified pricing strategy." },
  ],
  stakeholders: [
    { name: "Board of Directors", stance: "Supportive", influence: "High", action: "Present updated financial model with integration cost sensitivity analysis." },
    { name: "CTO / Engineering", stance: "Cautious", influence: "High", action: "Schedule joint architecture review." },
    { name: "Sales Team", stance: "Concerned", influence: "Medium", action: "Communicate territory and compensation protection." },
    { name: "Target's Employees", stance: "Uncertain", influence: "Medium", action: "Prepare Day 1 communication." },
  ],
  actions: [
    { action: "Commission independent due diligence on target's tech stack", priority: "Immediate" },
    { action: "Develop detailed 18-month integration roadmap", priority: "This week" },
    { action: "Negotiate retention agreements with top 5 engineering leaders", priority: "Before close" },
    { action: "Model three scenarios: aggressive, base, conservative timelines", priority: "Immediate" },
  ],
  devilsAdvocate: "You're assuming the competitor's technology is worth the premium. But what if their engineering talent — the real asset — leaves within 6 months? You'd be left with a codebase you don't fully understand and a market position that could have been achieved organically in 18 months at half the cost.",
  reframeQuestion: "Instead of 'Should we acquire them?', ask: 'What would it cost us to build this capability internally, and can we afford the 18-month delay?'",
  rapidAssignment: {
    R: { label: "Recommend", person: "VP Corporate Development" },
    A: { label: "Agree", person: "CFO, General Counsel" },
    P: { label: "Perform", person: "Integration PMO" },
    I: { label: "Input", person: "CTO, VP Sales, HR Director" },
    D: { label: "Decide", person: "CEO with Board approval" },
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
  const radius = 85;
  const stroke = 8;
  const size = 200;
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
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={getColor(animatedScore)} strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={circumference - progress} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: "stroke 0.3s ease" }} />
      <text x={size/2} y={size/2 - 5} textAnchor="middle" fill="hsl(var(--text-primary))" fontSize="48" fontWeight="800" style={{ fontFamily: "Inter" }}>{animatedScore}</text>
      <text x={size/2} y={size/2 + 20} textAnchor="middle" fill="hsl(var(--text-tertiary))" fontSize="14">/100</text>
    </svg>
  );
}

function meceBarColor(score: number) {
  if (score >= 80) return "hsl(var(--success))";
  if (score >= 60) return "hsl(var(--warning))";
  return "hsl(var(--destructive))";
}

function stanceColor(stance: string) {
  if (stance === "Supportive") return "hsl(var(--success))";
  if (stance === "Cautious") return "hsl(var(--warning))";
  if (stance === "Concerned") return "hsl(var(--destructive))";
  return "hsl(var(--text-tertiary))";
}

function severityBorderColor(severity: string) {
  if (severity === "High") return "hsl(var(--destructive))";
  if (severity === "Medium") return "hsl(var(--warning))";
  return "hsl(var(--primary))";
}

export default function MockAuditResults() {
  const [searchParams] = useSearchParams();
  const decision = searchParams.get("decision") || "Should we acquire our competitor?";
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeTab, setActiveTab] = useState("verdict-section");
  const scoreRef = useRef<HTMLDivElement>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [verdictPulse, setVerdictPulse] = useState(false);

  const verdictColor = "hsl(var(--warning))";
  const verdictBgTint = "hsla(173, 58%, 39%, 0.05)";

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

  useEffect(() => {
    const ids = NAV_TABS.map(t => t.id);
    const observer = new IntersectionObserver(
      (entries) => { for (const entry of entries) { if (entry.isIntersecting) setActiveTab(entry.target.id); } },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0.1 }
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const updateIndicator = useCallback(() => {
    if (!tabBarRef.current || !indicatorRef.current) return;
    const activeBtn = tabBarRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    if (!activeBtn) return;
    const barRect = tabBarRef.current.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    indicatorRef.current.style.left = `${btnRect.left - barRect.left}px`;
    indicatorRef.current.style.width = `${btnRect.width}px`;
  }, [activeTab]);

  useEffect(() => { updateIndicator(); }, [activeTab, updateIndicator]);
  useEffect(() => { window.addEventListener("resize", updateIndicator); return () => window.removeEventListener("resize", updateIndicator); }, [updateIndicator]);

  const handleTabClick = (id: string) => {
    setTimeout(() => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 50);
  };

  const handleCopySummary = () => {
    const summary = `Decision: ${decision}\nVerdict: ${mockData.verdict} (${mockData.confidenceScore}/100)\nKey Risk: ${mockData.keyRisk}\nNext Step: ${mockData.nextStep}`;
    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    toast.success("Copied to clipboard ✓");
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Share link copied ✓");
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen px-4 sm:px-6 pt-24 pb-20 page-enter">
        <div className="mx-auto" style={{ maxWidth: 800 }}>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium mb-8 transition-opacity hover:opacity-70" style={{ color: "hsl(var(--text-secondary))" }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>

          <p className="text-sm font-medium uppercase tracking-wider mb-2" style={{ letterSpacing: "0.1em", color: "hsl(var(--primary))" }}>Decision Audit</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-8" style={{ color: "hsl(var(--text-primary))" }}>{decision}</h1>

          {/* Confidence Score — larger gauge */}
          <div id="verdict-section" ref={scoreRef} className="rounded-xl p-6 text-center mb-6 scroll-mt-24" style={{ background: verdictBgTint, border: "1px solid hsl(var(--border))" }}>
            <div className="mt-2"><ScoreGauge score={mockData.confidenceScore} /></div>
            <span className="inline-block mt-4 rounded-full px-4 py-1.5 text-sm font-bold transition-transform" style={{
              background: verdictColor + "15", color: verdictColor, border: `1px solid ${verdictColor}30`,
              transform: verdictPulse ? "scale(1.05)" : "scale(1)", transition: "transform 300ms ease",
            }}>
              {mockData.verdict}
            </span>
            <p className="mt-3 text-base leading-relaxed" style={{ color: "hsl(var(--text-secondary))", maxWidth: 580, margin: "12px auto 0" }}>
              {mockData.verdictDescription}
            </p>
          </div>

          {/* Executive Summary — 3 column horizontal strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {[
              { icon: CheckCircle, label: "Verdict", value: `${mockData.verdict} (${mockData.confidenceScore}/100)`, color: "hsl(var(--success))" },
              { icon: AlertTriangle, label: "Key Risk", value: mockData.keyRisk, color: "hsl(var(--warning))" },
              { icon: ArrowRight, label: "Next Step", value: mockData.nextStep, color: "hsl(var(--primary))" },
            ].map(card => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-xl p-4" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" style={{ color: card.color }} />
                    <span className="text-xs font-semibold uppercase" style={{ letterSpacing: "0.08em", color: card.color }}>{card.label}</span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.5 }}>{card.value}</p>
                </div>
              );
            })}
          </div>

          {/* The Reframe */}
          <div className="rounded-xl p-6 mb-6" style={{ background: "hsla(40, 50%, 97%, 1)", borderLeft: "3px solid hsl(var(--primary))", borderTop: "1px solid hsl(var(--border))", borderRight: "1px solid hsl(var(--border))", borderBottom: "1px solid hsl(var(--border))" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ letterSpacing: "0.1em", color: "hsl(var(--primary))" }}>The Reframe</p>
            <p className="text-base italic leading-relaxed" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.7 }}>{mockData.reframeQuestion}</p>
          </div>

          {/* Sticky Tab Nav */}
          <div className="sticky top-16 z-40 -mx-4 px-4 py-2 mb-6" style={{ background: "hsla(0, 0%, 100%, 0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid hsl(var(--border))" }}>
            <div ref={tabBarRef} className="flex gap-1 overflow-x-auto scrollbar-hide relative pb-1">
              {NAV_TABS.map((tab) => (
                <button key={tab.id} data-tab={tab.id} onClick={() => handleTabClick(tab.id)} className="flex-shrink-0 px-3 py-2 text-xs font-medium transition-colors duration-200 relative" style={{ color: activeTab === tab.id ? "hsl(var(--primary))" : "hsl(var(--text-secondary))", background: "transparent", border: "none", minHeight: 36 }}>
                  {tab.label}
                </button>
              ))}
              <div ref={indicatorRef} className="absolute bottom-0 h-0.5 rounded-full transition-all duration-200 ease-out" style={{ background: "hsl(var(--primary))" }} />
              <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none sm:hidden" style={{ background: "linear-gradient(to right, transparent, hsla(0, 0%, 100%, 0.95))" }} />
            </div>
          </div>

          {/* MECE — Visual bar chart, no text descriptions */}
          <div id="mece" className="rounded-xl p-5 mb-4 scroll-mt-24" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ letterSpacing: "0.1em", color: "hsl(var(--primary))" }}>Decision Breakdown</p>
            <div className="space-y-3">
              {mockData.meceBreakdown.map((dim) => (
                <div key={dim.dimension}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: "hsl(var(--text-primary))" }}>{dim.dimension}</span>
                    <span className="text-sm font-bold" style={{ color: meceBarColor(dim.score) }}>{dim.score}</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full" style={{ background: "hsl(var(--border))" }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${dim.score}%`, background: meceBarColor(dim.score) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risks — color-coded left borders, no "Mitigation:" label */}
          <div id="risks" className="rounded-xl p-5 mb-4 scroll-mt-24" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ letterSpacing: "0.1em", color: "hsl(var(--primary))" }}>Risk Matrix</p>
            <div className="space-y-3">
              {mockData.risks.map((r, i) => (
                <div key={i} className="rounded-lg p-4" style={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(var(--border))", borderLeft: `3px solid ${severityBorderColor(r.severity)}` }}>
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <span className="font-semibold text-sm" style={{ color: "hsl(var(--text-primary))" }}>{r.risk}</span>
                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold flex-shrink-0" style={{ background: `${severityBorderColor(r.severity)}15`, color: severityBorderColor(r.severity) }}>{r.severity}</span>
                  </div>
                  <p className="text-sm" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.5 }}>{r.mitigation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stakeholders — compact 2-col grid with stance dots */}
          <div id="stakeholders" className="rounded-xl p-5 mb-4 scroll-mt-24" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ letterSpacing: "0.1em", color: "hsl(var(--primary))" }}>Stakeholder Analysis</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mockData.stakeholders.map((s, i) => (
                <div key={i} className="rounded-lg p-3" style={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(var(--border))" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: stanceColor(s.stance), flexShrink: 0 }} />
                    <span className="font-semibold text-sm" style={{ color: "hsl(var(--text-primary))" }}>{s.name}</span>
                  </div>
                  <p className="text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>{s.action.split(".")[0]}.</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions — numbered, priority tag only */}
          <div id="actions" className="rounded-xl p-5 mb-4 scroll-mt-24" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ letterSpacing: "0.1em", color: "hsl(var(--primary))" }}>Recommended Actions</p>
            <div className="space-y-2.5">
              {mockData.actions.map((a, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg p-3" style={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(var(--border))" }}>
                  <span className="flex-shrink-0 flex items-center justify-center rounded-full text-xs font-bold" style={{ width: 24, height: 24, background: "hsla(221, 83%, 53%, 0.1)", color: "hsl(var(--primary))" }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "hsl(var(--text-primary))" }}>{a.action}</p>
                    <span className="text-xs mt-1 inline-block" style={{ color: "hsl(var(--text-tertiary))" }}>{a.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Devil's Advocate */}
          <div id="devils-advocate" className="rounded-xl p-5 mb-4 scroll-mt-24" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", borderLeft: "3px solid hsla(0, 70%, 60%, 0.6)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Swords className="w-4 h-4" style={{ color: "hsla(0, 70%, 60%, 0.8)" }} />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ letterSpacing: "0.1em", color: "hsla(0, 70%, 60%, 0.8)" }}>Devil's Advocate</p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.7 }}>{mockData.devilsAdvocate}</p>
          </div>

          {/* RAPID — horizontal row of 5 letter badges */}
          <div id="rapid" className="rounded-xl p-5 mb-4 scroll-mt-24" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ letterSpacing: "0.1em", color: "hsl(var(--primary))" }}>RAPID Framework</p>
            <div className="flex flex-wrap gap-4 justify-between">
              {Object.entries(mockData.rapidAssignment).map(([letter, { label, person }]) => (
                <div key={letter} className="flex flex-col items-center text-center flex-1" style={{ minWidth: 80 }}>
                  <span className="flex items-center justify-center rounded-lg font-bold mb-2" style={{ width: 40, height: 40, background: "hsla(221, 83%, 53%, 0.1)", color: "hsl(var(--primary))", fontSize: 16 }}>
                    {letter}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: "hsl(var(--text-primary))" }}>{label}</span>
                  <span className="text-xs mt-0.5" style={{ color: "hsl(var(--text-tertiary))" }}>{person}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <button onClick={handleCopySummary} className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--text-primary))", background: "hsl(0, 0%, 100%)" }}>
              <Copy className="w-4 h-4" /> {copiedSummary ? "Copied!" : "Copy Summary"}
            </button>
            <button onClick={handleShare} className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--text-primary))", background: "hsl(0, 0%, 100%)" }}>
              <Share2 className="w-4 h-4" /> Share
            </button>
            <Link to="/" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
              New Audit <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

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
