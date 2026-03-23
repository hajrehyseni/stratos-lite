import { useState, useRef, useCallback, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { Scorecard } from "@/components/Scorecard";
import { HomepageLanding } from "@/components/HomepageLanding";
import { NewDiagnosticFlow, DiagnosticResult, clearDiagnosticSession } from "@/components/NewDiagnosticFlow";
import { NewProcessingState } from "@/components/NewProcessingState";
import { AuditResult, AuditResultSchema } from "@/lib/types";
import { saveJournalEntry, getJournalCount } from "@/lib/journal";
import { selectFrameworks, frameworkIds } from "@/lib/framework-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { STRIPE_TIERS } from "@/lib/stripe-config";
import { UpgradeModal } from "@/components/UpgradeModal";
import { SignupGate } from "@/components/SignupGate";
import { toast } from "sonner";

const ANON_AUDIT_KEY = "stratos_anon_audit_done";

function generateId(): string {
  return Math.random().toString(36).substring(2, 8);
}

type Phase = "landing" | "diagnostic" | "processing" | "result";

const SKIP_DEFAULTS: DiagnosticResult = {
  stakes: "",
  decision_type: "risk",
  blast_radius: "company",
  primary_constraint: "data",
  success_vision: "",
};

const Index = () => {
  const { user, subscription, refreshSubscription } = useAuth();
  const [phase, setPhase] = useState<Phase>("landing");
  const [decision, setDecision] = useState("");
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult>(SKIP_DEFAULTS);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [auditId, setAuditId] = useState("");
  const [landingExiting, setLandingExiting] = useState(false);
  const [journalSaved, setJournalSaved] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showSignupGate, setShowSignupGate] = useState(false);

  // Restore diagnostic flow from sessionStorage on mount
  useEffect(() => {
    const prefill = sessionStorage.getItem("stratos_prefill");
    if (prefill) {
      sessionStorage.removeItem("stratos_prefill");
      setDecision(prefill);
      if (prefill.length >= 10) {
        setPhase("diagnostic");
      }
      return;
    }
    const savedDiag = sessionStorage.getItem("stratos_diag_state");
    const savedDecision = sessionStorage.getItem("stratos_diag_decision");
    if (savedDiag && savedDecision) {
      setDecision(savedDecision);
      setPhase("diagnostic");
    }
  }, []);

  const apiResolved = useRef(false);
  const [apiResolvedState, setApiResolvedState] = useState(false);
  const apiResult = useRef<{ parsed: AuditResult; id: string } | null>(null);

  const canRunAudit = (): boolean => {
    // Demo mode: always allow audits
    return true;
  };

  const handleLandingSubmit = (text: string) => {
    setDecision(text);
    if (!canRunAudit()) return;
    sessionStorage.setItem("stratos_diag_decision", text);
    setLandingExiting(true);
    setTimeout(() => {
      setPhase("diagnostic");
      setLandingExiting(false);
    }, 400);
  };

  const handleSkipDiagnostic = useCallback(() => {
    setDiagnosticResult(SKIP_DEFAULTS);
    startProcessing(SKIP_DEFAULTS);
  }, [decision]);

  const handleDiagnosticComplete = useCallback(
    (dr: DiagnosticResult) => {
      setDiagnosticResult(dr);
      startProcessing(dr);
    },
    [decision]
  );

  const startProcessing = (dr: DiagnosticResult) => {
    setPhase("processing");
    apiResolved.current = false;
    setApiResolvedState(false);
    apiResult.current = null;

    (async () => {
      try {
        const frameworks = selectFrameworks({
          decision_type: dr.decision_type,
          blast_radius: dr.blast_radius,
          primary_constraint: dr.primary_constraint,
        });
        const { data, error } = await supabase.functions.invoke("audit", {
          body: {
            decision: decision.trim(),
            stakes: dr.stakes,
            decision_type: dr.decision_type,
            blast_radius: dr.blast_radius,
            primary_constraint: dr.primary_constraint,
            success_vision: dr.success_vision,
            frameworks: frameworkIds(frameworks),
          },
        });
        if (error) throw error;
        const parsed = AuditResultSchema.parse(data);
        const id = generateId();

        await supabase.from("audit_results").insert({
          id,
          decision: decision.trim(),
          result: parsed as any,
          user_id: user?.id || null,
        });

        if (user) {
          const { data: subData } = await supabase
            .from("subscriptions")
            .select("audit_count")
            .eq("user_id", user.id)
            .single();
          
          if (subData) {
            await supabase
              .from("subscriptions")
              .update({ audit_count: (subData.audit_count ?? 0) + 1 })
              .eq("user_id", user.id);
          }
          refreshSubscription();
        } else {
          localStorage.setItem(ANON_AUDIT_KEY, "true");
          const prevAnonCount = parseInt(localStorage.getItem("stratos_anon_audit_count") || "0", 10);
          localStorage.setItem("stratos_anon_audit_count", String(prevAnonCount + 1));
        }

        apiResult.current = { parsed, id };
        apiResolved.current = true;
        setApiResolvedState(true);
      } catch (e: any) {
        console.error("Audit error:", e);
        const msg = e?.message || "";
        if (msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("too many")) {
          toast.error("You're moving fast! Please wait a moment before running another audit.");
        } else {
          toast.error(msg || "Failed to audit decision. Please try again.");
        }
        setPhase("landing");
      }
    })();
  };

  const handleProcessingDone = useCallback(() => {
    if (apiResult.current) {
      clearDiagnosticSession();
      sessionStorage.removeItem("stratos_diag_decision");
      setResult(apiResult.current.parsed);
      setAuditId(apiResult.current.id);
      setJournalSaved(false);
      setPhase("result");
    }
  }, []);

  const handleBackToLanding = () => {
    sessionStorage.removeItem("stratos_diag_decision");
    clearDiagnosticSession();
    setPhase("landing");
  };

  const handleReset = (prefill?: string) => {
    setResult(null);
    setDecision(prefill || "");
    setAuditId("");
    setJournalSaved(false);
    setDiagnosticResult(SKIP_DEFAULTS);
    clearDiagnosticSession();
    sessionStorage.removeItem("stratos_diag_decision");
    if (prefill && prefill.length >= 20) {
      sessionStorage.setItem("stratos_diag_decision", prefill);
      setPhase("diagnostic");
    } else {
      setPhase("landing");
    }
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
    setJournalSaved(true);
    toast.success("Saved to your private journal");
  };

  // Compute remaining audits
  const anonCount = parseInt(localStorage.getItem("stratos_anon_audit_count") || "0", 10);
  const currentTier = STRIPE_TIERS[subscription.plan];
  const remainingAudits = user ? Math.max(0, currentTier.audits - subscription.auditCount) : Math.max(0, 3 - anonCount);
  const hasUsedAudit = user ? subscription.auditCount > 0 : anonCount > 0;

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
          journalSaved={journalSaved}
          remainingAudits={remainingAudits}
          planName={subscription.plan}
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
          <HomepageLanding onSubmit={handleLandingSubmit} remainingAudits={remainingAudits} hasUsedAudit={hasUsedAudit} />
        </div>
      )}

      {phase === "diagnostic" && (
        <NewDiagnosticFlow
          decision={decision}
          onComplete={handleDiagnosticComplete}
          onSkip={handleSkipDiagnostic}
          onBackToLanding={handleBackToLanding}
        />
      )}

      {phase === "processing" && (
        <NewProcessingState
          lens={diagnosticResult.decision_type as any}
          scale={diagnosticResult.blast_radius as any}
          onApiReady={handleProcessingDone}
          apiResolved={apiResolvedState}
          decisionText={decision}
        />
      )}

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      <SignupGate open={showSignupGate} onClose={() => setShowSignupGate(false)} />
    </>
  );
};

export default Index;
