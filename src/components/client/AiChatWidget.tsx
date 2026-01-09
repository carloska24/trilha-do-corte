import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Calendar,
  Check,
  Mic,
  MicOff,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { LOCAL_AVATARS } from '../../constants';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  action?: {
    type: string;
    data: any;
  };
}

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Olá! Sou a Trilha AI 🤖. Posso verificar horários livres ou agendar seu corte. Como posso ajudar?',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Voice Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        handleSpeechError(event.error);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      // Try to re-init if null (e.g. strict mode double mount issue)
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'pt-BR';
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
        };
        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onerror = (event: any) => handleSpeechError(event.error);
      } else {
        alert('Seu navegador não suporta reconhecimento de voz.');
        return;
      }
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: any) {
        console.error('Speech start error:', err);
        handleSpeechError(err.error || 'start-failed');
      }
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const contextHistory = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text || (m.action ? 'Action Proposed' : '') }],
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          contextHistory,
        }),
      });
      // Trigger TTS for the AI text
      if (data.type === 'text' && data.text) {
        speak(data.text);
      } else if (data.action && data.action.action === 'PROPOSE_BOOKING') {
        speak(
          `Encontrei um horário. Posso agendar ${data.action.data.serviceName} para ${data.action.data.date} às ${data.action.data.time}?`
        );
      } else if (data.action && data.action.action === 'PROPOSE_SLOTS') {
        speak(`Aqui estão os horários disponíveis para ${data.action.data.date}.`);
      }
    } catch (error) {
      // ... existing error handling ...
      speak('Desculpe, tive um erro de conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  // ... existing handleSpeechError ...

  // TTS Helper
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel previous
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.1; // Slightly faster for fluidity

      // Try to find a good Brazilian voice
      const voices = window.speechSynthesis.getVoices();
      const brVoice = voices.find(v => v.lang.includes('PT-BR') || v.lang.includes('pt-BR'));
      if (brVoice) utterance.voice = brVoice;

      window.speechSynthesis.speak(utterance);
    }
  };

  interface BookingActionData {
    clientName?: string; // AI might infer name
    serviceName: string;
    serviceId: string;
    date: string;
    time: string;
    price: number;
  }

  const handleConfirmAction = async (actionData: BookingActionData) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        text: 'Confirmar Agendamento ✅',
      },
    ]);

    setIsLoading(true);
    const loadingMsgId = Date.now() + 1;
    // Optimistic feedback
    speak('Confirmando seu agendamento, só um momento...');

    try {
      // 1. Need a Client ID.
      // Ideally we would ask for phone/name, but for "Cyberpunk Express" let's try to auto-handle.
      const targetName = actionData.clientName || 'Cliente Visitante'; // Use name from AI intent

      // Fetch clients to see if exists
      const clients = await api.getClients();
      let chatClient = clients.find(c => c.name.toLowerCase() === targetName.toLowerCase());

      if (!chatClient) {
        // Create personalized temporary client
        chatClient =
          (await api.createClient({
            name: targetName,
            phone: '00000000000',
            img: LOCAL_AVATARS[Math.floor(Math.random() * LOCAL_AVATARS.length)], // Use Local System Avatar
            status: 'new',
            notes: 'Criado via Chat AI',
          })) || undefined;
      }

      if (!chatClient) throw new Error('Falha ao identificar cliente.');

      // 2. Create Appointment
      const newAppt = await api.createAppointment({
        clientId: chatClient.id,
        clientName: chatClient.name,
        serviceId: actionData.serviceId || '1', // fallback
        date: actionData.date,
        time: actionData.time,
        price: actionData.price || 35.0,
        status: 'pending', // Pending approval
        notes: 'Agendado via Trilha AI',
      });

      if (newAppt) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'ai',
            text: `Agendamento Confirmado com Sucesso! 🚀\n\n✂️ Serviço: ${actionData.serviceName}\n📅 Data: ${actionData.date}\n⏰ Horário: ${actionData.time}\n\nTe esperamos na base!`,
          },
        ]);
        speak('Agendamento confirmado com sucesso! Te esperamos lá.');
      } else {
        throw new Error('Falha ao criar agendamento na API.');
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: 'Ops! Tive um problema ao salvar o agendamento no sistema. Tente novamente ou ligue para nós.',
        },
      ]);
      speak('Ops! Tive um problema ao salvar o agendamento.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="pointer-events-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-[90vw] max-w-[380px] h-[500px] flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 p-4 border-b border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <Sparkles size={16} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-100 text-sm">Trilha AI</h3>
                  <p className="text-xs text-zinc-400">Receptionist</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#09090b]">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700'
                    }`}
                  >
                    {msg.text && <div className="whitespace-pre-wrap">{msg.text}</div>}

                    {/* RENDER TIME SLOTS PILLS */}
                    {msg.action && msg.action.action === 'PROPOSE_SLOTS' && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400 text-xs uppercase font-bold tracking-wider">
                          <Clock size={12} />
                          <span>Horários para {msg.action.data.date}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {msg.action.data.slots.map((slot: string) => {
                            const isSelected = messages.some(
                              m => m.sender === 'user' && m.text?.includes(slot)
                            );
                            return (
                              <button
                                key={slot}
                                disabled={isSelected}
                                onClick={() => handleSendMessage(`Quero agendar às ${slot}`)}
                                className={`
                                py-2 rounded-lg text-xs font-bold transition-all border
                                ${
                                  isSelected
                                    ? 'bg-purple-600 border-purple-500 text-white opacity-50 cursor-default'
                                    : 'bg-zinc-900 border-zinc-700 hover:border-purple-500 hover:bg-purple-500/10 text-zinc-300 hover:text-white'
                                }
                              `}
                              >
                                {slot}
                                {isSelected && <Check size={10} className="inline ml-1" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* CONFIRMATION CARD */}
                    {msg.action && msg.action.action === 'PROPOSE_BOOKING' && (
                      <div className="mt-2 bg-zinc-950/50 rounded-xl p-3 border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-2 text-purple-300 font-bold border-b border-white/10 pb-2">
                          <Calendar size={14} />
                          <span>Confirmação</span>
                        </div>
                        <div className="space-y-1 text-xs text-zinc-300 mb-3">
                          <p>
                            <span className="text-zinc-500">Serviço:</span>{' '}
                            {msg.action.data.serviceName}
                          </p>
                          <p>
                            <span className="text-zinc-500">Data:</span> {msg.action.data.date}
                          </p>
                          <p>
                            <span className="text-zinc-500">Horário:</span> {msg.action.data.time}
                          </p>
                        </div>
                        <button
                          onClick={() => handleConfirmAction(msg.action?.data)}
                          className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <Check size={14} />
                          Confirmar Agendamento
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800 rounded-2xl p-3 rounded-bl-none flex items-center gap-1">
                    <div
                      className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-zinc-900 border-t border-zinc-800">
              <div className="flex gap-2">
                <button
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl transition-all border ${
                    isListening
                      ? 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isListening ? 'Ouvindo...' : 'Pergunte sobre horários...'}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-zinc-600"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isLoading}
                  className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)]"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`pointer-events-auto h-14 w-14 rounded-full shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)] flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-zinc-800 text-zinc-400 rotate-90' : 'bg-black border border-purple-500/50'
        }`}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <svg
            clipRule="evenodd"
            fillRule="evenodd"
            strokeLinejoin="round"
            strokeMiterlimit="2"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8"
          >
            <linearGradient
              id="_Linear1"
              gradientTransform="matrix(0 -58.453 64.5 0 2040 309.453)"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="1"
              y1="0"
              y2="0"
            >
              <stop offset="0" stopColor="#7e0d9d"></stop>
              <stop offset=".5" stopColor="#7328f2"></stop>
              <stop offset="1" stopColor="#51a0f7"></stop>
            </linearGradient>
            <g transform="translate(-2008 -248)">
              <path
                d="m2018 298.832v8.168c0 .792.47 1.509 1.19 1.829s1.57.183 2.16-.349c0 0 2.97-2.702 5.82-5.297 2.96-2.692 6.82-4.183 10.82-4.183h22.01c3.18 0 6.24-1.264 8.49-3.514s3.51-5.302 3.51-8.484c0-6.108 0-21.002 0-21.002 0-1.104-.9-2-2-2s-2 .896-2 2v21.002c0 2.121-.84 4.156-2.34 5.655-1.5 1.5-3.54 2.343-5.66 2.343h-22.01c-4.99 0-9.81 1.862-13.51 5.223 0 0-2.48 2.257-2.48 2.257 0-2.152 0-4.423 0-5.2v-.28c0-1.105-.9-2-2-2-2.12 0-4.16-.843-5.66-2.343-1.5-1.499-2.34-3.534-2.34-5.655 0-6.109 0-17.895 0-24.004 0-2.121.84-4.156 2.34-5.655 1.5-1.5 3.54-2.343 5.66-2.343h37c1.1 0 2-.896 2-2s-.9-2-2-2h-37c-3.18 0-6.24 1.264-8.49 3.514s-3.51 5.302-3.51 8.484v24.004c0 3.182 1.26 6.234 3.51 8.484 1.78 1.773 4.05 2.934 6.49 3.346zm35.9-40.45c-.27-.824-1.03-1.382-1.9-1.382s-1.63.558-1.9 1.382l-2.63 8.087s-8.09 2.629-8.09 2.629c-.82.268-1.38 1.036-1.38 1.902s.56 1.634 1.38 1.902l8.09 2.629s2.63 8.087 2.63 8.087c.27.824 1.03 1.382 1.9 1.382s1.63-.558 1.9-1.382l2.63-8.087s8.09-2.629 8.09-2.629c.82-.268 1.38-1.036 1.38-1.902s-.56-1.634-1.38-1.902l-8.09-2.629s-2.63-8.087-2.63-8.087zm-31.9 26.618h24c1.1 0 2-.896 2-2s-.9-2-2-2h-24c-1.1 0-2 .896-2 2s.9 2 2 2zm0-8h14c1.1 0 2-.896 2-2s-.9-2-2-2h-14c-1.1 0-2 .896-2 2s.9 2 2 2zm30-11.532 1.04 3.206c.2.609.68 1.086 1.29 1.284l3.2 1.042s-3.2 1.042-3.2 1.042c-.61.198-1.09.675-1.29 1.284l-1.04 3.206s-1.04-3.206-1.04-3.206c-.2-.609-.68-1.086-1.29-1.284l-3.2-1.042s3.2-1.042 3.2-1.042c.61-.198 1.09-.675 1.29-1.284zm-30 3.532h14c1.1 0 2-.896 2-2s-.9-2-2-2h-14c-1.1 0-2 .896-2 2s.9 2 2 2zm44.9-16.618c-.27-.824-1.03-1.382-1.9-1.382s-1.63.558-1.9 1.382l-.91 2.804s-2.81.912-2.81.912c-.82.268-1.38 1.036-1.38 1.902s.56 1.634 1.38 1.902l2.81.912s.91 2.804.91 2.804c.27.824 1.03 1.382 1.9 1.382s1.63-.558 1.9-1.382l.91-2.804s2.81-.912 2.81-.912c.82-.268 1.38-1.036 1.38-1.902s-.56-1.634-1.38-1.902l-2.81-.912s-.91-2.804-.91-2.804z"
                fill="url(#_Linear1)"
              ></path>
            </g>
          </svg>
        )}
      </motion.button>
    </div>
  );
}
