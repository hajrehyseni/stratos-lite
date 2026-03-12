import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { STRIPE_TIERS, type PlanType } from "@/lib/stripe-config";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, Shield } from "lucide-react";
import { getJournalCount } from "@/lib/journal";

const perAudit: Record<PlanType, string> = { free: "£0 per audit", pro: "£0.76 per audit", executive: "£0.41 per audit" };

const comparisonRows = [
  { label: "Monthly audits", free: "3 total", pro: "25", exec: "120" },
  { label: "Full scorecard", free: "✓", pro: "✓", exec: "✓" },
  { label: "Decision journal", free: "—", pro: "✓", exec: "✓" },
  { label: "Dashboard & analytics", free: "—", pro: "✓", exec: "✓" },
  { label: "PDF export", free: "—", pro: "✓", exec: "✓" },
  { label: "Share links", free: "—", pro: "✓", exec: "✓" },
  { label: "Priority processing", free: "—", pro: "—", exec: "✓" },
  { label: "Team sharing", free: "—", pro: "—", exec: "✓" },
];

export default function PricingPage() {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async (plan: "pro" | "executive") => {
    if (!user) { navigate("/signup"); return; }
    try {
      const tier = STRIPE_TIERS[plan];
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { price_id: tier.price_id },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error(e?.message || "Failed to create checkout session");
    }
  };

  const plans: { key: PlanType; highlight: boolean; ctaLabel: string }[] = [
    { key: "free", highlight: false, ctaLabel: "Start Free" },
    { key: "pro", highlight: true, ctaLabel: "Start Pro trial" },
    { key: "executive", highlight: false, ctaLabel: "Go Executive" },
  ];

  return (
    <>
      <NavBar journalCount={getJournalCount()} />
      <div className="min-h-screen px-4 pt-24 pb-16 page-enter">
        <div style={{ maxWidth: 1120 }} className="mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-2xl md:text-3xl font-semibold" style={{ color: "#FFFFFF" }}>
              One wrong satisficing call costs more than a year of StratOS
            </h1>
            <p className="mt-3 text-base" style={{ color: "#6B7280" }}>
              Every plan includes all 6 strategic frameworks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(({ key, highlight, ctaLabel }) => {
              const tier = STRIPE_TIERS[key];
              const isCurrent = subscription.plan === key;

              return (
                <div
                  key={key}
                  className="rounded-xl p-6 flex flex-col relative transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: highlight ? "1px solid hsl(16, 100%, 62%)" : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: highlight ? "0 0 20px hsla(16, 100%, 62%, 0.1)" : "none",
                  }}
                >
                  {highlight && (
                    <span
                      className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[11px] font-bold"
                      style={{ background: "hsl(16, 100%, 62%)", color: "#FFFFFF" }}
                    >
                      Most Popular
                    </span>
                  )}

                  <h3 className="text-xl font-semibold" style={{ color: "#FFFFFF" }}>{tier.name}</h3>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold" style={{ color: "#FFFFFF" }}>£{tier.price}</span>
                    {tier.price > 0 && <span className="text-sm" style={{ color: "#6B7280" }}>/month</span>}
                  </div>
                  <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>{perAudit[key]}</p>
                  <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>{tier.label}</p>

                  <ul className="mt-6 space-y-3 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "hsl(160, 84%, 39%)" }} />
                        <span className="text-sm" style={{ color: "#FFFFFF" }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    {isCurrent ? (
                      <div className="w-full text-center rounded-full py-3 text-sm font-semibold" style={{ border: "1px solid rgba(255,255,255,0.2)", color: "#FFFFFF" }}>
                        Current Plan
                      </div>
                    ) : key === "free" ? (
                      <button
                        onClick={() => !user && navigate("/signup")}
                        className="w-full rounded-full py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          color: "#FFFFFF",
                          border: "1px solid rgba(255,255,255,0.2)",
                          background: "transparent",
                        }}
                      >
                        {user ? "Included" : ctaLabel}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCheckout(key as "pro" | "executive")}
                        className="w-full rounded-full py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: highlight ? "hsl(16, 100%, 62%)" : "transparent",
                          color: "#FFFFFF",
                          border: highlight ? "none" : "1px solid rgba(255,255,255,0.2)",
                          boxShadow: highlight ? "0 0 16px hsla(16, 100%, 62%, 0.3)" : "none",
                        }}
                      >
                        {ctaLabel}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Money-back guarantee */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <Shield className="w-4 h-4" style={{ color: "#6B7280" }} />
            <span className="text-sm" style={{ color: "#6B7280" }}>
              30-day money-back guarantee
            </span>
          </div>

          {/* Comparison table */}
          <div className="mt-16 overflow-x-auto">
            <table className="w-full" style={{ maxWidth: 768, margin: "0 auto" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <th className="text-left py-3 text-sm font-medium" style={{ color: "#6B7280" }}>Feature</th>
                  <th className="text-center py-3 text-sm font-medium" style={{ color: "#6B7280" }}>Free</th>
                  <th className="text-center py-3 text-sm font-medium" style={{ color: "hsl(16, 100%, 62%)" }}>Pro</th>
                  <th className="text-center py-3 text-sm font-medium" style={{ color: "#6B7280" }}>Executive</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="py-3 text-sm" style={{ color: "#FFFFFF" }}>{row.label}</td>
                    {[row.free, row.pro, row.exec].map((val, i) => (
                      <td key={i} className="text-center py-3 text-sm" style={{ color: val === "✓" ? "hsl(160, 84%, 39%)" : val === "—" ? "rgba(255,255,255,0.2)" : "#FFFFFF" }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
