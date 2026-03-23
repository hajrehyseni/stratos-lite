

# Plan: Restore the Full Multi-Stage Audit Flow

## Problem
The `handleLandingSubmit` in `Index.tsx` was changed to `navigate('/audit-results')` — bypassing the entire diagnostic interview AND the real AI audit engine. Users type a decision and get hardcoded mock data. The 3-stage diagnostic flow (Stakes → Context → Constraints) and the sophisticated edge function with 10-step SSM/SODA methodology are both present in the codebase but completely bypassed.

## What Exists (and works)
- **3-stage diagnostic interview** (`NewDiagnosticFlow.tsx`) — Stakes, Context (decision type + blast radius), Constraints (constraint + success vision)
- **Processing animation** (`NewProcessingState.tsx`) — phased loading with staggered checkmarks
- **Edge function** (`supabase/functions/audit/index.ts`) — full 10-step methodology with Lovable AI, tool-calling for structured JSON output
- **Scorecard component** (`Scorecard.tsx`) — renders real audit results
- **Mock results page** (`MockAuditResults.tsx`) — static demo page at `/audit-results`

## Plan

### 1. Fix `handleLandingSubmit` in `Index.tsx`
Restore the original flow: when user submits a decision, transition to the diagnostic phase instead of navigating away.

```
handleLandingSubmit = (text) => {
  setDecision(text);
  sessionStorage.setItem("stratos_diag_decision", text);
  setPhase("diagnostic");  // enters the 3-stage interview
}
```

This reconnects: **Landing → Diagnostic (3 stages) → Processing animation → AI audit call → Scorecard results**.

### 2. Keep `/audit-results` as a demo/fallback route
The `MockAuditResults` page stays available at `/audit-results` for demo purposes (e.g. dashboard "View" buttons link there). No changes needed.

### 3. Verify the edge function works
The `audit` edge function already uses `LOVABLE_API_KEY` and calls the Lovable AI Gateway with the full 10-step prompt. The `startProcessing` function in `Index.tsx` already calls `supabase.functions.invoke("audit", ...)` with all diagnostic answers. This path just needs to be reachable again.

## What Changes
- **1 file modified**: `src/pages/Index.tsx` — revert `handleLandingSubmit` from `navigate(...)` back to `setDecision(text); setPhase("diagnostic")`

## What Doesn't Change
- All UX improvements (light theme, animations, gauge, cards)
- Diagnostic flow component
- Processing animation
- Edge function
- Mock results page
- Dashboard, pricing, journal pages
- Authentication, routing, Supabase integration

## Risk
The edge function may fail if `LOVABLE_API_KEY` is missing or the `check-subscription` function has issues. The existing error handling in `startProcessing` already catches this and shows a toast + returns to landing. The mock page remains as a reliable demo fallback.

