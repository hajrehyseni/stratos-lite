import { useState, useEffect, useRef, useCallback } from "react";
import { Check, ArrowLeft, ArrowRight, CornerDownLeft, Mic, MicOff } from "lucide-react";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { toast } from "@/hooks/use-toast";

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

const decisionTypeOptions = [
  { key: "investment", emoji: "💰", label: "Investment" },
  { key: "growth", emoji: "🚀", label: "Growth" },
  { key: "risk", emoji: "⚠️", label: "Risk / Crisis" },
  { key: "people", emoji: "👥", label: "People / Org" },
];

const blastRadiusOptions = [
  { key: "team", emoji: "🎯", label: "My team" },
  { key: "department", emoji: "🏢", label: "My department" },
  { key: "company", emoji: "🏛️", label: "The whole company" },
  { key: "bet-the-company", emoji: "🌍", label: "Bet-the-company" },
];

const constraintOptions = [
  { key: "time", emoji: "⏰", label: "Time pressure" },
  { key: "budget", emoji: "💷", label: "Budget ceiling" },
  { key: "politics", emoji: "🏛️", label: "Political complexity" },
  { key: "data", emoji: "📊", label: "Incomplete data" },
];

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

function charColor(len: number) {
  if (len < 50) return "hsl(var(--text-tertiary))";
  if (len <= 400) return "hsl(var(--success))";
  return "hsl(var(--warning))";
}

