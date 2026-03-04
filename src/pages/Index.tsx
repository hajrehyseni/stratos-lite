import { useState, useRef, useCallback } from "react";
import { NavBar } from "@/components/NavBar";
import { Scorecard } from "@/components/Scorecard";
import { HomepageLanding } from "@/components/HomepageLanding";
import { NewDiagnosticFlow } from "@/components/NewDiagnosticFlow";
import { NewProcessingState } from "@/components/NewProcessingState";
import { AuditResult, AuditResultSchema, FocusLens, DecisionScale } from "@/lib/types";
import { saveJournalEntry, getJournalCount } from "@/lib/journal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function generateId(): string {
  return Math.random().toString(36).substring(2, 8);
}

type Phase = "landing" | "diagnostic" | "processing" | "result";

const Index = () => {
  const [phase, setPhase] = useState<Phase>("landing");
  const [decision, setDecision] = useState("");
  const [lens, setLens] = useState<FocusLens>("risk");
  const [scale, setScale] = useState<DecisionScale>("tactical");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [auditId, setAuditId] = useState("");
  const [landingExiting, setLandingExiting] = useState(false);

  const apiDone = useRef(false);
  const apiResult = useRef<{ parsed: AuditResult; id: string } | null>(null);
  const minTimeDone = useRef(false);

  const handleLandingSubmit = (text: string) => {
    setDecision(text);
    setLandingExiting(true);
    setTimeout(() => {
      setPhase("diagnostic");
      setLandingExiting(false);
    }, 400);
  };

  const handleDiagnosticComplete = useCallback(
    (selectedLens: FocusLens, selectedScale: DecisionScale) => {
      setLens(selectedLens);
      setScale(selectedScale);
      setPhase("processing");

      // Fire API call
      apiDone.current = false;
      minTimeDone.current = false;
      apiResult.current = null;

      (async () => {
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

          apiResult.current = { parsed, id };
          apiDone.current = true;

          if (minTimeDone.current) {
            showResult(parsed, id);
          }
        } catch (e: any) {
          console.error("Audit error:", e);
          toast.error(e?.message || "Failed to audit decision. Please try again.");
          setPhase("landing");
        }
      })();
    },
    [decision]
  );

  const handleMinTimeReached = useCallback(() => {
    minTimeDone.current = true;
    if (apiDone.current && apiResult.current) {
      showResult(apiResult.current.parsed, apiResult.current.id);
    }
  }, []);

  const showResult = (parsed: AuditResult, id: string) => {
    setResult(parsed);
    setAuditId(id);
    setPhase("result");
  };

  const handleReset = (prefill?: string) => {
    setResult(null);
    setDecision(prefill || "");
    setAuditId("");
    setPhase("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    toast.success("Saved to your private journal");
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

      {phase === "landing" && (
        <div
          style={{
            opacity: landingExiting ? 0 : 1,
            transform: landingExiting ? "translateY(-10px)" : "translateY(0)",
            transition: "opacity 400ms ease, transform 400ms ease",
          }}
        >
          <HomepageLanding onSubmit={handleLandingSubmit} />
        </div>
      )}

      {phase === "diagnostic" && (
        <NewDiagnosticFlow
          decision={decision}
          onComplete={handleDiagnosticComplete}
        />
      )}

      {phase === "processing" && (
        <NewProcessingState
          lens={lens}
          scale={scale}
          onMinTimeReached={handleMinTimeReached}
        />
      )}
    </>
  );
};

export default Index;
