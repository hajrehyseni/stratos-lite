import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Scorecard } from "@/components/Scorecard";
import { AuditResult, AuditResultSchema } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function SharedResult() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ decision: string; result: AuditResult } | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const { data: row } = await supabase
        .from("audit_results")
        .select("*")
        .eq("id", id)
        .single();

      if (row) {
        try {
          const parsed = AuditResultSchema.parse(row.result);
          setData({ decision: row.decision, result: parsed });
        } catch { /* invalid */ }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <h1 className="font-display text-2xl text-foreground mb-2">Result not found</h1>
          <a href="/" className="text-gold text-sm hover:underline">Try StratOS Lite →</a>
        </div>
      </div>
    );
  }

  return (
    <Scorecard
      decision={data.decision}
      result={data.result}
      auditId={id!}
      onReset={() => window.location.href = "/"}
    />
  );
}
