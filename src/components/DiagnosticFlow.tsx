import { useState, useEffect, useRef } from "react";
import type { DiagnosticAnswers, FocusLens, DecisionScale } from "@/lib/types";
import { SignalMeter } from "./SignalMeter";
import { TypingIndicator } from "./TypingIndicator";
import { LivePromptPreview } from "./LivePromptPreview";
import { DepthIndicator } from "./DepthIndicator";
import { HeroSection } from "./HeroSection";
import { Check } from "lucide-react";

interface Props {
  onComplete: (answers: DiagnosticAnswers) => void;
  isLoading: boolean;
}

type Step = "q1-typing" | "q1" | "q2-typing" | "q2" | "q3-typing" | "q3" | "enrich-typing" | "enrich" | "reveal";

const AFTER_Q1 = ["q1", "q2-typing", "q2", "q3-typing", "q3", "enrich-typing", "enrich", "reveal"];
const PAST_Q1 = ["q2-typing", "q2", "q3-typing", "q3", "enrich-typing", "enrich", "reveal"];
const SHOW_Q2 = ["q2", "q3-typing", "q3", "enrich-typing", "enrich", "reveal"];
const PAST_Q2 = ["q3-typing", "q3", "enrich-typing", "enrich", "reveal"];
const SHOW_Q3 = ["q3", "enrich-typing", "enrich", "reveal"];
const PAST_Q3 = ["enrich-typing", "enrich", "reveal"];

const focusOptions: { key: FocusLens; letter: string; title: string; desc: string }[] = [
  { key: "risk", letter: "A", title: "Find every risk before I commit", desc: "Surface all failure modes, hidden downsides, and second-order consequences." },
  { key: "speed", letter: "B", title: "Move fast — give me the fastest validation test", desc: "Tell me the one experiment that validates or kills this in 30 days." },
  { key: "board", letter: "C", title: "Build the board-level case", desc: "Give me the strongest FOR and AGAINST, plus the question the board will ask." },
  { key: "confidence", letter: "D", title: "Challenge my thinking — I've already decided", desc: "Find the holes I'm not seeing. Be the voice of the board member who votes no." },
];

const scaleOptions: { key: DecisionScale; title: string; line1: string; line2: string }[] = [
  { key: "team", title: "TEAM", line1: "Low stakes · Reversible in weeks", line2: "A hire, a campaign, a test." },
  { key: "department", title: "DEPARTMENT", line1: "Moderate · Reversible in months", line2: "A process change, a partnership, a market test." },
  { key: "company", title: "COMPANY", line1: "High stakes · 1–2 year horizon", line2: "Expansion, funding, major restructure." },
  { key: "bet-the-company", title: "BET-THE-COMPANY", line1: "Company-shaping · Near-irreversible", line2: "Acquisition, major pivot, defining capital event." },
];

function getSignalLevel(len: number): number {
  if (len >= 320) return 5;
  if (len >= 200) return 4;
  if (len >= 120) return 3;
  if (len >= 60) return 2;
  if (len > 0) return 1;
  return 0;
}

