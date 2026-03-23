import { useState, useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";
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

const exampleChips = [
  "Should we acquire our competitor?",
  "Should I restructure my team?",
  "Should we pivot our product strategy?",
];

export function HomepageLanding({ onSubmit, remainingAudits, hasUsedAudit }: Props) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [shake, setShake] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  const [showError, setShowError] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const canSubmit = value.trim().length >= 10;

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

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

  const handleChipClick = (text: string) => { setValue(text); setHasTyped(true); inputRef.current?.focus(); };

  return (
    <div className="flex flex-col page-enter">
      {/* Hero with subtle radial gradient */}
      <div className="relative flex flex-col items-center px-4 sm:px-6 pt-28 sm:pt-36 pb-16 md:pb-20" style={{ minHeight: "85vh", justifyContent: "center" }}>
        {/* Premium background texture */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 30%, hsla(221, 83%, 53%, 0.04), transparent)",
        }} />
        <div className="absolute inset-0 pointer-events-none dot-grid-bg" />

        <div className="w-full flex flex-col items-center relative z-10" style={{ maxWidth: 1120 }}>
          <h1
            className="text-center text-4xl sm:text-5xl lg:text-6xl"
            style={{
              fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.02em",
              color: "hsl(var(--text-primary))", maxWidth: 768,
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 400ms ease-out, transform 400ms ease-out",
            }}
          >
            What's the decision you can't afford to get wrong?
          </h1>
          <p
            className="text-center text-lg md:text-xl mt-6 mx-auto"
            style={{
              color: "hsl(var(--text-secondary))", maxWidth: 600, lineHeight: 1.6,
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(14px)",
              transition: "opacity 400ms ease-out 100ms, transform 400ms ease-out 100ms",
            }}
          >
            Fortune 500 frameworks. 30-second audit. <strong style={{ color: "hsl(var(--text-primary))" }}>Free.</strong>
          </p>

          {/* Input */}
          <div className="w-full" style={{ maxWidth: 672, marginTop: 40, opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(14px)", transition: "opacity 400ms ease-out 200ms, transform 400ms ease-out 200ms" }}>
            {/* Desktop */}
            <div className="hidden sm:block">
              <div className={`relative flex items-center ${shake ? "input-shake" : ""}`} style={{
                height: 60, borderRadius: 9999, background: "hsl(var(--secondary))",
                border: shake ? "1.5px solid hsl(var(--destructive))" : isFocused ? "1.5px solid hsl(var(--primary))" : "1.5px solid hsl(var(--border))",
                boxShadow: isFocused ? "0 0 0 4px hsla(221, 83%, 53%, 0.12)" : "none",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease", paddingLeft: 24, paddingRight: 6,
              }}>
                <label htmlFor="hero-input" className="sr-only">Describe your decision</label>
                <input ref={inputRef} id="hero-input" type="text" value={value} onChange={handleChange} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} onKeyDown={handleKeyDown} placeholder="Describe your decision..." className="w-full bg-transparent outline-none" style={{ fontSize: 17, fontWeight: 400, color: "hsl(var(--text-primary))", height: 52 }} />
                <button ref={submitRef} onClick={handleSubmit} disabled={!canSubmit} className={`flex-shrink-0 flex items-center justify-center gap-2 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${canSubmit && hasTyped ? "cta-glow" : ""}`} style={{ height: 48, paddingLeft: 24, paddingRight: 20, background: canSubmit ? "hsl(var(--primary))" : "hsla(221, 83%, 53%, 0.3)", opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? "pointer" : "default", color: "hsl(var(--primary-foreground))", fontSize: 15, fontWeight: 600 }} aria-label="Audit this decision">
                  Audit this decision <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Mobile */}
            <div className="sm:hidden flex flex-col gap-3">
              <div className={`relative flex items-center ${shake ? "input-shake" : ""}`} style={{
                height: 56, borderRadius: 9999, background: "hsl(var(--secondary))",
                border: shake ? "1.5px solid hsl(var(--destructive))" : isFocused ? "1.5px solid hsl(var(--primary))" : "1.5px solid hsl(var(--border))",
                boxShadow: isFocused ? "0 0 0 4px hsla(221, 83%, 53%, 0.12)" : "none",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease", paddingLeft: 20, paddingRight: 20,
              }}>
                <label htmlFor="hero-input-mobile" className="sr-only">Describe your decision</label>
                <input id="hero-input-mobile" type="text" value={value} onChange={handleChange} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} onKeyDown={handleKeyDown} placeholder="Describe your decision..." className="w-full bg-transparent outline-none" style={{ fontSize: 17, color: "hsl(var(--text-primary))", height: 48 }} />
              </div>
              <button onClick={handleSubmit} disabled={!canSubmit} className={`w-full flex items-center justify-center gap-2 rounded-full transition-all duration-200 active:scale-[0.98] ${canSubmit && hasTyped ? "cta-glow" : ""}`} style={{ height: 52, background: canSubmit ? "hsl(var(--primary))" : "hsla(221, 83%, 53%, 0.3)", opacity: canSubmit ? 1 : 0.5, color: "hsl(var(--primary-foreground))", fontSize: 16, fontWeight: 600 }}>
                Audit this decision <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showError && !canSubmit && (
            <p className="text-center mt-3 text-sm font-medium" style={{ color: "hsl(var(--destructive))" }}>
              Describe a decision to get started (at least 10 characters)
            </p>
          )}

          <div className="mt-5 flex gap-2.5 pb-2 w-full justify-center flex-wrap px-1" style={{ maxWidth: 672 }}>
            {exampleChips.map((chip) => (
              <button key={chip} onClick={() => handleChipClick(chip)} className="rounded-full px-4 py-2 text-sm transition-all duration-200 hover:border-[hsl(var(--primary))] hover:scale-[1.02]" style={{ background: "transparent", border: "1px solid hsl(var(--border))", color: "hsl(var(--text-secondary))", minHeight: 44, whiteSpace: "normal", textAlign: "center", boxShadow: "0 1px 3px hsla(0, 0%, 0%, 0.04)", transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px hsla(0, 0%, 0%, 0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px hsla(0, 0%, 0%, 0.04)"; }}
              >
                {chip}
              </button>
            ))}
          </div>

          {hasUsedAudit && remainingAudits !== undefined && remainingAudits > 0 && (
            <p className="text-center mt-2 text-sm font-medium" style={{ color: "hsl(var(--warning))" }}>
              You have {remainingAudits} free audit{remainingAudits !== 1 ? "s" : ""} remaining
            </p>
          )}
        </div>
      </div>

      <TrustStrip />
      <SystemSections />
      <MidPageCTA />
      <TestimonialWall />
      <FAQAccordion />
      <Footer />
    </div>
  );
}
