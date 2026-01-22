import React, { useState, useEffect, useRef } from 'react';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ChairIcon } from '../components/icons/ChairIcon';
import { ClientsIcon } from '../components/icons/ClientsIcon';
import { CalendarIcon } from '../components/icons/CalendarIcon';
import { ServicesIcon } from '../components/icons/ServicesIcon';
import { SettingsIcon } from '../components/icons/SettingsIcon';
import { AnimatedWallet } from '../components/icons/AnimatedWallet';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';
import { AppointmentStatus, BarberProfile, Client, Service } from '../types';
import { LogOut, Check, X, Camera, Mic, MicOff, Settings, Briefcase } from 'lucide-react';
import { useVoiceInterpreter } from '../hooks/useVoiceInterpreter';
import { api } from '../services/api';
import { LOCAL_AVATARS } from '../constants';

// Sub-components (Modals only, as views are now Routes)
import { FinancialModal } from '../components/dashboard/FinancialModal';
import { ClientProfileModal } from '../components/dashboard/ClientProfileModal';
import { BarberProfileModal } from '../components/dashboard/BarberProfileModal';
import { DraggableMic } from '../components/ui/DraggableMic';

const DEFAULT_BARBER_IMAGE =
  'https://images.unsplash.com/photo-1618077553780-75539862f629?q=80&w=400&auto=format&fit=crop';

