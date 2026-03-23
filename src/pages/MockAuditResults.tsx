import { useSearchParams, Link } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ArrowRight, ArrowLeft, AlertTriangle, Users, Target, Shield, TrendingUp } from "lucide-react";

const mockData = {
  confidenceScore: 72,
  verdict: "CONDITIONAL PROCEED",
  verdictDescription: "The acquisition has strong strategic merit but carries significant integration risks. Proceed only after addressing the three critical risks identified below and securing board alignment on the 18-month integration timeline.",
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
  rapidAssignment: {
    recommend: "VP Corporate Development",
    agree: "CFO, General Counsel",
    perform: "Integration PMO, combined engineering teams",
    input: "CTO, VP Sales, HR Director",
    decide: "CEO with Board approval",
  },
};

function ScoreGauge({ score }: { score: number }) {
  const radius = 70;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score <= 30 ? "hsl(0, 84%, 60%)" : score <= 60 ? "hsl(38, 92%, 50%)" : score <= 80 ? "hsl(173, 58%, 39%)" : "hsl(142, 71%, 45%)";

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
        <circle cx="80" cy="80" r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={circumference - progress} strokeLinecap="round" transform="rotate(-90 80 80)" style={{ transition: "stroke-dashoffset 1.5s ease-out" }} />
        <text x="80" y="75" textAnchor="middle" fill="hsl(var(--text-primary))" fontSize="42" fontWeight="800" style={{ fontFamily: "Inter" }}>{score}</text>
        <text x="80" y="98" textAnchor="middle" fill="hsl(var(--text-tertiary))" fontSize="14">/100</text>
      </svg>
    </div>
  );
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

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl p-6 ${className}`} style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ letterSpacing: "0.1em", color: "hsl(var(--primary))" }}>{children}</p>;
}

export default function MockAuditResults() {
  const [searchParams] = useSearchParams();
  const decision = searchParams.get("decision") || "Should we acquire our competitor?";

  const verdictColor = mockData.verdict === "PROCEED" ? "hsl(var(--success))" : mockData.verdict.includes("CONDITIONAL") ? "hsl(var(--warning))" : "hsl(var(--destructive))";

  return (
    <>
      <NavBar />
      <div className="min-h-screen px-4 sm:px-6 pt-24 pb-20 page-enter">
        <div className="mx-auto" style={{ maxWidth: 800 }}>
          {/* Back link */}
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium mb-8 transition-opacity hover:opacity-70" style={{ color: "hsl(var(--text-secondary))" }}>
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          {/* Decision title */}
          <p className="text-sm font-medium uppercase tracking-wider mb-2" style={{ letterSpacing: "0.1em", color: "hsl(var(--primary))" }}>Decision Audit</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-8" style={{ color: "hsl(var(--text-primary))" }}>{decision}</h1>

          {/* Confidence Score */}
          <Card className="text-center mb-6">
            <SectionLabel>Confidence Score</SectionLabel>
            <div className="mt-4"><ScoreGauge score={mockData.confidenceScore} /></div>
            <span className="inline-block mt-4 rounded-full px-4 py-1.5 text-sm font-bold" style={{ background: verdictColor + "15", color: verdictColor, border: `1px solid ${verdictColor}30` }}>
              {mockData.verdict}
            </span>
            <p className="mt-4 text-base leading-relaxed" style={{ color: "hsl(var(--text-secondary))", maxWidth: 600, margin: "16px auto 0" }}>
              {mockData.verdictDescription}
            </p>
          </Card>

          {/* MECE Breakdown */}
          <Card className="mb-6">
            <SectionLabel>MECE Breakdown</SectionLabel>
            <h2 className="text-xl font-semibold mb-5" style={{ color: "hsl(var(--text-primary))" }}>Decision Dimensions</h2>
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
          </Card>

          {/* Risk Matrix */}
          <Card className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
              <SectionLabel>Risk Matrix</SectionLabel>
            </div>
            <h2 className="text-xl font-semibold mb-5" style={{ color: "hsl(var(--text-primary))" }}>Key Risks</h2>
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
          </Card>

          {/* Stakeholder Analysis */}
          <Card className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
              <SectionLabel>Stakeholder Analysis</SectionLabel>
            </div>
            <h2 className="text-xl font-semibold mb-5" style={{ color: "hsl(var(--text-primary))" }}>Key Stakeholders</h2>
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
          </Card>

          {/* Recommended Actions */}
          <Card className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
              <SectionLabel>Recommended Actions</SectionLabel>
            </div>
            <h2 className="text-xl font-semibold mb-5" style={{ color: "hsl(var(--text-primary))" }}>Next Steps</h2>
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
          </Card>

          {/* Devil's Advocate */}
          <Card className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
              <SectionLabel>Devil's Advocate</SectionLabel>
            </div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: "hsl(var(--text-primary))" }}>The Counterargument</h2>
            <p className="text-base leading-relaxed" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.7 }}>{mockData.devilsAdvocate}</p>
          </Card>

          {/* RAPID */}
          <Card className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
              <SectionLabel>RAPID Framework</SectionLabel>
            </div>
            <h2 className="text-xl font-semibold mb-5" style={{ color: "hsl(var(--text-primary))" }}>Role Assignment</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(mockData.rapidAssignment).map(([role, person]) => (
                <div key={role} className="rounded-lg p-3" style={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(var(--border))" }}>
                  <p className="text-xs font-semibold uppercase" style={{ color: "hsl(var(--primary))", letterSpacing: "0.05em" }}>{role}</p>
                  <p className="text-sm mt-1" style={{ color: "hsl(var(--text-primary))" }}>{person}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Action bar */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
              New Audit <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-medium transition-all duration-200 hover:scale-[1.02]" style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--text-primary))" }}>
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
