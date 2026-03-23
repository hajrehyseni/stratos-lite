import { useState, useEffect, useRef } from "react";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";

export interface DiagnosticResult {
  stakes: string;
  decision_type: string;
  blast_radius: string;
  primary_constraint: string;
  success_vision: string;
}

interface Props {
  decision: string;
  onComplete: (result: DiagnosticResult) => void;
  onSkip: () => void;
  onBackToLanding?: () => void;
}

const SESSION_KEY = "stratos_diag_state";

const SKIP_DEFAULTS: DiagnosticResult = {
  stakes: "",
  decision_type: "risk",
  blast_radius: "company",
  primary_constraint: "data",
  success_vision: "",
};

const decisionTypeOptions = [
  { key: "investment", emoji: "💰", label: "Investment", desc: "Spend money now for future returns" },
  { key: "growth", emoji: "🚀", label: "Growth", desc: "Enter new markets, launch products, scale up" },
  { key: "risk", emoji: "⚠️", label: "Risk/Crisis", desc: "Something's gone wrong or might go wrong" },
  { key: "people", emoji: "👥", label: "People/Org", desc: "Hiring, firing, restructuring, culture" },
];

const blastRadiusOptions = [
  { key: "team", emoji: "🎯", label: "My team", desc: "5-15 people, contained impact" },
  { key: "department", emoji: "🏢", label: "My department", desc: "50-200 people, budget implications" },
  { key: "company", emoji: "🏛️", label: "The whole company", desc: "Revenue, strategy, or culture shift" },
  { key: "bet-the-company", emoji: "🌍", label: "Bet-the-company", desc: "Existential: we win big or we're done" },
];

const constraintOptions = [
  { key: "time", emoji: "⏰", label: "Time pressure", desc: "Decision needed within days/weeks" },
  { key: "budget", emoji: "💷", label: "Budget ceiling", desc: "Limited funds, need ROI justification" },
  { key: "politics", emoji: "🏛️", label: "Political complexity", desc: "Multiple stakeholders with competing interests" },
  { key: "data", emoji: "📊", label: "Incomplete data", desc: "We're deciding with 60% of the picture" },
];

type Stage = 1 | 2 | 3;

function SelectableCard({
  emoji, label, desc, selected, dimmed, onClick,
}: {
  emoji: string; label: string; desc: string; selected: boolean; dimmed: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left relative transition-all duration-200 cursor-pointer"
      style={{
        padding: 20, borderRadius: 12,
        background: selected ? "hsla(221, 83%, 53%, 0.06)" : "hsl(var(--secondary))",
        border: selected ? "1.5px solid hsl(var(--primary))" : "1px solid hsl(var(--border))",
        opacity: dimmed ? 0.5 : 1,
        transform: selected ? "scale(1.02)" : "scale(1)",
        minHeight: 48,
      }}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--primary))" }}>
          <Check className="w-3 h-3" style={{ color: "hsl(var(--primary-foreground))" }} />
        </div>
      )}
      <span style={{ fontSize: 20 }}>{emoji}</span>
      <p style={{ fontSize: 15, fontWeight: 600, marginTop: 8, color: "hsl(var(--text-primary))" }}>{label}</p>
      <p style={{ fontSize: 12, marginTop: 4, color: "hsl(var(--text-secondary))" }}>{desc}</p>
    </button>
  );
}

const stageNames: Record<Stage, string> = { 1: "Stakes", 2: "Context", 3: "Constraints" };

function StageLabel({ current }: { current: Stage }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", color: "hsl(var(--text-tertiary))" }}>
      STAGE {current} OF 3 — {stageNames[current]}
    </p>
  );
}

function saveSessionState(data: { stage: Stage; stakes: string; decisionType: string | null; blastRadius: string | null; constraint: string | null; successVision: string }) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch {}
}

export function clearDiagnosticSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
}

function loadSessionState(): { stage: Stage; stakes: string; decisionType: string | null; blastRadius: string | null; constraint: string | null; successVision: string } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function getCharCountColor(len: number) {
  if (len < 50) return "hsl(var(--text-tertiary))";
  if (len <= 400) return "hsl(var(--success))";
  return "hsl(var(--warning))";
}

