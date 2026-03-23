

# Plan: World-Class UX Patterns — Borrowing from the Best

## Best Practices We're Borrowing

| App | Pattern | What We Take |
|-----|---------|-------------|
| **Shazam** | One action, instant result | Pulsing circular CTA, "listening" processing state |
| **Uber** | Bottom-sheet navigation on mobile | Slide-up mobile menu instead of slide-right |
| **Apple** | Dramatic whitespace + single focal point | Hero with one headline, one input, nothing else |
| **Stripe** | Rotating placeholder in input | Already have this — keep it |
| **Linear** | Keyboard-first, snappy 200ms transitions | Reduce all transitions, add keyboard hints |
| **Notion** | Minimal chrome, content is king | Strip nav to essentials, remove visual clutter |
| **Spotify** | Bold typography hierarchy, card-based browsing | Results page as swipeable cards on mobile |
| **Google Search** | Dead-simple input → rich results | Hero = just input. Results = rich dashboard |
| **Calm** | Progressive disclosure, one thing at a time | Diagnostic flow already does this — polish it |

---

## Changes

### 1. Hero — Google Search Simplicity
**`HomepageLanding.tsx`**
- Remove subtitle "Board-ready audit. 30 seconds." — the headline is strong enough alone
- Headline shortened: **"Audit any decision."** (3 words, Apple-level brevity)
- Move input 8px closer to headline (marginTop 24→16)
- Below input: 3 micro-badges inline — `Free · 30 seconds · Private` (styled as subtle gray pills, not text)
- Remove all remaining paragraph text from hero — zero body copy
- Social proof line removed (was adding clutter, not credibility at this stage)

### 2. Nav — Uber Bottom Sheet on Mobile
**`NavBar.tsx`**
- Replace slide-from-right mobile panel with **bottom sheet** (slides up from bottom, dark overlay)
- Reduce nav height from `h-16` to `h-14` for tighter feel
- Bottom sheet: rounded top corners (16px), max-height 70vh, smooth spring animation
- Links inside as large tap-friendly rows (56px height each)
- CTA button pinned at bottom of sheet

### 3. How It Works — Linear's Icon-Forward Simplicity
**`SystemSections.tsx`**
- Replace alternating 2-column layout with **3 icon circles in a horizontal row** (Shazam/Linear style)
- Each: 56px circle (brand blue bg, white icon) → bold label → one-line description
- Diagnose: "Every angle mapped" / Assess: "Risks surfaced" / Decide: "Verdict delivered"
- Remove all mockup cards — the OutputPreview below IS the visual proof
- On mobile: vertical stack with thin 40px connecting line between circles
- Keep "How it works" heading + "3 steps, 30 seconds"

### 4. Output Preview — Spotify Card Energy
**`OutputPreview.tsx`**
- Increase max-width to 640px
- Add floating shadow (`0 12px 40px hsla(221, 83%, 53%, 0.08)`) — like a device mockup
- Score number larger (text-3xl)
- Add "Try it free →" link below that scrolls back to hero input
- Subtle border-radius increase to 20px for premium feel

### 5. Trust Strip — Apple Minimalism
**`TrustStrip.tsx`**
- Remove vertical dividers between metrics
- Icons smaller (w-5 h-5), values stay bold
- Wider spacing between items
- Reduce padding from py-10 to py-6 — it's context, not a section

### 6. Diagnostic Flow — Calm + Linear Speed
**`NewDiagnosticFlow.tsx`**
- Replace "1 of 5" counter with **dot indicators** (● ○ ○ ○ ○) — Calm/Typeform pattern
- Remove subtitles on card steps 2, 3, 4 (questions + card labels are enough)
- Reduce auto-advance delay from 500ms to 350ms (Linear speed)
- Reduce transition duration from 400ms to 250ms
- Remove "Skip to instant audit" link on step 1 — breaks confidence
- Step 5: remove framework mention ("McKinsey 7S · SODA...") — users don't care about internals

### 7. Processing State — Shazam Listening Mode
**`NewProcessingState.tsx`**
- Replace checklist-in-a-box with **pulsing concentric rings** (center of viewport)
- Current step text cross-fades below the rings
- Remove the card wrapper — let it breathe full-viewport
- Keep thin progress bar at bottom (h-0.5)
- Decision pill stays at top, truncated

### 8. Results Page — Bold Visual Hierarchy
**`MockAuditResults.tsx`**
- Score gauge increased to 240px on desktop — make it the hero
- Remove `verdictDescription` paragraph — the 3-column exec summary says it all
- "Copy Summary" button → full-width on mobile, prominent primary style
- Add subtle score-reveal animation (scale 0.8→1 with opacity on mount)

### 9. MidPageCTA — One Punch
**`MidPageCTA.tsx`**
- Heading: **"Your next decision, sorted."** (keep — it's good)
- Remove card wrapper — just centered text + button on clean background
- Button: rounded-full, `py-4 px-10`, with arrow icon

### 10. Global CSS — Linear Speed
**`index.css`**
- Add concentric ring pulse animation for processing state
- Reduce `typeform-slide-in` from 300ms to 250ms
- Add `.shazam-pulse` utility (scale 1→1.15→1, infinite, 2s)
- Add bottom-sheet slide-up animation

## Files Changed

1. **`src/components/HomepageLanding.tsx`** — "Audit any decision.", micro-badges, no subtitle
2. **`src/components/NavBar.tsx`** — Bottom-sheet mobile menu, h-14
3. **`src/components/SystemSections.tsx`** — 3 icon circles, no mockup cards
4. **`src/components/OutputPreview.tsx`** — Larger, floating shadow, "Try it free"
5. **`src/components/TrustStrip.tsx`** — No dividers, tighter padding
6. **`src/components/NewDiagnosticFlow.tsx`** — Dot indicators, faster transitions, no subtitles on card steps
7. **`src/components/NewProcessingState.tsx`** — Pulsing rings, no card wrapper
8. **`src/pages/MockAuditResults.tsx`** — 240px gauge, no verdict paragraph, prominent copy button
9. **`src/components/MidPageCTA.tsx`** — Remove card wrapper, cleaner layout
10. **`src/index.css`** — Ring pulse, bottom-sheet, faster transitions

## What Doesn't Change
- AI engine, edge function, prompt engineering
- Diagnostic data collected (same 5 fields)
- Authentication, routing, database
- Pricing page, Footer, FAQ, Scorecard
- All existing data structures

