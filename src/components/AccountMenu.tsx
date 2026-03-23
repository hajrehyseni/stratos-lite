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
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;
  const tier = STRIPE_TIERS[subscription.plan];
  const initial = user.email?.[0]?.toUpperCase() || "U";

  const handleBilling = async () => {
    try { const { data, error } = await supabase.functions.invoke("customer-portal"); if (error) throw error; if (data?.url) window.open(data.url, "_blank"); } catch { toast.error("Could not open billing portal"); }
    setOpen(false);
  };

  const handleSignOut = async () => { await signOut(); setOpen(false); navigate("/"); };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 transition-opacity hover:opacity-80" aria-label="Account menu" style={{ minHeight: 44 }}>
        <span className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", fontSize: 13, fontWeight: 700 }}>{initial}</span>
        <ChevronDown className="w-4 h-4" style={{ color: "hsl(var(--text-tertiary))" }} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden shadow-xl z-50" style={{ width: 240, background: "hsl(0, 0%, 100%)", border: "1px solid hsl(var(--border))" }}>
          <div className="px-4 py-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <p className="truncate text-base" style={{ color: "hsl(var(--text-primary))" }}>{user.email}</p>
            <p className="text-sm mt-0.5" style={{ color: "hsl(var(--primary))" }}>{tier.name} plan</p>
          </div>
          <button onClick={() => { navigate("/settings"); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-black/[0.03] transition-colors" style={{ fontSize: 14, color: "hsl(var(--text-primary))", minHeight: 44 }}>
            <User className="w-4 h-4" style={{ color: "hsl(var(--text-tertiary))" }} />Account Settings
          </button>
          {subscription.plan !== "free" && (
            <button onClick={handleBilling} className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-black/[0.03] transition-colors" style={{ fontSize: 14, color: "hsl(var(--text-primary))", minHeight: 44 }}>
              <CreditCard className="w-4 h-4" style={{ color: "hsl(var(--text-tertiary))" }} />Manage Billing
            </button>
          )}
          <button onClick={handleSignOut} className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-black/[0.03] transition-colors" style={{ fontSize: 14, color: "hsl(var(--destructive))", borderTop: "1px solid hsl(var(--border))", minHeight: 44 }}>
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
