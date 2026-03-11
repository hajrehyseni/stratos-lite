import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.text();

    // Parse event (webhook signature verification would go here in production)
    const event = JSON.parse(body) as Stripe.Event;

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log(`[STRIPE-WEBHOOK] Event: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (userId && customerId) {
        // Get subscription details to determine plan
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const productId = sub.items.data[0].price.product as string;
        const plan = productId === "prod_U80LMla9yMEoUz" ? "executive" : "pro";

        await supabaseClient
          .from("subscriptions")
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan,
            status: "active",
            audit_count: 0,
            period_start: new Date(sub.current_period_start * 1000).toISOString(),
          })
          .eq("user_id", userId);

        console.log(`[STRIPE-WEBHOOK] Activated ${plan} for user ${userId}`);
      }
    }

    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const productId = sub.items.data[0].price.product as string;
      const plan = productId === "prod_U80LMla9yMEoUz" ? "executive" : "pro";

      // Check if period changed (new billing cycle) — reset audit count
      const { data: existing } = await supabaseClient
        .from("subscriptions")
        .select("period_start")
        .eq("stripe_customer_id", customerId)
        .single();

      const newPeriodStart = new Date(sub.current_period_start * 1000).toISOString();
      const periodChanged = existing?.period_start !== newPeriodStart;

      await supabaseClient
        .from("subscriptions")
        .update({
          plan,
          status: sub.status === "active" ? "active" : "inactive",
          period_start: newPeriodStart,
          ...(periodChanged ? { audit_count: 0 } : {}),
        })
        .eq("stripe_customer_id", customerId);

      console.log(`[STRIPE-WEBHOOK] Updated subscription for customer ${customerId}: ${plan}`);
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      await supabaseClient
        .from("subscriptions")
        .update({
          plan: "free",
          status: "canceled",
          stripe_subscription_id: null,
        })
        .eq("stripe_customer_id", customerId);

      console.log(`[STRIPE-WEBHOOK] Canceled subscription for customer ${customerId}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[STRIPE-WEBHOOK] Error: ${message}`);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
