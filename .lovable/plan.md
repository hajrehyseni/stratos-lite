

# Plan: Voice Input Everywhere + Warm Brand Color

## Two Changes

### 1. Voice Input on Diagnostic Flow (Steps 1 & 5)

**`src/components/NewDiagnosticFlow.tsx`**
- Import `useVoiceInput` from `@/hooks/use-voice-input` and `Mic`, `MicOff` from lucide-react
- Call the hook at component level
- Add `useEffect` that watches `voice.transcript` — when it arrives, append to `stakes` (step 1) or `successVision` (step 5) based on current step, then `resetTranscript()`
- On Steps 1 and 5, add a mic button in the row below the textarea (next to the char counter)
- Button shows `Mic` normally, `MicOff` with `shazam-pulse` class when listening
- Clicking calls `startListening`/`stopListening` toggle
- If `!isSupported`, show toast on click

### 2. Warm Brand Color — Soft Indigo

The current monochrome black (`--primary: 0 0% 10%`) is clinical and cold. A warm, inviting primary color that still feels Apple-clean:

**Proposed: Deep warm indigo** — `--primary: 234 60% 45%` — a soft, confident blue-purple that's easier on the eyes than pure black CTAs while still feeling premium. Think Stripe's indigo or Linear's purple — inviting, modern, not aggressive.

**`src/index.css`**
- Change `--primary: 0 0% 10%` → `--primary: 234 60% 45%`
- Change `--primary-foreground: 0 0% 100%` (stays white)
- Change `--ring: 0 0% 10%` → `--ring: 234 60% 45%`
- Update shazam-pulse color to match new primary hue
- All buttons, progress bars, active states automatically pick up the new color via CSS variables

This keeps the Apple-clean layout, Inter font, whitespace, and minimalism — just swaps the accent from stark black to a warm, eye-friendly indigo.

## Files Changed

1. **`src/components/NewDiagnosticFlow.tsx`** — Add mic buttons to Steps 1 & 5
2. **`src/index.css`** — Warm indigo primary color

