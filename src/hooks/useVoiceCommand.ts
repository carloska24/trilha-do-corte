import { useState, useEffect, useCallback } from 'react';

// Type definitions for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

export type VoiceAction =
  | { type: 'SET_HOURS'; payload: { start?: number; end?: number; date?: string } }
  | { type: 'SET_INTERVAL'; payload: { minutes: number } }
  | { type: 'RESET_EXCEPTIONS'; payload: { start: number; end: number } }
  | { type: 'SET_CLOSED'; payload: { date?: string } }
  | { type: 'UNKNOWN'; transcript: string }
  | null;

export const useVoiceCommand = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'pt-BR';
      setRecognition(recog);
    }
  }, []);

  const parseCommand = (text: string): VoiceAction => {
    const cleanText = text.toLowerCase();

    // --- DETERMINE DATE (DEFAULT: GLOBAL/NULL) ---
    let targetDate: string | undefined = undefined;

    // "Amanhã" / "Hoje"
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Helper for Local YYYY-MM-DD
    const getLocalISODate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (cleanText.match(/(amanhã|amanha)/i)) {
      targetDate = getLocalISODate(tomorrow);
    } else if (cleanText.match(/(hoje)/i)) {
      targetDate = getLocalISODate(today);
    } else {
      // "Dia X"
      const dayMatch = cleanText.match(/(?:dia)\s*(\d{1,2})/i);
      if (dayMatch) {
        const day = parseInt(dayMatch[1]);
        if (!isNaN(day) && day >= 1 && day <= 31) {
          const d = new Date();
          // If day is less than today's day, assume next month
          if (day < d.getDate()) {
            d.setMonth(d.getMonth() + 1);
          }
          d.setDate(day);
          targetDate = getLocalISODate(d);
        }
      }
    }

    // --- SPECIAL COMMANDS ---

    // 1. "Todos os dias horário padrão" (RESET EVERYTHING)
    if (cleanText.match(/(?:todos|todo)\s*(?:os)?\s*(?:dias|dia)\s*(?:horário|horario)/i)) {
      return { type: 'RESET_EXCEPTIONS', payload: { start: 9, end: 19 } };
    }

    // 2. "Horário Padrão" (GLOBAL DEFAULT ONLY)
    if (cleanText.match(/(?:horário|horario|definir)\s*(?:padrão|padrao|normal)/i)) {
      return { type: 'SET_HOURS', payload: { start: 9, end: 19, date: targetDate } };
    }

    // 3. "Dia X Fechado" / "Folga"
    if (cleanText.match(/(?:fechado|folga|bloquear|não abre|nao abre)/i)) {
      return { type: 'SET_CLOSED', payload: { date: targetDate } };
    }

    // --- PARSE HOURS ---
    // Patterns: "das 8 as 18", "de 9 ate 19", "abrir as 10", "fechar as 20"

    // 1. Range (Start & End)
    // Supports: "das 9 as 18", "9:00 as 18:00", "9h as 18h"
    const rangeMatch = cleanText.match(
      /(?:das|de)\s*(\d{1,2})(?::\d{2}|h)?\s*(?:as|ate|a|às|até)\s*(\d{1,2})(?::\d{2}|h)?/i
    );
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1]);
      const end = parseInt(rangeMatch[2]);
      if (!isNaN(start) && !isNaN(end)) {
        return { type: 'SET_HOURS', payload: { start, end, date: targetDate } };
      }
    }

    // 2. Start Only
    const startMatch = cleanText.match(
      /(?:abrir|inicio|começa|comeca)\s*(?:as|às|nas)?\s*(\d{1,2})(?::\d{2}|h)?/i
    );
    if (startMatch) {
      const start = parseInt(startMatch[1]);
      if (!isNaN(start)) {
        return { type: 'SET_HOURS', payload: { start, date: targetDate } };
      }
    }

    // 3. End Only
    const endMatch = cleanText.match(
      /(?:fechar|fim|encerra|até|ate)\s*(?:as|às|nas)?\s*(\d{1,2})(?::\d{2}|h)?/i
    );
    if (endMatch) {
      const end = parseInt(endMatch[1]);
      if (!isNaN(end)) {
        return { type: 'SET_HOURS', payload: { end, date: targetDate } };
      }
    }

    // --- PARSE INTERVAL ---
    // Patterns: "intervalo de 30", "30 minutos", "tempo de corte 45"
    const intervalMatch = cleanText.match(/(?:intervalo|tempo|dura|corte)\s*(?:de)?\s*(\d{2})/i);
    if (intervalMatch) {
      const minutes = parseInt(intervalMatch[1]);
      if (!isNaN(minutes)) {
        return { type: 'SET_INTERVAL', payload: { minutes } };
      }
    }

    return { type: 'UNKNOWN', transcript: text };
  };

  const startListening = useCallback(
    (onResult: (action: VoiceAction) => void) => {
      if (!recognition) {
        console.warn('Speech Recognition not supported in this browser.');
        return;
      }

      setIsListening(true);
      setTranscript('');

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const lastResultIndex = event.results.length - 1;
        const text = event.results[lastResultIndex][0].transcript;
        setTranscript(text);

        const action = parseCommand(text);
        onResult(action);
        setIsListening(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    },
    [recognition]
  );

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: !!recognition,
  };
};
