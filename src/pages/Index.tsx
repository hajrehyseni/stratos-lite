import { useState } from "react";
import { DecisionInput } from "@/components/DecisionInput";
import { Scorecard } from "@/components/Scorecard";
import { AuditResult, AuditResultSchema } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function generateId(): string {
  return Math.random().toString(36).substring(2, 8);
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [decision, setDecision] = useState("");
  const [auditId, setAuditId] = useState("");

  const handleSubmit = async (decisionText: string) => {
    setIsLoading(true);
    setDecision(decisionText);

    try {
      const { data, error } = await supabase.functions.invoke("audit", {
        body: { decision: decisionText },
      });

      if (error) throw error;

      const parsed = AuditResultSchema.parse(data);
      const id = generateId();

      // Store in DB for share links
      await supabase.from("audit_results").insert({
        id,
        decision: decisionText,
        result: parsed as any,
      });

      setResult(parsed);
      setAuditId(id);
    } catch (e: any) {
      console.error("Audit error:", e);
      toast.error(e?.message || "Failed to audit decision. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setDecision("");
    setAuditId("");
  };

  if (result) {
    return <Scorecard decision={decision} result={result} auditId={auditId} onReset={handleReset} />;
  }

  return <DecisionInput onSubmit={handleSubmit} isLoading={isLoading} />;
};

export default Index;
