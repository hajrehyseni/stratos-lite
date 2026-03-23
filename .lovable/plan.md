# Plan: Typeform-Style Diagnostic Flow Redesign

## Problem

The current 3-stage diagnostic flow crams multiple questions onto single screens (Stage 2 has two card grids), uses small form elements, and feels like a traditional form rather than a guided conversation. It lacks the smooth, one-question-at-a-time rhythm that makes Typeform feel effortless.

## Design: One Question Per Screen, Full-Viewport

Redesign the flow into **5 individual screens** (one question each), each taking the full viewport height, with smooth cross-fade transitions between them. This mirrors Typeform's core pattern.

```text
Screen 1: "What happens if you get this wrong?"     [textarea]
Screen 2: "What kind of decision is this?"           [4 cards]
Screen 3: "Who gets affected?"                       [4 cards]
Screen 4: "What makes this hard?"                    [4 cards]
Screen 5: "What does success look like?"             [textarea]
           → [Run Audit] button
```

### Key UX Improvements

**Layout & Typography**

- Each question centered vertically in full viewport (min-h-screen, flexbox center)
- Large headline text (28-32px) for the question — feels like a conversation, not a form
- Generous whitespace, max-width 580px content area
- Subtle step counter: "1 of 5" top-right, not a complex progress bar

**Transitions**

- Cross-fade + slide-up between screens (opacity 0→1, translateY 20px→0, 400ms ease-out)
- Exit animation: slide-up + fade-out before next question enters
- No jarring hard-swaps

**Card Selection (screens 2-4)**

- Single-select cards auto-advance after 500ms delay (visual confirmation, then slide to next)
- Cards grow slightly on hover (scale 1.03) with a subtle shadow lift
- Selected card gets a smooth border + checkmark animation
- Unselected cards dim to 40% opacity with a 200ms transition

**Textarea Screens (1, 5)**

- Auto-focus on mount with a subtle cursor blink
- Large, borderless-feeling textarea (just a bottom border, like Typeform)
- Press Enter or click "Next" to advance
- Helpful placeholder text in lighter weight
- Character guidance below (same color-coded counter)

**Navigation**

- Up/Down arrow key navigation between screens (Typeform signature)
- "Press Enter ↵" hint next to the advance button
- Back arrow top-left to go to previous question
- Smooth scroll-to-top on each transition

**Progress Indicator**

- Thin horizontal progress bar at the very top of the viewport (fixed position)
- Fills proportionally: 0% → 20% → 40% → 60% → 80% → 100%
- Animated width transition (300ms ease)

**Skip Flow**

- Small "Skip to instant audit" link at bottom of screen 1 only
- On screens 2-5, just the back arrow — no skip clutter

**Final Screen Polish**

- Screen 5 has both the textarea and the "Run Audit" CTA
- CTA button pulses gently once when constraint is selected (draws the eye)
- Below CTA: "Your answers help our AI apply the right strategic frameworks"

## Files Changed

1. `**src/components/NewDiagnosticFlow.tsx**` — Complete rewrite. Same interface (Props, DiagnosticResult), same session persistence, but entirely new 5-screen Typeform-style layout with cross-fade transitions, auto-advance on card select, keyboard navigation, and full-viewport centering.
2. `**src/index.css**` — Add keyframes for the new slide-fade transitions if not already present.

## What Doesn't Change

- Props interface and DiagnosticResult type (Index.tsx integration unchanged)
- Session persistence logic (same keys)
- All other pages, components, and the processing/results flow
- The data collected is identical — same 5 fields sent to the audit engine  
  
Remember, I want a super engine for super business users signing up to my service. It needs to deliver world class McKinsey audit reports
- &nbsp;