import { useState } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { STRIPE_TIERS, type PlanType } from "@/lib/stripe-config";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, X, Shield } from "lucide-react";
import { getJournalCount } from "@/lib/journal";

const perAudit: Record<PlanType, string> = { free: "£0 per audit", pro: "£0.76 per audit", executive: "£0.41 per audit" };
const annualPrices: Record<PlanType, number> = { free: 0, pro: 15, executive: 39 };

const comparisonRows = [
  { label: "Monthly audits", free: "3 total", pro: "25", exec: "120" },
  { label: "Full scorecard", free: true, pro: true, exec: true },
  { label: "Decision journal", free: false, pro: true, exec: true },
  { label: "Dashboard & analytics", free: false, pro: true, exec: true },
  { label: "PDF export", free: false, pro: true, exec: true },
  { label: "Share links", free: false, pro: true, exec: true },
  { label: "Priority processing", free: false, pro: false, exec: true },
  { label: "Team sharing", free: false, pro: false, exec: true },
];

export default function PricingPage() {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);

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

  const plans: { key: PlanType; highlight: boolean }[] = [
    { key: "free", highlight: false },
    { key: "pro", highlight: true },
    { key: "executive", highlight: false },
  ];

  return (
    <>
      <NavBar journalCount={getJournalCount()} />
      <div className="min-h-screen px-4 pt-24 pb-16">
        <div style={{ maxWidth: 1024 }} className="mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold" style={{ color: "hsl(var(--foreground))" }}>
              One satisficing decision costs more than a year of StratOS
            </h1>
            <p className="mt-3 text-base" style={{ color: "hsl(var(--muted-foreground))" }}>
              Every plan includes all 6 strategic frameworks.
            </p>
          </div>

          {/* Annual / Monthly toggle */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className="text-sm" style={{ color: !annual ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative rounded-full transition-colors"
              style={{ width: 48, height: 26, background: annual ? "hsl(var(--primary))" : "rgba(255,255,255,0.15)" }}
            >
              <span
                className="absolute top-1 rounded-full transition-all duration-200"
                style={{
                  width: 18, height: 18,
                  background: annual ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
                  left: annual ? 26 : 4,
                }}
              />
            </button>
            <span className="text-sm" style={{ color: annual ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>
              Annual
            </span>
            {annual && (
              <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: "rgba(201,168,76,0.15)", color: "hsl(var(--primary))" }}>
                Save 20%
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(({ key, highlight }) => {
              const tier = STRIPE_TIERS[key];
              const isCurrent = subscription.plan === key;
              const displayPrice = annual ? annualPrices[key] : tier.price;

              return (
                <div
                  key={key}
                  className="rounded-xl p-6 flex flex-col relative transition-colors duration-200"
                  style={{
                    background: "#0F0F0F",
                    border: highlight ? "1px solid hsl(var(--primary))" : "1px solid rgba(255,255,255,0.1)",
                  }}
                  onMouseEnter={(e) => { if (!highlight) e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)"; }}
                  onMouseLeave={(e) => { if (!highlight) e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                >
                  {highlight && (
                    <span
                      className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[11px] font-bold uppercase"
                      style={{ letterSpacing: "0.08em", background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
                    >
                      Most Popular
                    </span>
                  )}

                  <h3 className="text-xl font-semibold" style={{ color: "hsl(var(--foreground))" }}>{tier.name}</h3>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold" style={{ color: "hsl(var(--primary))" }}>£{displayPrice}</span>
                    {displayPrice > 0 && <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>/month</span>}
                  </div>
                  <p className="mt-1 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{perAudit[key]}</p>
                  <p className="mt-1 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{tier.label}</p>

                  <ul className="mt-6 space-y-3 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "hsl(var(--primary))" }} />
                        <span className="text-sm" style={{ color: "hsl(var(--foreground))" }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    {isCurrent ? (
                      <div className="w-full text-center rounded-lg py-3 text-sm font-semibold" style={{ border: "1px solid hsl(var(--primary))", color: "hsl(var(--primary))" }}>
                        Current Plan
                      </div>
                    ) : key === "free" ? (
                      <div className="w-full text-center rounded-lg py-3 text-sm" style={{ color: "hsl(var(--muted-foreground))", border: "1px solid rgba(255,255,255,0.1)" }}>
                        {user ? "Included" : "Get Started"}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCheckout(key as "pro" | "executive")}
                        className="w-full rounded-lg py-3 text-sm font-semibold transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
                        style={{
                          background: highlight ? "hsl(var(--primary))" : "transparent",
                          color: highlight ? "hsl(var(--primary-foreground))" : "hsl(var(--primary))",
                          border: "1px solid hsl(var(--primary))",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "hsl(var(--primary))"; e.currentTarget.style.color = "hsl(var(--primary-foreground))"; }}
                        onMouseLeave={(e) => { if (!highlight) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "hsl(var(--primary))"; } }}
                      >
                        Upgrade to {tier.name}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Money-back guarantee */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <Shield className="w-4 h-4" style={{ color: "hsl(var(--muted-foreground))" }} />
            <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              30-day money-back guarantee
            </span>
          </div>

          {/* Comparison table */}
          <div className="mt-16 overflow-x-auto">
            <table className="w-full" style={{ maxWidth: 768, margin: "0 auto" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <th className="text-left py-3 text-sm font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Feature</th>
                  <th className="text-center py-3 text-sm font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Free</th>
                  <th className="text-center py-3 text-sm font-medium" style={{ color: "hsl(var(--primary))" }}>Pro</th>
                  <th className="text-center py-3 text-sm font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Executive</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="py-3 text-sm" style={{ color: "hsl(var(--foreground))" }}>{row.label}</td>
                    {[row.free, row.pro, row.exec].map((val, i) => (
                      <td key={i} className="text-center py-3">
                        {typeof val === "string" ? (
                          <span className="text-sm" style={{ color: "hsl(var(--foreground))" }}>{val}</span>
                        ) : val ? (
                          <Check className="w-4 h-4 mx-auto" style={{ color: "hsl(var(--primary))" }} />
                        ) : (
                          <X className="w-4 h-4 mx-auto" style={{ color: "hsl(var(--muted-foreground))", opacity: 0.3 }} />
                        )}
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