export function DiagnosticFlow({ onComplete, isLoading }: Props) {
  const [step, setStep] = useState<Step>("q1-typing");
  const [decision, setDecision] = useState("");
  const [focus, setFocus] = useState<FocusLens | null>(null);
  const [scale, setScale] = useState<DecisionScale | null>(null);
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [constraint, setConstraint] = useState("");
  const [selectedQ2, setSelectedQ2] = useState<FocusLens | null>(null);
  const [selectedQ3, setSelectedQ3] = useState<DecisionScale | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    if (step === "q1-typing") {
      const t = setTimeout(() => setStep("q1"), 1100);
      return () => clearTimeout(t);
    }
  }, [step]);

  const handleQ1Submit = () => {
    if (decision.trim().length < 20) return;
    setStep("q2-typing");
    setTimeout(() => setStep("q2"), 1400);
  };

  const handleQ2Select = (f: FocusLens) => {
    setFocus(f);
    setSelectedQ2(f);
    setTimeout(() => {
      setStep("q3-typing");
      setTimeout(() => setStep("q3"), 1300);
    }, 450);
  };

  const handleQ3Select = (s: DecisionScale) => {
    setScale(s);
    setSelectedQ3(s);
    setTimeout(() => {
      setStep("enrich-typing");
      setTimeout(() => setStep("enrich"), 1200);
    }, 450);
  };

  const handleBuild = () => {
    if (!focus || !scale) return;
    setStep("reveal");
  };

  const depth = computeDepth();

  function computeDepth(): number {
    let d = 0;
    if (decision.trim().length >= 20) d++;
    if (focus) d++;
    if (scale) d++;
    if (budget.trim()) d++;
    if (timeline.trim()) d++;
    if (constraint.trim()) d++;
    return d;
  }

  const partialAnswers = {
    decision: decision.trim() || undefined,
    focus: focus || undefined,
    scale: scale || undefined,
    budget: budget.trim() || undefined,
    timeline: timeline.trim() || undefined,
    constraint: constraint.trim() || undefined,
  };

  const canContinue = decision.trim().length >= 20;

  if (step === "reveal") {
    return (
      <PromptRevealCollapsible
        answers={partialAnswers as DiagnosticAnswers}
        onDone={() => {
          onComplete({
            decision: decision.trim(),
            focus: focus!,
            scale: scale!,
            budget: budget.trim() || undefined,
            timeline: timeline.trim() || undefined,
            constraint: constraint.trim() || undefined,
          });
        }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <HeroSection />

      {/* Diagnostic chat */}
      <div className="w-full max-w-[640px] mx-auto px-4 sm:px-6 pb-16 space-y-6">
        {depth > 0 && (
          <div className="flex justify-center">
            <DepthIndicator depth={depth} />
          </div>
        )}

        <div className="space-y-6">
          {/* Q1 */}
          {step === "q1-typing" && (
            <div className="slide-in-step">
              <BotMessage>
                <TypingIndicator label="StratOS is thinking..." />
              </BotMessage>
            </div>
          )}

          {AFTER_Q1.includes(step) && (
            <div className="slide-in-step">
              <BotMessage>
                <p className="text-foreground font-body">What is the decision you need to make?</p>
              </BotMessage>

              {step === "q1" ? (
                <UserInputBlock>
                  <div className="flex items-center justify-between mb-2">
                    <SignalMeter level={getSignalLevel(decision.length)} />
                    <span className={`text-[9px] font-mono transition-colors ${decision.length >= 200 ? 'text-gold' : 'text-muted-foreground'}`}>
                      {decision.length}/600
                    </span>
                  </div>
                  <textarea
                    value={decision}
                    onChange={(e) => setDecision(e.target.value.slice(0, 600))}
                    placeholder="Be specific. The more context you share, the sharper the analysis. e.g. We're considering expanding into UAE in Q1 2026..."
                    className="stratos-textarea"
                  />
                  <style>{`
                    .stratos-textarea {
                      width: 100%;
                      min-height: 120px;
                      background: transparent;
                      border: 1px solid rgba(255,255,255,0.08);
                      border-radius: 8px;
                      padding: 20px;
                      color: hsl(0 0% 95%);
                      font-size: 14px;
                      resize: none;
                      font-family: var(--font-body);
                      box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
                      transition: border-color 0.3s ease, box-shadow 0.3s ease;
                      outline: none;
                    }
                    .stratos-textarea::placeholder {
                      color: rgba(240,237,232,0.4);
                      font-style: italic;
                    }
                    .stratos-textarea:focus {
                      border-color: rgba(255,184,0,0.5);
                      box-shadow: inset 0 2px 4px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,184,0,0.3), 0 0 20px rgba(255,184,0,0.08);
                    }
                  `}</style>
                  <p className="text-[10px] text-muted-foreground mt-2">🔒 Your answer stays private — never stored or shared</p>
                  <button
                    onClick={handleQ1Submit}
                    disabled={!canContinue}
                    className="w-full sm:w-auto sm:min-w-[200px] mt-3 font-body font-semibold uppercase tracking-[0.1em] text-[16px] rounded-lg transition-all duration-200 btn-press"
                    style={{
                      height: "52px",
                      backgroundColor: canContinue ? '#FFB800' : 'hsl(0 0% 15%)',
                      color: canContinue ? '#000' : 'hsl(0 0% 40%)',
                      opacity: canContinue ? 1 : 0.3,
                      cursor: canContinue ? 'pointer' : 'not-allowed',
                      boxShadow: canContinue ? '0 0 20px rgba(255,184,0,0.15)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (canContinue) {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 0 30px rgba(255,184,0,0.25)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      if (canContinue) {
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(255,184,0,0.15)';
                      }
                    }}
                  >
                    Continue
                  </button>
                </UserInputBlock>
              ) : PAST_Q1.includes(step) ? (
                <UserBubble>{decision}</UserBubble>
              ) : null}
            </div>
          )}

          {/* Q2 */}
          {step === "q2-typing" && (
            <div className="slide-in-step">
              <BotMessage>
                <TypingIndicator label="StratOS is thinking..." />
              </BotMessage>
            </div>
          )}

          {SHOW_Q2.includes(step) && (
            <div className="slide-in-step">
              <BotMessage>
                <p className="text-foreground font-body">What matters most to you right now?</p>
              </BotMessage>

              {step === "q2" ? (
                <div className="space-y-2">
                  {focusOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleQ2Select(opt.key)}
                      className="w-full text-left bg-card rounded-lg px-4 py-3 transition-all duration-200 group relative"
                      style={{
                        border: selectedQ2 === opt.key ? '1.5px solid #FFB800' : '1px solid hsl(0 0% 15%)',
                        transform: selectedQ2 === opt.key ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      {selectedQ2 === opt.key && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                          <Check className="w-3 h-3 text-background" />
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <span className="font-mono text-xs text-gold mt-0.5">{opt.letter}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground group-hover:text-gold transition-colors">{opt.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : PAST_Q2.includes(step) ? (
                <UserBubble>
                  {focusOptions.find((o) => o.key === focus)?.title || ""}
                </UserBubble>
              ) : null}
            </div>
          )}

          {/* Q3 */}
          {step === "q3-typing" && (
            <div className="slide-in-step">
              <BotMessage>
                <TypingIndicator label="StratOS is thinking..." />
              </BotMessage>
            </div>
          )}

          {SHOW_Q3.includes(step) && (
            <div className="slide-in-step">
              <BotMessage>
                <p className="text-foreground font-body">What is the scale of this decision?</p>
              </BotMessage>

              {step === "q3" ? (
                <div className="grid grid-cols-2 gap-2">
                  {scaleOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleQ3Select(opt.key)}
                      className="text-left bg-card rounded-lg px-3 py-3 transition-all duration-200 group relative"
                      style={{
                        border: selectedQ3 === opt.key ? '1.5px solid #FFB800' : '1px solid hsl(0 0% 15%)',
                        transform: selectedQ3 === opt.key ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      {selectedQ3 === opt.key && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-gold flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-background" />
                        </div>
                      )}
                      <p className="text-xs font-mono font-bold text-foreground group-hover:text-gold transition-colors">{opt.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{opt.line1}</p>
                      <p className="text-[10px] text-muted-foreground">{opt.line2}</p>
                    </button>
                  ))}
                </div>
              ) : PAST_Q3.includes(step) ? (
                <UserBubble>
                  {scaleOptions.find((o) => o.key === scale)?.title || ""}
                </UserBubble>
              ) : null}
            </div>
          )}

          {/* Enrichment */}
          {step === "enrich-typing" && (
            <div className="slide-in-step">
              <BotMessage>
                <TypingIndicator label="StratOS is thinking..." />
              </BotMessage>
            </div>
          )}

          {step === "enrich" && (
            <div className="slide-in-step">
              <BotMessage>
                <p className="text-foreground font-body text-sm">
                  Want a sharper analysis? Three optional details that make the prompt 10× more specific.
                </p>
              </BotMessage>

              <UserInputBlock>
                <div className="space-y-3">
                  <EnrichField
                    label="Budget or investment range"
                    placeholder="e.g. £150k initial, board approval needed over £500k"
                    value={budget}
                    onChange={setBudget}
                  />
                  <EnrichField
                    label="Decision timeline or deadline"
                    placeholder="e.g. Board decision needed by end of Q1 2026"
                    value={timeline}
                    onChange={setTimeline}
                  />
                  <EnrichField
                    label="Your biggest concern or constraint"
                    placeholder="e.g. Worried about regulatory complexity"
                    value={constraint}
                    onChange={setConstraint}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">
                  🔒 Everything stays in this session only
                </p>

                <LivePromptPreview answers={partialAnswers} />

                <button
                  onClick={handleBuild}
                  disabled={isLoading}
                  className="w-full mt-4 font-body font-bold uppercase tracking-[0.1em] text-[15px] rounded-lg disabled:opacity-40 transition-all duration-200 btn-press"
                  style={{
                    height: "52px",
                    background: "linear-gradient(135deg, #FFB800, #E5A600)",
                    color: "#000",
                    boxShadow: "0 0 20px rgba(255,184,0,0.15)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(255,184,0,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255,184,0,0.15)';
                  }}
                >
                  BUILD MY EXPERT PROMPT →
                </button>
              </UserInputBlock>
            </div>
          )}
        </div>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function BotMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 mb-3">
      <div className="shrink-0 w-6 h-6 rounded bg-gold/10 flex items-center justify-center">
        <span className="text-gold text-xs font-mono font-bold">S</span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="bg-secondary rounded-lg px-4 py-2 max-w-[85%]">
        <p className="text-sm text-foreground font-body">{children}</p>
      </div>
    </div>
  );
}

function UserInputBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      {children}
    </div>
  );
}

