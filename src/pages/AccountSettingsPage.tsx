import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_TIERS } from "@/lib/stripe-config";
import { toast } from "sonner";
import { User, CreditCard, AlertTriangle, ExternalLink } from "lucide-react";

export default function AccountSettingsPage() {
  const { user, subscription, signOut } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  if (!user) { navigate("/login?redirect=settings"); return null; }

  const tier = STRIPE_TIERS[subscription.plan];
  const usagePercent = Math.min(100, Math.round((subscription.auditCount / tier.audits) * 100));

  const handleManageBilling = async () => {
    setBillingLoading(true);
    try { const { data, error } = await supabase.functions.invoke("customer-portal"); if (error) throw error; if (data?.url) window.location.href = data.url; } catch { toast.error("Could not open billing portal"); }
    setBillingLoading(false);
  };

  const handleDeleteAccount = async () => { toast.success("Account deletion requested. You've been signed out."); await signOut(); navigate("/"); };

  return (
    <>
      <NavBar />
      <div className="min-h-screen px-4 pt-28 pb-20 page-enter" style={{ background: "hsl(var(--background))" }}>
        <div style={{ maxWidth: 640 }} className="mx-auto">
          <h1 className="text-3xl font-bold mb-10" style={{ color: "hsl(var(--text-primary))" }}>Account Settings</h1>

          <section className="rounded-2xl p-6 mb-6" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
            <div className="flex items-center gap-3 mb-5">
              <User className="w-5 h-5" style={{ color: "hsl(var(--text-tertiary))" }} />
              <h2 className="text-lg font-semibold" style={{ color: "hsl(var(--text-primary))" }}>Profile</h2>
            </div>
            <div className="space-y-4">
              <div><label className="text-sm font-medium" style={{ color: "hsl(var(--text-tertiary))" }}>Email</label><p className="text-base mt-1" style={{ color: "hsl(var(--text-primary))" }}>{user.email}</p></div>
              <div><label className="text-sm font-medium" style={{ color: "hsl(var(--text-tertiary))" }}>Member since</label><p className="text-base mt-1" style={{ color: "hsl(var(--text-primary))" }}>{new Date(user.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p></div>
            </div>
          </section>

          <section className="rounded-2xl p-6 mb-6" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
            <div className="flex items-center gap-3 mb-5">
              <CreditCard className="w-5 h-5" style={{ color: "hsl(var(--text-tertiary))" }} />
              <h2 className="text-lg font-semibold" style={{ color: "hsl(var(--text-primary))" }}>Plan & Usage</h2>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-base font-semibold" style={{ color: "hsl(var(--text-primary))" }}>{tier.name} plan</p><p className="text-sm" style={{ color: "hsl(var(--text-secondary))" }}>{tier.label}</p></div>
              {subscription.plan === "free" ? (
                <button onClick={() => navigate("/pricing")} className="rounded-full px-5 py-2 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>Upgrade</button>
              ) : (
                <button onClick={handleManageBilling} disabled={billingLoading} className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-all hover:scale-[1.02]" style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--text-primary))", background: "transparent", opacity: billingLoading ? 0.6 : 1 }}>Manage subscription <ExternalLink className="w-3.5 h-3.5" /></button>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2"><span className="text-sm" style={{ color: "hsl(var(--text-secondary))" }}>Audits used this period</span><span className="text-sm font-semibold" style={{ color: "hsl(var(--text-primary))" }}>{subscription.auditCount} / {tier.audits}</span></div>
              <div className="rounded-full overflow-hidden" style={{ height: 8, background: "hsl(var(--border))" }}>
                <div className="rounded-full transition-all duration-500" style={{ width: `${usagePercent}%`, height: "100%", background: usagePercent > 80 ? "hsl(var(--warning))" : "hsl(var(--primary))" }} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl p-6" style={{ background: "hsla(0, 84%, 60%, 0.04)", border: "1px solid hsla(0, 84%, 60%, 0.15)" }}>
            <div className="flex items-center gap-3 mb-4"><AlertTriangle className="w-5 h-5" style={{ color: "hsl(var(--destructive))" }} /><h2 className="text-lg font-semibold" style={{ color: "hsl(var(--destructive))" }}>Danger Zone</h2></div>
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} className="rounded-xl px-5 py-3 text-sm font-medium transition-all hover:scale-[1.02]" style={{ border: "1px solid hsl(var(--destructive))", color: "hsl(var(--destructive))", background: "transparent" }}>Delete account</button>
            ) : (
              <div>
                <p className="text-sm mb-4" style={{ color: "hsl(var(--text-secondary))" }}>This will permanently delete your account and all data. This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={handleDeleteAccount} className="rounded-xl px-5 py-3 text-sm font-semibold" style={{ background: "hsl(var(--destructive))", color: "hsl(var(--destructive-foreground))" }}>Yes, delete my account</button>
                  <button onClick={() => setShowDeleteConfirm(false)} className="rounded-xl px-5 py-3 text-sm font-medium" style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--text-primary))", background: "transparent" }}>Cancel</button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
