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
  Trash2,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { LOCAL_AVATARS } from '../../constants';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  action?: {
    type?: string;
    action?: string; // Add this
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

  // Error Handler for Speech
  const handleSpeechError = (error: any) => {
    console.warn('Speech Recognition Error:', error);
    setIsListening(false);
    if (error === 'not-allowed' || error === 'service-not-allowed') {
      alert('Permissão de microfone negada. Verifique suas configurações.');
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

      if (!res.ok) throw new Error('Falha na comunicação com a IA');

      const data = await res.json();

      const aiMsg: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        text: data.text || undefined,
        // Pass the WHOLE data object if it is an action, because data contains { action: '...', data: {...} }
        action: data.type === 'action' ? data : undefined,
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: '😵 Ops! Tive um problema de conexão. Tente novamente em instantes.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  interface BookingActionData {
    clientName?: string;
    clientPhone?: string; // New field collected by AI
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

    try {
      // ARCHITECTURAL FIX: Use PUBLIC endpoint only.
      // Do NOT call api.getClients/createClient (Protected/Admin only).
      // Let the Backend (appointmentsController) handle Guest creation via the 'phone' field.

      const targetName = actionData.clientName || 'Cliente Visitante';
      // Use AI phone or generate random guest ID
      const targetPhone = actionData.clientPhone || `55${Date.now().toString().slice(-9)}`;

      // Direct Public Booking Call
      // We cast to 'any' because 'phone' is valid for the API Schema but might be missing in the strict FE Type
      const appointmentPayload: any = {
        clientName: targetName,
        serviceId: actionData.serviceId || '1',
        date: actionData.date,
        time: actionData.time,
        price: actionData.price || 35.0,
        status: 'pending',
        notes: 'Agendado via Trilha AI',
        phone: targetPhone, // Backend uses this to auto-create client
      };

      const newAppt = await api.createAppointment(appointmentPayload);

      if (newAppt) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'ai',
            text: `✅ Agendamento Confirmado!\n\nServiço: ${actionData.serviceName}\nData: ${actionData.date} às ${actionData.time}\n\nTe esperamos na Trilha! 🚂`,
          },
        ]);
        // Trigger generic success visual if needed
      } else {
        throw new Error('Falha ao criar agendamento.');
      }
    } catch (error: any) {
      console.error('Booking Error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: 'Ops! Tive um problema ao salvar o agendamento no sistema. Tente novamente ou ligue para nós.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear Chat Logic
  const handleClearChat = () => {
    if (window.confirm('Limpar histórico da conversa?')) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: 'Olá! Sou a Trilha AI 🤖. Posso verificar horários livres ou agendar seu corte. Como posso ajudar?',
        },
      ]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="pointer-events-auto bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/80 rounded-3xl shadow-2xl w-[90vw] max-w-[380px] h-[600px] flex flex-col overflow-hidden mb-6 ring-1 ring-white/5"
          >
            {/* Header - High Tech Look */}
            <div className="bg-zinc-900/80 backdrop-blur-md p-4 border-b border-zinc-800/50 flex justify-between items-center z-10 sticky top-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <Sparkles size={20} className="text-white fill-white/20" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-100 text-sm tracking-wide flex items-center gap-2">
                    TRILHA AI
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      BETA
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Assistente Virtual Inteligente
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  title="Limpar Conversa"
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <div className="w-px h-4 bg-zinc-800 mx-1" />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              {messages.map(msg => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex flex-col max-w-[85%] ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* Sender Label (Optional, adds nice touch) */}
                    <span className="text-[10px] text-zinc-500 mb-1 px-1 font-medium tracking-wider uppercase">
                      {msg.sender === 'user' ? 'Você' : 'Trilha AI'}
                    </span>

                    <div
                      className={`rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm relative group transition-all duration-200 ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm shadow-indigo-500/10'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-sm hover:border-zinc-700'
                      }`}
                    >
                      {msg.text && (
                        <div className="whitespace-pre-wrap font-medium tracking-tight opacity-95">
                          {msg.text}
                          {/* Add a tiny timestamp or indicator if needed */}
                        </div>
                      )}

                      {/* RENDER TIME SLOTS PILLS */}
                      {msg.action && msg.action.action === 'PROPOSE_SLOTS' && (
                        <div className="mt-4 pt-3 border-t border-zinc-800">
                          <div className="flex items-center gap-2 mb-3 text-violet-400 text-xs uppercase font-extrabold tracking-widest">
                            <Clock size={12} />
                            <span>Horários Disponíveis</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {(msg.action.data.slots || []).map((slot: string) => {
                              const isSelected = messages.some(
                                m => m.sender === 'user' && m.text?.includes(slot)
                              );
                              return (
                                <button
                                  key={slot}
                                  disabled={isSelected}
                                  onClick={() => handleSendMessage(`Quero agendar às ${slot}`)}
                                  className={`
                                py-2.5 rounded-xl text-xs font-bold transition-all border
                                ${
                                  isSelected
                                    ? 'bg-violet-600 border-violet-500 text-white opacity-50 cursor-default'
                                    : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-violet-500 hover:bg-violet-500/10 hover:text-white hover:scale-105 active:scale-95'
                                }
                              `}
                                >
                                  {slot}
                                  {isSelected && <Check size={12} className="inline ml-1.5" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* CLIENT DATA FORM (REQUEST_CLIENT_DATA) */}
                      {msg.action && msg.action.action === 'REQUEST_CLIENT_DATA' && (
                        <div className="mt-4 bg-zinc-950 rounded-xl p-4 border border-zinc-800 shadow-xl">
                          <div className="mb-4 flex items-center gap-2 text-violet-400">
                            <div className="p-1.5 bg-violet-500/10 rounded-lg">
                              <User size={14} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">
                              Identificação Rápida
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1 mb-1 block">
                                Seu Nome
                              </label>
                              <input
                                type="text"
                                id={`name-${msg.id}`}
                                placeholder="Como prefere ser chamado?"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-zinc-600"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1 mb-1 block">
                                WhatsApp
                              </label>
                              <input
                                type="tel"
                                id={`phone-${msg.id}`}
                                placeholder="(00) 00000-0000"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-zinc-600"
                              />
                            </div>
                            <button
                              onClick={() => {
                                const nameInput = document.getElementById(
                                  `name-${msg.id}`
                                ) as HTMLInputElement;
                                const phoneInput = document.getElementById(
                                  `phone-${msg.id}`
                                ) as HTMLInputElement;
                                if (nameInput.value && phoneInput.value) {
                                  handleSendMessage(
                                    `Meus dados para cadastro: Nome: ${nameInput.value}, Telefone: ${phoneInput.value}. Pode confirmar?`
                                  );
                                } else {
                                  alert('Por favor, preencha os dois campos!');
                                }
                              }}
                              className="w-full mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-lg text-xs tracking-wide shadow-lg shadow-violet-900/20 active:scale-95 transition-all"
                            >
                              SALVAR DADOS
                            </button>
                          </div>
                        </div>
                      )}

                      {/* CONFIRMATION CARD */}
                      {msg.action && msg.action.action === 'PROPOSE_BOOKING' && (
                        <div className="mt-4 bg-zinc-950 rounded-xl p-0 overflow-hidden border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                          <div className="bg-zinc-900/50 p-3 border-b border-zinc-800 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                              <Calendar size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-zinc-200">
                                Confirmar Agendamento
                              </p>
                              <p className="text-[10px] text-zinc-500 line-clamp-1">
                                Verifique os detalhes abaixo
                              </p>
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-zinc-500">Serviço</span>
                              <span className="font-bold text-zinc-200">
                                {msg.action.data.serviceName}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-zinc-500">Data</span>
                              <span className="font-bold text-zinc-200">
                                {msg.action.data.date}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-zinc-500">Horário</span>
                              <span className="font-bold text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded">
                                {msg.action.data.time}
                              </span>
                            </div>
                          </div>
                          <div className="p-3 bg-zinc-900/30 border-t border-zinc-800">
                            <button
                              onClick={() => handleConfirmAction(msg.action?.data)}
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold tracking-wide transition-all shadow-lg shadow-emerald-500/20 active:translate-y-0.5 flex items-center justify-center gap-2"
                            >
                              <Check size={14} strokeWidth={3} />
                              CONFIRMAR AGORA
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 rounded-tl-sm flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase mr-2.5">
                      Trilha AI digitando
                    </span>
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800">
              <div className="relative flex items-center gap-2">
                <button
                  onClick={toggleListening}
                  className={`
                    p-3 rounded-xl transition-all duration-300 flex items-center justify-center
                    ${
                      isListening
                        ? 'bg-red-500/10 text-red-500 ring-1 ring-red-500/50 animate-pulse'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                    }
                  `}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder={isListening ? 'Ouvindo...' : 'Digite sua mensagem...'}
                    className="w-full bg-black/50 border border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all placeholder:text-zinc-600"
                  />
                  <div className="absolute right-1 top-1 bottom-1">
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputText.trim() || isLoading}
                      className="h-full aspect-square bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center justify-center shadow-lg shadow-violet-500/20"
                    >
                      <Send size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`pointer-events-auto flex items-center justify-center transition-all duration-300 z-50 ${
          isOpen
            ? 'bg-zinc-800 text-zinc-400 rounded-full w-14 h-14 rotate-90 ring-4 ring-zinc-900 shadow-xl'
            : 'bg-transparent filter drop-shadow-2xl hover:drop-shadow-[0_0_15px_rgba(113,40,242,0.5)]'
        }`}
      >
        {isOpen ? (
          <X size={28} />
        ) : (
          <svg
            clipRule="evenodd"
            fillRule="evenodd"
            strokeLinejoin="round"
            strokeMiterlimit="2"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[68px] h-[68px]"
          >
            <linearGradient
              id="_LinearFloat"
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
                fill="url(#_LinearFloat)"
              ></path>
            </g>
          </svg>
        )}
      </motion.button>
    </div>
  );
}
