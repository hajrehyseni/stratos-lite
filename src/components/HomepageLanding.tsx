import { useState, useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { TrustStrip } from "@/components/TrustStrip";
import { SystemSections } from "@/components/SystemSections";
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

function useFadeUp(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
}

export function HomepageLanding({ onSubmit }: Props) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [shake, setShake] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  const trustRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  useFadeUp(trustRef);
  useFadeUp(ctaRef);
  useFadeUp(testimonialsRef);
  useFadeUp(faqRef);

  const canSubmit = value.trim().length >= 10;

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit(value.trim());
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    if (!hasTyped && newVal.length > 0) {
      setHasTyped(true);
      submitRef.current?.classList.add("pulse-once");
      setTimeout(() => submitRef.current?.classList.remove("pulse-once"), 400);
    }
    setValue(newVal);
  };

  const handleChipClick = (text: string) => {
    setValue(text);
    setHasTyped(true);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col page-enter">
      {/* Hero section */}
      <div className="flex flex-col items-center px-4 sm:px-6 pt-28 sm:pt-36 pb-16 md:pb-24" style={{ minHeight: "85vh", justifyContent: "center" }}>
        <div className="w-full flex flex-col items-center" style={{ maxWidth: 1120 }}>
          <h1
            className="text-center text-4xl sm:text-5xl lg:text-6xl"
            style={{ fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.02em", color: "hsl(var(--text-primary))", maxWidth: 768 }}
          >
            What's the decision you can't afford to get wrong?
          </h1>

          <p
            className="text-center text-lg md:text-xl mt-6 mx-auto"
            style={{ color: "hsl(var(--text-secondary))", maxWidth: 560, lineHeight: 1.6 }}
          >
            The strategic frameworks behind every Fortune 500 board decision
          </p>

          {/* Input Area — stacks on mobile */}
          <div className="w-full" style={{ maxWidth: 672, marginTop: 40 }}>
            {/* Desktop: inline input+button */}
            <div className="hidden sm:block">
              <div
                className={`relative flex items-center ${shake ? "input-shake" : ""}`}
                style={{
                  height: 60,
                  borderRadius: 9999,
                  background: "hsla(0, 0%, 100%, 0.06)",
                  border: shake
                    ? "1.5px solid hsl(var(--destructive))"
                    : isFocused
                    ? "1.5px solid hsl(var(--primary))"
                    : "1.5px solid hsla(0, 0%, 100%, 0.15)",
                  boxShadow: isFocused
                    ? "0 0 0 4px hsla(16, 100%, 62%, 0.12)"
                    : "none",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  paddingLeft: 24,
                  paddingRight: 6,
                }}
              >
                <label htmlFor="hero-input" className="sr-only">Describe your decision</label>
                <input
                  ref={inputRef}
                  id="hero-input"
                  type="text"
                  value={value}
                  onChange={handleChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your decision..."
                  className="w-full bg-transparent outline-none"
                  style={{
                    fontSize: 17,
                    fontWeight: 400,
                    color: "hsl(var(--text-primary))",
                    height: 52,
                  }}
                />
                <button
                  ref={submitRef}
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="flex-shrink-0 flex items-center justify-center gap-2 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    height: 48,
                    paddingLeft: 24,
                    paddingRight: 20,
                    background: canSubmit ? "hsl(var(--primary))" : "hsla(16, 100%, 62%, 0.25)",
                    opacity: canSubmit ? 1 : 0.5,
                    cursor: canSubmit ? "pointer" : "default",
                    color: "hsl(var(--primary-foreground))",
                    fontSize: 15,
                    fontWeight: 600,
                    boxShadow: canSubmit ? "0 4px 16px hsla(16, 100%, 62%, 0.3)" : "none",
                  }}
                  aria-label="Audit this decision"
                >
                  Audit this decision
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile: stacked input + button */}
            <div className="sm:hidden flex flex-col gap-3">
              <div
                className={`relative flex items-center ${shake ? "input-shake" : ""}`}
                style={{
                  height: 56,
                  borderRadius: 9999,
                  background: "hsla(0, 0%, 100%, 0.06)",
                  border: shake
                    ? "1.5px solid hsl(var(--destructive))"
                    : isFocused
                    ? "1.5px solid hsl(var(--primary))"
                    : "1.5px solid hsla(0, 0%, 100%, 0.15)",
                  boxShadow: isFocused ? "0 0 0 4px hsla(16, 100%, 62%, 0.12)" : "none",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  paddingLeft: 20,
                  paddingRight: 20,
                }}
              >
                <label htmlFor="hero-input-mobile" className="sr-only">Describe your decision</label>
                <input
                  id="hero-input-mobile"
                  type="text"
                  value={value}
                  onChange={handleChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your decision..."
                  className="w-full bg-transparent outline-none"
                  style={{ fontSize: 17, color: "hsl(var(--text-primary))", height: 48 }}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full flex items-center justify-center gap-2 rounded-full transition-all duration-200 active:scale-[0.98]"
                style={{
                  height: 52,
                  background: canSubmit ? "hsl(var(--primary))" : "hsla(16, 100%, 62%, 0.25)",
                  opacity: canSubmit ? 1 : 0.5,
                  color: "hsl(var(--primary-foreground))",
                  fontSize: 16,
                  fontWeight: 600,
                  boxShadow: canSubmit ? "0 4px 16px hsla(16, 100%, 62%, 0.3)" : "none",
                }}
              >
                Audit this decision
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Example decision chips */}
          <div className="mt-5 flex gap-2.5 overflow-x-auto scrollbar-hide pb-2 w-full justify-center flex-wrap md:flex-nowrap px-1" style={{ maxWidth: 672 }}>
            {exampleChips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="flex-shrink-0 rounded-full px-4 py-2 text-sm transition-all duration-200"
                style={{
                  background: "transparent",
                  border: "1px solid hsla(0, 0%, 100%, 0.12)",
                  color: "hsl(var(--text-tertiary))",
                  minHeight: 44,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "hsla(0, 0%, 100%, 0.3)"; e.currentTarget.style.color = "hsl(var(--text-secondary))"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "hsla(0, 0%, 100%, 0.12)"; e.currentTarget.style.color = "hsl(var(--text-tertiary))"; }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Trust line */}
          <p className="text-center mt-4 text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>
            ✓ Free · No signup · 30 seconds · 🔒 Private &amp; encrypted
          </p>
        </div>
      </div>

      {/* Trust Strip */}
      <div ref={trustRef} className="fade-up-section">
        <TrustStrip />
      </div>

      {/* System Sections */}
      <SystemSections />

      {/* Mid-page CTA */}
      <div ref={ctaRef} className="fade-up-section">
        <MidPageCTA />
      </div>

      {/* Testimonials */}
      <div ref={testimonialsRef} className="fade-up-section">
        <TestimonialWall />
      </div>

      {/* FAQ */}
      <div ref={faqRef} className="fade-up-section">
        <FAQAccordion />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
