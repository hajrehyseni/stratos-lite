import { STRIPE_TIERS } from "@/lib/stripe-config";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function UpgradeModal({ open, onClose }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!open) return null;

  const handleCheckout = async (plan: "pro" | "executive") => {
    if (!user) {
      navigate("/signup");
      onClose();
      return;
    }
    try {
      const tier = STRIPE_TIERS[plan];
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { price_id: tier.price_id },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Failed to start checkout");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative rounded-xl p-8 w-full"
        style={{ maxWidth: 560, background: "#0F0F0F", border: "1px solid #1A1A1A" }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-center" style={{ fontSize: 22, fontWeight: 600, color: "hsl(var(--foreground))" }}>
          You've reached your audit limit
        </h2>
        <p className="text-center mt-2" style={{ fontSize: 14, color: "hsl(var(--muted-foreground))" }}>
          Upgrade to continue making better decisions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {(["pro", "executive"] as const).map(key => {
            const tier = STRIPE_TIERS[key];
            return (
              <div key={key} className="rounded-lg p-5" style={{ border: key === "pro" ? "1px solid hsl(var(--primary))" : "1px solid #1A1A1A" }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "hsl(var(--foreground))" }}>{tier.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span style={{ fontSize: 28, fontWeight: 700, color: "hsl(var(--primary))" }}>£{tier.price}</span>
                  <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>/mo</span>
                </div>
                <p className="mt-1" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{tier.label}</p>
                <ul className="mt-4 space-y-2">
                  {tier.features.slice(0, 3).map(f => (
                    <li key={f} className="flex items-center gap-2" style={{ fontSize: 13, color: "hsl(var(--foreground))" }}>
                      <Check className="w-3.5 h-3.5" style={{ color: "hsl(var(--primary))" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout(key)}
                  className="w-full mt-4 rounded-lg py-2.5 font-semibold transition-all duration-200"
                  style={{
                    fontSize: 13,
                    background: key === "pro" ? "hsl(var(--primary))" : "transparent",
                    color: key === "pro" ? "hsl(var(--primary-foreground))" : "hsl(var(--primary))",
                    border: "1px solid hsl(var(--primary))",
                  }}
                >
                  Get {tier.name}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
