import { useState, useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";

interface UseTTSReturn {
  isSpeaking: boolean;
  isLoading: boolean;
  speak: (sections: string[]) => void;
  stop: () => void;
}

const MAX_TTS_CHARS = 500;

function trimText(sections: string[]): string {
  const full = sections.filter(Boolean).join("\n\n");
  if (full.length <= MAX_TTS_CHARS) return full;
  // Trim at the last sentence boundary within limit
  const trimmed = full.slice(0, MAX_TTS_CHARS);
  const lastPeriod = trimmed.lastIndexOf(".");
  return lastPeriod > 100 ? trimmed.slice(0, lastPeriod + 1) : trimmed;
}

function speakWithBrowser(text: string): SpeechSynthesisUtterance | null {
  if (!("speechSynthesis" in window)) return null;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function useTTS(): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (utteranceRef.current) {
      window.speechSynthesis?.cancel();
      utteranceRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    cleanup();
    setIsSpeaking(false);
    setIsLoading(false);
  }, [cleanup]);

  const speak = useCallback(async (sections: string[]) => {
    stop();

    const text = trimText(sections);
    if (!text) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        cleanup();
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        cleanup();
      };

      setIsLoading(false);
      setIsSpeaking(true);
      await audio.play();
    } catch (error) {
      console.error("ElevenLabs TTS error, falling back to browser speech:", error);

      // Fallback to browser SpeechSynthesis
      const utterance = speakWithBrowser(text);
      if (utterance) {
        utteranceRef.current = utterance;
        utterance.onend = () => {
          setIsSpeaking(false);
          utteranceRef.current = null;
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          utteranceRef.current = null;
          toast({
            title: "Voice narration unavailable",
            description: "Unable to play audio right now. Please try again later.",
            variant: "destructive",
          });
        };
        setIsLoading(false);
        setIsSpeaking(true);
        toast({
          title: "Using basic voice",
          description: "Premium narration is temporarily unavailable. Playing with browser voice instead.",
        });
      } else {
        setIsLoading(false);
        setIsSpeaking(false);
        toast({
          title: "Voice narration unavailable",
          description: "Your browser does not support speech synthesis. Please try a different browser.",
          variant: "destructive",
        });
      }
    }
  }, [stop, cleanup]);

  return { isSpeaking, isLoading, speak, stop };
}
