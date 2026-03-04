import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Scorecard } from "@/components/Scorecard";
import { NavBar } from "@/components/NavBar";
import { AuditResult, AuditResultSchema } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

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
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#FFB800", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-[24px] font-semibold text-foreground mb-2">Result not found</h1>
          <a href="/" style={{ color: "#FFB800", fontSize: 14 }} className="hover:opacity-80">
            Try StratOS →
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <Scorecard
        decision={data.decision}
        result={data.result}
        auditId={id!}
        onReset={() => window.location.href = "/"}
      />
    </>
  );
}
