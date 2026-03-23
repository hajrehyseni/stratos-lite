import { useState, useRef, useEffect } from "react";
import { ArrowRight, Mic, MicOff } from "lucide-react";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { toast } from "sonner";
import { TrustStrip } from "@/components/TrustStrip";
import { SystemSections } from "@/components/SystemSections";
import { OutputPreview } from "@/components/OutputPreview";
import { MidPageCTA } from "@/components/MidPageCTA";
import { TestimonialWall } from "@/components/TestimonialWall";
import { FAQAccordion } from "@/components/FAQAccordion";
import { Footer } from "@/components/Footer";

interface Props {
  onSubmit: (decision: string) => void;
  remainingAudits?: number;
  hasUsedAudit?: boolean;
}

const placeholders = [
  "Should we acquire CompetitorX?",
  "Should I restructure my leadership team?",
  "Should we pivot to enterprise?",
];

export function HomepageLanding({ onSubmit, remainingAudits, hasUsedAudit }: Props) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [shake, setShake] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  const [showError, setShowError] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const canSubmit = value.trim().length >= 10;
  const voice = useVoiceInput();

  useEffect(() => {
    if (voice.transcript) {
      setValue(voice.transcript);
      setHasTyped(true);
      voice.resetTranscript();
      inputRef.current?.focus();
    }
  }, [voice.transcript]);

  const handleMic = () => {
    if (!voice.isSupported) {
      toast.error("Voice input not supported in this browser");
      return;
    }
    if (voice.isListening) voice.stopListening();
    else voice.startListening();
  };

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (value.length > 0) return;
    const iv = setInterval(() => setPlaceholderIdx(p => (p + 1) % placeholders.length), 3000);
    return () => clearInterval(iv);
  }, [value]);

  const handleSubmit = () => {
    if (canSubmit) { setShowError(false); onSubmit(value.trim()); }
    else { setShake(true); setShowError(true); setTimeout(() => setShake(false), 600); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); handleSubmit(); } };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    if (!hasTyped && newVal.length > 0) { setHasTyped(true); submitRef.current?.classList.add("pulse-once"); setTimeout(() => submitRef.current?.classList.remove("pulse-once"), 400); }
    setValue(newVal);
  };

  const currentPlaceholder = `e.g. ${placeholders[placeholderIdx]}`;

  return (
    <div className="flex flex-col page-enter">
      {/* Hero — Apple clean white */}
      <div className="relative flex flex-col items-center px-4 sm:px-6 pt-32 sm:pt-40 pb-12 md:pb-16" style={{ justifyContent: "center" }}>
        <div className="w-full flex flex-col items-center relative z-10" style={{ maxWidth: 1120 }}>
          <h1
            className="text-center text-5xl sm:text-6xl lg:text-7xl font-bold"
            style={{
              lineHeight: 1.06, letterSpacing: "-0.04em",
              color: "hsl(var(--text-primary))", maxWidth: 640,
              opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 400ms ease-out, transform 400ms ease-out",
            }}
          >
            Audit any decision.
          </h1>

          {/* Input */}
          <div className="w-full" style={{ maxWidth: 560, marginTop: 24, opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(14px)", transition: "opacity 400ms ease-out 150ms, transform 400ms ease-out 150ms" }}>
            {/* Desktop */}
            <div className="hidden sm:block">
              <div className={`relative flex items-center ${shake ? "input-shake" : ""}`} style={{
                height: 56, borderRadius: 12, background: "hsl(var(--background))",
                border: shake ? "1px solid hsl(var(--destructive))" : isFocused ? "1px solid hsl(var(--text-tertiary))" : "1px solid hsl(var(--border))",
                boxShadow: isFocused ? "0 0 0 3px hsla(0, 0%, 0%, 0.06)" : "0 1px 3px hsla(0, 0%, 0%, 0.04)",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease", paddingLeft: 20, paddingRight: 6,
              }}>
                <label htmlFor="hero-input" className="sr-only">Describe your decision</label>
                <input ref={inputRef} id="hero-input" type="text" value={value} onChange={handleChange} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} onKeyDown={handleKeyDown} placeholder={currentPlaceholder} className="w-full bg-transparent outline-none" style={{ fontSize: 16, fontWeight: 400, color: "hsl(var(--text-primary))", height: 48 }} />
                <button onClick={handleMic} className={`flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-200 ${voice.isListening ? "shazam-pulse" : ""}`} style={{ width: 36, height: 36, background: voice.isListening ? "hsla(0, 84%, 50%, 0.08)" : "transparent", color: voice.isListening ? "hsl(var(--destructive))" : "hsl(var(--text-faint))" }} aria-label={voice.isListening ? "Stop listening" : "Voice input"}>
                  {voice.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button ref={submitRef} onClick={handleSubmit} disabled={!canSubmit} className="flex-shrink-0 flex items-center justify-center gap-2 rounded-lg transition-all duration-200 hover:opacity-85 active:scale-[0.98]" style={{ height: 44, paddingLeft: 20, paddingRight: 16, background: canSubmit ? "hsl(var(--primary))" : "hsl(var(--border))", opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? "pointer" : "default", color: canSubmit ? "hsl(var(--primary-foreground))" : "hsl(var(--text-faint))", fontSize: 15, fontWeight: 600, borderRadius: 10 }} aria-label="Audit this decision">
                  Audit <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Mobile */}
            <div className="sm:hidden flex flex-col gap-3">
              <div className={`relative flex items-center ${shake ? "input-shake" : ""}`} style={{
                height: 52, borderRadius: 12, background: "hsl(var(--background))",
                border: shake ? "1px solid hsl(var(--destructive))" : isFocused ? "1px solid hsl(var(--text-tertiary))" : "1px solid hsl(var(--border))",
                boxShadow: isFocused ? "0 0 0 3px hsla(0, 0%, 0%, 0.06)" : "0 1px 3px hsla(0, 0%, 0%, 0.04)",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease", paddingLeft: 16, paddingRight: 16,
              }}>
                <label htmlFor="hero-input-mobile" className="sr-only">Describe your decision</label>
                <input id="hero-input-mobile" type="text" value={value} onChange={handleChange} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} onKeyDown={handleKeyDown} placeholder={currentPlaceholder} className="w-full bg-transparent outline-none" style={{ fontSize: 16, color: "hsl(var(--text-primary))", height: 44 }} />
                <button onClick={handleMic} className={`flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-200 ${voice.isListening ? "shazam-pulse" : ""}`} style={{ width: 36, height: 36, background: voice.isListening ? "hsla(0, 84%, 50%, 0.08)" : "transparent", color: voice.isListening ? "hsl(var(--destructive))" : "hsl(var(--text-faint))" }} aria-label={voice.isListening ? "Stop listening" : "Voice input"}>
                  {voice.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
              <button onClick={handleSubmit} disabled={!canSubmit} className="w-full flex items-center justify-center gap-2 rounded-xl transition-all duration-200 active:scale-[0.98]" style={{ height: 48, background: canSubmit ? "hsl(var(--primary))" : "hsl(var(--border))", opacity: canSubmit ? 1 : 0.5, color: canSubmit ? "hsl(var(--primary-foreground))" : "hsl(var(--text-faint))", fontSize: 16, fontWeight: 600 }}>
                Audit <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Micro text — Apple inline style */}
          <div className="mt-6 text-sm" style={{ opacity: heroVisible ? 1 : 0, transition: "opacity 400ms ease-out 250ms", color: "hsl(var(--text-tertiary))" }}>
            Free · 30 seconds · Private
          </div>

          {showError && !canSubmit && (
            <p className="text-center mt-3 text-sm font-medium" style={{ color: "hsl(var(--destructive))" }}>
              Describe a decision to get started (at least 10 characters)
            </p>
          )}

          {hasUsedAudit && remainingAudits !== undefined && remainingAudits > 0 && (
            <p className="text-center mt-3 text-sm font-medium" style={{ color: "hsl(var(--warning))" }}>
              You have {remainingAudits} free audit{remainingAudits !== 1 ? "s" : ""} remaining
            </p>
          )}
        </div>
      </div>

      <TrustStrip />
      <SystemSections />
      <OutputPreview />
      <MidPageCTA />
      <TestimonialWall />
      <FAQAccordion />
      <Footer />
    </div>
  );
}
