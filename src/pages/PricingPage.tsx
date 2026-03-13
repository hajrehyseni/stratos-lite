import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { STRIPE_TIERS, type PlanType } from "@/lib/stripe-config";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, Shield, ArrowRight } from "lucide-react";
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

const frameworks = [
  "MECE analysis",
  "Risk matrix",
  "Stakeholder mapping",
  "Cynefin classification",
  "Pre-mortem analysis",
  "RAPID framework",
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
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      toast.error(e?.message || "Failed to create checkout session");
    }
  };

  const plans: { key: PlanType; highlight: boolean; ctaLabel: string }[] = [
    { key: "free", highlight: false, ctaLabel: "Get Started Free" },
    { key: "pro", highlight: true, ctaLabel: "Start Pro trial" },
    { key: "executive", highlight: false, ctaLabel: "Go Executive" },
  ];

  return (
    <>
      <NavBar journalCount={getJournalCount()} />
      <div className="min-h-screen px-4 pt-28 pb-20 page-enter">
        <div style={{ maxWidth: 1120 }} className="mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: "hsl(var(--text-primary))" }}>
              Simple pricing for better decisions
            </h1>
            <p className="mt-5 text-lg md:text-xl" style={{ color: "hsl(var(--text-secondary))", maxWidth: 560, margin: "20px auto 0" }}>
              Every plan includes all 6 strategic frameworks. Start free, upgrade when you need more.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(({ key, highlight, ctaLabel }) => {
              const tier = STRIPE_TIERS[key];
              const isCurrent = subscription.plan === key;

              return (
                <div
                  key={key}
                  className="rounded-2xl p-8 flex flex-col relative transition-all duration-200"
                  style={{
                    background: "hsla(0, 0%, 100%, 0.04)",
                    border: highlight ? "2px solid hsl(var(--primary))" : "1px solid hsla(0, 0%, 100%, 0.08)",
                    boxShadow: highlight ? "0 0 40px hsla(16, 100%, 62%, 0.12)" : "none",
                  }}
                >
                  {highlight && (
                    <span
                      className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold"
                      style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
                    >
                      Most Popular
                    </span>
                  )}

                  <h3 className="text-xl font-bold" style={{ color: "hsl(var(--text-primary))" }}>{tier.name}</h3>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold" style={{ color: "hsl(var(--text-primary))" }}>£{tier.price}</span>
                    {tier.price > 0 && <span className="text-base" style={{ color: "hsl(var(--text-secondary))" }}>/month</span>}
                  </div>
                  <p className="mt-1 text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>{perAudit[key]}</p>
                  <p className="mt-1 text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>{tier.label}</p>

                  <ul className="mt-6 space-y-3 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "hsl(var(--success))" }} />
                        <span className="text-base" style={{ color: "hsl(var(--text-primary))" }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    {isCurrent && key === "free" ? (
                      <button
                        onClick={() => navigate("/")}
                        className="w-full text-center rounded-full py-3.5 text-base font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        style={{ border: "1px solid hsla(0, 0%, 100%, 0.2)", color: "hsl(var(--text-primary))", background: "transparent", minHeight: 48 }}
                      >
                        Get Started Free
                      </button>
                    ) : isCurrent ? (
                      <div className="w-full text-center rounded-full py-3.5 text-base font-semibold" style={{ border: "1px solid hsla(0, 0%, 100%, 0.2)", color: "hsl(var(--text-primary))" }}>
                        Current Plan
                      </div>
                    ) : key === "free" ? (
                      <button
                        onClick={() => navigate("/")}
                        className="w-full rounded-full py-3.5 text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          color: "hsl(var(--text-primary))",
                          border: "1px solid hsla(0, 0%, 100%, 0.2)",
                          background: "transparent",
                          minHeight: 48,
                        }}
                      >
                        Get Started Free
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCheckout(key as "pro" | "executive")}
                        className="w-full rounded-full py-3.5 text-base font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: highlight ? "hsl(var(--primary))" : "transparent",
                          color: highlight ? "hsl(var(--primary-foreground))" : "hsl(var(--text-primary))",
                          border: highlight ? "none" : "1px solid hsla(0, 0%, 100%, 0.2)",
                          boxShadow: highlight ? "0 4px 20px hsla(16, 100%, 62%, 0.3)" : "none",
                          minHeight: 48,
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
          <div className="flex items-center justify-center gap-2 mt-10">
            <Shield className="w-5 h-5" style={{ color: "hsl(var(--text-tertiary))" }} />
            <span className="text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>
              30-day money-back guarantee
            </span>
          </div>

          {/* All plans include */}
          <div className="mt-16 text-center">
            <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: "hsl(var(--text-tertiary))" }}>
              All plans include
            </p>
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-1">
              {frameworks.map((f, i) => (
                <span key={f} className="text-sm" style={{ color: "hsl(var(--text-secondary))" }}>
                  {f}{i < frameworks.length - 1 ? " ·" : ""}
                </span>
              ))}
            </div>
          </div>

          {/* Comparison table */}
          <div className="mt-16 overflow-x-auto">
            <table className="w-full" style={{ maxWidth: 768, margin: "0 auto" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid hsla(0, 0%, 100%, 0.1)" }}>
                  <th className="text-left py-4 text-sm font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--text-tertiary))" }}>Feature</th>
                  <th className="text-center py-4 text-sm font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--text-tertiary))" }}>Free</th>
                  <th className="text-center py-4 text-sm font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}>Pro</th>
                  <th className="text-center py-4 text-sm font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--text-tertiary))" }}>Executive</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label} style={{ borderBottom: "1px solid hsla(0, 0%, 100%, 0.06)" }}>
                    <td className="py-4 text-base" style={{ color: "hsl(var(--text-primary))" }}>{row.label}</td>
                    <td className="text-center py-4 text-base font-medium" style={{ color: row.free === "✓" ? "hsl(var(--success))" : row.free === "—" ? "hsl(var(--text-tertiary))" : "hsl(var(--text-primary))" }}>
                      {row.free}
                    </td>
                    <td className="text-center py-4 text-base font-medium" style={{ color: row.pro === "✓" ? "hsl(var(--success))" : row.pro === "—" ? "hsl(var(--text-tertiary))" : "hsl(var(--text-primary))" }}>
                      {row.pro}
                    </td>
                    <td className="text-center py-4 text-base font-medium" style={{ color: row.exec === "✓" ? "hsl(var(--success))" : row.exec === "—" ? "hsl(var(--text-tertiary))" : "hsl(var(--text-primary))" }}>
                      {row.exec}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center">
            <p className="text-xl font-semibold mb-4" style={{ color: "hsl(var(--text-primary))" }}>
              Not sure? Try a free audit first.
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
                boxShadow: "0 4px 20px hsla(16, 100%, 62%, 0.3)",
                minHeight: 52,
              }}
            >
              Run free audit
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
