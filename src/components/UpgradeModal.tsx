import { STRIPE_TIERS } from "@/lib/stripe-config";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, X, Shield } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const unlockedFeatures = ["MECE analysis", "Risk matrix", "Stakeholder map", "Confidence score"];
const proFeatures = ["Decision Journal", "Dashboard", "PDF exports", "Share links"];

export function UpgradeModal({ open, onClose }: Props) {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();

  if (!open) return null;

  const tier = STRIPE_TIERS[subscription.plan];
  const used = subscription.auditCount;
  const max = tier.audits;
  const pct = Math.min(100, Math.round((used / max) * 100));

  const handleCheckout = async (plan: "pro" | "executive") => {
    if (!user) {
      navigate("/signup");
      onClose();
      return;
    }
    try {
      const t = STRIPE_TIERS[plan];
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { price_id: t.price_id },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Failed to start checkout");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl p-8 w-full"
        style={{ maxWidth: 560, background: "hsl(228, 35%, 14%)", border: "1px solid hsla(0, 0%, 100%, 0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2"
          style={{ color: "hsl(var(--text-tertiary))", minWidth: 44, minHeight: 44 }}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Usage indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "hsl(var(--text-secondary))" }}>
              {used} of {max} free audits used
            </span>
            <span className="text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>
              {pct}%
            </span>
          </div>
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: 6, background: "hsla(0, 0%, 100%, 0.08)" }}
          >
            <div
              className="rounded-full transition-all duration-500"
              style={{ height: "100%", width: `${pct}%`, background: "hsl(var(--primary))" }}
            />
          </div>
        </div>

        <h2 className="text-xl font-bold" style={{ color: "hsl(var(--text-primary))" }}>
          You've used all your free audits
        </h2>
        <p className="mt-2 text-base" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.6 }}>
          Upgrade to keep making better decisions — start with a free 7-day Pro trial.
        </p>

        {/* What you've unlocked */}
        <div
          className="mt-6 rounded-xl p-5"
          style={{ background: "hsla(0, 0%, 100%, 0.03)", border: "1px solid hsla(0, 0%, 100%, 0.06)" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: "hsl(var(--text-tertiary))" }}
          >
            What you've unlocked so far
          </p>
          <div className="grid grid-cols-2 gap-2">
            {unlockedFeatures.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "hsl(var(--success))" }} />
                <span className="text-sm" style={{ color: "hsl(var(--text-primary))" }}>{f}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid hsla(0, 0%, 100%, 0.06)" }}>
            <p className="text-sm" style={{ color: "hsl(var(--text-secondary))" }}>
              Upgrade to also get:{" "}
              <span style={{ color: "hsl(var(--text-primary))" }}>{proFeatures.join(", ")}</span>
            </p>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {(["pro", "executive"] as const).map((key) => {
            const t = STRIPE_TIERS[key];
            const isPro = key === "pro";
            return (
              <div
                key={key}
                className="rounded-xl p-5"
                style={{
                  border: isPro
                    ? "1px solid hsl(var(--primary))"
                    : "1px solid hsla(0, 0%, 100%, 0.08)",
                }}
              >
                <h3 className="text-lg font-bold" style={{ color: "hsl(var(--text-primary))" }}>
                  {t.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold" style={{ color: "hsl(var(--primary))" }}>
                    £{t.price}
                  </span>
                  <span className="text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>/mo</span>
                </div>
                <p className="mt-1 text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>
                  {t.label}
                </p>
                <button
                  onClick={() => handleCheckout(key)}
                  className="w-full mt-4 rounded-full py-2.5 font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: isPro ? "hsl(var(--primary))" : "transparent",
                    color: isPro ? "hsl(var(--primary-foreground))" : "hsl(var(--text-primary))",
                    border: isPro ? "none" : "1px solid hsla(0, 0%, 100%, 0.2)",
                    boxShadow: isPro ? "0 4px 16px hsla(16, 100%, 62%, 0.3)" : "none",
                    minHeight: 44,
                  }}
                >
                  {isPro ? "Start free trial →" : "Go Executive"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Money-back guarantee */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <Shield className="w-4 h-4" style={{ color: "hsl(var(--text-tertiary))" }} />
          <span className="text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>
            30-day money-back guarantee
          </span>
        </div>

        {/* Continue on free plan */}
        <button
          onClick={onClose}
          className="w-full mt-4 text-center text-sm transition-opacity hover:opacity-80"
          style={{ color: "hsl(var(--text-tertiary))", background: "none", border: "none", minHeight: 44 }}
        >
          Continue on free plan
        </button>
      </div>
    </div>
  );
}
