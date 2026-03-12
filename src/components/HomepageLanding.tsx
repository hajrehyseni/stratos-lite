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
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
}

export function HomepageLanding({ onSubmit }: Props) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleChipClick = (text: string) => {
    setValue(text);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <div className="flex flex-col items-center px-4" style={{ minHeight: "90vh", justifyContent: "center" }}>
        <div className="w-full flex flex-col items-center" style={{ maxWidth: 820 }}>
          <h1
            className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold"
            style={{ lineHeight: 1.1, letterSpacing: "-0.03em", color: "hsl(var(--foreground))", maxWidth: 768 }}
          >
            What's the decision you can't afford to get wrong?
          </h1>

          <p
            className="text-center text-base md:text-lg mt-5 mx-auto"
            style={{ color: "hsl(var(--muted-foreground))", maxWidth: 560, lineHeight: 1.6 }}
          >
            The strategic frameworks behind every Fortune 500 board decision
          </p>

          {/* Input Area */}
          <div className="w-full" style={{ maxWidth: 672, marginTop: 36 }}>
            <div
              className={`relative flex items-center ${shake ? "input-shake" : ""}`}
              style={{
                height: 56,
                borderRadius: 32,
                background: "rgba(255,255,255,0.04)",
                border: shake
                  ? "1px solid rgba(255,100,100,0.5)"
                  : isFocused
                  ? "1px solid rgba(201,168,76,0.4)"
                  : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isFocused
                  ? "0 0 0 1px rgba(201,168,76,0.2), 0 0 20px rgba(201,168,76,0.06)"
                  : "none",
                transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                paddingLeft: 20,
                paddingRight: 6,
              }}
            >
              <input
                ref={inputRef}
                id="hero-input"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your decision..."
                className="w-full bg-transparent outline-none"
                style={{
                  fontSize: 15,
                  fontWeight: 400,
                  color: "hsl(var(--foreground))",
                  fontStyle: value ? "normal" : "italic",
                  minHeight: 48,
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  width: 42,
                  height: 42,
                  background: canSubmit ? "hsl(var(--primary))" : "rgba(201,168,76,0.3)",
                  opacity: canSubmit ? 1 : 0.3,
                  cursor: canSubmit ? "pointer" : "default",
                  color: "hsl(var(--primary-foreground))",
                }}
                aria-label="Submit decision"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Example decision chips */}
          <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-hide pb-2 w-full justify-center flex-wrap md:flex-nowrap px-1">
            {exampleChips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="flex-shrink-0 rounded-full px-4 py-2 text-sm transition-all duration-200 hover:text-foreground"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(201,168,76,0.15)",
                  color: "hsl(var(--muted-foreground))",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.15)"; }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Consolidated trust line */}
          <p className="text-center mt-3 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            ✓ Free · No signup · 30 seconds · 🔒 Data stays on your device
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

      {/* Background gradient */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background: "radial-gradient(ellipse 600px 400px at 50% 0%, rgba(201,168,76,0.03), transparent)",
        }}
      />
    </div>
  );
}
