

# Plan: Content Refinement & Value Delivery Overhaul

## Core Problem

The app has too much text, the homepage feels generic, and the output doesn't feel worth £49/month. The diagnostic flow questions are solid but the surrounding content — homepage sections, testimonials, FAQ answers, results page descriptions — is verbose. The actual AI engine (10-step SSM/SODA methodology) is genuinely powerful but the presentation undersells it.

## Philosophy: Less Text, More Impact

Every word earns its place or gets cut. The user should feel the value within 5 seconds of seeing any screen.

---

## 1. HOMEPAGE — Strip to Essentials

**Hero** — Tighten copy:
- Headline stays (it's strong)
- Subtitle: cut to **"Fortune 500 frameworks. 30-second audit. Free."** (from 20 words to 6)
- Remove "✓ Free · No signup · 30 seconds · 🔒 Private & encrypted" — redundant with new subtitle
- Keep chips but reduce to 3 (cut "Should we enter a new market?" — least specific)

**How It Works (SystemSections)** — Make punchy:
- Cut body text from 2 sentences to 1 each:
  - Diagnose: "MECE decomposition. Every angle mapped. No blind spots."
  - Assess: "Top 3 risks surfaced with specific mitigations."
  - Decide: "Confidence score, clear verdict, devil's advocate challenge."
- Remove visual mockups on mobile entirely (already hidden) — on desktop make them smaller

**TrustStrip** — Keep as-is (numbers are good, already concise)

**MidPageCTA** — Tighten:
- Heading: "Ready?" (from "Ready to make a better call?")
- Subtext: "30 seconds to clarity." (from "Your next big decision deserves more than instinct.")

**Testimonials** — Shorter quotes, add role credibility:
- Cut each quote to ~15 words max
- Quote 1: "Replaced 3 hours of board prep. The risk surface alone saved us from a bad acquisition."
- Quote 2: "80% of McKinsey's value in 30 seconds. Best pre-meeting prep I've found."  
- Quote 3: "Caught a political blind spot we all missed. We run every major decision through it."
- Section heading: "What leaders say" (from "Trusted by leaders making high-stakes calls")

**FAQ** — Cut to 4 questions (from 6), shorter answers:
- Keep: Privacy, How different from ChatGPT, Who's it for, Is it free
- Drop: "What frameworks" (already shown in How It Works) and "Can I trust AI" (defensive)
- Trim each answer to 2 sentences max

## 2. DIAGNOSTIC FLOW — Already Good, Minor Tweaks

- Step 1 subtitle: "Worst case — money, trust, opportunities." (from "Think worst-case: money lost, trust eroded, opportunities missed.")
- Step 5 subtitle: "This anchors your audit to your definition of success." (from "Paint the picture. This anchors our analysis to your definition of success.")
- Bottom text on step 5: "Powering your audit: McKinsey 7S · SODA · RAPID · Cynefin · Pre-Mortem" (shorter, more impressive)

## 3. PROCESSING STATE — Add Gravitas

- Change step labels to feel more premium:
  - "Parsing decision context..." → "Mapping decision architecture..."
  - "Mapping stakeholder landscape..." → "Modelling stakeholder dynamics..."
  - "Identifying hidden assumptions..." → "Stress-testing assumptions..."
  - "Stress-testing the inverse position..." → "Running pre-mortem analysis..."
  - "Building risk register..." → "Quantifying risk exposure..."
  - "Generating strategic recommendation..." → "Synthesising strategic verdict..."
- Bottom text: "6 frameworks · 10-step methodology" (from "Applying 6 strategic frameworks...")

## 4. RESULTS PAGE (MockAuditResults) — Deliver 100x Value

This is the money shot. The current mock data is good but the presentation buries the value.

**Score section** — Tighten verdict description to 2 sentences max. Current is 3 sentences. Cut the middle one about cash reserves.

**MECE cards** — Cut descriptions to 1 sentence each (currently 2). The score bar already communicates magnitude.

**Risk cards** — Keep as-is (already concise and actionable)

**Stakeholder cards** — Shorten action text to 1 sentence each

**Devil's Advocate** — Keep (this is a differentiator)

**RAPID** — Keep (unique value)

**Add "Executive Summary" export-ready block** at the very top after the score — a 3-line TL;DR:
```
Verdict: CONDITIONAL PROCEED (72/100)
Key Risk: Integration timeline and talent retention
Next Step: Commission independent tech due diligence this week
```
This alone is worth £49/month — it's what an exec copies into their board email.

## 5. SCORECARD (Live Results) — Fix Dark Theme Remnants

The `Scorecard.tsx` still uses dark theme styles (`hsla(228, 35%, 14%)`, `hsla(0, 0%, 100%, 0.03)`). Update card styles and sticky nav to match the light theme used in MockAuditResults.

## 6. PRICING PAGE — Tighten

- Cut heading to: "Simple pricing" (from "Simple pricing for better decisions")
- Subtitle to: "All 6 frameworks included. Start free." (from current 20+ words)
- Remove the "All plans include" framework list at bottom (redundant — already in cards)
- Remove "Not sure? Try a free audit first" section at bottom (redundant — Free card already says this)

## Files Changed

1. **`src/components/HomepageLanding.tsx`** — Tighter subtitle, fewer chips, remove redundant trust line
2. **`src/components/SystemSections.tsx`** — 1-sentence body text per step
3. **`src/components/MidPageCTA.tsx`** — 2-word heading, shorter subtext
4. **`src/components/TestimonialWall.tsx`** — Shorter section heading, trimmed quotes
5. **`src/components/FAQAccordion.tsx`** — 4 FAQs, 2-sentence answers
6. **`src/components/NewDiagnosticFlow.tsx`** — Tighter subtitles, better bottom text
7. **`src/components/NewProcessingState.tsx`** — Premium step labels, shorter bottom text
8. **`src/pages/MockAuditResults.tsx`** — Executive summary block, trimmed descriptions, tighter copy
9. **`src/components/Scorecard.tsx`** — Fix dark theme remnants to light theme
10. **`src/pages/PricingPage.tsx`** — Tighter heading/subtitle, remove redundant sections

## What Doesn't Change

- Diagnostic flow structure (5 screens, same data collected)
- AI engine and edge function
- Authentication, routing, database
- All animations and transitions
- Mobile responsive behaviour

