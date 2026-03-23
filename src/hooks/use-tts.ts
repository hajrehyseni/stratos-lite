import { useState, useCallback, useRef } from "react";

interface UseTTSReturn {
  isSpeaking: boolean;
  isLoading: boolean;
  speak: (sections: string[]) => void;
  stop: () => void;
}

export function useTTS(): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

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
  }, []);

  const stop = useCallback(() => {
    cleanup();
    setIsSpeaking(false);
    setIsLoading(false);
  }, [cleanup]);

  const speak = useCallback(async (sections: string[]) => {
    stop();

    const text = sections.filter(Boolean).join("\n\n");
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
      console.error("TTS error:", error);
      setIsLoading(false);
      setIsSpeaking(false);
    }
  }, [stop, cleanup]);

  return { isSpeaking, isLoading, speak, stop };
}
