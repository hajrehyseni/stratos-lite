import { useState, useEffect, useRef, useCallback } from "react";
import { Check, ArrowLeft, ArrowRight, CornerDownLeft } from "lucide-react";

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

const TOTAL_STEPS = 5;

/* ─── Option data ─── */
const decisionTypeOptions = [
  { key: "investment", emoji: "💰", label: "Investment", desc: "Spend money now for future returns" },
  { key: "growth", emoji: "🚀", label: "Growth", desc: "Enter new markets, launch products, scale up" },
  { key: "risk", emoji: "⚠️", label: "Risk / Crisis", desc: "Something's gone wrong or might go wrong" },
  { key: "people", emoji: "👥", label: "People / Org", desc: "Hiring, firing, restructuring, culture" },
];

const blastRadiusOptions = [
  { key: "team", emoji: "🎯", label: "My team", desc: "5–15 people, contained impact" },
  { key: "department", emoji: "🏢", label: "My department", desc: "50–200 people, budget implications" },
  { key: "company", emoji: "🏛️", label: "The whole company", desc: "Revenue, strategy, or culture shift" },
  { key: "bet-the-company", emoji: "🌍", label: "Bet-the-company", desc: "Existential: we win big or we're done" },
];

const constraintOptions = [
  { key: "time", emoji: "⏰", label: "Time pressure", desc: "Decision needed within days or weeks" },
  { key: "budget", emoji: "💷", label: "Budget ceiling", desc: "Limited funds, need ROI justification" },
  { key: "politics", emoji: "🏛️", label: "Political complexity", desc: "Multiple stakeholders with competing interests" },
  { key: "data", emoji: "📊", label: "Incomplete data", desc: "Deciding with 60% of the picture" },
];

/* ─── Session persistence ─── */
interface SessionState {
  step: number;
  stakes: string;
  decisionType: string | null;
  blastRadius: string | null;
  constraint: string | null;
  successVision: string;
}

function saveSession(data: SessionState) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch {}
}
function loadSession(): SessionState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function clearDiagnosticSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
}

/* ─── Helpers ─── */
function charColor(len: number) {
  if (len < 50) return "hsl(var(--text-tertiary))";
  if (len <= 400) return "hsl(var(--success))";
  return "hsl(var(--warning))";
}

/* ─── Card component ─── */
function OptionCard({
  emoji, label, desc, selected, hasSelection, onClick,
}: {
  emoji: string; label: string; desc: string; selected: boolean; hasSelection: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left relative w-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      style={{
        padding: window.innerWidth < 640 ? "16px 20px" : "20px 24px",
        borderRadius: 14,
        background: selected ? "hsla(221, 83%, 53%, 0.06)" : "hsl(var(--secondary))",
        border: selected ? "2px solid hsl(var(--primary))" : "1.5px solid hsl(var(--border))",
        opacity: hasSelection && !selected ? 0.4 : 1,
        transform: selected ? "scale(1.02)" : "scale(1)",
        cursor: "pointer",
        minHeight: 56,
      }}
    >
      {selected && (
        <div
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: "hsl(var(--primary))", animation: "typeform-check-pop 300ms ease" }}
        >
          <Check className="w-3.5 h-3.5" style={{ color: "hsl(var(--primary-foreground))" }} />
        </div>
      )}
      <span className="text-xl sm:text-2xl">{emoji}</span>
      <p className="mt-2 text-base font-semibold" style={{ color: "hsl(var(--text-primary))" }}>{label}</p>
      <p className="mt-1 text-sm" style={{ color: "hsl(var(--text-secondary))" }}>{desc}</p>
    </button>
  );
}

