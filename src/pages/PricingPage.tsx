import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { STRIPE_TIERS, type PlanType } from "@/lib/stripe-config";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, Shield, ArrowRight, ArrowDown, Users } from "lucide-react";
import { useState, useEffect } from "react";

const perAudit: Record<PlanType, string> = { free: "£0 per audit", pro: "£0.76 per audit", executive: "£0.41 per audit" };
const annualPerAudit: Record<PlanType, string> = { free: "£0 per audit", pro: "£0.61 per audit", executive: "£0.33 per audit" };

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

const frameworks = ["MECE analysis", "Risk matrix", "Stakeholder mapping", "Cynefin classification", "Pre-mortem analysis", "RAPID framework"];

export default function PricingPage() {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);
  const [saveWiggle, setSaveWiggle] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSaveWiggle(true), 500);
    const t2 = setTimeout(() => setSaveWiggle(false), 1100);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  const handleCheckout = async (plan: "pro" | "executive") => {
    if (!user) { navigate("/signup"); return; }
    try {
      const tier = STRIPE_TIERS[plan];
      const { data, error } = await supabase.functions.invoke("create-checkout", { body: { price_id: tier.price_id } });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e: any) { toast.error(e?.message || "Failed to create checkout session"); }
  };

  const getPrice = (key: PlanType) => { const base = STRIPE_TIERS[key].price; if (!annual || base === 0) return base; return Math.round(base * 0.8 * 100) / 100; };

  const plans: { key: PlanType; highlight: boolean; ctaLabel: string; subtext?: string }[] = [
    { key: "free", highlight: false, ctaLabel: "Get Started Free" },
    { key: "pro", highlight: true, ctaLabel: "Start Pro trial", subtext: "7-day free trial · Cancel anytime" },
    { key: "executive", highlight: false, ctaLabel: "Go Executive", subtext: "Best for teams making 100+ decisions/month" },
  ];

  return (
    <>
      <NavBar />
      <div className="min-h-screen px-4 pt-28 pb-20 page-enter" style={{ background: "hsl(var(--background))" }}>
        <div style={{ maxWidth: 1120 }} className="mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: "hsl(var(--text-primary))" }}>Simple pricing</h1>
            <p className="mt-5 text-lg md:text-xl" style={{ color: "hsl(var(--text-secondary))", maxWidth: 560, margin: "20px auto 0" }}>All 6 frameworks included. Start free.</p>
            <p className="text-sm mt-3" style={{ color: "hsl(var(--text-tertiary))" }}>One bad decision costs more than a year of StratOS.</p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-10">
            <span className="text-sm font-medium" style={{ color: annual ? "hsl(var(--text-tertiary))" : "hsl(var(--text-primary))" }}>Monthly</span>
            <button onClick={() => setAnnual(!annual)} className="relative rounded-full transition-colors" style={{ width: 48, height: 26, background: annual ? "hsl(var(--primary))" : "hsl(var(--border))" }} aria-label="Toggle annual billing">
              <span className="absolute top-1 rounded-full transition-transform duration-200" style={{ width: 18, height: 18, background: "white", left: annual ? 26 : 4 }} />
            </button>
            <span className="text-sm font-medium" style={{ color: annual ? "hsl(var(--text-primary))" : "hsl(var(--text-tertiary))" }}>
              Annual <span className={`ml-1.5 rounded-full px-2 py-0.5 text-xs font-bold inline-block ${saveWiggle ? "animate-wiggle" : ""}`} style={{ background: "hsla(160, 84%, 39%, 0.1)", color: "hsl(var(--success))" }}>Save 20%</span>
            </span>
          </div>

          <div className="text-center mb-10">
            <button onClick={() => document.getElementById("comparison-table")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80" style={{ color: "hsl(var(--text-tertiary))" }}>Compare all features <ArrowDown className="w-4 h-4" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(({ key, highlight, ctaLabel, subtext }) => {
              const tier = STRIPE_TIERS[key];
              const isCurrent = subscription.plan === key;
              const price = getPrice(key);
              return (
                <div key={key} className="rounded-2xl p-8 flex flex-col relative transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5" style={{ background: highlight ? "hsl(var(--secondary))" : "hsl(0, 0%, 100%)", border: highlight ? "2px solid hsl(var(--primary))" : "1px solid hsl(var(--border))", boxShadow: highlight ? "0 4px 24px hsla(221, 83%, 53%, 0.1)" : "none" }}>
                  {highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>Most Popular</span>
                  )}
                  <h3 className="text-xl font-bold" style={{ color: "hsl(var(--text-primary))" }}>{tier.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold" style={{ color: "hsl(var(--text-primary))" }}>£{price % 1 === 0 ? price : price.toFixed(2)}</span>
                    {tier.price > 0 && <span className="text-base" style={{ color: "hsl(var(--text-secondary))" }}>/month</span>}
                  </div>
                  {annual && tier.price > 0 && <p className="text-sm mt-0.5" style={{ color: "hsl(var(--success))" }}>£{(price * 12).toFixed(0)} billed annually</p>}
                  <p className="mt-1 text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>{annual ? annualPerAudit[key] : perAudit[key]}</p>
                  <p className="mt-1 text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>{tier.label}</p>
                  <ul className="mt-6 space-y-3 flex-1">
                    {tier.features.map((f) => (<li key={f} className="flex items-start gap-2.5"><Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "hsl(var(--success))" }} /><span className="text-base" style={{ color: "hsl(var(--text-primary))" }}>{f}</span></li>))}
                  </ul>
                  <div className="mt-8">
                    {isCurrent && key !== "free" ? (
                      <div className="w-full text-center rounded-full py-3.5 text-base font-semibold" style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--text-primary))" }}>Current Plan</div>
                    ) : key === "free" ? (
                      <button onClick={() => navigate("/")} className="w-full rounded-full py-3.5 text-base font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]" style={{ color: "hsl(var(--text-primary))", border: "1px solid hsl(var(--border))", background: "transparent", minHeight: 48 }}>Get Started Free</button>
                    ) : (
                      <button onClick={() => handleCheckout(key as "pro" | "executive")} className="w-full rounded-full py-3.5 text-base font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", border: "none", minHeight: 48 }}>{ctaLabel}</button>
                    )}
                    {subtext && <p className="text-center mt-3 text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>{subtext}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <Users className="w-4 h-4" style={{ color: "hsl(var(--text-tertiary))" }} />
            <span className="text-sm" style={{ color: "hsl(var(--text-secondary))" }}>Used by leaders at startups and enterprises alike</span>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4">
            <Shield className="w-5 h-5" style={{ color: "hsl(var(--text-tertiary))" }} />
            <span className="text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>30-day money-back guarantee</span>
          </div>

          {/* frameworks list removed — redundant */}

          <div id="comparison-table" className="mt-16 overflow-x-auto scroll-mt-24">
            <table className="w-full" style={{ maxWidth: 768, margin: "0 auto" }}>
              <thead>
                <tr className="sticky top-16 z-10" style={{ borderBottom: "2px solid hsl(var(--border))", background: "hsl(var(--background))" }}>
                  <th className="text-left py-4 text-sm font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--text-tertiary))" }}>Feature</th>
                  <th className="text-center py-4 text-sm font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--text-tertiary))" }}>Free</th>
                  <th className="text-center py-4 text-sm font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}>Pro</th>
                  <th className="text-center py-4 text-sm font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--text-tertiary))" }}>Executive</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.label} style={{ borderBottom: "1px solid hsl(var(--border))", background: i % 2 === 0 ? "transparent" : "hsla(221, 83%, 53%, 0.02)" }}>
                    <td className="py-4 text-base" style={{ color: "hsl(var(--text-primary))" }}>{row.label}</td>
                    <td className="text-center py-4 text-base font-medium" style={{ color: row.free === "✓" ? "hsl(var(--success))" : row.free === "—" ? "hsl(var(--text-tertiary))" : "hsl(var(--text-primary))" }}>{row.free}</td>
                    <td className="text-center py-4 text-base font-medium" style={{ color: row.pro === "✓" ? "hsl(var(--success))" : row.pro === "—" ? "hsl(var(--text-tertiary))" : "hsl(var(--text-primary))" }}>{row.pro}</td>
                    <td className="text-center py-4 text-base font-medium" style={{ color: row.exec === "✓" ? "hsl(var(--success))" : row.exec === "—" ? "hsl(var(--text-tertiary))" : "hsl(var(--text-primary))" }}>{row.exec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* bottom CTA removed — redundant */}
        </div>
      </div>
      <Footer />
    </>
  );
}
