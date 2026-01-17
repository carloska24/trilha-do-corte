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
import { ConfirmModal } from '../ui/ConfirmModal';
import { useUI } from '../../contexts/UIContext';

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
  const { openBooking } = useUI(); // Access booking modal
  const [isOpen, setIsOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
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

  // Open BookingModal with pre-filled data from AI conversation
  const handleOpenBookingModal = (actionData: BookingActionData) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: '🎫 Abrindo o formulário de agendamento com seus dados preenchidos...',
      },
    ]);

    // Close chat widget and open booking modal with pre-filled data
    setIsOpen(false);
    openBooking({
      name: actionData.clientName || '',
      phone: actionData.clientPhone || '',
      serviceId: actionData.serviceId,
      date: actionData.date,
      time: actionData.time,
    });
  };

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
        // Format date for display
        const dateParts = actionData.date.split('-');
        const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'ai',
            text: `✅ Agendamento Confirmado!\n\nServiço: ${actionData.serviceName}\nData: ${formattedDate} às ${actionData.time}\n\n📲 Enviando confirmação para seu WhatsApp...`,
          },
        ]);

        // Send WhatsApp notification
        // Google Maps short link with photo preview
        const mapLink = 'https://maps.app.goo.gl/rSR7ZgNUEYzvPscTA';

        // WhatsApp message with emojis
        const whatsappMsg =
          `✅ AGENDAMENTO CONFIRMADO\n\n` +
          `👤 Nome do cliente\n` +
          `${targetName}\n\n` +
          `✂️ Serviço agendado\n` +
          `${actionData.serviceName}\n\n` +
          `📅 Data: ${formattedDate}\n` +
          `🕐 Horário: ${actionData.time}\n` +
          `📍 Unidade: Trilha do Corte - Jd. São Marcos\n\n` +
          `💈 Te esperamos para mais um corte de respeito!\n\n` +
          `🗺️ Localização:\n${mapLink}`;

        const cleanPhone = targetPhone.replace(/\D/g, '');
        const whatsappUrl = `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(
          whatsappMsg
        )}`;

        // Open WhatsApp in new tab after short delay
        setTimeout(() => {
          window.open(whatsappUrl, '_blank');
        }, 1500);
      } else {
        throw new Error('Falha ao criar agendamento.');
      }
    } catch (error: any) {
      console.error('Booking Error:', error);

      let errorMessage =
        'Ops! Tive um problema ao salvar o agendamento no sistema. Tente novamente ou ligue para nós.';

      // Handle Conflict (Phone Hijack)
      if (error.message && error.message.includes('Este telefone já está cadastrado')) {
        errorMessage = error.message;
      }
      // Handle custom API errors (if we threw them as Error objects with the message)
      // The api.createAppointment wrapper catches errors and returns null usually,
      // but if we modified it or if it throws, we need to be safe.
      // Wait, api.createAppointment catches errors and returns null?
      // Let's verify api.createAppointment implementation again.
      // It returns null on error. We need to modify api.ts to throw/return the error message.

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear Chat Logic
  const handleClearChat = () => {
    setShowClearConfirm(true);
  };

  const confirmClear = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: 'Olá! Sou a Trilha AI 🤖. Posso verificar horários livres ou agendar seu corte. Como posso ajudar?',
      },
    ]);
    setShowClearConfirm(false);
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
            <div className="bg-black/40 backdrop-blur-xl p-4 border-b border-white/5 flex justify-between items-center z-10 sticky top-0 relative overflow-hidden">
              {/* Decorative Top Line */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="relative group">
                  {/* Avatar Container with Glow */}
                  <div className="absolute inset-0 bg-violet-600 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

                  <div className="relative bg-zinc-900 rounded-full p-0.5 ring-1 ring-white/10 group-hover:ring-violet-500/50 transition-all">
                    <svg
                      viewBox="0 0 64 64"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-9 h-9 text-white drop-shadow-md transform transition-transform group-hover:scale-105"
                    >
                      <linearGradient
                        id="header-robot-gradient"
                        gradientUnits="userSpaceOnUse"
                        x1="4.001"
                        x2="59.999"
                        y1="32"
                        y2="32"
                      >
                        <stop offset="0" stopColor="#00c0ff"></stop>
                        <stop offset="0.5" stopColor="#8b5cf6"></stop>
                        <stop offset="1" stopColor="#ff00ff"></stop>
                      </linearGradient>
                      <path
                        d="m47.21406 51.20557v-11.97246a7.92841 7.92841 0 0 1 0 11.97246zm-21.22654-26.62314v3.85757h1.99874v-3.85757a3.442 3.442 0 1 0 -1.99874 0zm19.2178 27.88229a8.01186 8.01186 0 0 1 -7.98493 7.53528h-20.467a8.01079 8.01079 0 0 1 -7.99493-7.99492s0-13.88122.01-14.03115a8.01185 8.01185 0 0 1 7.98493-7.5352h20.467a8.01185 8.01185 0 0 1 7.98493 7.5352c.00877.15327.01 14.34092 0 14.49079zm-21.74622-11.58254a3.90264 3.90264 0 0 0 -7.805-.00009 3.90264 3.90264 0 0 0 7.805.00009zm11.37279 9.15408a10.48167 10.48167 0 0 1 -7.845 3.69767 10.50434 10.50434 0 0 1 -7.845-3.69762.99754.99754 0 0 0 -1.5391 1.26917 12.56221 12.56221 0 0 0 9.38406 4.42718 12.55562 12.55562 0 0 0 9.38415-4.42718.99756.99756 0 0 0 -1.53911-1.26922zm-.40959-13.06172c-5.15279.12917-5.15388 7.68511-.00012 7.81505a3.90778 3.90778 0 0 0 .00012-7.81505zm-12.96193 3.90755a1.90393 1.90393 0 0 0 -3.80758.00009 1.90393 1.90393 0 0 0 3.80758-.00009zm12.96181-1.90882a1.909 1.909 0 0 0 .00008 3.81758 1.909 1.909 0 0 0 -.00008-3.81758zm-30.42072 6.246a7.79 7.79 0 0 0 2.75826 5.98626v-11.97242a7.84447 7.84447 0 0 0 -2.75826 5.9862zm37.766-17.57882-4.98682.7095a.99774.99774 0 0 1 -1.1293-1.12922l.70966-4.98673c-6.21245-12.77437 9.67246-24.40586 19.94733-14.54089 9.9411 10.0446-2.00133 26.32616-14.54083 19.94738zm-.2898-14.61073h5.99616a.99948.99948 0 0 0 0-1.99874h-5.99612a.99948.99948 0 0 0 0 1.99878zm11.99244 5.99628h-11.99235a.99948.99948 0 0 0 -.00005 1.99873h11.9924a.99948.99948 0 0 0 0-1.99873zm0-3.99747h-11.99235a.99948.99948 0 0 0 -.00005 1.99873h11.9924a.99948.99948 0 0 0 0-1.99877z"
                        fill="url(#header-robot-gradient)"
                      ></path>
                    </svg>
                    {/* Live Badge */}
                    <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border border-black"></span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 text-sm tracking-wide flex items-center gap-2">
                    TRILHA AI
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]">
                      BETA
                    </span>
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-violet-500"></span>
                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                      Online
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  title="Reiniciar Memória"
                  className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-red-400 transition-all hover:rotate-12"
                >
                  <Trash2 size={16} />
                </button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all hover:scale-110"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Body - Cyberpunk Scroll */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              {/* Welcome Message (Hidden if messages exist, but messages[0] is typically a welcome msg from state) */}

              {messages.map(msg => (
                <motion.div
                  initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex flex-col max-w-[85%] ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* Sender Label - Only for AI */}
                    {msg.sender === 'ai' && (
                      <div className="flex items-center gap-2 mb-1 pl-1">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-violet-500">
                          Trilha AI
                        </span>
                        <span className="text-[8px] px-1 py-px rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          BOT
                        </span>
                      </div>
                    )}

                    <div
                      className={`relative px-4 py-3 text-sm leading-relaxed shadow-lg backdrop-blur-sm transition-all duration-200 border ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-700 text-white rounded-2xl rounded-tr-sm border-white/10 shadow-violet-500/10'
                          : 'bg-zinc-900/90 text-zinc-200 rounded-2xl rounded-tl-sm border-white/5 hover:border-violet-500/30'
                      }`}
                    >
                      {/* Glow Effect for AI Bubbles */}
                      {msg.sender === 'ai' && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
                      )}

                      {msg.text && (
                        <div className="whitespace-pre-wrap relative z-10 font-normal tracking-wide">
                          {msg.text}
                        </div>
                      )}

                      {/* ACTIONS RENDERER (Slots, Form, Confirmation) */}

                      {/* RENDER TIME SLOTS PILLS */}
                      {msg.action && msg.action.action === 'PROPOSE_SLOTS' && (
                        <div className="mt-4 pt-3 border-t border-white/10">
                          <div className="flex items-center gap-2 mb-3 text-violet-400 text-xs uppercase font-black tracking-widest">
                            <Clock size={12} className="animate-pulse" />
                            <span>Horários Disponíveis</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {Array.from(new Set(msg.action.data.slots || [])).map((slot: any) => {
                              const isSelected = messages.some(
                                m => m.sender === 'user' && m.text?.includes(slot)
                              );
                              return (
                                <button
                                  key={slot}
                                  disabled={isSelected}
                                  onClick={() => handleSendMessage(`Quero agendar às ${slot}`)}
                                  className={`
                                py-2.5 rounded-lg text-xs font-bold transition-all border relative overflow-hidden group
                                ${
                                  isSelected
                                    ? 'bg-violet-600 border-violet-500 text-white opacity-50 cursor-default'
                                    : 'bg-zinc-950/50 border-zinc-800 text-zinc-300 hover:border-violet-500 hover:bg-violet-600 hover:text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                                }
                              `}
                                >
                                  <span className="relative z-10 flex items-center justify-center gap-1">
                                    {slot}
                                    {isSelected && <Check size={12} />}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* CLIENT DATA FORM (REQUEST_CLIENT_DATA) */}
                      {msg.action && msg.action.action === 'REQUEST_CLIENT_DATA' && (
                        <div className="mt-4 bg-black/40 rounded-xl p-4 border border-violet-500/20 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
                          <div className="mb-4 flex items-center gap-2 text-violet-400">
                            <div className="p-1.5 bg-violet-500/10 rounded-lg ring-1 ring-violet-500/20">
                              <User size={14} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">
                              Cadastro Rápido
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="group/input">
                              <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1 mb-1 block group-focus-within/input:text-violet-400 transition-colors">
                                Nome Completo
                              </label>
                              <input
                                type="text"
                                id={`name-${msg.id}`}
                                placeholder="Nome e Sobrenome"
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-zinc-700 font-medium"
                              />
                            </div>
                            <div className="group/input">
                              <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1 mb-1 block group-focus-within/input:text-violet-400 transition-colors">
                                WhatsApp
                              </label>
                              <input
                                type="tel"
                                id={`phone-${msg.id}`}
                                placeholder="(00) 00000-0000"
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-zinc-700 font-medium"
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

                                const name = nameInput.value.trim();
                                const phone = phoneInput.value.trim().replace(/\D/g, '');

                                // Validate full name (must have at least 2 words)
                                const nameParts = name.split(' ').filter(p => p.length > 0);
                                if (nameParts.length < 2) {
                                  alert(
                                    '⚠️ Dados Incompletos!\n\nPor favor, insira seu nome completo (nome e sobrenome).'
                                  );
                                  nameInput.focus();
                                  return;
                                }

                                // Validate phone (must have at least 10 digits for Brazilian numbers)
                                if (phone.length < 10) {
                                  alert(
                                    '⚠️ Dados Incompletos!\n\nPor favor, insira um telefone válido com DDD.'
                                  );
                                  phoneInput.focus();
                                  return;
                                }

                                handleSendMessage(
                                  `Meus dados para cadastro: Nome: ${name}, Telefone: ${phoneInput.value}. Pode confirmar?`
                                );
                              }}
                              className="w-full mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 rounded-lg text-xs tracking-widest shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] active:scale-[0.98] transition-all relative overflow-hidden"
                            >
                              <span className="relative z-10">SALVAR DADOS</span>
                              {/* Shine Effect */}
                              <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* CONFIRMATION CARD */}
                      {msg.action && msg.action.action === 'PROPOSE_BOOKING' && (
                        <div className="mt-4 bg-black/40 rounded-xl p-0 overflow-hidden border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] group-hover:border-emerald-500/50 transition-colors">
                          <div className="bg-emerald-950/30 p-3 border-b border-emerald-500/20 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 ring-1 ring-emerald-500/30">
                              <Calendar size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-emerald-400 tracking-wide">
                                Confirmar Agendamento
                              </p>
                              <p className="text-[10px] text-zinc-500 line-clamp-1">
                                Verifique os detalhes abaixo
                              </p>
                            </div>
                          </div>
                          <div className="p-4 space-y-3 relative">
                            {/* Subtle Pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/5 via-transparent to-transparent pointer-events-none" />

                            <div className="flex justify-between items-center text-xs relative z-10">
                              <span className="text-zinc-500 font-medium">Serviço</span>
                              <span className="font-bold text-zinc-200">
                                {msg.action.data.serviceName}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs relative z-10">
                              <span className="text-zinc-500 font-medium">Data</span>
                              <span className="font-bold text-zinc-200">
                                {msg.action.data.date}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs relative z-10">
                              <span className="text-zinc-500 font-medium">Horário</span>
                              <span className="font-bold text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                {msg.action.data.time}
                              </span>
                            </div>
                          </div>
                          <div className="p-3 bg-black/50 border-t border-white/5">
                            <button
                              onClick={() => handleConfirmAction(msg.action?.data)}
                              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-black tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2 group/btn"
                            >
                              <span className="group-hover/btn:scale-110 transition-transform">
                                <Check size={14} strokeWidth={4} />
                              </span>
                              CONFIRMAR AGORA
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator - Glitch Style */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start pl-1"
                >
                  <div className="bg-zinc-900/80 border border-violet-500/20 rounded-2xl p-4 rounded-tl-sm flex items-center gap-3 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                    <div className="flex gap-1.5 relative">
                      {/* Glow behind dots */}
                      <div className="absolute inset-0 bg-violet-500/20 blur-md rounded-full" />

                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: 'easeInOut',
                          delay: 0,
                        }}
                        className="w-2 h-2 bg-violet-500 rounded-full relative z-10"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: 'easeInOut',
                          delay: 0.2,
                        }}
                        className="w-2 h-2 bg-indigo-500 rounded-full relative z-10"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: 'easeInOut',
                          delay: 0.4,
                        }}
                        className="w-2 h-2 bg-purple-500 rounded-full relative z-10"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">
                      Processando
                    </span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Floating Magnetic Look */}
            <div className="p-4 bg-black/40 backdrop-blur-xl border-t border-white/5 relative z-20">
              <div className="relative flex items-center gap-2">
                <button
                  onClick={toggleListening}
                  className={`
                    p-3.5 rounded-xl transition-all duration-300 flex items-center justify-center shrink-0 border
                    ${
                      isListening
                        ? 'bg-red-500/10 border-red-500/50 text-red-400 animate-[pulse_2s_infinite]'
                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-zinc-700'
                    }
                  `}
                >
                  {isListening ? (
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity }}>
                      <MicOff size={20} />
                    </motion.div>
                  ) : (
                    <Mic size={20} />
                  )}
                </button>

                <div className="flex-1 relative group">
                  {/* Gradient Border Effect on Focus */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm pointer-events-none" />

                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder={isListening ? 'Ouvindo...' : 'Digite sua mensagem...'}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-12 py-3.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-transparent focus:border-transparent relative z-10 transition-all placeholder:text-zinc-600 shadow-inner"
                  />
                  <div className="absolute right-1.5 top-1.5 bottom-1.5 z-20">
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputText.trim() || isLoading}
                      className="h-full aspect-square bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale text-white rounded-lg transition-all flex items-center justify-center shadow-lg shadow-violet-500/20 active:scale-95 group/send"
                    >
                      <Send
                        size={16}
                        strokeWidth={2.5}
                        className="group-hover/send:-translate-y-0.5 group-hover/send:translate-x-0.5 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={confirmClear}
        title="Reiniciar Conversa"
        message="Tem certeza que deseja apagar todo o histórico? Isso não pode ser desfeito."
        confirmLabel="Sim, Limpar"
        cancelLabel="Voltar"
        isDanger
      />

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
