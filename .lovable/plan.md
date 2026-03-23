

# Plan: Upgrade Audit Results — Visual Data + Listen Mode

## Current State
The Scorecard is text-heavy with collapsible sections. The only visual element is the confidence gauge (SVG ring). Risk cards, MECE branches, stakeholder analysis, and RAPID roles are all rendered as plain text blocks. For a busy executive scanning on mobile, there's too much reading and not enough visual signal.

## Two Upgrades

### 1. Visual Enhancements — Make Data Scannable

**Risk Heat Strip** — Replace the 3 plain text risk cards (Biggest Risk, Hidden Assumption, Blind Spot) with a horizontal severity bar. Each risk gets a colored dot (red/amber/blue) with a one-line label, and tapping expands to full text. This is how Notion and Linear surface risk — compact, color-coded, scannable.

**MECE Horizontal Bars** — Each MECE branch gets a proportional bar chart (width based on number of findings vs total). Visual weight instantly shows which dimension dominates the analysis without reading anything.

**RAPID Role Badges** — Instead of a vertical list, render RAPID as a horizontal badge row (like GitHub labels). Each letter gets a distinct color chip with the person's name. One glance shows who owns what.

**Stakeholder Position Dots** — Add a visual "support map": green dots for Support, red for Oppose, gray for Neutral, sized by influence (High = large, Low = small). This gives instant political read of the room.

**Time Horizon Timeline** — Replace the 3 text blocks with a horizontal 3-node timeline (10min → 10mo → 10yr) connected by a line, each node showing a condensed insight. Visual progression instead of stacked paragraphs.

### 2. Listen to Results — Text-to-Speech via Browser API

Add a "Listen" button at the top of the results page (next to the gauge) that reads the executive summary aloud using the browser's built-in `SpeechSynthesis` API. Free, no API key, works on all modern browsers.

**What it reads** (in order):
1. Verdict + score
2. The Reframe question
3. Top 3 recommended actions
4. Biggest risk

**UX**: A `Volume2` icon button. While playing, shows a pulsing speaker icon. Tapping again stops. A progress indicator shows which section is being read. Executive can listen while driving, walking, or multitasking.

**Why not ElevenLabs?** The browser `SpeechSynthesis` API is instant, free, and good enough for reading 4 short paragraphs. ElevenLabs would add API cost, latency, and a secret key dependency for marginal voice quality improvement on what amounts to 30 seconds of speech.

## Files Changed

1. **`src/components/Scorecard.tsx`** — Add Listen button, visual risk strip, MECE bars, RAPID badges, stakeholder dots, time horizon timeline
2. **`src/hooks/use-tts.ts`** (new) — Simple hook wrapping `window.speechSynthesis` with start/stop/progress state
3. **`src/components/ConfidenceGauge.tsx`** — Minor: add Listen button integration slot below the gauge

## What Doesn't Change
- AI engine, edge functions, database schema
- PDF export, sharing, journal
- No new dependencies or API keys

