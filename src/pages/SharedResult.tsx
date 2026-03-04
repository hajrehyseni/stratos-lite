import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Scorecard } from "@/components/Scorecard";
import { NavBar } from "@/components/NavBar";
import { AuditResult, AuditResultSchema } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

export default function SharedResult() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ decision: string; result: AuditResult } | null>(null);

  useEffect(() => {
    async function load() {
      // Try URL hash first (encoded share link)
      if (location.hash) {
        try {
          const decoded = JSON.parse(decodeURIComponent(location.hash.slice(1)));
          const parsed = AuditResultSchema.parse(decoded.result);
          setData({ decision: decoded.decision, result: parsed });
          setLoading(false);
          return;
        } catch { /* fall through to DB */ }
      }

      // Fall back to database
      if (!id) { setLoading(false); return; }
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
  }, [id, location.hash]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-[24px] font-semibold mb-2" style={{ color: "#E8E4DF" }}>Result not found</h1>
          <a href="/" style={{ color: "#C9A84C", fontSize: 14 }} className="hover:opacity-80">
            Run your own audit →
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
        onReset={() => { window.location.href = "/"; }}
        readOnly
      />
    </>
  );
}
