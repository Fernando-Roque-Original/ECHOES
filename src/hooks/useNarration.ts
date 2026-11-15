import { useEffect, useState } from 'react';

export function useNarration(text: string, enabled: boolean) {
  const [speaking, setSpeaking] = useState(false);
  const supported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const speak = () => {
    if (!supported || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.92;
    utterance.pitch = 0.96;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (enabled) {
      speak();
    } else {
      stop();
    }
    return stop;
    // The text is intentionally the narration trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, enabled]);

  return { supported, speaking, speak, stop };
}

