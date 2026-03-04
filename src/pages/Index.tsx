import { useState, useRef, useEffect, useCallback } from "react";
import { NavBar } from "@/components/NavBar";
import { Scorecard } from "@/components/Scorecard";
import { AuditResult, AuditResultSchema } from "@/lib/types";
import { saveJournalEntry, getJournalCount } from "@/lib/journal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

function generateId(): string {
  return Math.random().toString(36).substring(2, 8);
}

type Phase = "input" | "processing" | "result";

const Index = () => {
  const [phase, setPhase] = useState<Phase>("input");
  const [decision, setDecision] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [auditId, setAuditId] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSocialProof, setShowSocialProof] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startTime = useRef<number>(0);

  const isExpanded = decision.length > 0;
  const canSubmit = decision.trim().length >= 20;

  // Show social proof after 2s delay
  useEffect(() => {
    const t = setTimeout(() => setShowSocialProof(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || phase !== "input") return;

    setPhase("processing");
    startTime.current = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke("audit", {
        body: { decision: decision.trim() },
      });

      if (error) throw error;
      const parsed = AuditResultSchema.parse(data);
      const id = generateId();

      await supabase.from("audit_results").insert({
        id,
        decision: decision.trim(),
        result: parsed as any,
      });

      // Ensure minimum 3s processing time
      const elapsed = Date.now() - startTime.current;
      const remaining = Math.max(0, 3000 - elapsed);

      setTimeout(() => {
        setResult(parsed);
        setAuditId(id);
        setPhase("result");
      }, remaining);
    } catch (e: any) {
      console.error("Audit error:", e);
      toast.error(e?.message || "Failed to audit decision. Please try again.");
      setPhase("input");
    }
  }, [decision, canSubmit, phase]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && canSubmit) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleReset = () => {
    setResult(null);
    setDecision("");
    setAuditId("");
    setPhase("input");
  };

  const handleSaveToJournal = () => {
    if (!result) return;
    saveJournalEntry({
      id: auditId,
      decision: decision.trim(),
      result,
      createdAt: new Date().toISOString(),
      followUp: true,
    });
    toast.success("Saved to your Decision Journal");
  };

  if (phase === "result" && result) {
    return (
      <>
        <NavBar journalCount={getJournalCount()} />
        <Scorecard
          decision={decision.trim()}
          result={result}
          auditId={auditId}
          onReset={handleReset}
          onSaveToJournal={handleSaveToJournal}
        />
      </>
    );
  }

  return (
    <>
      <NavBar journalCount={getJournalCount()} />

      <div
        className="flex flex-col items-center justify-center px-4"
        style={{ minHeight: "90vh" }}
      >
        <div className="w-full" style={{ maxWidth: 680 }}>
          {/* Headline */}
          {phase === "input" && (
            <div className="text-center mb-6">
              <div
                style={{
                  fontSize: "clamp(1.6rem, 5vw, 3.8rem)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                }}
              >
                <span className="block font-light" style={{ color: "rgba(255,255,255,0.9)" }}>
                  What's the decision
                </span>
                <span className="block font-light" style={{ color: "rgba(255,255,255,0.9)" }}>
                  you can't afford
                </span>
                <span className="block font-light" style={{ color: "rgba(255,255,255,0.9)" }}>
                  to get{" "}
                  <span className="font-semibold" style={{ color: "#FFB800" }}>
                    wrong?
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Input pill */}
          <div className="relative w-full">
            {/* Left icon */}
            <div
              className="absolute left-5 z-10 transition-opacity duration-300"
              style={{
                top: isExpanded ? 20 : 20,
                opacity: isFocused ? 1 : 0.5,
                color: "#FFB800",
                fontSize: 20,
              }}
            >
              ⚡
            </div>

            <textarea
              ref={textareaRef}
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your decision..."
              disabled={phase !== "input"}
              rows={1}
              className="w-full resize-none outline-none transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: isFocused
                  ? "1px solid rgba(255,184,0,0.4)"
                  : "1px solid rgba(255,255,255,0.1)",
                borderRadius: isExpanded ? 16 : 32,
                padding: "18px 56px 18px 56px",
                fontSize: 18,
                fontFamily: "'Inter', system-ui, sans-serif",
                fontWeight: 400,
                color: "rgba(255,255,255,0.95)",
                minHeight: isExpanded ? 120 : 64,
                maxHeight: 200,
                boxShadow: isFocused
                  ? "0 0 0 4px rgba(255,184,0,0.08)"
                  : "none",
                opacity: phase === "processing" ? 0.5 : 1,
              }}
            />

            {/* Arrow button inside pill */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || phase !== "input"}
              className="absolute right-4 transition-all duration-300 flex items-center justify-center btn-press"
              style={{
                top: isExpanded ? 16 : 16,
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: canSubmit ? "#FFB800" : "transparent",
                opacity: canSubmit ? 1 : 0.3,
                cursor: canSubmit ? "pointer" : "default",
                boxShadow: canSubmit ? "0 0 12px rgba(255,184,0,0.3)" : "none",
              }}
              onMouseEnter={(e) => {
                if (canSubmit) {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(255,184,0,0.5)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                if (canSubmit) {
                  e.currentTarget.style.boxShadow = "0 0 12px rgba(255,184,0,0.3)";
                }
              }}
            >
              <ArrowRight
                className="w-4 h-4"
                style={{ color: canSubmit ? "#080808" : "rgba(255,255,255,0.3)" }}
              />
            </button>
          </div>

          {/* Hint text */}
          {phase === "input" && canSubmit && (
            <p
              className="text-center mt-3 text-[13px] transition-opacity duration-400"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              Press Enter or click →
            </p>
          )}

          {/* Processing state */}
          {phase === "processing" && (
            <div className="mt-10 space-y-4">
              <p className="text-center text-[14px] breathe" style={{ color: "rgba(255,255,255,0.5)" }}>
                Analyzing your decision...
              </p>

              {/* Skeleton cards */}
              <div className="space-y-3">
                {[{ h: 140 }, { h: 100 }, { h: 80 }].map((card, i) => (
                  <div
                    key={i}
                    className="skeleton-shimmer rounded-xl card-stagger"
                    style={{
                      height: card.h,
                      animationDelay: `${i * 150}ms`,
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 12,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Social proof */}
        {phase === "input" && (
          <p
            className="mt-16 text-[13px] text-center transition-opacity duration-1000"
            style={{
              color: "rgba(255,255,255,0.25)",
              opacity: showSocialProof ? 1 : 0,
            }}
          >
            Used by leaders making decisions from £50K to £50M
          </p>
        )}
      </div>
    </>
  );
};

export default Index;
