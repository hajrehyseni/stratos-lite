

# Plan: Upgrade TTS to ElevenLabs (David Attenborough-style Voice)

## Status: ✅ Implemented

Replaced browser SpeechSynthesis with ElevenLabs TTS via edge function using the "George" voice — deep, authoritative British male narration with warm, measured delivery.

## Architecture
Scorecard → useTTS hook → Edge Function → ElevenLabs API → MP3 audio → browser playback

## Files Changed
1. `supabase/functions/elevenlabs-tts/index.ts` — Edge function calling ElevenLabs API
2. `src/hooks/use-tts.ts` — Rewritten to use edge function + Audio playback
3. `src/components/Scorecard.tsx` — Updated Listen button with loading state
