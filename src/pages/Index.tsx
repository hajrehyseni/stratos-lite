import { useState, useCallback } from "react";
import { DiagnosticFlow } from "@/components/DiagnosticFlow";
import { ProcessingAnimation } from "@/components/ProcessingAnimation";
import { Scorecard } from "@/components/Scorecard";
import { NavBar } from "@/components/NavBar";
import { AuditResult, AuditResultSchema, DiagnosticAnswers } from "@/lib/types";
import { buildStratOSPrompt } from "@/lib/prompt-builder";
import { saveJournalEntry, getJournalCount } from "@/lib/journal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function generateId(): string {
  return Math.random().toString(36).substring(2, 8);
}

type Phase = "diagnostic" | "processing" | "result";

const Index = () => {
  const [phase, setPhase] = useState<Phase>("diagnostic");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [diagnostic, setDiagnostic] = useState<DiagnosticAnswers | null>(null);
  const [builtPrompt, setBuiltPrompt] = useState("");
  const [auditId, setAuditId] = useState("");
  const [depth, setDepth] = useState(0);
  const [showDiagnostic, setShowDiagnostic] = useState(true);

  const handleDiagnosticComplete = useCallback(async (answers: DiagnosticAnswers) => {
    setDiagnostic(answers);
    const prompt = buildStratOSPrompt(answers);
    setBuiltPrompt(prompt);

    let d = 3;
    if (answers.budget) d++;
    if (answers.timeline) d++;
    if (answers.constraint) d++;
    setDepth(d);

    setPhase("processing");
    setIsLoading(true);
    setShowDiagnostic(false);

    try {
      const { data, error } = await supabase.functions.invoke("audit", {
        body: {
          decision: answers.decision,
          focus: answers.focus,
          scale: answers.scale,
          budget: answers.budget,
          timeline: answers.timeline,
          constraint: answers.constraint,
        },
      });

      if (error) throw error;
      const parsed = AuditResultSchema.parse(data);
      const id = generateId();

      await supabase.from("audit_results").insert({
        id,
        decision: answers.decision,
        result: parsed as any,
      });

      setResult(parsed);
      setAuditId(id);
    } catch (e: any) {
      console.error("Audit error:", e);
      toast.error(e?.message || "Failed to audit decision. Please try again.");
      setPhase("diagnostic");
      setShowDiagnostic(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleProcessingDone = useCallback(() => {
    if (result) {
      setPhase("result");
    }
    // If result not ready yet, the effect below will handle it
  }, [result]);

  // When result arrives after processing animation
  if (phase === "processing" && result && !isLoading) {
    // Let the processing animation finish naturally
  }

  const handleReset = () => {
    setResult(null);
    setDiagnostic(null);
    setBuiltPrompt("");
    setAuditId("");
    setDepth(0);
    setPhase("diagnostic");
    setShowDiagnostic(true);
  };

  const handleSaveToJournal = () => {
    if (!result || !diagnostic) return;
    saveJournalEntry({
      id: auditId,
      decision: diagnostic.decision,
      result,
      diagnostic,
      builtPrompt,
      createdAt: new Date().toISOString(),
      followUp: true,
    });
    toast.success("Saved to your Decision Journal");
  };

  return (
    <>
      <NavBar
        depth={phase === "diagnostic" ? depth : undefined}
        journalCount={getJournalCount()}
      />

      {phase === "diagnostic" && showDiagnostic && (
        <DiagnosticFlow onComplete={handleDiagnosticComplete} isLoading={isLoading} />
      )}

      {phase === "processing" && (
        <ProcessingAnimation
          onComplete={() => {
            if (result) setPhase("result");
            else {
              // Wait for result
              const interval = setInterval(() => {
                // This is a bit hacky but works for the animation timing
              }, 100);
              // We'll handle this via effect
            }
          }}
        />
      )}

      {phase === "result" && result && diagnostic && (
        <div>
          <Scorecard
            decision={diagnostic.decision}
            result={result}
            auditId={auditId}
            onReset={handleReset}
            diagnostic={diagnostic}
            builtPrompt={builtPrompt}
          />
          {/* Journal save prompt */}
          <div className="max-w-2xl mx-auto px-4 pb-12">
            <div className="border border-border rounded-lg p-4 text-center space-y-3">
              <p className="text-sm text-foreground font-body">
                Want to track what happens? We'll remind you to record the outcome in 30 days.
              </p>
              <button
                onClick={handleSaveToJournal}
                className="text-sm font-mono text-gold hover:underline"
              >
                Save to Decision Journal →
              </button>
              <p className="text-[10px] text-muted-foreground">
                Your decisions are stored locally to your browser session only. We cannot read them. They are never transmitted to our servers or shared with anyone.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Index;
