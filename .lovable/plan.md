

# Plan: Premium Brand Identity Overhaul

## Current State

The branding looks like a generic SaaS template: Inter bold, plain blue logo, no typographic personality. Compare to Anthropic's Claude (elegant serif "Claude"), Stripe (clean geometric wordmark), or Linear (distinctive tight sans). StratOS needs its own visual DNA.

## Changes

### 1. Typography — Premium Display Font
**`index.css` + `tailwind.config.ts`**
- Import **"Instrument Serif"** (Google Fonts) for headlines/logo only — it's the same class of elegant serif that Claude, Anthropic, and premium fintech brands use
- Keep Inter for body text (proven readability)
- Headlines (`h1-h3`): Instrument Serif, weight 400, tight letter-spacing (-0.03em)
- This single change transforms the entire feel from "SaaS template" to "premium intelligence platform"

### 2. Logo Mark — Refined Geometric Symbol
**`StratOSLogo.tsx` + `favicon.svg`**
- Redesign the SVG mark: replace the stacked chevrons with a clean **diamond/prism** shape — a single elegant geometric form suggesting clarity and precision
- Use a deeper gradient (brand blue → navy) for more sophistication
- Larger corner radius on the container (rx="8")
- The mark should work at 16px (favicon) and 32px (nav) without losing clarity

### 3. Wordmark — "StratOS" Typography
**`NavBar.tsx` + `Footer.tsx`**
- Render "Strat" in Instrument Serif (regular weight) + "OS" in Inter (semibold, slightly smaller, uppercase tracking)
- This creates a distinctive wordmark without needing a custom font file — the serif/sans contrast IS the brand
- Add a subtle dot separator or thin space between "Strat" and "OS"

### 4. Hero Headline — Serif Impact
**`HomepageLanding.tsx`**
- "Audit any decision." rendered in Instrument Serif — immediately feels like a premium consulting brand, not a tech startup
- Reduce font-weight to 400 (serifs don't need 800 weight — they carry authority naturally)
- Slightly increase size on desktop (text-6xl → text-7xl) for dramatic impact

### 5. Section Headings — Consistent Serif Treatment
**`SystemSections.tsx`, `MidPageCTA.tsx`, `TestimonialWall.tsx`, `FAQAccordion.tsx`, `PricingPage.tsx`**
- All section headings (How it works, What leaders say, etc.) use Instrument Serif
- Body text, labels, buttons, badges stay Inter — the contrast creates visual hierarchy

### 6. Color Refinement — Deeper, Richer
**`index.css`**
- Primary blue: shift from `221 83% 53%` to `225 84% 48%` — slightly deeper, more authoritative (closer to navy-blue territory)
- Add a secondary accent: warm gold `--accent-gold: 42 100% 50%` for premium touches (verdict badges, "Pro" tags)
- Update scrollbar thumb and CTA glow to match new primary

### 7. Footer — Brand Presence
**`Footer.tsx`**
- Use the new serif/sans wordmark
- Add tagline in Instrument Serif italic: *"Clarity for every decision"*
- Subtle gold accent on the copyright year

## Files Changed

1. **`src/index.css`** — Import Instrument Serif, update primary color, add accent-gold variable
2. **`tailwind.config.ts`** — Add `font-serif: ["Instrument Serif"]` family
3. **`src/components/StratOSLogo.tsx`** — Refined diamond/prism mark with deeper gradient
4. **`public/favicon.svg`** — Matching updated mark
5. **`src/components/NavBar.tsx`** — Serif/sans wordmark ("Strat" serif + "OS" sans)
6. **`src/components/Footer.tsx`** — Serif wordmark + italic tagline
7. **`src/components/HomepageLanding.tsx`** — Headline in Instrument Serif, 400 weight
8. **`src/components/SystemSections.tsx`** — Section heading in serif
9. **`src/components/MidPageCTA.tsx`** — Heading in serif
10. **`src/components/TestimonialWall.tsx`** — Section heading + quote in serif italic
11. **`src/components/FAQAccordion.tsx`** — Heading in serif
12. **`src/pages/PricingPage.tsx`** — Heading in serif

## What Doesn't Change
- AI engine, edge function, processing animation
- Diagnostic flow, results page layout, dashboard
- Authentication, routing, database
- All existing animations and interaction patterns

