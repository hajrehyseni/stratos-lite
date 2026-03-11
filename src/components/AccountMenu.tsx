import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_TIERS } from "@/lib/stripe-config";
import { toast } from "sonner";
import { User, CreditCard, LogOut, ChevronDown } from "lucide-react";

export function AccountMenu() {
  const { user, subscription, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const tier = STRIPE_TIERS[subscription.plan];
  const initial = user.email?.[0]?.toUpperCase() || "U";

  const handleBilling = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      toast.error("Could not open billing portal");
    }
    setOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate("/");
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
      >
        <span
          className="flex items-center justify-center rounded-full"
          style={{ width: 28, height: 28, background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", fontSize: 12, fontWeight: 600 }}
        >
          {initial}
        </span>
        <ChevronDown className="w-3.5 h-3.5" style={{ color: "hsl(var(--muted-foreground))" }} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 rounded-lg overflow-hidden shadow-xl z-50"
          style={{ width: 220, background: "#0F0F0F", border: "1px solid #1A1A1A" }}
        >
          <div className="px-4 py-3" style={{ borderBottom: "1px solid #1A1A1A" }}>
            <p className="truncate" style={{ fontSize: 13, color: "hsl(var(--foreground))" }}>{user.email}</p>
            <p style={{ fontSize: 11, color: "hsl(var(--primary))", marginTop: 2 }}>{tier.name} plan</p>
          </div>

          <button
            onClick={() => { navigate("/pricing"); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-white/[0.03] transition-colors"
            style={{ fontSize: 13, color: "hsl(var(--foreground))" }}
          >
            <User className="w-4 h-4" style={{ color: "hsl(var(--muted-foreground))" }} />
            Current Plan
          </button>

          {subscription.plan !== "free" && (
            <button
              onClick={handleBilling}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-white/[0.03] transition-colors"
              style={{ fontSize: 13, color: "hsl(var(--foreground))" }}
            >
              <CreditCard className="w-4 h-4" style={{ color: "hsl(var(--muted-foreground))" }} />
              Manage Billing
            </button>
          )}

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-white/[0.03] transition-colors"
            style={{ fontSize: 13, color: "hsl(var(--destructive))", borderTop: "1px solid #1A1A1A" }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
