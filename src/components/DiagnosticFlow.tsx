import { useState, useEffect, useRef } from "react";
import type { DiagnosticAnswers, FocusLens, DecisionScale } from "@/lib/types";
import { SignalMeter } from "./SignalMeter";
import { TypingIndicator } from "./TypingIndicator";
import { LivePromptPreview } from "./LivePromptPreview";
import { DepthIndicator } from "./DepthIndicator";

interface Props {
  onComplete: (answers: DiagnosticAnswers) => void;
  isLoading: boolean;
}

type Step = "q1-typing" | "q1" | "q2-typing" | "q2" | "q3-typing" | "q3" | "enrich-typing" | "enrich" | "reveal";

const focusOptions: { key: FocusLens; letter: string; title: string; desc: string }[] = [
  { key: "risk", letter: "A", title: "Find every risk before I commit", desc: "Surface all failure modes, hidden downsides, and second-order consequences." },
  { key: "speed", letter: "B", title: "Move fast — give me the fastest validation test", desc: "Tell me the one experiment that validates or kills this in 30 days." },
  { key: "board", letter: "C", title: "Build the board-level case", desc: "Give me the strongest FOR and AGAINST, plus the question the board will ask." },
  { key: "confidence", letter: "D", title: "Challenge my thinking — I've already decided", desc: "Find the holes I'm not seeing. Be the voice of the board member who votes no." },
];

