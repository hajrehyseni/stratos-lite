

# Plan: Apple-Style Branding Overhaul

## What Apple Branding Actually Means

Apple's design language is defined by: **SF Pro** (clean geometric sans-serif everywhere), **monochrome with one accent**, **massive whitespace**, **no decorative elements**, **black text on white**, and **ultra-clean geometric forms**. The current StratOS uses decorative serifs, blue-heavy color, dot-grid textures, and ornate typography — the opposite of Apple.

## Current vs Apple Direction

| Element | Current | Apple Style |
|---------|---------|-------------|
| Logo font | DM Serif Display (decorative serif) | Clean geometric sans (SF Pro / Inter) |
| Headline font | Playfair Display 700 (high-contrast serif) | Clean sans, ultra-thin or medium weight |
| Color | Blue-heavy everywhere | Black text, minimal accent color |
| Background | Dot-grid texture, radial gradients | Pure white, zero texture |
| CTA buttons | Blue rounded-full with glow | Black or dark, subtle, no glow |
| Overall feel | Consulting/financial | Minimalist technology |

## Changes

### 1. Typography — Kill the Serifs, Go Clean Sans
**`src/index.css` + `tailwind.config.ts`**
- Remove Playfair Display and DM Serif Display imports entirely
- Import **"SF Pro Display"** fallback chain: `"Inter", "SF Pro Display", -apple-system, "Helvetica Neue", sans-serif`
- All headings (`h1-h3`): Inter with `font-weight: 600` (not 700 — Apple uses semibold, not bold), letter-spacing `-0.03em`
- Hero headline: `font-weight: 700`, letter-spacing `-0.04em` — this is how Apple does product headlines
- Body stays Inter 400

### 2. Logo Wordmark — Clean Geometric
**`NavBar.tsx` + `Footer.tsx`**
- Remove serif font from "Strat" — render entire "StratOS" in Inter
- "Strat" in Inter semibold (600), "OS" same font but slightly lighter weight or same weight, no uppercase transformation, no size difference
- Tighter tracking (-0.02em), single cohesive word
- Remove the diamond prism icon from the nav — Apple doesn't use icon marks in their nav, just the wordmark (or keep it very subtle, reduced to 20px)

### 3. Color — Monochrome with Blue Accent
**`src/index.css`**
- Primary shifts from bright blue to **near-black**: `--primary: 0 0% 10%` for buttons/CTAs
- Keep blue as a subtle accent only (links, active states): `--accent-blue: 225 84% 48%`
- CTA buttons become black with white text (Apple's "Buy" button style)
- Remove `cta-glow` animation from buttons — Apple never glows
- Remove `dot-grid-bg` texture from hero — pure white background

### 4. Hero — Dramatic Whitespace
**`HomepageLanding.tsx`**
- Remove radial gradient background and dot-grid overlay — pure white
- Headline: Inter 700, text-5xl on mobile / text-7xl on desktop, black text
- Increase top padding significantly (pt-32 sm:pt-40) — Apple uses enormous top spacing
- Input bar: remove the blue-tinted background, use a thin 1px border on white, subtle rounded corners (12px not pill-shaped 9999)
- Audit button: black background, white text, no glow
- Micro-badges: remove borders, just gray text separated by `·` (Apple style inline text, not pill badges)

### 5. Trust Strip — Text Only, No Icons
**`TrustStrip.tsx`**
- Remove icons entirely — Apple never uses icons for stats
- Single line of text: "6 frameworks · 30s to results · 10-step audit"
- Muted gray, centered, small text (text-sm)
- Minimal vertical padding

### 6. Section Headings — Sans Serif, Centered
**`SystemSections.tsx`, `TestimonialWall.tsx`, `FAQAccordion.tsx`, `MidPageCTA.tsx`**
- Remove all `font-serif` classes — use default sans
- Section headings: Inter semibold, text-3xl sm:text-4xl, black
- Subtitles: text-base, gray, generous bottom margin

### 7. How It Works — Cleaner Circles
**`SystemSections.tsx`**
- Icon circles: change from blue fill to thin gray border with black icon (Apple's outline icon style)
- Labels: Inter semibold, not bold
- Connecting dashes: remove entirely — Apple doesn't use connecting elements

### 8. Output Preview Card — Flatter
**`OutputPreview.tsx`**
- Remove blue-tinted shadow — use a neutral `0 2px 20px rgba(0,0,0,0.06)`
- Score circle border: black instead of blue
- Verdict badge: black/dark instead of orange

### 9. CTA Button Global Style
**`NavBar.tsx`, `MidPageCTA.tsx`, `HomepageLanding.tsx`**
- All primary CTAs: black background, white text, rounded-xl (not rounded-full — Apple uses ~12px radius)
- Hover: slight opacity change (0.85), no scale transform
- Remove all `cta-glow` classes

### 10. Footer — Minimal
**`Footer.tsx`**
- Remove serif italic tagline
- Wordmark in clean sans
- Thinner, more minimal padding

## Files Changed

1. **`src/index.css`** — Remove serif imports, update heading rules, remove dot-grid, remove cta-glow
2. **`tailwind.config.ts`** — Remove serif/brand families, simplify to single sans stack
3. **`src/components/NavBar.tsx`** — Clean sans wordmark, black CTA
4. **`src/components/Footer.tsx`** — Sans wordmark, remove italic tagline
5. **`src/components/HomepageLanding.tsx`** — Pure white hero, black CTA, inline text badges
6. **`src/components/TrustStrip.tsx`** — Single text line, no icons
7. **`src/components/SystemSections.tsx`** — Outline circles, sans headings, no connectors
8. **`src/components/OutputPreview.tsx`** — Neutral shadow, black accents
9. **`src/components/MidPageCTA.tsx`** — Sans heading, black button
10. **`src/components/TestimonialWall.tsx`** — Sans heading and quote
11. **`src/components/FAQAccordion.tsx`** — Sans heading
12. **`src/components/StratOSLogo.tsx`** — Subtle size reduction for nav context

## What Doesn't Change
- AI engine, edge functions, database
- Diagnostic flow, results page logic
- Authentication, routing, pricing structure
- Voice input, search functionality

