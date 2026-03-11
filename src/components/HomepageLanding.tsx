import { useState, useRef } from "react";
import { ArrowRight, Pencil, Brain, BarChart3 } from "lucide-react";

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

  const howItWorks = [
    {
      icon: <Pencil className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />,
      title: "Describe your decision",
      desc: "Enter the strategic decision keeping you up at night. No jargon needed.",
    },
    {
      icon: <Brain className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />,
      title: "AI runs the audit",
      desc: "MECE breakdown, risk matrix, stakeholder analysis — the frameworks used by top strategy firms.",
    },
    {
      icon: <BarChart3 className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />,
      title: "Get your scorecard",
      desc: "A confidence score, verdict, risk surface, and actionable next steps in under 30 seconds.",
    },
  ];

  return (
    <div className="flex flex-col items-center px-4" style={{ minHeight: "100vh" }}>
      {/* Hero section */}
      <div className="w-full flex flex-col items-center" style={{ maxWidth: 720, paddingTop: "20vh" }}>
        {/* Institutional Badge */}
        <p
          className="text-center"
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
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

        {/* Headline — space between spans for screen readers */}
        <h1 className="text-center" style={{ lineHeight: 1.2, letterSpacing: "-0.02em" }}>
          <span style={{ fontSize: 36, fontWeight: 300, color: "#E8E4DF", display: "block" }}>
            What's the decision
          </span>
          <span style={{ fontSize: 36, fontWeight: 600, color: "hsl(var(--primary))", display: "block" }}>
            {" "}you can't afford to get wrong?
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-center"
          style={{
            fontSize: 12,
            fontWeight: 400,
            color: "hsl(var(--muted-foreground))",
            marginTop: 12,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          The strategic frameworks behind every Fortune 500 board decision
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
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-200"
              style={{
                width: 40,
                height: 40,
                background: canSubmit ? "hsl(var(--primary))" : "rgba(201,168,76,0.3)",
                opacity: canSubmit ? 1 : 0.3,
                cursor: canSubmit ? "pointer" : "default",
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

        <p className="text-center" style={{ fontSize: 12, fontWeight: 400, color: "hsl(var(--muted-foreground))", marginTop: 16 }}>
          Free. No signup. Takes 10 seconds.
        </p>
      </div>

      {/* Privacy line */}
      <p className="text-center" style={{ fontSize: 11, color: "#444", paddingTop: 48 }}>
        🔒 Private — all data stored on your device only
      </p>

      {/* How It Works */}
      <div className="w-full" style={{ maxWidth: 720, marginTop: 64, paddingBottom: 80 }}>
        <h2
          className="text-center"
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "hsl(var(--muted-foreground))",
            marginBottom: 32,
          }}
        >
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {howItWorks.map((item) => (
            <div key={item.title} className="text-center">
              <div
                className="mx-auto flex items-center justify-center rounded-lg"
                style={{ width: 44, height: 44, background: "rgba(201,168,76,0.08)", marginBottom: 16 }}
              >
                {item.icon}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "hsl(var(--foreground))", marginBottom: 8 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", lineHeight: 1.6 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

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