/* ─── Main component ─── */
export function NewDiagnosticFlow({ decision, onComplete, onSkip, onBackToLanding }: Props) {
  const saved = loadSession();
  const [step, setStep] = useState(saved?.step ?? 1);
  const [stakes, setStakes] = useState(saved?.stakes ?? "");
  const [decisionType, setDecisionType] = useState<string | null>(saved?.decisionType ?? null);
  const [blastRadius, setBlastRadius] = useState<string | null>(saved?.blastRadius ?? null);
  const [constraint, setConstraint] = useState<string | null>(saved?.constraint ?? null);
  const [successVision, setSuccessVision] = useState(saved?.successVision ?? "");

  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState<"in" | "out">("in");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Persist
  useEffect(() => {
    saveSession({ step, stakes, decisionType, blastRadius, constraint, successVision });
  }, [step, stakes, decisionType, blastRadius, constraint, successVision]);

  // Auto-focus textareas
  useEffect(() => {
    if ((step === 1 || step === 5) && textareaRef.current && !animating) {
      setTimeout(() => textareaRef.current?.focus(), 350);
    }
  }, [step, animating]);

  // Transition helper
  const goTo = useCallback((nextStep: number) => {
    if (animating) return;
    setAnimating(true);
    setSlideDir("out");
    setTimeout(() => {
      setStep(nextStep);
      setSlideDir("in");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setAnimating(false), 400);
    }, 250);
  }, [animating]);

  // Card auto-advance
  const selectAndAdvance = useCallback((setter: (v: string) => void, value: string, nextStep: number) => {
    setter(value);
    setTimeout(() => goTo(nextStep), 500);
  }, [goTo]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        if (step === 1 && stakes.length > 0) { e.preventDefault(); goTo(2); }
        if (step === 5) { e.preventDefault(); handleFinalSubmit(); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, stakes, constraint, goTo]);

  const handleBack = () => {
    if (step === 1 && onBackToLanding) {
      clearDiagnosticSession();
      onBackToLanding();
    } else if (step > 1) {
      goTo(step - 1);
    }
  };

  const handleSkip = () => {
    clearDiagnosticSession();
    onSkip();
  };

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

  const progress = (step / TOTAL_STEPS) * 100;

  const screenClass = `typeform-screen-${slideDir}`;

  return (
    <div ref={containerRef} className="relative min-h-screen flex flex-col">
      {/* Fixed progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-border/40">
        <div
          className="h-full rounded-r-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, background: "hsl(var(--primary))" }}
        />
      </div>

      {/* Fixed top bar */}
      <div className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-8 py-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-70"
          style={{ color: "hsl(var(--text-secondary))", background: "none", border: "none" }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <span className="text-xs font-medium" style={{ color: "hsl(var(--text-tertiary))" }}>
          {step} of {TOTAL_STEPS}
        </span>
      </div>

      {/* Main content — vertically centered */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-16 sm:py-24">
        <div className={`w-full ${screenClass}`} style={{ maxWidth: 580 }}>
          {/* Decision reminder pill */}
          <div className="mb-8">
            <span
              className="inline-block text-xs font-medium px-3 py-1.5 rounded-full"
              style={{
                background: "hsla(221, 83%, 53%, 0.08)",
                color: "hsl(var(--primary))",
                letterSpacing: "0.5px",
              }}
            >
              {decision.length > (window.innerWidth < 640 ? 40 : 60) ? decision.slice(0, window.innerWidth < 640 ? 37 : 57) + "…" : decision}
            </span>
          </div>

          {/* ─── STEP 1: Stakes ─── */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.2 }}>
                What happens if you get this wrong?
              </h1>
              <p className="text-sm mb-6" style={{ color: "hsl(var(--text-secondary))" }}>
                Worst case — money, trust, opportunities.
              </p>
              <textarea
                ref={textareaRef}
                value={stakes}
                onChange={(e) => setStakes(e.target.value.slice(0, 500))}
                placeholder="e.g. We lose our market window, £3M sunk cost, board loses confidence in leadership..."
                rows={4}
               className="typeform-textarea text-base"
                rows={window.innerWidth < 640 ? 3 : 4}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>
                  A sentence or two gives the best results
                </span>
                <span
                  className="text-xs font-medium transition-colors duration-200"
                  style={{ color: charColor(stakes.length) }}
                >
                  {stakes.length}/500
                </span>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <button
                  onClick={() => goTo(2)}
                  disabled={stakes.length === 0}
                  className="typeform-cta group"
                  style={{
                    opacity: stakes.length === 0 ? 0.4 : 1,
                    cursor: stakes.length === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  Next
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <span className="text-xs flex items-center gap-1" style={{ color: "hsl(var(--text-tertiary))" }}>
                  press <CornerDownLeft className="w-3 h-3" /> Enter
                </span>
              </div>

              <div className="mt-10">
                <button
                  onClick={handleSkip}
                  className="text-xs transition-opacity hover:underline"
                  style={{ color: "hsl(var(--text-tertiary))", background: "none", border: "none", padding: 0 }}
                >
                  Skip to instant audit →
                </button>
                <p className="text-[10px] mt-1" style={{ color: "hsl(var(--text-faint))" }}>
                  Faster, but less personalised results
                </p>
              </div>
            </div>
          )}

          {/* ─── STEP 2: Decision Type ─── */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.2 }}>
                What kind of decision is this?
              </h1>
              <p className="text-sm mb-8" style={{ color: "hsl(var(--text-secondary))" }}>
                This helps us apply the right strategic framework.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {decisionTypeOptions.map((opt) => (
                  <OptionCard
                    key={opt.key}
                    emoji={opt.emoji}
                    label={opt.label}
                    desc={opt.desc}
                    selected={decisionType === opt.key}
                    hasSelection={decisionType !== null}
                    onClick={() => selectAndAdvance(setDecisionType, opt.key, 3)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ─── STEP 3: Blast Radius ─── */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.2 }}>
                Who gets affected if this goes sideways?
              </h1>
              <p className="text-sm mb-8" style={{ color: "hsl(var(--text-secondary))" }}>
                The blast radius shapes how deep we go in our analysis.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {blastRadiusOptions.map((opt) => (
                  <OptionCard
                    key={opt.key}
                    emoji={opt.emoji}
                    label={opt.label}
                    desc={opt.desc}
                    selected={blastRadius === opt.key}
                    hasSelection={blastRadius !== null}
                    onClick={() => selectAndAdvance(setBlastRadius, opt.key, 4)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ─── STEP 4: Constraint ─── */}
          {step === 4 && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.2 }}>
                What's the constraint that makes this hard?
              </h1>
              <p className="text-sm mb-8" style={{ color: "hsl(var(--text-secondary))" }}>
                Every great decision has a limiting factor. What's yours?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {constraintOptions.map((opt) => (
                  <OptionCard
                    key={opt.key}
                    emoji={opt.emoji}
                    label={opt.label}
                    desc={opt.desc}
                    selected={constraint === opt.key}
                    hasSelection={constraint !== null}
                    onClick={() => selectAndAdvance(setConstraint, opt.key, 5)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ─── STEP 5: Success Vision ─── */}
          {step === 5 && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.2 }}>
                If this goes perfectly, what does the world look like in 12 months?
              </h1>
              <p className="text-sm mb-6" style={{ color: "hsl(var(--text-secondary))" }}>
                This anchors your audit to your definition of success.
              </p>
              <textarea
                ref={textareaRef}
                value={successVision}
                onChange={(e) => setSuccessVision(e.target.value.slice(0, 500))}
                placeholder="e.g. We've captured 15% market share, the new team is shipping weekly, board approved Series B..."
                rows={4}
               className="typeform-textarea text-base"
                rows={window.innerWidth < 640 ? 3 : 4}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>
                  Optional — but it sharpens the audit significantly
                </span>
                <span
                  className="text-xs font-medium transition-colors duration-200"
                  style={{ color: charColor(successVision.length) }}
                >
                  {successVision.length}/500
                </span>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <button
                  onClick={handleFinalSubmit}
                  className="typeform-cta-primary group w-full sm:w-auto"
                  style={{ minHeight: 56 }}
                >
                  Run Audit
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <span className="text-xs flex items-center gap-1" style={{ color: "hsl(var(--text-tertiary))" }}>
                  press <CornerDownLeft className="w-3 h-3" /> Enter
                </span>
              </div>

              <p className="text-xs mt-6" style={{ color: "hsl(var(--text-faint))" }}>
                Powering your audit: McKinsey 7S · SODA · RAPID · Cynefin · Pre-Mortem
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
