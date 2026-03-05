import { useState, useRef } from "react";
import { ArrowRight } from "lucide-react";

interface Props {
  onSubmit: (decision: string) => void;
}

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

  return (
    <div
      className="flex flex-col items-center justify-center px-4"
      style={{ minHeight: "90vh" }}
    >
      <div className="w-full flex flex-col items-center" style={{ maxWidth: 720 }}>
        {/* Institutional Badge */}
        <p
          className="text-center"
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
            marginTop: 80,
          }}
        >
          London Royal Academy
        </p>
        <div
          style={{
            width: 40,
            height: 1,
            background: "rgba(255,255,255,0.08)",
            margin: "16px auto 24px",
          }}
        />

        {/* Headline */}
        <h1
          className="text-center"
          style={{
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          <span style={{ fontSize: 36, fontWeight: 300, color: "#E8E4DF", display: "block" }}>
            What's the decision
          </span>
          <span style={{ fontSize: 36, fontWeight: 600, color: "#C9A84C", display: "block" }}>
            you can't afford to get wrong?
          </span>
        </h1>

        {/* Framework text */}
        <p
          className="text-center"
          style={{
            fontSize: 12,
            fontWeight: 400,
            color: "#555",
            marginTop: 12,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Uses MECE, risk matrix &amp; stakeholder analysis frameworks
        </p>

        {/* Input Area */}
        <div className="w-full px-4 sm:px-0" style={{ maxWidth: 580, marginTop: 32 }}>
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
              paddingLeft: 16,
              paddingRight: 8,
            }}
          >
            <span
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.3)",
                marginRight: 12,
                flexShrink: 0,
              }}
            >
              ⚡
            </span>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="What's the decision you can't stop thinking about?"
              className="w-full bg-transparent outline-none"
              style={{
                fontSize: 15,
                fontWeight: 400,
                color: "#fff",
                fontStyle: value ? "normal" : "italic",
                minHeight: 48,
              }}
            />
            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-200"
              style={{
                width: 40,
                height: 40,
                background: canSubmit ? "#C9A84C" : "rgba(201,168,76,0.3)",
                opacity: canSubmit ? 1 : 0.3,
                cursor: canSubmit ? "pointer" : "default",
                boxShadow: canSubmit ? "none" : "none",
              }}
              onMouseEnter={(e) => {
                if (canSubmit) {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 0 12px rgba(201,168,76,0.3)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
              aria-label="Submit decision"
            >
              <ArrowRight style={{ width: 18, height: 18, color: "#080808" }} />
            </button>
          </div>
        </div>

        {/* Below input */}
        <p
          className="text-center"
          style={{
            fontSize: 12,
            fontWeight: 400,
            color: "#555",
            marginTop: 16,
          }}
        >
          Free. No signup. Takes 10 seconds.
        </p>
      </div>

      {/* Footer privacy line */}
      <p
        className="text-center mt-auto"
        style={{
          fontSize: 11,
          color: "#444",
          paddingBottom: 32,
          paddingTop: 48,
        }}
      >
        🔒 Private — all data stored on your device only
      </p>

      {/* Background gradient */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(ellipse 600px 400px at 50% 0%, rgba(201,168,76,0.03), transparent)",
        }}
      />
    </div>
  );
}
