

# Plan: Upgrade TTS to ElevenLabs (David Attenborough-style Voice)

## What Changes

Replace the robotic browser `SpeechSynthesis` API with ElevenLabs TTS via an edge function. ElevenLabs produces natural, warm narration — the closest to a David Attenborough documentary feel available via API.

**Voice choice**: "George" (`JBFqnCBsd6RMkjVDRZzb`) — a deep, authoritative British male voice. With stability at 0.6 and style at 0.4, it delivers calm, measured narration perfect for executive briefings.

## Architecture

```text
Scorecard → useTTS hook → Edge Function → ElevenLabs API → MP3 audio → browser playback
```

## Changes

### 1. Connect ElevenLabs
Link the ElevenLabs connector to the project so the API key is available as an environment variable in edge functions.

### 2. New Edge Function: `supabase/functions/elevenlabs-tts/index.ts`
- Accepts `{ text: string }` in the POST body
- Calls ElevenLabs `/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb` with model `eleven_multilingual_v2`
- Voice settings: stability 0.6, similarity_boost 0.75, style 0.4 (warm, natural narration)
- Returns raw MP3 audio bytes
- Input validation with length check (max 5000 chars)

### 3. Rewrite `src/hooks/use-tts.ts`
- Replace `SpeechSynthesis` with fetch calls to the edge function
- Concatenate all sections into one text block (instead of reading section-by-section via browser API)
- Play returned MP3 via `new Audio(URL.createObjectURL(blob))`
- Keep the same interface: `speak(sections)`, `stop()`, `isSpeaking`
- Add loading state while audio generates
- Remove `currentSection`/`totalSections` (no longer section-by-section) — replace with simple `isLoading` + `isSpeaking`

### 4. Update `src/components/Scorecard.tsx`
- Minor: handle new `isLoading` state from the hook (show spinner on button while audio generates)
- The `speak()` call stays the same — pass sections array, hook joins them internally

## Files Changed

1. **`supabase/functions/elevenlabs-tts/index.ts`** (new) — Edge function calling ElevenLabs API
2. **`src/hooks/use-tts.ts`** — Rewrite to use edge function + Audio playback
3. **`src/components/Scorecard.tsx`** — Handle loading state on Listen button

