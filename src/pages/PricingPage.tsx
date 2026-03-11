import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { STRIPE_TIERS, type PlanType } from "@/lib/stripe-config";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { getJournalCount } from "@/lib/journal";

export default function PricingPage() {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async (plan: "pro" | "executive") => {
    if (!user) {
      navigate("/signup");
      return;
    }

    try {
      const tier = STRIPE_TIERS[plan];
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { price_id: tier.price_id },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to create checkout session");
    }
  };

  const plans: { key: PlanType; highlight: boolean }[] = [
    { key: "free", highlight: false },
    { key: "pro", highlight: true },
    { key: "executive", highlight: false },
  ];

  const cardBase = { background: "#0F0F0F", border: "1px solid #1A1A1A" };

  return (
    <>
      <NavBar journalCount={getJournalCount()} />
      <div className="min-h-screen px-4 pt-24 pb-16">
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div className="text-center mb-12">
            <h1 style={{ fontSize: 32, fontWeight: 600, color: "hsl(var(--foreground))" }}>
              Simple, transparent pricing
            </h1>
            <p className="mt-3" style={{ fontSize: 16, color: "hsl(var(--muted-foreground))" }}>
              Pay for what you need. Cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(({ key, highlight }) => {
              const tier = STRIPE_TIERS[key];
              const isCurrent = subscription.plan === key;

              return (
                <div
                  key={key}
                  className="rounded-xl p-6 flex flex-col"
                  style={{
                    ...cardBase,
                    border: highlight
                      ? "1px solid hsl(var(--primary))"
                      : "1px solid #1A1A1A",
                    position: "relative",
                  }}
                >
                  {highlight && (
                    <span
                      className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5"
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        background: "hsl(var(--primary))",
                        color: "hsl(var(--primary-foreground))",
                      }}
                    >
                      Most Popular
                    </span>
                  )}

                  <h3 style={{ fontSize: 20, fontWeight: 600, color: "hsl(var(--foreground))" }}>
                    {tier.name}
                  </h3>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span style={{ fontSize: 40, fontWeight: 700, color: "hsl(var(--primary))" }}>
                      £{tier.price}
                    </span>
                    {tier.price > 0 && (
                      <span style={{ fontSize: 14, color: "hsl(var(--muted-foreground))" }}>/month</span>
                    )}
                  </div>

                  <p className="mt-2" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                    {tier.label}
                  </p>

                  <ul className="mt-6 space-y-3 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "hsl(var(--primary))" }} />
                        <span style={{ fontSize: 14, color: "hsl(var(--foreground))" }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    {isCurrent ? (
                      <div
                        className="w-full text-center rounded-lg py-3"
                        style={{ fontSize: 14, fontWeight: 600, border: "1px solid hsl(var(--primary))", color: "hsl(var(--primary))" }}
                      >
                        Current Plan
                      </div>
                    ) : key === "free" ? (
                      <div
                        className="w-full text-center rounded-lg py-3"
                        style={{ fontSize: 14, color: "hsl(var(--muted-foreground))", border: "1px solid #1A1A1A" }}
                      >
                        {user ? "Included" : "Get Started"}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCheckout(key as "pro" | "executive")}
                        className="w-full rounded-lg py-3 font-semibold transition-all duration-200"
                        style={{
                          fontSize: 14,
                          background: highlight ? "hsl(var(--primary))" : "transparent",
                          color: highlight ? "hsl(var(--primary-foreground))" : "hsl(var(--primary))",
                          border: `1px solid hsl(var(--primary))`,
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "hsl(var(--primary))";
                          e.currentTarget.style.color = "hsl(var(--primary-foreground))";
                        }}
                        onMouseLeave={e => {
                          if (!highlight) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "hsl(var(--primary))";
                          }
                        }}
                      >
                        Upgrade to {tier.name}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
