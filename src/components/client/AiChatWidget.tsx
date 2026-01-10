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
            className="pointer-events-auto bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-2xl w-[90vw] max-w-[380px] h-[600px] flex flex-col overflow-hidden mb-6 ring-1 ring-black/5 dark:ring-white/5"
          >
            {/* Header - High Tech Look */}
            <div className="bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md p-4 border-b border-zinc-200/50 dark:border-zinc-800/50 flex justify-between items-center z-10 sticky top-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <Sparkles size={20} className="text-white fill-white/20" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-wide flex items-center gap-2">
                    TRILHA AI
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                      BETA
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    Assistente Virtual Inteligente
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  title="Limpar Conversa"
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent">
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
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mb-1 px-1 font-medium tracking-wider uppercase">
                      {msg.sender === 'user' ? 'Você' : 'Trilha AI'}
                    </span>

                    <div
                      className={`rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm relative group transition-all duration-200 ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm shadow-indigo-500/10'
                          : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-tl-sm hover:border-zinc-300 dark:hover:border-zinc-700'
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
                        <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                          <div className="flex items-center gap-2 mb-3 text-violet-600 dark:text-violet-400 text-xs uppercase font-extrabold tracking-widest">
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
                                    : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-violet-500 hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-white hover:scale-105 active:scale-95'
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
                        <div className="mt-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xl">
                          <div className="mb-4 flex items-center gap-2 text-violet-600 dark:text-violet-400">
                            <div className="p-1.5 bg-violet-500/10 rounded-lg">
                              <User size={14} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">
                              Identificação Rápida
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] text-zinc-500 dark:text-zinc-500 uppercase font-bold ml-1 mb-1 block">
                                Seu Nome
                              </label>
                              <input
                                type="text"
                                id={`name-${msg.id}`}
                                placeholder="Como prefere ser chamado?"
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-zinc-500 dark:text-zinc-500 uppercase font-bold ml-1 mb-1 block">
                                WhatsApp
                              </label>
                              <input
                                type="tel"
                                id={`phone-${msg.id}`}
                                placeholder="(00) 00000-0000"
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
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
                        <div className="mt-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl p-0 overflow-hidden border border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-colors">
                          <div className="bg-zinc-100/50 dark:bg-zinc-900/50 p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                              <Calendar size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                Confirmar Agendamento
                              </p>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-500 line-clamp-1">
                                Verifique os detalhes abaixo
                              </p>
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-zinc-500">Serviço</span>
                              <span className="font-bold text-zinc-700 dark:text-zinc-200">
                                {msg.action.data.serviceName}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-zinc-500">Data</span>
                              <span className="font-bold text-zinc-700 dark:text-zinc-200">
                                {msg.action.data.date}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-zinc-500">Horário</span>
                              <span className="font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                {msg.action.data.time}
                              </span>
                            </div>
                          </div>
                          <div className="p-3 bg-zinc-100/30 dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-zinc-800">
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
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 rounded-tl-sm flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium tracking-wider uppercase mr-2.5">
                      Trilha AI digitando
                    </span>
                    <div className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800">
              <div className="relative flex items-center gap-2">
                <button
                  onClick={toggleListening}
                  className={`
                    p-3 rounded-xl transition-all duration-300 flex items-center justify-center
                    ${
                      isListening
                        ? 'bg-red-500/10 text-red-500 ring-1 ring-red-500/50 animate-pulse'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white'
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
                    className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
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
            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full w-14 h-14 rotate-90 ring-4 ring-white dark:ring-zinc-900 shadow-xl'
            : 'bg-transparent filter drop-shadow-2xl hover:drop-shadow-[0_0_15px_rgba(113,40,242,0.5)]'
        }`}
      >
        {isOpen ? (
          <X size={28} />
        ) : (
          <svg
            id="fi_12220455"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[48px] h-[48px]"
          >
            <linearGradient
              id="linear-gradient"
              gradientUnits="userSpaceOnUse"
              x1="4.001"
              x2="59.999"
              y1="32"
              y2="32"
            >
              <stop offset="0" stopColor="#00c0ff"></stop>
              <stop offset="1" stopColor="#5558ff"></stop>
            </linearGradient>
            <path
              d="m47.21406 51.20557v-11.97246a7.92841 7.92841 0 0 1 0 11.97246zm-21.22654-26.62314v3.85757h1.99874v-3.85757a3.442 3.442 0 1 0 -1.99874 0zm19.2178 27.88229a8.01186 8.01186 0 0 1 -7.98493 7.53528h-20.467a8.01079 8.01079 0 0 1 -7.99493-7.99492s0-13.88122.01-14.03115a8.01185 8.01185 0 0 1 7.98493-7.5352h20.467a8.01185 8.01185 0 0 1 7.98493 7.5352c.00877.15327.01 14.34092 0 14.49079zm-21.74622-11.58254a3.90264 3.90264 0 0 0 -7.805-.00009 3.90264 3.90264 0 0 0 7.805.00009zm11.37279 9.15408a10.48167 10.48167 0 0 1 -7.845 3.69767 10.50434 10.50434 0 0 1 -7.845-3.69762.99754.99754 0 0 0 -1.5391 1.26917 12.56221 12.56221 0 0 0 9.38406 4.42718 12.55562 12.55562 0 0 0 9.38415-4.42718.99756.99756 0 0 0 -1.53911-1.26922zm-.40959-13.06172c-5.15279.12917-5.15388 7.68511-.00012 7.81505a3.90778 3.90778 0 0 0 .00012-7.81505zm-12.96193 3.90755a1.90393 1.90393 0 0 0 -3.80758.00009 1.90393 1.90393 0 0 0 3.80758-.00009zm12.96181-1.90882a1.909 1.909 0 0 0 .00008 3.81758 1.909 1.909 0 0 0 -.00008-3.81758zm-30.42072 6.246a7.79 7.79 0 0 0 2.75826 5.98626v-11.97242a7.84447 7.84447 0 0 0 -2.75826 5.9862zm37.766-17.57882-4.98682.7095a.99774.99774 0 0 1 -1.1293-1.12922l.70966-4.98673c-6.21245-12.77437 9.67246-24.40586 19.94733-14.54089 9.9411 10.0446-2.00133 26.32616-14.54083 19.94738zm-.2898-14.61073h5.99616a.99948.99948 0 0 0 0-1.99874h-5.99612a.99948.99948 0 0 0 0 1.99878zm11.99244 5.99628h-11.99235a.99948.99948 0 0 0 -.00005 1.99873h11.9924a.99948.99948 0 0 0 0-1.99873zm0-3.99747h-11.99235a.99948.99948 0 0 0 -.00005 1.99873h11.9924a.99948.99948 0 0 0 0-1.99877z"
              fill="url(#linear-gradient)"
            ></path>
          </svg>
        )}
      </motion.button>
    </div>
  );
}
