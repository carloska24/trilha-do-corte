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
  | { type: 'SET_CLOSED'; payload: { dates: string[] } } // Changed to array
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

    // Helper for Local YYYY-MM-DD
    const getLocalISODate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // --- EXTRACT ALL DATES ---
    const extractedDates: string[] = [];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 1. "Amanhã" / "Hoje"
    if (cleanText.match(/(amanhã|amanha)/i)) extractedDates.push(getLocalISODate(tomorrow));
    if (cleanText.match(/(hoje)/i)) extractedDates.push(getLocalISODate(today));

    // 2. "Dia DD/MM" pattern (global, finds all occurrences)
    const dateSlashRegex = /(?:dia)?\s*(\d{1,2})(?:\/|\s+do\s+|\s+de\s+)(\d{1,2})/gi;
    let match;
    while ((match = dateSlashRegex.exec(cleanText)) !== null) {
      const day = parseInt(match[1]);
      const month = parseInt(match[2]) - 1; // JS Month is 0-indexed

      if (!isNaN(day) && !isNaN(month) && month >= 0 && month <= 11) {
        const d = new Date();
        d.setMonth(month);
        d.setDate(day);

        // Smart Year Adjustment
        const now = new Date();
        // If date is more than 30 days in the ONE PAST, assume next year.
        if (d < now && now.getTime() - d.getTime() > 30 * 24 * 60 * 60 * 1000) {
          d.setFullYear(d.getFullYear() + 1);
        }
        extractedDates.push(getLocalISODate(d));
      }
    }

    // 3. "Dia DD" pattern (only if no slash pattern found closer? simplistic approach for now)
    // To avoid double counting "dia 31" from "dia 31/12", we only use this if regular regex fails or use a more complex negative lookahead.
    // Actually, capturing "dia 31 e dia 1" might need a loop too.
    const dateDayRegex = /(?:dia)\s*(\d{1,2})(?!\/|\s+do|\s+de)/gi;
    while ((match = dateDayRegex.exec(cleanText)) !== null) {
      const day = parseInt(match[1]);
      if (!isNaN(day) && day >= 1 && day <= 31) {
        const d = new Date();
        if (day < d.getDate()) d.setMonth(d.getMonth() + 1);
        d.setDate(day);
        extractedDates.push(getLocalISODate(d));
      }
    }

    // Unique dates
    const uniqueDates = Array.from(new Set(extractedDates));
    // For SET_HOURS (single date focus), we pick the first one if multiple, or undefined.
    const targetDate = uniqueDates.length > 0 ? uniqueDates[0] : undefined;

    // --- SPECIAL COMMANDS ---

    // 1. "Todos os dias horário padrão" / "Resetar tudo" / "Limpar agenda" / "Voltar ao normal" / "Cancelar alterações"
    if (
      cleanText.match(/(?:todos|todo)\s*(?:os)?\s*(?:dias|dia)\s*(?:horário|horario)/i) ||
      cleanText.match(
        /(?:resetar|restaurar|limpar|apagar|remover|excluir)\s*(?:tudo|agenda|padrão|padrao|folgas|bloqueios|exceções|excecoes|alterações|alteracoes)/i
      ) ||
      cleanText.match(/(?:voltar|retornar)\s*(?:ao)?\s*(?:normal|padrão|padrao|inicio|início)/i) ||
      cleanText.match(/(?:cancelar|anular)\s*(?:alterações|alteracoes|mudanças|mudancas)/i)
    ) {
      return { type: 'RESET_EXCEPTIONS', payload: { start: 9, end: 19 } };
    }

    // 2. "Horário Padrão" (GLOBAL DEFAULT ONLY)
    if (cleanText.match(/(?:horário|horario|definir)\s*(?:padrão|padrao|normal)/i)) {
      return { type: 'SET_HOURS', payload: { start: 9, end: 19, date: targetDate } };
    }

    // 3. "Dia X Fechado" / "Folga" (NOW SUPPORTS MULTIPLE DATES)
    if (cleanText.match(/(?:fechado|folga|bloquear|não abre|nao abre)/i)) {
      // If we found dates, return all of them. If no dates found, maybe global? But usually closed implies a date.
      // If no date is mentioned but "fechado" is said? Maybe assume today? Or ignore?
      // Let's assume if dates are found, apply to all.
      if (uniqueDates.length > 0) {
        return { type: 'SET_CLOSED', payload: { dates: uniqueDates } };
      }
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
