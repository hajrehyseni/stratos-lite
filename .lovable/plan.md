

# Plan: Executive-Grade Visual Refinement — Less Text, More Impact

## Rating: 7.5/10 → Target: 9.5/10

The app reads well but still *looks* like a SaaS template. An executive scanning on mobile wants to **see** value in 3 seconds, not read about it. The biggest gaps: too much descriptive text everywhere, results page is a wall of collapsible text blocks, homepage sections blend together, and the dashboard is functional but visually flat.

---

## Changes

### 1. Homepage Hero — Cut Words, Add Visual Punch
**`HomepageLanding.tsx`**
- Subtitle: "Fortune 500 frameworks. 30-second audit. **Free.**" → **"Board-ready audit. 30 seconds."** (5 words instead of 7)
- Remove the "Describe your decision..." placeholder — change to **"e.g. Should we acquire CompetitorX?"** (shows exactly what to type)
- Remove the 3 separate chips below input — replace with a single auto-rotating placeholder inside the input itself that cycles through 3 examples every 3 seconds (like Stripe's homepage input)
- This eliminates 3 lines of UI clutter and makes the input the hero

### 2. Trust Strip — Icon-Forward, Zero Descriptions
**`TrustStrip.tsx`**
- Remove the sub-labels ("McKinsey-grade analysis", "From question to verdict", "SSM + SODA methodology") — they add clutter
- Make the values larger (text-2xl bold) and the icons bigger (w-6 h-6)
- Add a very subtle divider between each metric (1px vertical line)
- Result: 3 bold icons + values, no explanatory text

### 3. How It Works — Visual Cards, Not Text Blocks
**`SystemSections.tsx`**
- Remove the body text paragraphs entirely ("MECE decomposition. Every angle mapped..." etc.)
- Let the headings + mockup visuals do the talking
- Make mockup cards the primary content (larger, centered on mobile too — currently hidden on mobile)
- Show simplified mockup cards on mobile (smaller versions, single column)
- The section heading "How it works" + "3 steps, 30 seconds" stays

### 4. Output Preview — Make It Interactive
**`OutputPreview.tsx`**
- Add animated score counting from 0→72 when scrolled into view (Intersection Observer)
- Add a subtle pulsing glow on the verdict badge
- The MECE bars should animate their width on scroll-in (staggered, 200ms delay each)
- This makes the static preview feel alive and premium

### 5. Testimonials — Single Impactful Quote
**`TestimonialWall.tsx`**
- Replace carousel of 3 cards with a single large, centered testimonial quote
- Large italic text (text-xl), prominent attribution with role
- Auto-rotate between the 3 quotes with a cross-fade (no carousel mechanics, just text swap every 6 seconds)
- Much cleaner, more Apple-like — one voice at a time

### 6. FAQ — Cut to 3, Shorter Answers
**`FAQAccordion.tsx`**
- Reduce from 4 to 3 questions: Privacy, How different from ChatGPT, Is it free
- Trim answers to 1 sentence each:
  - Privacy: "Encrypted, never shared, never used for training."
  - vs ChatGPT: "Structured scorecard with confidence score, risk register, and stakeholder map — not a wall of text."
  - Free: "First audit free, no account needed. Pro is £19/mo."

### 7. Results Page — Visual Dashboard, Not Text Report
**`MockAuditResults.tsx`** — The money shot needs the most work:
- **Score section**: Make the gauge larger (200px on desktop). Add a colored background gradient that fills the entire top section (subtle, 5% opacity verdict color)
- **Executive Summary**: Restyle as a horizontal 3-column card strip (Verdict | Key Risk | Next Step) instead of a vertical mono-font block. Each column gets an icon (CheckCircle | AlertTriangle | ArrowRight). This looks like a dashboard widget, not a code block
- **MECE Breakdown**: Display as a horizontal bar chart with color-coded bars (green/amber/red based on score). Remove the text descriptions — the dimension name + score + visual bar is enough. Executives scan visually
- **Risk cards**: Add color-coded left borders (red for High, amber for Medium). Remove "Mitigation:" label — just show the text. Reduce padding
- **Stakeholder cards**: Show as a compact grid (2 columns) with stance as a colored dot (green/amber/blue) next to the name. Remove verbose action text — truncate to first sentence
- **Actions**: Number badges are good. Remove feasibility badges — just show priority as a subtle tag
- **RAPID**: Show as a single horizontal row of 5 letter badges (R·A·P·I·D) with names below, not a 2-column grid. This is more scannable

### 8. Live Scorecard — Match Mock Results Visual Style  
**`Scorecard.tsx`**
- Apply the same visual treatments from MockAuditResults (horizontal exec summary, visual MECE bars, compact stakeholder grid)
- Fix the dark-theme remnant borders (`hsla(0, 0%, 100%, 0.06)` → `hsl(var(--border))`)
- The sticky nav pills should use the same sliding underline as MockAuditResults

### 9. Dashboard — Visual Score Trend
**`DashboardPage.tsx`**
- Add a mini sparkline SVG in each stat card showing a simple 4-point trend line (hardcoded upward for now)
- Decision rows: show verdict as a small colored tag (green/amber/red) next to the score badge
- Add a subtle gradient header banner behind "Welcome back, [name]" (light blue to transparent, like pricing page)

### 10. MidPageCTA — One Line, Big Button
**`MidPageCTA.tsx`**
- Remove the subtext "McKinsey-grade audit in 30 seconds. No account needed."
- Remove the duplicate "No account needed" below the button
- Just: heading "Your next decision, sorted." + button. Nothing else
- Make the button larger (py-5, text-xl)

### 11. Pricing — Feature Icons
**`PricingPage.tsx`**
- Add small Lucide icons next to each feature in the plan cards (CheckCircle for included, Lock for not included)
- Remove the social proof line at bottom ("Used by leaders...") — it's redundant with the homepage

### 12. Global — Reduce Font Sizes for Density
**`index.css`**
- Body text default from text-base (16px) to 15px for tighter density
- Add utility class `.section-fade-divider` for gradient dividers between homepage sections instead of hard 1px borders

## Files Changed

1. **`src/components/HomepageLanding.tsx`** — Rotating placeholder, remove chips, tighter subtitle
2. **`src/components/TrustStrip.tsx`** — Icon-forward, remove sub-labels
3. **`src/components/SystemSections.tsx`** — Remove body text, show mockups on mobile
4. **`src/components/OutputPreview.tsx`** — Scroll-triggered animations
5. **`src/components/TestimonialWall.tsx`** — Single rotating quote, no carousel
6. **`src/components/FAQAccordion.tsx`** — 3 FAQs, 1-sentence answers
7. **`src/pages/MockAuditResults.tsx`** — Visual dashboard layout: horizontal exec summary, bar charts, compact grids
8. **`src/components/Scorecard.tsx`** — Match mock results visual style, fix dark theme borders
9. **`src/pages/DashboardPage.tsx`** — Sparklines, verdict tags, gradient header
10. **`src/components/MidPageCTA.tsx`** — Single line + button only
11. **`src/pages/PricingPage.tsx`** — Feature icons
12. **`src/index.css`** — Section dividers, body text size

## What Doesn't Change
- Diagnostic flow (5-screen Typeform style — already good)
- Processing animation
- AI engine and edge function
- Authentication, routing, database
- NavBar, Footer, StratOS logo

