-- Drop the overly permissive update policy
DROP POLICY "Service role can update subscriptions" ON public.subscriptions;

-- Replace with policy that allows users to update their own, and service role bypasses RLS anyway
CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Also tighten audit_results: let authenticated users update their own
CREATE POLICY "Users can update own audit results" ON public.audit_results
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);