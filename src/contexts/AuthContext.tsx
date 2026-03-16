import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { getPlanFromProductId, type PlanType } from "@/lib/stripe-config";

interface SubscriptionState {
  plan: PlanType;
  auditCount: number;
  subscriptionEnd: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: SubscriptionState;
  refreshSubscription: () => Promise<void>;
  signOut: () => Promise<void>;
}

const defaultSub: SubscriptionState = { plan: "free", auditCount: 0, subscriptionEnd: null };

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  subscription: defaultSub,
  refreshSubscription: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionState>(defaultSub);

  const fetchSubscription = useCallback(async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setSubscription(defaultSub);
      return;
    }

    try {
      // First check local DB subscription
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("plan, audit_count")
        .eq("user_id", currentSession.user.id)
        .single();

      if (subData) {
        // Also check Stripe for paid plans
        const { data: stripeData } = await supabase.functions.invoke("check-subscription", {
          headers: { Authorization: `Bearer ${currentSession.access_token}` },
        });

        if (stripeData?.subscribed && stripeData?.product_id) {
          const plan = getPlanFromProductId(stripeData.product_id);
          setSubscription({
            plan,
            auditCount: subData.audit_count ?? 0,
            subscriptionEnd: stripeData.subscription_end,
          });
        } else {
          setSubscription({
            plan: (subData.plan as PlanType) || "free",
            auditCount: subData.audit_count ?? 0,
            subscriptionEnd: null,
          });
        }
      }
    } catch (e) {
      console.error("Failed to fetch subscription:", e);
    }
  }, []);

  useEffect(() => {
    // Set up auth listener BEFORE checking session
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        console.log("Auth event:", _event, "User:", newSession?.user?.email);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
        // Defer subscription fetch to avoid deadlocks
        setTimeout(() => fetchSubscription(newSession), 0);
      }
    );

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setLoading(false);
      fetchSubscription(existingSession);
    });

    return () => authSub.unsubscribe();
  }, [fetchSubscription]);

  // Refresh subscription periodically
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => fetchSubscription(session), 60000);
    return () => clearInterval(interval);
  }, [session, fetchSubscription]);

  const refreshSubscription = useCallback(async () => {
    await fetchSubscription(session);
  }, [session, fetchSubscription]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSubscription(defaultSub);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, subscription, refreshSubscription, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
