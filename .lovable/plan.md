

# Plan: Voice Input + Audit Search — Both

## What We're Building

Two features that make StratOS faster for executives:

1. **Voice Input** — A microphone button on the hero input that converts speech to text using the browser's built-in Web Speech API (free, no API key needed, works on all modern browsers). No need for external APIs — the browser handles it natively.

2. **Audit History Search** — A search bar on the Dashboard and Journal pages that filters past audits by keyword, verdict, or score range.

---

## Why NOT an external voice API

The Web Speech API is built into Chrome, Safari, and Edge. It's instant, free, and requires zero backend. For a simple "speak your decision" use case, it's the right tool. ElevenLabs or similar would add cost and complexity for no gain here — we're transcribing a single sentence, not building a podcast tool.

---

## Changes

### 1. Voice Input Button — Hero
**`src/components/HomepageLanding.tsx`**
- Add a microphone icon button (Lucide `Mic`) inside the input card, to the left of the submit arrow
- On click: start `webkitSpeechRecognition` / `SpeechRecognition`
- While listening: button pulses with the existing `shazam-pulse` animation, icon changes to `MicOff`
- On result: populate the input field with the transcript, auto-focus
- On error or unsupported browser: show toast "Voice input not supported in this browser"
- Extract voice logic into a small hook: `src/hooks/use-voice-input.ts`

### 2. Voice Input Hook
**`src/hooks/use-voice-input.ts`** (new file)
- Returns `{ isListening, startListening, stopListening, transcript, isSupported }`
- Uses `window.SpeechRecognition || window.webkitSpeechRecognition`
- Sets `lang = "en-US"`, `continuous = false`, `interimResults = false`
- Handles `onresult`, `onerror`, `onend` events

### 3. Dashboard Search
**`src/pages/DashboardPage.tsx`**
- Add a search input below the welcome header (Search icon + text input, full width)
- Filters `mockAudits` array by decision text (case-insensitive substring match)
- Add verdict filter pills: All | Proceed | Conditional | Do Not Proceed
- Filtering is instant (client-side), no debounce needed for 4 items

### 4. Journal Search
**`src/pages/JournalPage.tsx`**
- Add same search input pattern above the journal entries list
- Filters entries by decision text and verdict
- Show "No results" state when filter returns empty

### 5. TypeScript Declaration
**`src/vite-env.d.ts`**
- Add `SpeechRecognition` and `webkitSpeechRecognition` type declarations to avoid TS errors

## Files Changed

1. **`src/hooks/use-voice-input.ts`** — New hook for Web Speech API
2. **`src/vite-env.d.ts`** — Speech API type declarations
3. **`src/components/HomepageLanding.tsx`** — Mic button in hero input
4. **`src/pages/DashboardPage.tsx`** — Search bar + verdict filter pills
5. **`src/pages/JournalPage.tsx`** — Search bar for journal entries

## What Doesn't Change
- AI engine, edge functions, database
- No new API keys or secrets needed
- No new dependencies
- Authentication, routing, pricing