function OptionCard({ emoji, label, selected, hasSelection, onClick }: {
  emoji: string; label: string; selected: boolean; hasSelection: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left relative w-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      style={{
        padding: "16px 20px",
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
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--primary))", animation: "typeform-check-pop 250ms ease" }}>
          <Check className="w-3.5 h-3.5" style={{ color: "hsl(var(--primary-foreground))" }} />
        </div>
      )}
      <span className="text-xl">{emoji}</span>
      <p className="mt-2 text-base font-semibold" style={{ color: "hsl(var(--text-primary))" }}>{label}</p>
    </button>
  );
}

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

  const voice = useVoiceInput();

  // Append voice transcript to the active text field
  useEffect(() => {
    if (!voice.transcript) return;
    if (step === 1) {
      setStakes((prev) => {
        const joined = prev ? prev + " " + voice.transcript : voice.transcript;
        return joined.slice(0, 500);
      });
    } else if (step === 5) {
      setSuccessVision((prev) => {
        const joined = prev ? prev + " " + voice.transcript : voice.transcript;
        return joined.slice(0, 500);
      });
    }
    voice.resetTranscript();
  }, [voice.transcript]);

  const toggleVoice = () => {
    if (!voice.isSupported) {
      toast({ title: "Voice input not supported", description: "Try Chrome, Safari, or Edge.", variant: "destructive" });
      return;
    }
    if (voice.isListening) {
      voice.stopListening();
    } else {
      voice.startListening();
    }
  };

  useEffect(() => {
    saveSession({ step, stakes, decisionType, blastRadius, constraint, successVision });
  }, [step, stakes, decisionType, blastRadius, constraint, successVision]);

  useEffect(() => {
    if ((step === 1 || step === 5) && textareaRef.current && !animating) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [step, animating]);

  const goTo = useCallback((nextStep: number) => {
    if (animating) return;
    setAnimating(true);
    setSlideDir("out");
    setTimeout(() => {
      setStep(nextStep);
      setSlideDir("in");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setAnimating(false), 250);
    }, 200);
  }, [animating]);

  const selectAndAdvance = useCallback((setter: (v: string) => void, value: string, nextStep: number) => {
    setter(value);
    setTimeout(() => goTo(nextStep), 350);
  }, [goTo]);

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
    if (step === 1 && onBackToLanding) { clearDiagnosticSession(); onBackToLanding(); }
    else if (step > 1) { goTo(step - 1); }
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
      {/* Thin progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5" style={{ background: "hsla(221, 83%, 53%, 0.1)" }}>
        <div className="h-full rounded-r-full transition-all duration-500 ease-out" style={{ width: `${progress}%`, background: "hsl(var(--primary))" }} />
      </div>

      {/* Top bar with dot indicators */}
      <div className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-8 py-4">
        <button onClick={handleBack} className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-70" style={{ color: "hsl(var(--text-secondary))", background: "none", border: "none" }}>
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span key={i} className="rounded-full transition-all duration-300" style={{
              width: i + 1 === step ? 12 : 6,
              height: 6,
              background: i + 1 <= step ? "hsl(var(--primary))" : "hsl(var(--border))",
            }} />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-16 sm:py-20">
        <div className={`w-full ${screenClass}`} style={{ maxWidth: 580 }}>
          {/* Decision reminder pill */}
          <div className="mb-8">
            <span className="inline-block text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: "hsla(221, 83%, 53%, 0.08)", color: "hsl(var(--primary))", letterSpacing: "0.5px" }}>
              {decision.length > (window.innerWidth < 640 ? 40 : 60) ? decision.slice(0, window.innerWidth < 640 ? 37 : 57) + "…" : decision}
            </span>
          </div>

          {/* STEP 1: Stakes */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.2 }}>
                What happens if you get this wrong?
              </h1>
              <textarea
                ref={textareaRef}
                value={stakes}
                onChange={(e) => setStakes(e.target.value.slice(0, 500))}
                placeholder="e.g. We lose our market window, £3M sunk cost, board loses confidence..."
                className="typeform-textarea text-base"
                rows={3}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>A sentence or two</span>
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-all ${voice.isListening ? "shazam-pulse" : ""}`}
                    style={{ background: voice.isListening ? "hsl(var(--primary))" : "hsl(var(--secondary))", color: voice.isListening ? "hsl(var(--primary-foreground))" : "hsl(var(--text-secondary))" }}
                    title={voice.isListening ? "Stop listening" : "Dictate"}
                  >
                    {voice.isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-xs font-medium" style={{ color: charColor(stakes.length) }}>{stakes.length}/500</span>
              </div>
              <div className="flex items-center gap-3 mt-8">
                <button onClick={() => goTo(2)} disabled={stakes.length === 0} className="typeform-cta group" style={{ opacity: stakes.length === 0 ? 0.4 : 1, cursor: stakes.length === 0 ? "not-allowed" : "pointer" }}>
                  Next <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <span className="text-xs flex items-center gap-1" style={{ color: "hsl(var(--text-tertiary))" }}>
                  press <CornerDownLeft className="w-3 h-3" /> Enter
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: Decision Type */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-8" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.2 }}>
                What kind of decision is this?
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {decisionTypeOptions.map((opt) => (
                  <OptionCard key={opt.key} emoji={opt.emoji} label={opt.label} selected={decisionType === opt.key} hasSelection={decisionType !== null} onClick={() => selectAndAdvance(setDecisionType, opt.key, 3)} />
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Blast Radius */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-8" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.2 }}>
                Who gets affected?
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {blastRadiusOptions.map((opt) => (
                  <OptionCard key={opt.key} emoji={opt.emoji} label={opt.label} selected={blastRadius === opt.key} hasSelection={blastRadius !== null} onClick={() => selectAndAdvance(setBlastRadius, opt.key, 4)} />
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Constraint */}
          {step === 4 && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-8" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.2 }}>
                What makes this hard?
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {constraintOptions.map((opt) => (
                  <OptionCard key={opt.key} emoji={opt.emoji} label={opt.label} selected={constraint === opt.key} hasSelection={constraint !== null} onClick={() => selectAndAdvance(setConstraint, opt.key, 5)} />
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Success Vision */}
          {step === 5 && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.2 }}>
                If this goes perfectly, what does 12 months look like?
              </h1>
              <textarea
                ref={textareaRef}
                value={successVision}
                onChange={(e) => setSuccessVision(e.target.value.slice(0, 500))}
                placeholder="e.g. 15% market share, new team shipping weekly, Series B approved..."
                className="typeform-textarea text-base"
                rows={3}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>Optional — sharpens the audit</span>
                <span className="text-xs font-medium" style={{ color: charColor(successVision.length) }}>{successVision.length}/500</span>
              </div>
              <div className="flex items-center gap-3 mt-8">
                <button onClick={handleFinalSubmit} className="typeform-cta-primary group w-full sm:w-auto" style={{ minHeight: 56 }}>
                  Run Audit <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <span className="hidden sm:flex text-xs items-center gap-1" style={{ color: "hsl(var(--text-tertiary))" }}>
                  press <CornerDownLeft className="w-3 h-3" /> Enter
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