const scaleOptions: { key: DecisionScale; title: string; line1: string; line2: string }[] = [
  { key: "tactical", title: "TACTICAL", line1: "Low stakes · Reversible in weeks", line2: "A hire, a campaign, a test." },
  { key: "operational", title: "OPERATIONAL", line1: "Moderate · Reversible in months", line2: "A process change, a partnership, a market test." },
  { key: "strategic", title: "STRATEGIC", line1: "High stakes · 1–2 year horizon", line2: "Expansion, funding, major restructure." },
  { key: "existential", title: "EXISTENTIAL", line1: "Company-shaping · Near-irreversible", line2: "Acquisition, major pivot, defining capital event." },
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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [step]);

  // Step transitions with typing indicators
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
    setTimeout(() => {
      setStep("q3-typing");
      setTimeout(() => setStep("q3"), 1300);
    }, 450);
  };

  const handleQ3Select = (s: DecisionScale) => {
    setScale(s);
    setTimeout(() => {
      setStep("enrich-typing");
      setTimeout(() => setStep("enrich"), 1200);
    }, 450);
  };

  const handleBuild = () => {
    if (!focus || !scale) return;
    setStep("reveal");
    // After reveal animation, trigger completion
    setTimeout(() => {
      onComplete({
        decision: decision.trim(),
        focus,
        scale,
        budget: budget.trim() || undefined,
        timeline: timeline.trim() || undefined,
        constraint: constraint.trim() || undefined,
      });
    }, 3500);
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

  if (step === "reveal") {
    return <PromptReveal answers={partialAnswers as DiagnosticAnswers} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 sm:px-6 pt-20 pb-12">
      <div className="w-full max-w-2xl space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2 mb-6">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-body">
            London Royal Academy
          </p>
          <h2 className="text-sm font-medium tracking-wide text-gold">StratOS Lite</h2>
          {depth > 0 && (
            <div className="flex justify-center pt-2">
              <DepthIndicator depth={depth} />
            </div>
          )}
        </div>

        {/* Chat thread */}
        <div className="space-y-5">
          {/* Q1 */}
          {step === "q1-typing" && (
            <BotMessage>
              <TypingIndicator label="StratOS is thinking..." />
            </BotMessage>
          )}

          {step >= "q1" && step !== "q1-typing" && (
            <>
              <BotMessage>
                <p className="text-foreground font-body">What is the decision you need to make?</p>
              </BotMessage>

              {step === "q1" ? (
                <UserInputBlock>
                  <div className="flex items-center justify-between mb-2">
                    <SignalMeter level={getSignalLevel(decision.length)} />
                    <span className="text-[10px] font-mono text-muted-foreground">{decision.length}/600</span>
                  </div>
                  <textarea
                    value={decision}
                    onChange={(e) => setDecision(e.target.value.slice(0, 600))}
                    placeholder="Be specific. The more context you share, the sharper the analysis. e.g. We're considering expanding into UAE in Q1 2026. We've done desk research but haven't spoken to customers yet. Investment is around £150k..."
                    className="w-full min-h-[120px] bg-transparent border-0 text-foreground placeholder:text-muted-foreground font-body text-sm resize-none focus:outline-none"
                  />
                  <p className="text-[10px] text-muted-foreground mt-2">🔒 Your answer stays private — never stored or shared</p>
                  <button
                    onClick={handleQ1Submit}
                    disabled={decision.trim().length < 20}
                    className="w-full mt-3 bg-gold text-accent-foreground font-body font-semibold text-sm py-2.5 rounded-lg hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                  >
                    Continue
                  </button>
                </UserInputBlock>
              ) : (
                <UserBubble>{decision}</UserBubble>
              )}
            </>
          )}

          {/* Q2 */}
          {step === "q2-typing" && (
            <BotMessage>
              <TypingIndicator label="StratOS is thinking..." />
            </BotMessage>
          )}

          {(step >= "q2" && step !== "q2-typing" && step !== "q1-typing" && step !== "q1") && (
            <>
              <BotMessage>
                <p className="text-foreground font-body">What matters most to you right now?</p>
              </BotMessage>

              {step === "q2" ? (
                <div className="space-y-2">
                  {focusOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleQ2Select(opt.key)}
                      className="w-full text-left bg-card border border-border rounded-lg px-4 py-3 hover:border-gold transition-colors group"
                    >
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
              ) : (
                <UserBubble>
                  {focusOptions.find((o) => o.key === focus)?.title || ""}
                </UserBubble>
              )}
            </>
          )}

          {/* Q3 */}
          {step === "q3-typing" && (
            <BotMessage>
              <TypingIndicator label="StratOS is thinking..." />
            </BotMessage>
          )}

          {(step >= "q3" && step !== "q3-typing" && !["q1-typing","q1","q2-typing","q2"].includes(step)) && (
            <>
              <BotMessage>
                <p className="text-foreground font-body">What is the scale of this decision?</p>
              </BotMessage>

              {step === "q3" ? (
                <div className="grid grid-cols-2 gap-2">
                  {scaleOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleQ3Select(opt.key)}
                      className="text-left bg-card border border-border rounded-lg px-3 py-3 hover:border-gold transition-colors group"
                    >
                      <p className="text-xs font-mono font-bold text-foreground group-hover:text-gold transition-colors">{opt.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{opt.line1}</p>
                      <p className="text-[10px] text-muted-foreground">{opt.line2}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <UserBubble>
                  {scaleOptions.find((o) => o.key === scale)?.title || ""}
                </UserBubble>
              )}
            </>
          )}

          {/* Enrichment */}
          {step === "enrich-typing" && (
            <BotMessage>
              <TypingIndicator label="StratOS is thinking..." />
            </BotMessage>
          )}

          {step === "enrich" && (
            <>
              <BotMessage>
                <p className="text-foreground font-body text-sm">
                  Want a sharper analysis? Three optional details that make the prompt 10× more specific. Each one you add is woven directly into the expert prompt.
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
                    placeholder="e.g. We're worried about regulatory complexity and finding the right local partner"
                    value={constraint}
                    onChange={setConstraint}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">
                  🔒 Everything you add stays in this session only — never stored, never shared, not even with us
                </p>

                <LivePromptPreview answers={partialAnswers} />

                <button
                  onClick={handleBuild}
                  disabled={isLoading}
                  className="w-full mt-4 bg-gold text-accent-foreground font-body font-semibold text-sm py-3 rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  BUILD MY EXPERT PROMPT →
                </button>
              </UserInputBlock>
            </>
          )}
        </div>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function BotMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
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
    <div className="bg-card border border-border rounded-lg p-4">
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
        className="w-full mt-1 bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
      />
    </div>
  );
}

// Prompt reveal animation
function PromptReveal({ answers }: { answers: DiagnosticAnswers }) {
  const [visibleLines, setVisibleLines] = useState(0);

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

  const enrichCount = [answers.budget, answers.timeline, answers.constraint].filter(Boolean).length;
  const charCount = answers.decision.length + (answers.budget?.length || 0) + (answers.timeline?.length || 0) + (answers.constraint?.length || 0);

  const lines = [
    `// StratOS prompt engine · ai.londonra.com · private session`,
    `ROLE      → McKinsey + VC + Board member + Risk Officer`,
    `DECISION  → "${answers.decision.slice(0, 50)}${answers.decision.length > 50 ? "..." : ""}"`,
    `LENS      → ${focusLabels[answers.focus]}`,
    `SCALE     → ${scaleLabels[answers.scale]}`,
    `ENRICH    → ${enrichCount} context signal${enrichCount !== 1 ? "s" : ""} woven into prompt`,
    `RULES     → Brutally honest · Specific · No generic advice`,
    `FRAMES    → MECE · Devil's Advocate · Pre-Mortem · Stakeholder Map`,
    `PRIVACY   → Session only · Zero retention · Board-safe ✓`,
    `STATUS    → Expert prompt assembled (${charCount} chars) ✓`,
  ];

  const lensInsights: Record<string, string> = {
    risk: "Risk-first lens active. Every failure mode will be named. The devil's argument will be the strongest case against, not a strawman.",
    speed: "Speed lens active. The 30-day test is the centrepiece. One specific experiment with defined success criteria.",
    board: "Board lens active. The output is structured for stakeholder presentation. The 'Better Question' is the one your board will ask that you haven't answered.",
    confidence: "Stress-test lens active. Every assumption in your framing will be named and challenged.",
  };

  useEffect(() => {
    if (visibleLines < lines.length) {
      const t = setTimeout(() => setVisibleLines((v) => v + 1), 240);
      return () => clearTimeout(t);
    }
  }, [visibleLines, lines.length]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="bg-background border border-border rounded-lg p-6 font-mono text-xs">
          <div className="space-y-1">
            {lines.slice(0, visibleLines).map((line, i) => (
              <div key={i} className={`${i === 0 ? "text-muted-foreground" : "text-foreground"} animate-fade-in`}>
                {line}
              </div>
            ))}
          </div>

          {visibleLines >= lines.length && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="text-xs text-gold font-body italic">
                {lensInsights[answers.focus]}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
