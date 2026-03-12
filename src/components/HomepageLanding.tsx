import { useState, useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { TrustStrip } from "@/components/TrustStrip";
import { SystemSections } from "@/components/SystemSections";
import { MidPageCTA } from "@/components/MidPageCTA";
import { TestimonialWall } from "@/components/TestimonialWall";
import { SocialProofLogos } from "@/components/SocialProofLogos";
import { FAQAccordion } from "@/components/FAQAccordion";
import { Footer } from "@/components/Footer";

interface Props {
  onSubmit: (decision: string) => void;
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
  const socialRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  useFadeUp(trustRef);
  useFadeUp(ctaRef);
  useFadeUp(testimonialsRef);
  useFadeUp(socialRef);
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
      // Pulse the submit button once
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
      <div className="flex flex-col items-center px-4" style={{ minHeight: "85vh", justifyContent: "center", paddingTop: 80 }}>
        <div className="w-full flex flex-col items-center" style={{ maxWidth: 1120 }}>
          <h1
            className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
            style={{ fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#FFFFFF", maxWidth: 768 }}
          >
            What's the decision you can't afford to get wrong?
          </h1>

          <p
            className="text-center text-base md:text-lg mt-5 mx-auto"
            style={{ color: "#6B7280", maxWidth: 560, lineHeight: 1.6 }}
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
                  height: 56,
                  borderRadius: 9999,
                  background: "rgba(255,255,255,0.06)",
                  border: shake
                    ? "1px solid hsl(0, 84%, 60%)"
                    : isFocused
                    ? "1px solid hsl(16, 100%, 62%)"
                    : "1px solid rgba(255,255,255,0.12)",
                  boxShadow: isFocused
                    ? "0 0 0 3px hsla(16, 100%, 62%, 0.15)"
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
                    fontSize: 16,
                    fontWeight: 400,
                    color: "#FFFFFF",
                    height: 48,
                  }}
                />
                <button
                  ref={submitRef}
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="flex-shrink-0 flex items-center justify-center gap-2 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    height: 44,
                    paddingLeft: 20,
                    paddingRight: 16,
                    background: canSubmit ? "hsl(16, 100%, 62%)" : "hsla(16, 100%, 62%, 0.3)",
                    opacity: canSubmit ? 1 : 0.5,
                    cursor: canSubmit ? "pointer" : "default",
                    color: "#FFFFFF",
                    fontSize: 14,
                    fontWeight: 600,
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
                  height: 48,
                  borderRadius: 9999,
                  background: "rgba(255,255,255,0.06)",
                  border: shake
                    ? "1px solid hsl(0, 84%, 60%)"
                    : isFocused
                    ? "1px solid hsl(16, 100%, 62%)"
                    : "1px solid rgba(255,255,255,0.12)",
                  boxShadow: isFocused ? "0 0 0 3px hsla(16, 100%, 62%, 0.15)" : "none",
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
                  style={{ fontSize: 16, color: "#FFFFFF", height: 44 }}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full flex items-center justify-center gap-2 rounded-full transition-all duration-200 active:scale-[0.98]"
                style={{
                  height: 48,
                  background: canSubmit ? "hsl(16, 100%, 62%)" : "hsla(16, 100%, 62%, 0.3)",
                  opacity: canSubmit ? 1 : 0.5,
                  color: "#FFFFFF",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                Audit this decision
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Example decision chips */}
          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-2 w-full justify-center flex-wrap md:flex-nowrap px-1" style={{ maxWidth: 672 }}>
            {exampleChips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="flex-shrink-0 rounded-full px-4 py-2 text-sm transition-all duration-200"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#6B7280",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "#FFFFFF"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#6B7280"; }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Consolidated trust line */}
          <p className="text-center mt-4 text-sm" style={{ color: "#6B7280" }}>
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

      {/* Social Proof */}
      <div ref={socialRef} className="fade-up-section">
        <SocialProofLogos />
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