function EnrichField({ label, placeholder, value, onChange }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 200))}
        placeholder={placeholder}
        className="w-full mt-1 bg-background rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-300"
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,184,0,0.5)";
          e.currentTarget.style.boxShadow = "inset 0 1px 3px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,184,0,0.3)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          e.currentTarget.style.boxShadow = "inset 0 1px 3px rgba(0,0,0,0.2)";
        }}
      />
    </div>
  );
}

function PromptRevealCollapsible({ answers, onDone }: { answers: DiagnosticAnswers; onDone: () => void }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [fired, setFired] = useState(false);

  const focusLabels: Record<string, string> = {
    risk: "RISK · Downside-first analysis",
    speed: "SPEED · Fastest validation path",
    board: "BOARD · Stakeholder presentation case",
    confidence: "CONFIDENCE · Assumption stress-test",
  };

  const scaleLabels: Record<string, string> = {
    tactical: "TACTICAL decision · calibrated scrutiny",
    operational: "OPERATIONAL decision · balanced scrutiny",
    strategic: "STRATEGIC decision · full scrutiny applied",
    existential: "EXISTENTIAL decision · maximum scrutiny",
  };

  const lines = [
    `// StratOS prompt engine · ai.londonra.com · private session`,
    `ROLE      → McKinsey + VC + Board member + Risk Officer`,
    `DECISION  → "${answers.decision.slice(0, 50)}${answers.decision.length > 50 ? "..." : ""}"`,
    `LENS      → ${focusLabels[answers.focus]}`,
    `SCALE     → ${scaleLabels[answers.scale]}`,
    `RULES     → Brutally honest · Specific · No generic advice`,
    `FRAMES    → MECE · Devil's Advocate · Pre-Mortem · Stakeholder Map`,
    `STATUS    → Expert prompt assembled ✓`,
  ];

  useEffect(() => {
    if (showPrompt && visibleLines < lines.length) {
      const t = setTimeout(() => setVisibleLines((v) => v + 1), 240);
      return () => clearTimeout(t);
    }
  }, [showPrompt, visibleLines, lines.length]);

  // Auto-proceed after a short delay — execs don't need to see the prompt
  useEffect(() => {
    const t = setTimeout(() => {
      if (!fired) {
        setFired(true);
        onDone();
      }
    }, 2000);
    return () => clearTimeout(t);
  }, [fired, onDone]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[640px] text-center space-y-6">
        <p className="text-sm text-gold font-mono uppercase tracking-wider">Building your expert prompt...</p>
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-gold/40 border-t-gold animate-spin" />
        </div>

        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="text-xs font-mono text-muted-foreground hover:text-gold transition-colors"
        >
          {showPrompt ? "Hide prompt assembly ‹" : "View prompt assembly ›"}
        </button>

        {showPrompt && (
          <div className="bg-background border border-border rounded-lg p-6 font-mono text-xs text-left">
            <div className="space-y-1">
              {lines.slice(0, visibleLines).map((line, i) => (
                <div key={i} className={`${i === 0 ? "text-muted-foreground" : "text-foreground"} animate-fade-in`}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
