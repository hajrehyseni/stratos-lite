import { useState, useCallback, useRef } from "react";

interface UseTTSReturn {
  isSpeaking: boolean;
  isSupported: boolean;
  currentSection: number;
  totalSections: number;
  speak: (sections: string[]) => void;
  stop: () => void;
}

export function useTTS(): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [totalSections, setTotalSections] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sectionsRef = useRef<string[]>([]);
  const indexRef = useRef(0);

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const speakNext = useCallback(() => {
    if (indexRef.current >= sectionsRef.current.length) {
      setIsSpeaking(false);
      setCurrentSection(0);
      return;
    }

    const text = sectionsRef.current[indexRef.current];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.lang = "en-US";
    utteranceRef.current = utterance;

    utterance.onend = () => {
      indexRef.current += 1;
      setCurrentSection(indexRef.current);
      speakNext();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentSection(0);
    };

    setCurrentSection(indexRef.current + 1);
    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback((sections: string[]) => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    sectionsRef.current = sections.filter(Boolean);
    indexRef.current = 0;
    setTotalSections(sectionsRef.current.length);
    setIsSpeaking(true);
    speakNext();
  }, [isSupported, speakNext]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentSection(0);
  }, [isSupported]);

  return { isSpeaking, isSupported, currentSection, totalSections, speak, stop };
}