export const DashboardLayout: React.FC = () => {
  // Contexts
  const { currentUser, logout, updateProfile } = useAuth();
  const {
    appointments,
    clients,
    services,
    shopSettings,
    updateAppointments,
    updateClients,
    updateServices,
    updateShopSettings,
  } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current view for active tab highlighting
  const getCurrentView = () => {
    const path = location.pathname;
    if (path.includes('/dashboard/clients')) return 'clients';
    if (path.includes('/dashboard/calendar')) return 'calendar';
    if (path.includes('/dashboard/services')) return 'services';
    if (path.includes('/dashboard/settings')) return 'settings';
    return 'home'; // Default to home for /dashboard
  };

  const currentView = getCurrentView();

  // AI VOICE STATE
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    error: voiceError,
  } = useVoiceInterpreter();
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // TEXT TO SPEECH HELPER
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.2; // Slightly faster
      // Try to find a good voice
      // Try to find a good voice
      const voices = window.speechSynthesis.getVoices();

      // 1. Priority: "Google Português do Brasil" (Standard Female in Chrome)
      let brVoice = voices.find(v => v.name === 'Google Português do Brasil');

      // 2. Fallback: Any PT-BR voice that contains "Luciana" (iOS) or "Female"
      if (!brVoice) {
        brVoice = voices.find(
          v =>
            (v.lang === 'pt-BR' || v.lang === 'pt_BR') &&
            (v.name.includes('Luciana') ||
              v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('feminino'))
        );
      }

      // 3. Fallback: Any Google PT-BR (Usually decent)
      if (!brVoice) {
        brVoice = voices.find(
          v => (v.lang === 'pt-BR' || v.lang === 'pt_BR') && v.name.includes('Google')
        );
      }

      // 4. Last Resort: Any PT-BR
      if (!brVoice) {
        brVoice = voices.find(v => v.lang === 'pt-BR' || v.lang === 'pt_BR');
      }

      if (brVoice) utterance.voice = brVoice;

      window.speechSynthesis.speak(utterance);
    }
  };

  // HANDLE MIC ERRORS (MOBILE HTTP ISSUE)
  useEffect(() => {
    if (voiceError) {
      console.error('Voice Error:', voiceError);
      if (
        voiceError.includes('not-allowed') ||
        voiceError.includes('security') ||
        voiceError.includes('permission')
      ) {
        alert(
          '⚠️ ERRO DE MICROFONE\n\n' +
            'O Chrome bloqueou o microfone por segurança (HTTP).\n\n' +
            'COMO RESOLVER:\n' +
            '1. Abra chrome://flags\n' +
            '2. Busque "Insecure origins treated as secure"\n' +
            '3. Adicione o IP: ' +
            window.location.origin +
            '\n' +
            '4. Reinicie o Chrome.'
        );
      } else {
        alert('Erro no microfone: ' + voiceError);
      }
    }
  }, [voiceError]);

  // Prevent multiple executions for the same transcript
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState('');

  useEffect(() => {
    if (!isListening && transcript && transcript !== lastProcessedTranscript) {
      handleVoiceCommand(transcript);
    }
  }, [isListening, transcript, lastProcessedTranscript]);

  const handleVoiceCommand = async (text: string) => {
    if (!text || voiceProcessing) {
      console.log('⚠️ Ignorando comando: vazio ou processamento em andamento.');
      return;
    }

    // Additional Safety: If Text is too short, ignore
    if (text.length < 4) return;

    setVoiceProcessing(true);
    setLastProcessedTranscript(text); // Mark as processed
    setAiResponse('Processando...');
    // speak('Processando...'); // Optional: too verbose

    try {
      const { processVoiceCommand } = await import('../utils/aiCommandProcessor');
      // Pass available services to AI for context
      const result = await processVoiceCommand(text, services);

      if (result.action === 'schedule') {
        // New AI returns ISO date YYYY-MM-DD directly
        // Fix: Use Local Date for fallback instead of UTC to prevent "tomorrow" issues at night
        const getLocalDateStr = () => {
          const d = new Date();
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        const appointmentDate = result.data.date || getLocalDateStr();
        const time = result.data.time || '12:00';
        const clientName = result.data.clientName || 'Cliente Voz';

        // 🛡️ SECURITY: Validate Business Hours
        const [h] = time.split(':').map(Number);
        // Fix: accessing shopSettings from context
        const { startHour, endHour } = shopSettings;

        // 1. Validate Business Hours
        if (h < startHour || h >= endHour) {
          const msg = `A barbearia está fechada às ${time}. Funcionamos das ${startHour}h às ${endHour}h.`;
          setAiResponse(`❌ ${msg}`);
          speak(msg);
          setTimeout(() => setAiResponse(null), 4000);
          return;
        }

        // 2. Validate Sunday (Closed)
        // appointmentDate is YYYY-MM-DD
        const [y, m, d] = appointmentDate.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d); // Local Time construction
        if (dateObj.getDay() === 0) {
          const msg = 'Não abrimos aos domingos! Tente outro dia.';
          setAiResponse(`❌ ${msg}`);
          speak(msg);
          setTimeout(() => setAiResponse(null), 4000);
          return;
        }

        // 2.5. Validate Closed Days (Exceptions)
        const exceptionForDate = shopSettings.exceptions?.[appointmentDate];
        if (exceptionForDate?.closed) {
          const msg = `A barbearia está fechada neste dia (${appointmentDate
            .split('-')
            .reverse()
            .slice(0, 2)
            .join('/')}).`;
          setAiResponse(`❌ ${msg}`);
          speak(`A barbearia está fechada neste dia. Escolha outra data.`);
          setTimeout(() => setAiResponse(null), 4000);
          return;
        }

        // 3. Validate Availability (Collision Check)
        const isOccupied = appointments.some(
          app =>
            app.status !== 'cancelled' &&
            app.time === time &&
            (app.date === appointmentDate || app.date.toString().split('T')[0] === appointmentDate)
        );

        if (isOccupied) {
          const msg = `O horário das ${time} já está ocupado.`;
          setAiResponse(`❌ ${msg}`);
          speak(msg);
          setTimeout(() => setAiResponse(null), 4000);
          return;
        }

        // 1. Find Client via Fuzzy Search
        // We need the latest clients list. Use `clients` from context.
        const targetName = (result.data.clientName || '').toLowerCase();
        let foundClient = clients.find(c => c.name.toLowerCase().includes(targetName));

        // If not found, try to fallback to a generic "Guest" or "Cliente Voz" if it exists, prevents 400 error
        if (!foundClient) {
          foundClient = clients.find(
            c => c.name.toLowerCase().includes('voz') || c.name.toLowerCase().includes('convidado')
          );
        }

        // AUTO-CREATE CLIENT (Fix 400 Bad Request)
        if (!foundClient && result.data.clientName) {
          console.log(`[AI] Creating new client: ${result.data.clientName}`);
          setAiResponse(`🆕 Criando cadastro para ${result.data.clientName}...`);
          speak(`Criando cadastro para ${result.data.clientName}`);
          try {
            const newClient = await api.createClient({
              name: result.data.clientName,
              phone: '00000000000', // Placeholder
              status: 'active',
              level: 1,
              lastVisit: new Date().toISOString(),
              img: null,
              notes: 'Criado via IA de Voz',
            });
            if (newClient) {
              foundClient = newClient;
              // Refresh clients list if possible, or assume context updates eventually
              // For now, allow flow to proceed with newClient.id
            }
          } catch (err) {
            console.error('Failed to auto-create client', err);
          }
        }

        // If still no client, we can't schedule without an ID (assuming backend requires it).
        // Or we assume the backend CAN create one if we send a special flag?
        // Based on previous logs, 'voice_temp' failed. So let's require a client.

        let finalClientId = foundClient ? foundClient.id : 'temp_id_placeholder';
        // NOTE: If 'temp_id_placeholder' triggers 400, we MUST have a valid ID.
        // Strategy: If no client found, don't schedule, ask user to register.

        if (!foundClient) {
          const errorMsg = `Cliente "${result.data.clientName}" não encontrado.`;
          setAiResponse(`⚠️ ${errorMsg}`);
          speak(errorMsg);
          setTimeout(() => setAiResponse(null), 4000);
          return;
        }

        const finalClientName = foundClient.name;

        // Find Service
        let serviceId = '1'; // Default
        let servicePrice = 35;
        let serviceName = 'Corte';

        if (result.data.serviceName) {
          const foundService = services.find(
            s =>
              s.name.toLowerCase() === result.data.serviceName.toLowerCase() ||
              s.name.toLowerCase().includes(result.data.serviceName.toLowerCase())
          );
          if (foundService) {
            serviceId = foundService.id;
            servicePrice = foundService.priceValue;
            serviceName = foundService.name;
          }
        }

        const newApptPayload = {
          clientId: finalClientId,
          clientName: finalClientName,
          serviceId: serviceId,
          date: appointmentDate,
          time: time,
          status: 'pending' as const,
          price: servicePrice,
          notes: `Agendado via IA de Voz. Serviço Solicitado: ${result.data.serviceName}`,
        };

        setAiResponse(`⏳ Agendando para ${clientName}...`);

        // 2. Call API
        const created = await api.createAppointment(newApptPayload);

        if (created) {
          const successMsg = `Agendado: ${clientName} às ${time}`;
          setAiResponse(`✅ ${successMsg}`);
          speak(`Agendado para ${clientName} às ${time}`);

          // 3. Update Local State & Notify WhatsApp
          updateAppointments([...appointments, created]);

          // WhatsApp Notification
          try {
            const { generateWhatsAppLink } = await import('../utils/whatsappUtils');

            // Fix: Use client phone if available (preferred), otherwise fallback safely
            // Note: The notification usually goes TO the barber or TO the client.
            // If notifying client: use client phone. If notifying barber: use barber phone.
            // Let's assume we want to open a chat WITH the client to confirm.
            const targetPhone =
              foundClient?.phone && foundClient.phone !== '00000000000' ? foundClient.phone : '';

            const link = generateWhatsAppLink(
              targetPhone,
              `Olá ${clientName}! Seu agendamento foi confirmado para ${appointmentDate.split('-').reverse().join('/')} às ${time}. (${serviceName} - R$ ${servicePrice})`
            );

            setAiResponse(`✅ Agendado! Abrindo WhatsApp...`);
            if (targetPhone) {
              window.open(link, '_blank');
            }
          } catch (err) {
            console.error('Error generating WhatsApp link', err);
          }
        } else {
          setAiResponse('❌ Falha ao criar agendamento.');
          speak('Não consegui criar o agendamento.');
        }

        setTimeout(() => setAiResponse(null), 4000);
      } else if (result.action === 'cancel') {
        const targetName = result.data.clientName;
        // AI returns ISO now, or fallback today
        const targetDate = result.data.date || new Date().toISOString().split('T')[0];

        setAiResponse(`🔍 Procurando por ${targetName} para cancelar...`);

        // Fuzzy search for client name in pending appointments
        const toCancel = appointments.filter(
          a =>
            a.status === 'pending' &&
            a.clientName.toLowerCase().includes(targetName.toLowerCase()) &&
            a.date === targetDate // Strict date match from AI
        );

        if (toCancel.length === 0) {
          setAiResponse(
            `⚠️ Não achei agendamento para ${targetName} ${result.data.date?.toLowerCase() || ''}.`
          );
          speak(`Não encontrei agendamento para ${targetName} nesta data.`);
        } else {
          await Promise.all(
            toCancel.map(app => api.updateAppointment(app.id, { status: 'cancelled' }))
          );

          // Refresh
          const freshApps = await api.getAppointments();
          updateAppointments(freshApps);

          setAiResponse(`✅ Agendamento de ${targetName} cancelado!`);
          speak(`O agendamento de ${targetName} foi cancelado.`);
        }
        setTimeout(() => setAiResponse(null), 4000);
      } else if (result.action === 'reschedule') {
        // Logic for Rescheduling
        const targetName = result.data.client_name;
        const newDate = result.data.date;
        const newTime = result.data.time;

        setAiResponse(`🔄 Tentando remarcar ${targetName}...`);

        // Find pending appt
        const apptToReschedule = appointments.find(
          a =>
            a.status === 'pending' && a.clientName.toLowerCase().includes(targetName.toLowerCase())
        );

        if (apptToReschedule) {
          await api.updateAppointment(apptToReschedule.id, {
            date: newDate,
            time: newTime,
          });
          setAiResponse(`✅ Remarcado: ${targetName} para ${newDate} às ${newTime}`);
          speak(
            `Remarquei ${targetName} para o dia ${newDate
              .split('-')
              .reverse()
              .join('/')} às ${newTime}.`
          );
          const fresh = await api.getAppointments();
          updateAppointments(fresh);
        } else {
          setAiResponse(`⚠️ Não achei agendamento de ${targetName} para remarcar.`);
          speak(`Não encontrei agendamento de ${targetName} para remarcar.`);
        }
        setTimeout(() => setAiResponse(null), 5000);
      } else if (result.action === 'manage_shop') {
        // --- REAL SHOP MANAGEMENT LOGIC ---
        const { action_type, dates, start_hour, end_hour } = result.data;
        const currentExceptions = { ...shopSettings.exceptions };

        if (action_type === 'close_agenda' && dates && dates.length > 0) {
          dates.forEach((date: string) => {
            currentExceptions[date] = { closed: true };
          });

          api.updateSettings({ ...shopSettings, exceptions: currentExceptions });
          updateShopSettings({ ...shopSettings, exceptions: currentExceptions });

          const formattedDates = dates.map((d: string) =>
            d.split('-').reverse().slice(0, 2).join('/')
          );
          const msg = `🔒 Agenda fechada para: ${formattedDates.join(', ')}`;
          setAiResponse(msg);
          speak(`Fechei a agenda para o dia ${formattedDates.join(' e ')}.`);
        } else if (action_type === 'open_agenda' && dates && dates.length > 0) {
          dates.forEach((date: string) => {
            // Remove explicitly or set closed: false
            if (currentExceptions[date]) {
              delete currentExceptions[date];
            }
          });

          api.updateSettings({ ...shopSettings, exceptions: currentExceptions });
          updateShopSettings({ ...shopSettings, exceptions: currentExceptions });

          const formattedDates = dates.map((d: string) =>
            d.split('-').reverse().slice(0, 2).join('/')
          );
          const msg = `🔓 Agenda reaberta para: ${formattedDates.join(', ')}`;
          setAiResponse(msg);
          speak(`Reabri a agenda para o dia ${formattedDates.join(' e ')}.`);
        } else if (action_type === 'set_hours') {
          // Can be global or specific date
          if (dates && dates.length > 0) {
            // Specific Date
            dates.forEach((date: string) => {
              currentExceptions[date] = {
                ...currentExceptions[date],
                startHour: start_hour,
                endHour: end_hour,
                closed: false,
              };
            });
            api.updateSettings({ ...shopSettings, exceptions: currentExceptions });
            updateShopSettings({ ...shopSettings, exceptions: currentExceptions });
            const formattedDates = dates.map((d: string) =>
              d.split('-').reverse().slice(0, 2).join('/')
            );
            speak(`Horário alterado para o dia ${formattedDates[0]}.`);
          } else {
            // Global
            const newSettings = { ...shopSettings };
            if (start_hour) newSettings.startHour = start_hour;
            if (end_hour) newSettings.endHour = end_hour;

            api.updateSettings(newSettings);
            updateShopSettings(newSettings);
            speak(`Horário de funcionamento padrão atualizado.`);
          }
          setAiResponse(`🕒 Horário atualizado!`);
        } else {
          speak('Entendi o comando, mas faltaram informações como a data.');
        }

        setTimeout(() => setAiResponse(null), 4000);
      } else {
        setAiResponse(`❓ ${result.message}`);
        speak(result.message || 'Desculpe, não entendi.');
        setTimeout(() => setAiResponse(null), 4000);
      }
    } catch (error) {
      console.error(error);
      // Check for Conflict 409
      if (
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        (error as any).status === 409
      ) {
        setAiResponse('⚠️ Horário já ocupado!');
        speak('Esse horário já está ocupado.');
      } else {
        // Tentar extrair mensagem de erro da resposta se disponível
        let message = 'Erro ao processar comando.';
        if (error instanceof Error) {
          message = error.message;
        } else if (typeof error === 'object' && (error as any).error) {
          message = (error as any).error; // Backend error
        }

        console.error('❌ AI Command Error:', error);
        setAiResponse(`❌ ${message}`);
        speak('Ocorreu um erro ao processar seu comando.');
      }
      setTimeout(() => setAiResponse(null), 3000);
    } finally {
      setVoiceProcessing(false);
    }
  };

  // UI State
  const [showFinancials, setShowFinancials] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Financial State
  const [dailyGoal, setDailyGoal] = useState(1500);

  // Finishing Flow State (Global because it can be triggered from multiple places potentially)
  const [finishingAppId, setFinishingAppId] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [barberNotes, setBarberNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  const barberProfile = currentUser as BarberProfile;
  const hasSpeechSupport = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Remove 2MB check - rely on server/Cloudinary 50MB limits
      try {
        const url = await api.uploadImage(file);
        if (url && barberProfile) {
          await api.updateBarber(barberProfile.id, { image: url }); // Persist to DB (Barber type uses 'image')
          updateProfile({ photoUrl: url }); // Update Local Context (BarberProfile uses 'photoUrl')
        }
      } catch (err) {
        alert('Erro ao enviar imagem. Tente novamente.');
        console.error(err);
      }
    }
  };

  const initiateFinish = (id: string) => {
    setFinishingAppId(id);
    setPhotoPreview(null);
    setBarberNotes('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await api.uploadImage(file); // Upload first
        if (url) {
          setPhotoPreview(url); // Set URL as preview
        }
      } catch (err) {
        console.error('Error uploading finish photo:', err);
        alert('Erro ao enviar foto.');
      }
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setBarberNotes(prev => prev + ' (Transcrição: Cliente pediu corte baixo com degradê...)');
        setIsRecording(false);
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  const confirmFinish = async () => {
    if (finishingAppId) {
      // Optimistic Update can be tricky if API fails, but let's try
      // Call API to persist
      try {
        await api.updateAppointment(finishingAppId, {
          status: 'completed',
          photoUrl: photoPreview || undefined, // Send URL
          notes: barberNotes,
        });

        // Local Update
        const updated = appointments.map(app =>
          app.id === finishingAppId
            ? {
                ...app,
                status: 'completed' as AppointmentStatus,
                photoUrl: photoPreview || undefined,
                notes: barberNotes,
              }
            : app
        );
        updateAppointments(updated);
        setFinishingAppId(null);
      } catch (err) {
        console.error('Failed to finish appointment', err);
        alert('Erro ao finalizar. Verifique sua conexão.');
      }
    }
  };

  // Derived Data for Financials
  const finished = appointments
    .filter(a => a.status === 'completed')
    .sort((a, b) => b.time.localeCompare(a.time));
  const todayRevenue = finished.reduce((acc, curr) => acc + curr.price, 0);
  const completedCount = finished.length;

  // Context for Outlets (Child routes can access these functions)
  const outletContext = {
    initiateFinish,
    setSelectedClient,
    dailyGoal,
    openProfileModal: () => setShowProfileModal(true),
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-yellow-500 selection:text-black transition-colors duration-300">
      {/* HEADER PIXEL PERFECT */}
      {/* HEADER PIXEL PERFECT */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--bg-secondary)] z-40 flex items-center justify-between px-4 border-b border-[var(--border-color)] transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[var(--color-neon-yellow)] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.2)] group hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all duration-300">
            <ChairIcon
              size={28}
              className="text-[var(--text-inverted)] group-hover:scale-110 transition-transform"
            />
          </div>
          <div className="flex flex-col justify-center translate-y-[2px]">
            <h1 className="text-xl md:text-3xl text-[var(--text-primary)] tracking-wide leading-none font-rye drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap">
              Trilha do Corte
            </h1>
            <div className="flex items-center gap-2 pl-1">
              <span className="text-[10px] md:text-xs font-bold text-[var(--color-neon-yellow)] uppercase tracking-[0.35em] drop-shadow-sm opacity-90 font-sans whitespace-nowrap">
                Barber Club
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/dashboard/financial')}
            className="group flex items-center justify-center transition-transform hover:scale-110"
          >
            <AnimatedWallet className="w-10 h-10 text-[var(--text-primary)] drop-shadow-xl filter brightness-110" />
          </button>
          <button
            onClick={() => setShowProfileModal(true)}
            className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--bg-card)] shadow-md hover:border-[var(--color-neon-yellow)] transition-colors"
          >
            <img
              src={getOptimizedImageUrl(barberProfile?.photoUrl || DEFAULT_BARBER_IMAGE, 100, 100)}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[var(--bg-primary)] animate-pulse"></div>
          </button>
        </div>
      </header>

      {/* AI VOICE BUTTON - Fixed Bottom Right (above nav) - DRAGABLE & RESTRICTED */}
      {(() => {
        const allowedPaths = ['/dashboard', '/dashboard/calendar'];
        // Strict check: only show on Dashboard (Home) and Calendar (Agenda)
        // If the path exactly matches or is just a sub-path logic?
        // User said: "Dashboard and Agenda".
        // Dashboard path: /dashboard
        // Agenda path: /dashboard/calendar
        const showMic = allowedPaths.includes(location.pathname);

        if (!showMic) return null;

        return (
          <DraggableMic
            isListening={isListening}
            onToggle={isListening ? stopListening : startListening}
          />
        );
      })()}

      {/* AI Voice Feedback Toast */}
      {(isListening || aiResponse) && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 md:bottom-10 md:left-1/2 md:-translate-x-1/2 z-[1000] flex flex-col items-center gap-2 pointer-events-none w-full px-4">
          {isListening && (
            <div className="bg-[var(--bg-card)]/90 backdrop-blur-md text-[var(--text-primary)] px-6 py-3 rounded-full border border-neon-yellow/30 shadow-[0_0_30px_rgba(234,179,8,0.2)] flex items-center gap-3 animate-fade-in-up">
              <div className="flex gap-1 h-3 items-end">
                <div className="w-1 bg-neon-yellow animate-[music-bar_0.5s_ease-in-out_infinite] h-full"></div>
                <div className="w-1 bg-neon-yellow animate-[music-bar_0.7s_ease-in-out_infinite] h-2/3"></div>
                <div className="w-1 bg-neon-yellow animate-[music-bar_0.4s_ease-in-out_infinite] h-full"></div>
              </div>
              <span className="font-mono text-sm tracking-widest uppercase text-neon-yellow">
                Ouvindo...
              </span>
              <span className="text-xs text-gray-400 max-w-[150px] truncate">"{transcript}"</span>
            </div>
          )}

          {aiResponse && (
            <div className="bg-[var(--bg-card)] text-[var(--text-primary)] px-6 py-4 rounded-xl border border-[var(--border-color)] shadow-2xl flex items-center gap-3 animate-fade-in-up w-auto min-w-[300px]">
              <div className="bg-blue-500/20 p-2 rounded-full">
                <Briefcase size={18} className="text-blue-400" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  Maquinista AI
                </span>
                <span className="font-medium text-sm text-balance">{aiResponse}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BOTTOM NAV PIXEL PERFECT */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] z-50 flex justify-around items-center px-2 pb-2 transition-colors duration-300">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-xl group"
        >
          <ChairIcon
            size={24}
            className={`transition-colors animate-float-slow ${
              currentView === 'home'
                ? 'text-[#FFD700]'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
            }`}
          />
          <span
            className={`text-[10px] font-bold uppercase tracking-wider transition-colors font-sf-pro ${
              currentView === 'home'
                ? 'text-[#FFD700]'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
            }`}
          >
            Dashboard
          </span>
        </button>

        <button
          onClick={() => navigate('/dashboard/clients')}
          className="flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-xl group"
        >
          <ClientsIcon
            size={24}
            className={`transition-colors animate-float-slow ${
              currentView === 'clients'
                ? 'text-[#FFD700]'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
            }`}
          />
          <span
            className={`text-[10px] font-bold uppercase tracking-wider transition-colors font-sf-pro ${
              currentView === 'clients'
                ? 'text-[#FFD700]'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
            }`}
          >
            Clientes
          </span>
        </button>

        <button
          onClick={() => navigate('/dashboard/calendar')}
          className="flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-xl group"
        >
          <CalendarIcon
            size={24}
            className={`transition-colors animate-float-slow ${
              currentView === 'calendar'
                ? 'text-[#FFD700]'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
            }`}
          />
          <span
            className={`text-[10px] font-bold uppercase tracking-wider transition-colors font-sf-pro ${
              currentView === 'calendar'
                ? 'text-[#FFD700]'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
            }`}
          >
            Agenda
          </span>
        </button>

        <button
          onClick={() => navigate('/dashboard/services')}
          className="flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-xl group"
        >
          <ServicesIcon
            size={24}
            className={`transition-colors animate-float-slow ${
              currentView === 'services'
                ? 'text-[#FFD700]'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
            }`}
          />
          <span
            className={`text-[10px] font-bold uppercase tracking-wider transition-colors font-sf-pro ${
              currentView === 'services'
                ? 'text-[#FFD700]'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
            }`}
          >
            Oficina
          </span>
        </button>

        <button
          onClick={() => navigate('/dashboard/settings')}
          className="flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-xl group"
        >
          <SettingsIcon
            size={24}
            className={`transition-colors animate-float-slow ${
              currentView === 'settings'
                ? 'text-[#FFD700]'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
            }`}
          />
          <span
            className={`text-[10px] font-bold uppercase tracking-wider transition-colors font-sf-pro ${
              currentView === 'settings'
                ? 'text-[#FFD700]'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
            }`}
          >
            Ajustes
          </span>
        </button>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="pt-20 pb-24 px-4 min-h-screen relative overflow-hidden transition-colors duration-300">
        {/* Premium Gradient Background: Pure black at top, subtle gradient below */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-zinc-950 pointer-events-none" />
        <div className="relative z-10 w-full">
          <Outlet context={outletContext} />
        </div>
      </main>

      {/* MODALS */}
      <FinancialModal
        isOpen={showFinancials}
        onClose={() => setShowFinancials(false)}
        todayRevenue={todayRevenue}
        dailyGoal={dailyGoal}
        setDailyGoal={setDailyGoal}
        completedCount={completedCount}
        finished={finished}
      />

      <ClientProfileModal
        client={selectedClient}
        appointments={appointments}
        services={services}
        onClose={() => setSelectedClient(null)}
        onNewBooking={client => {
          setSelectedClient(null);
          navigate('/dashboard/calendar');
        }}
      />

      {/* NEW BARBER PROFILE MODAL */}
      {showProfileModal && barberProfile && (
        <BarberProfileModal barber={barberProfile} onClose={() => setShowProfileModal(false)} />
      )}

      {/* MODAL FINALIZAR */}
      {finishingAppId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-md flex flex-col shadow-2xl max-h-[90vh] rounded-sm">
            <div className="p-4 md:p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-secondary)]">
              <h3 className="font-black text-[var(--text-primary)] uppercase tracking-wider text-base md:text-lg">
                Registrar Obra
              </h3>
              <button
                onClick={() => setFinishingAppId(null)}
                className="text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto space-y-4 md:space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video bg-[#050505] border-2 border-dashed border-gray-700 hover:border-neon-yellow cursor-pointer flex flex-col items-center justify-center transition-all group relative overflow-hidden rounded-sm"
              >
                {photoPreview ? (
                  <>
                    <img
                      src={getOptimizedImageUrl(photoPreview, 400, 300)}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white font-bold uppercase text-xs">Trocar Foto</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Camera
                      className="text-gray-600 group-hover:text-neon-yellow mb-2 transition-colors"
                      size={24}
                    />
                    <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest group-hover:text-white">
                      Adicionar Foto
                    </span>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2 items-center">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Observações do Maquinista
                  </label>
                  {hasSpeechSupport && (
                    <button
                      onClick={toggleRecording}
                      className={`text-[9px] font-bold uppercase flex items-center gap-1 px-2 py-1 rounded transition-all ${
                        isRecording
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <MicOff size={10} /> Gravando
                        </>
                      ) : (
                        <>
                          <Mic size={10} /> Voz
                        </>
                      )}
                    </button>
                  )}
                </div>
                <textarea
                  value={barberNotes}
                  onChange={e => setBarberNotes(e.target.value)}
                  className={`w-full bg-[#050505] border p-3 text-sm text-white focus:outline-none focus:border-neon-yellow h-24 md:h-32 resize-none rounded-sm transition-colors ${
                    isRecording ? 'border-red-600' : 'border-gray-700'
                  }`}
                  placeholder={
                    isRecording ? 'Ouvindo sua voz...' : 'Descreva o corte, produtos usados...'
                  }
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-800 bg-[#151515]">
              <button
                onClick={confirmFinish}
                className="w-full bg-neon-yellow hover:bg-white text-black font-black uppercase py-3 md:py-4 tracking-widest transition-colors flex justify-center items-center gap-2 rounded-sm shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] text-sm md:text-base"
              >
                Confirmar e Liberar <Check size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