export function NewDiagnosticFlow({ decision, onComplete, onSkip, onBackToLanding }: Props) {
  const saved = loadSessionState();
  const [stage, setStage] = useState<Stage>(saved?.stage || 1);
  const [stakes, setStakes] = useState(saved?.stakes || "");
  const [decisionType, setDecisionType] = useState<string | null>(saved?.decisionType || null);
  const [blastRadius, setBlastRadius] = useState<string | null>(saved?.blastRadius || null);
  const [constraint, setConstraint] = useState<string | null>(saved?.constraint || null);
  const [successVision, setSuccessVision] = useState(saved?.successVision || "");
  const [visible, setVisible] = useState(false);
  const [stageKey, setStageKey] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Auto-focus textarea on stage 1
  useEffect(() => {
    if (stage === 1 && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [stage]);

  useEffect(() => {
    setStageKey((k) => k + 1);
  }, [stage]);

  useEffect(() => {
    saveSessionState({ stage, stakes, decisionType, blastRadius, constraint, successVision });
  }, [stage, stakes, decisionType, blastRadius, constraint, successVision]);

  const progressSegments = [true, stage >= 2, stage >= 3];

  const handleStakesSubmit = () => {
    setStage(2);
  };

  useEffect(() => {
    if (stage === 2 && decisionType && blastRadius) {
      const t = setTimeout(() => setStage(3), 600);
      return () => clearTimeout(t);
    }
  }, [stage, decisionType, blastRadius]);

  const handleFinalSubmit = () => {
    clearDiagnosticSession();
    onComplete({
      stakes,
      decision_type: decisionType || SKIP_DEFAULTS.decision_type,
      blast_radius: blastRadius || SKIP_DEFAULTS.blast_radius,
      primary_constraint: constraint || SKIP_DEFAULTS.primary_constraint,
      success_vision: successVision,
    });
  };

  const handleSkip = () => {
    clearDiagnosticSession();
    onSkip();
  };

  const handleBack = () => {
    if (stage === 1 && onBackToLanding) {
      clearDiagnosticSession();
      onBackToLanding();
    } else if (stage === 2) setStage(1);
    else if (stage === 3) setStage(2);
  };

  const textareaStyle: React.CSSProperties = {
    background: "hsl(var(--secondary))",
    border: "1.5px solid hsl(var(--border))",
    borderRadius: 10,
    padding: "14px 16px",
    fontSize: 16,
    fontFamily: "'Inter', system-ui, sans-serif",
    color: "hsl(var(--text-primary))",
    width: "100%",
    resize: "none",
    outline: "none",
    lineHeight: 1.5,
  };

  return (
    <div
      className="flex flex-col items-center justify-center px-4 transition-all duration-400"
      style={{
        minHeight: "90vh",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 400ms ease 200ms, transform 400ms ease 200ms",
      }}
    >
      <div className="w-full" style={{ maxWidth: 640 }}>
        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex gap-1 mb-2">
            {progressSegments.map((filled, i) => (
              <div key={i} className="flex-1 rounded-full transition-all duration-500" style={{ height: 3, background: filled ? "hsl(var(--primary))" : "hsl(var(--border))" }} />
            ))}
          </div>
          <div className="flex justify-between">
            {(["Stakes", "Context", "Constraints"] as const).map((label, i) => (
              <span key={label} className="text-xs" style={{ color: i + 1 <= stage ? "hsl(var(--primary))" : "hsl(var(--text-tertiary))", fontWeight: i + 1 === stage ? 600 : 400 }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        <button onClick={handleBack} className="flex items-center gap-1 mb-6 transition-colors duration-200 hover:opacity-70" style={{ fontSize: 13, background: "none", border: "none", padding: 0, color: "hsl(var(--text-secondary))" }}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", color: "hsl(var(--primary))" }}>YOUR DECISION</span>
            <span style={{ color: "hsl(var(--primary))", fontSize: 14, opacity: 0.5 }}>✓</span>
          </div>
          <p style={{ fontSize: 15, fontWeight: 400, borderLeft: "2px solid hsla(221, 83%, 53%, 0.3)", paddingLeft: 16, color: "hsl(var(--text-secondary))" }}>{decision}</p>
        </div>

        {/* STAGE 1: Stakes */}
        {stage === 1 && (
          <div key={`stage-${stageKey}`} style={{ animation: "slideInFromBottom 300ms ease forwards" }}>
            <StageLabel current={1} />
            <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 8, marginBottom: 16, color: "hsl(var(--text-primary))" }}>
              What happens if you get this wrong?
            </h2>
            <textarea
              ref={textareaRef}
              value={stakes}
              onChange={(e) => setStakes(e.target.value.slice(0, 500))}
              placeholder="e.g. We lose our market window, £3M sunk cost, board loses confidence in leadership..."
              rows={3}
              style={textareaStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = "hsl(var(--primary))"; e.currentTarget.style.boxShadow = "0 0 0 3px hsla(221, 83%, 53%, 0.12)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "hsl(var(--border))"; e.currentTarget.style.boxShadow = "none"; }}
            />
            <div className="flex items-center justify-between mt-1">
              <span style={{ fontSize: 11, color: "hsl(var(--text-tertiary))" }}>Write at least a sentence or two for best results</span>
              <span style={{ fontSize: 11, color: getCharCountColor(stakes.length), fontWeight: 500, transition: "color 0.2s ease" }}>{stakes.length}/500</span>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <button onClick={handleStakesSubmit} className="flex items-center justify-center gap-2 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" style={{ height: 44, paddingLeft: 20, paddingRight: 16, background: "hsl(var(--primary))", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "hsl(var(--primary-foreground))" }}>
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-6 group relative inline-block">
              <button onClick={handleSkip} className="transition-opacity duration-200 hover:underline" style={{ fontSize: 11, background: "none", border: "none", padding: 0, color: "hsl(var(--text-tertiary))" }}>
                Skip to instant audit →
              </button>
              <span className="absolute bottom-full left-0 mb-2 px-3 py-1.5 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap" style={{ background: "hsl(var(--text-primary))", color: "hsl(var(--background))" }}>
                Skip context questions for a faster but less personalised audit
              </span>
              <p className="mt-1" style={{ fontSize: 10, color: "hsl(var(--text-tertiary))" }}>Results will be less personalized</p>
            </div>
          </div>
        )}

        {/* STAGE 2 */}
        {stage === 2 && (
          <div key={`stage-${stageKey}`} style={{ animation: "slideInFromBottom 300ms ease forwards" }}>
            <StageLabel current={2} />
            <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 8, marginBottom: 16, color: "hsl(var(--text-primary))" }}>What kind of decision is this?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {decisionTypeOptions.map((opt) => (<SelectableCard key={opt.key} emoji={opt.emoji} label={opt.label} desc={opt.desc} selected={decisionType === opt.key} dimmed={decisionType !== null && decisionType !== opt.key} onClick={() => setDecisionType(opt.key)} />))}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: "hsl(var(--text-primary))" }}>Who gets affected if this goes sideways?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {blastRadiusOptions.map((opt) => (<SelectableCard key={opt.key} emoji={opt.emoji} label={opt.label} desc={opt.desc} selected={blastRadius === opt.key} dimmed={blastRadius !== null && blastRadius !== opt.key} onClick={() => setBlastRadius(opt.key)} />))}
            </div>
            <div className="mt-6">
              <button onClick={handleSkip} className="transition-opacity duration-200 hover:underline" style={{ fontSize: 11, background: "none", border: "none", padding: 0, color: "hsl(var(--text-tertiary))" }}>Skip to instant audit →</button>
              <p className="mt-1" style={{ fontSize: 10, color: "hsl(var(--text-tertiary))" }}>Results will be less personalized</p>
            </div>
          </div>
        )}

        {/* STAGE 3 */}
        {stage === 3 && (
          <div key={`stage-${stageKey}`} style={{ animation: "slideInFromBottom 300ms ease forwards" }}>
            <StageLabel current={3} />
            <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 8, marginBottom: 16, color: "hsl(var(--text-primary))" }}>What's the constraint that makes this hard?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {constraintOptions.map((opt) => (<SelectableCard key={opt.key} emoji={opt.emoji} label={opt.label} desc={opt.desc} selected={constraint === opt.key} dimmed={constraint !== null && constraint !== opt.key} onClick={() => setConstraint(opt.key)} />))}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: "hsl(var(--text-primary))" }}>If this decision goes perfectly, what does the world look like in 12 months?</h2>
            <textarea
              value={successVision}
              onChange={(e) => setSuccessVision(e.target.value.slice(0, 500))}
              placeholder="e.g. We've captured 15% market share, the new team is shipping weekly, board approved Series B..."
              rows={3}
              style={textareaStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = "hsl(var(--primary))"; e.currentTarget.style.boxShadow = "0 0 0 3px hsla(221, 83%, 53%, 0.12)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "hsl(var(--border))"; e.currentTarget.style.boxShadow = "none"; }}
            />
            <div className="flex items-center justify-between mt-1">
              <span style={{ fontSize: 11, color: "hsl(var(--text-tertiary))" }}>Write at least a sentence or two for best results</span>
              <span style={{ fontSize: 11, color: getCharCountColor(successVision.length), fontWeight: 500, transition: "color 0.2s ease" }}>{successVision.length}/500</span>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <button onClick={handleFinalSubmit} disabled={!constraint} className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" style={{ background: constraint ? "hsl(var(--primary))" : "hsla(221, 83%, 53%, 0.3)", cursor: constraint ? "pointer" : "not-allowed", fontSize: 15, border: "none", color: "hsl(var(--primary-foreground))" }}>
                Run Audit
              </button>
            </div>
            <div className="mt-6">
              <button onClick={handleSkip} className="transition-opacity duration-200 hover:underline" style={{ fontSize: 11, background: "none", border: "none", padding: 0, color: "hsl(var(--text-tertiary))" }}>Skip to instant audit →</button>
              <p className="mt-1" style={{ fontSize: 10, color: "hsl(var(--text-tertiary))" }}>Results will be less personalized</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
