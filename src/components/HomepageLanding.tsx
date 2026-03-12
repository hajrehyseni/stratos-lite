import { useState, useRef } from "react";
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

export function HomepageLanding({ onSubmit }: Props) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
            className="text-center text-4xl md:text-5xl lg:text-6xl font-semibold"
            style={{ lineHeight: 1.1, letterSpacing: "-0.03em", color: "hsl(var(--foreground))", maxWidth: 768 }}
          >
            What's the decision you can't afford to get wrong?
          </h1>

          <p
            className="text-center text-base md:text-lg mt-5 mx-auto"
            style={{ color: "hsl(var(--muted-foreground))", maxWidth: 560 }}
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
                className="flex-shrink-0 flex items-center justify-center gap-1.5 rounded-full transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  height: 42,
                  padding: "0 18px",
                  background: canSubmit ? "hsl(var(--primary))" : "rgba(201,168,76,0.3)",
                  opacity: canSubmit ? 1 : 0.3,
                  cursor: canSubmit ? "pointer" : "default",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "hsl(var(--primary-foreground))",
                  whiteSpace: "nowrap",
                }}
                aria-label="Submit decision"
              >
                Audit →
              </button>
            </div>
          </div>

          {/* Trust checkmarks */}
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            {["Free", "No signup", "30 seconds"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-sm">
                <span style={{ color: "hsl(var(--primary))" }}>✓</span>
                <span style={{ color: "hsl(var(--muted-foreground))" }}>{t}</span>
              </span>
            ))}
          </div>

          <p className="text-center mt-3 text-xs" style={{ color: "hsl(var(--muted-foreground))", opacity: 0.5 }}>
            🔒 Your data never leaves your device
          </p>

          {/* Example decision chips */}
          <div className="mt-6 flex gap-3 overflow-x-auto scrollbar-hide pb-2 w-full justify-center flex-wrap md:flex-nowrap">
            {exampleChips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="flex-shrink-0 rounded-full px-4 py-2 text-sm transition-all duration-200 hover:text-white"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "hsl(var(--muted-foreground))",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Strip */}
      <TrustStrip />

      {/* System Sections */}
      <SystemSections />

      {/* Mid-page CTA */}
      <MidPageCTA />

      {/* Testimonials */}
      <TestimonialWall />

      {/* Social Proof */}
      <SocialProofLogos />

      {/* FAQ */}
      <FAQAccordion />

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
