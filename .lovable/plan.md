

# Plan: Apple/Uber-Grade Polish — Mobile-First, Concise, Magnetic

## Current State

The bones are solid but the experience still feels like a "good SaaS template" rather than an app business users open daily like Uber or Google Maps. The gaps: too much dead space on mobile, verbose subtitles, diagnostic cards feel cramped on 390px, testimonials lack personality, and no visual proof of what the user gets before committing.

## Changes

### 1. HomepageLanding.tsx — Kill Dead Space, Add Output Preview
- Remove `minHeight: "85vh"` — let content dictate height
- Reduce `pt-28 sm:pt-36` to `pt-20 sm:pt-28` and input `marginTop` from 40px to 24px
- Tighten chip section: reduce `mt-5` to `mt-4`, reduce gap
- Add social proof micro-line below chips: "Trusted by leaders at Series B+ startups and Fortune 500 companies" (12px, muted)
- Insert new `OutputPreview` component between `SystemSections` and `MidPageCTA`

### 2. OutputPreview.tsx (NEW) — Show What They Get
A static, non-interactive compressed preview showing:
- Score gauge circle with "72" and "CONDITIONAL PROCEED" badge
- 3 MECE bars (Strategic Fit 85%, Financial Viability 68%, Operational Readiness 61%)
- Section heading: "See what you'll get"
- "See full example" link to `/audit-results`
- Styled as a slightly elevated card with subtle shadow, max-width 580px, centered

### 3. SystemSections.tsx — Section Header + Visual Polish
- Add centered "How it works" heading with "3 steps, 30 seconds" subtitle above steps
- Increase mockup `maxWidth` from 300 to 360
- Increase connector line height from 100px to 180px, opacity from 0.2 to 0.35
- Add hover scale (1.03) + shadow lift on mockup cards

### 4. MidPageCTA.tsx — Value-Driven Copy
- Heading: "Your next big decision deserves better"
- Subtext: "McKinsey-grade audit in 30 seconds. No account needed."

### 5. TestimonialWall.tsx — Initials Avatars + Quote Marks
- Replace gray circle avatars with colored initial circles (brand blue bg, white letter)
- Add large faded `"` (36px, 8% opacity) at top-left of each card
- Heading: "What leaders say" (replace "Early feedback")
- Remove "From beta users" subtitle

### 6. NewDiagnosticFlow.tsx — Mobile-First Typeform Polish
- Decision pill: truncate to 40 chars on mobile (currently 60)
- Cards: on mobile use `gap-2.5` (tighter), reduce padding to `16px 20px`, emoji `text-xl`
- Textarea: add `text-base` (16px) to prevent iOS zoom, reduce rows to 3 on mobile
- Progress bar: thin to `h-0.5` (2px) — thinner = premium
- CTA button on step 5: full-width on mobile with 56px height
- Reduce container `py-24` to `py-16` on mobile
- Faster transitions: 300ms instead of 400ms for snappier mobile feel

### 7. NewProcessingState.tsx — Tighter Copy
- Decision pill: truncate to 50 chars on mobile (currently 80)
- Reduce `minHeight` from 90vh to 80vh on mobile
- Bottom text: "6 frameworks · 10-step methodology" (already done, verify spacing)

### 8. PricingPage.tsx — ROI Line
- Add below subtitle: "One bad decision costs more than a year of StratOS." in muted text

### 9. index.css — Minor Tweaks
- Reduce typeform transition keyframe durations from 400ms to 300ms

## Files Changed
1. `src/components/HomepageLanding.tsx` — tighter hero, social proof, insert OutputPreview
2. `src/components/OutputPreview.tsx` (NEW) — visual proof section
3. `src/components/SystemSections.tsx` — section heading, bigger mockups, taller connectors
4. `src/components/MidPageCTA.tsx` — value-driven copy
5. `src/components/TestimonialWall.tsx` — initials avatars, quote marks, better heading
6. `src/components/NewDiagnosticFlow.tsx` — mobile-optimised cards, textarea, spacing
7. `src/components/NewProcessingState.tsx` — tighter mobile spacing
8. `src/pages/PricingPage.tsx` — ROI context line
9. `src/index.css` — transition speed tweaks

## What Doesn't Change
- AI engine, edge function, processing logic
- Results page / Scorecard / MockAuditResults
- Authentication, routing, database
- Footer, NavBar, FAQ
- Desktop diagnostic flow (only mobile gets tighter)

