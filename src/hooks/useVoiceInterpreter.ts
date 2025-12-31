import { useState, useEffect, useCallback } from 'react';

interface VoiceState {
  isListening: boolean;
  transcript: string;
  error: string | null;
}

export const useVoiceInterpreter = () => {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    transcript: '',
    error: null,
  });

  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false; // Stop after one command usually
        reco.interimResults = true;
        reco.lang = 'pt-BR'; // Brazilian Portuguese

        reco.onstart = () => {
          setState(prev => ({ ...prev, isListening: true, error: null }));
        };

        reco.onend = () => {
          setState(prev => ({ ...prev, isListening: false }));
        };

        reco.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setState(prev => ({ ...prev, error: event.error, isListening: false }));
        };

        reco.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              // Interim results could be shown for feedback
              setState(prev => ({ ...prev, transcript: event.results[i][0].transcript }));
            }
          }
          if (finalTranscript) {
            setState(prev => ({ ...prev, transcript: finalTranscript }));
          }
        };

        setRecognition(reco);
      } else {
        setState(prev => ({ ...prev, error: 'Sem suporte a voz neste navegador.' }));
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognition) {
      try {
        recognition.start();
      } catch (e) {
        // Already started or busy
        console.warn('Recognition already started');
      }
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
  }, [recognition]);

  return {
    ...state,
    startListening,
    stopListening,
  };
};
