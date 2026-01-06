// MARKER_SEARCH_TEST
import React, { useState, useEffect } from 'react';
import { Appointment, BookingData, Service, Client } from '../../types';
import { SERVICES as ALL_SERVICES } from '../../constants';
import { api } from '../../services/api';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Scissors,
  Zap,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  Minus,
  Mic,
  MicOff,
  MessageCircle, // WhatsApp Icon
  Share2,
  Trash2,
  Edit,
  Bell,
  MoreVertical,
  X,
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOutletContext } from 'react-router-dom';
import { useVoiceCommand } from '../../hooks/useVoiceCommand';
import { ConfirmModal } from '../ui/ConfirmModal';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';

interface DashboardOutletContext {
  setSelectedClient: (client: Client) => void;
}

export const CalendarView: React.FC = () => {
  const { appointments, services, updateAppointments, clients, shopSettings, updateShopSettings } =
    useData();
  const { currentUser } = useAuth();
  const { setSelectedClient } = useOutletContext<DashboardOutletContext>();

  const onNewAppointment = async (data: BookingData) => {
    try {
      // Find client ID if exists to link profile
      const foundClient = clients.find(c => c.name.toLowerCase() === data.name.toLowerCase());

      const payload = {
        clientName: data.name,
        serviceId: data.serviceId,
        date: data.date,
        time: data.time,
        status: 'pending' as const,
        price:
          services.find(s => s.id === data.serviceId)?.priceValue ||
          parseFloat(
            services
              .find(s => s.id === data.serviceId)
              ?.price.replace('R$', '')
              .replace(',', '.') || '0'
          ),
        clientId: foundClient?.id, // Link to existing client if found
      };

      const created = await api.createAppointment(payload);

      if (created) {
        updateAppointments([...appointments, created]);
        return true;
      } else {
        showToast('Erro ao criar na API');
        return false;
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      showToast('Erro de conexão');
      return false;
    }
  };

  const onSelectClient = (clientName: string) => {
    const found =
      clients.find(c => c.name && c.name.toLowerCase() === clientName.toLowerCase()) ||
      ({
        id: 'temp',
        name: clientName,
        phone: 'Sem cadastro',
        level: 1,
        lastVisit: 'Hoje',
        img: null,
        status: 'new',
        notes: 'Agendamento rápido.',
      } as Client);
    setSelectedClient(found);
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [longPressedId, setLongPressedId] = useState<string | null>(null);
  const [swipedAppId, setSwipedAppId] = useState<string | null>(null); // New Swipe State
  const [touchStartX, setTouchStartX] = useState<number | null>(null); // Swipe detection
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'config'>('daily');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Quick Add State with Context
  const [quickAddSlot, setQuickAddSlot] = useState<{ date: Date; time: string } | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isServiceListOpen, setIsServiceListOpen] = useState(false);
  const [isTimeListOpen, setIsTimeListOpen] = useState(false); // Custom Dropdown State

  // Export Modal State
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Helper for Toasts (Local implementation since CalendarView doesn't have the full toast system of Settings yet, or we can use a simple alert/log for now, user asked for toast feedback in settingsView, duplicating minimal toast here or omitting if not strictly required, but let's add a simple one)
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Voice Command Hook
  const { isListening, startListening, stopListening } = useVoiceCommand();

  // Form State
  const [clientName, setClientName] = useState('');
  const [selectedService, setSelectedService] = useState(services[0]?.id || '');

  // Auto-Scroll to Current Time
  useEffect(() => {
    if (activeTab === 'daily') {
      const currentHour = new Date().getHours();
      // Ensure we target a valid slot within our range (8-21)
      const targetHour = Math.max(
        shopSettings.startHour,
        Math.min(currentHour, shopSettings.endHour - 1)
      );

      // Delay slightly to ensure render
      setTimeout(() => {
        const element = document.getElementById(`hour-${targetHour}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [activeTab, selectedDate, shopSettings]);

  // Ticker Style Injection
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .animate-marquee {
        display: inline-flex;
        white-space: nowrap;
        animation: marquee 15s linear infinite;
        padding-left: 0;
      }
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style); // Safe cleanup
    };
  }, []);

  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, app: Appointment) => {
    e.stopPropagation();
    setDraggedAppId(app.id);
    setLongPressedId(null);
  };

  const handleDragEnd = () => {
    setDraggedAppId(null);
  };

  const handleMoveAppointment = async (appId: string, newTime: string) => {
    const app = appointments.find(a => a.id === appId);
    if (!app || app.time === newTime) return;

    // Optimistic Update
    const updated = appointments.map(a => (a.id === appId ? { ...a, time: newTime } : a));
    updateAppointments(updated);
    showToast(`Agendamento movido para ${newTime}`);

    // API Update
    try {
      await api.updateAppointment(appId, { time: newTime });
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar alteração');
    }
  };

  const [editId, setEditId] = useState<string | null>(null);

  const handleSaveAppointment = async () => {
    if (!clientName.trim() || !quickAddSlot || !selectedService) return;

    // Validate Past Time
    const [h, m] = quickAddSlot.time.split(':').map(Number);
    const appDate = new Date(quickAddSlot.date);
    appDate.setHours(h, m, 0, 0);

    // Reset seconds/ms of current time to avoid edge case issues
    const now = new Date();
    // Allow effectively "now" (within last minute) but nothing earlier
    if (appDate < now) {
      showToast('Não é possível agendar no passado!');
      return;
    }

    if (editId) {
      // UPDATE EXISTING
      const updated = appointments.map(app =>
        app.id === editId
          ? {
              ...app,
              clientName,
              serviceId: selectedService,
              date: getLocalISODate(quickAddSlot.date),
              time: quickAddSlot.time,
            }
          : app
      );
      updateAppointments(updated);

      // API Call (Mocked/Real)
      try {
        await api.updateAppointment(editId, {
          clientName,
          serviceId: selectedService,
          date: getLocalISODate(quickAddSlot.date),
          time: quickAddSlot.time,
        });
        showToast('Agendamento atualizado!');
      } catch (error) {
        console.error(error);
        showToast('Erro ao atualizar (API)');
      }

      setEditId(null);
    } else {
      // CREATE NEW
      const bookingData = {
        name: clientName,
        phone: '',
        serviceId: selectedService,
        date: getLocalISODate(quickAddSlot.date),
        time: quickAddSlot.time,
      };
      const success = await onNewAppointment(bookingData);
      if (success) {
        showToast('Agendamento criado!');
      }
    }

    setClientName('');
    setIsQuickAddOpen(false);
  };

  const getAppointmentsForDate = (date: Date) => {
    const targetDateKey = getLocalISODate(date);
    return appointments.filter(a => {
      // Handle both pure YYYY-MM-DD and ISO strings
      const appDateKey = a.date.includes('T') ? a.date.split('T')[0] : a.date;
      return appDateKey === targetDateKey && a.status !== 'cancelled';
    });
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const changeMonth = (months: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + months);
    setCurrentMonth(newMonth);
  };

  const handleSlotClick = (hour: number) => {
    setEditId(null); // Reset edit mode
    const time = `${String(hour).padStart(2, '0')}:00`;
    setQuickAddSlot({ date: selectedDate, time });
    setIsQuickAddOpen(true);
  };

  // Helper for Local YYYY-MM-DD (Safe Key)
  const getLocalISODate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // WhatsApp Export Logic
  const handleExportWhatsApp = () => {
    const dailyApps = getAppointmentsForDate(selectedDate).sort((a, b) =>
      a.time.localeCompare(b.time)
    );

    if (dailyApps.length === 0) {
      showToast('Nenhum agendamento para exportar.');
      return;
    }

    const dateStr = selectedDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });

    // UNICODE ESCAPE SEQUENCE METHOD (Standard 2025/2026 Fix)
    const ICON_CALENDAR = '\uD83D\uDDD3\uFE0F';
    const ICON_SCISSORS = '\u2702\uFE0F';
    const ICON_POLE = '\uD83D\uDC88';
    const LINE_SEPARATOR = '───────────────────────────';

    let msg = `${ICON_CALENDAR} *AGENDA - ${dateStr}*\n`;
    msg += `${LINE_SEPARATOR}\n\n`;

    dailyApps.forEach(app => {
      const service = getServiceDetails(app.serviceId);

      const serviceIcon = service.category === 'Barba' ? ICON_POLE : ICON_SCISSORS;

      let clientName = (app.clientName || 'Cliente').trim().split(' ')[0].toLowerCase();
      if (clientName.length > 0) {
        clientName = clientName.charAt(0).toUpperCase() + clientName.slice(1);
      }

      const serviceName = service.name;

      msg += `*${app.time}* • ${clientName}\n`;
      msg += `      ${serviceIcon} ${serviceName}\n\n`;
    });

    msg += `${LINE_SEPARATOR}\n`;
    msg += `_${ICON_POLE} Trilha do Corte_`;

    const barberPhone = (currentUser as any)?.phone?.replace(/\D/g, '');

    // API.WHATSAPP.COM is more reliable for specialized encoding
    const baseUrl = `https://api.whatsapp.com/send`;

    const phoneParam = barberPhone ? `&phone=55${barberPhone}` : '';
    const textParam = `text=${encodeURIComponent(msg)}`;

    const finalUrl = `${baseUrl}?${textParam}${phoneParam}`;

    window.open(finalUrl, '_blank');
  };

  const handleCancelAppointment = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal
    if (!window.confirm('Cancelar este agendamento?')) return;

    const updated = appointments.map(a =>
      a.id === id ? { ...a, status: 'cancelled' as const } : a
    );
    updateAppointments(updated);

    // Persist to API
    await api.updateAppointment(id, { status: 'cancelled' });
    showToast('Agendamento cancelado.');
  };

  const handleEditAppointment = (app: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditId(app.id);
    setClientName(app.clientName);
    setSelectedService(app.serviceId);
    setQuickAddSlot({ date: new Date(app.date), time: app.time });
    setIsQuickAddOpen(true);
  };

  const getTimeSlots = () => {
    // Check for today's exceptions first
    if (selectedDate.getDay() === 0) return []; // Block Sundays

    const dateKey = getLocalISODate(selectedDate);
    const exception = shopSettings.exceptions?.[dateKey];

    // Use exception values if present, otherwise defaults
    const start = exception?.startHour ?? shopSettings.startHour;
    const end = exception?.endHour ?? shopSettings.endHour;

    // Handle closed day (future feature but good to support data structure)
    if (exception?.closed) return [];

    // Safe guard against invalid range
    if (start >= end) return [];

    return Array.from({ length: end - start }, (_, i) => i + start);
  };

  // Helper to get service details
  const getServiceDetails = (id: string | number) => {
    if (!id)
      return { name: 'Serviço', category: 'Geral', icon: 'scissors', price: 'R$-', duration: 30 };

    // Normalize ID for comparison
    const searchId = String(id).trim();

    const s =
      services.find(serv => String(serv.id).trim() === searchId) ||
      ALL_SERVICES.find(serv => String(serv.id).trim() === searchId);

    return (
      s || { name: 'Serviço', category: 'Geral', icon: 'scissors', price: 'R$-', duration: 30 }
    );
  };

  // CALENDAR GRID LOGIC
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

    const result = [];
    for (let i = 0; i < firstDay; i++) result.push(null);
    for (let i = 1; i <= days; i++) result.push(new Date(year, month, i));
    return result;
  };

  const renderCalendarGrid = () => {
    const days = getDaysInMonth(currentMonth);
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <div className="p-4 animate-fade-in-up">
        {/* Month Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="text-white" />
          </button>
          <h3 className="text-xl font-black text-white uppercase tracking-wider">
            {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronRight className="text-white" />
          </button>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 text-center">
          {weekDays.map(d => (
            <div
              key={d}
              className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2"
            >
              {d}
            </div>
          ))}

          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="aspect-square"></div>;

            const count = getAppointmentsForDate(day).length;
            const isSelected = day.toDateString() === selectedDate.toDateString();
            const isToday = day.toDateString() === new Date().toDateString();
            const dateKey = getLocalISODate(day);
            const isSunday = day.getDay() === 0;
            const isClosed = shopSettings.exceptions?.[dateKey]?.closed;

            return (
              <div
                key={day.toISOString()}
                onClick={() => {
                  if (isSunday) return;
                  setSelectedDate(day);
                  setActiveTab('daily');
                }}
                className={`
                  aspect-square rounded-xl border flex flex-col items-center justify-center transition-all group relative
                  ${
                    isSunday
                      ? 'bg-zinc-900/30 border-white/5 text-zinc-700 cursor-not-allowed opacity-50 grayscale hover:scale-100' // Sunday Style
                      : isClosed
                      ? 'bg-red-900/20 border-red-900/50 text-red-500 cursor-pointer hover:scale-105'
                      : isSelected
                      ? 'bg-neon-yellow border-neon-yellow text-black cursor-pointer hover:scale-105'
                      : 'bg-[#1a1a1a] border-gray-800 text-white hover:border-gray-600 cursor-pointer hover:scale-105'
                  }
                `}
              >
                <span
                  className={`text-sm font-bold ${isSelected ? 'text-black' : 'text-gray-300'}`}
                >
                  {day.getDate()}
                </span>

                {count > 0 && (
                  <div className="flex gap-1 mt-1">
                    {[...Array(Math.min(count, 3))].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-1 rounded-full ${
                          isSelected ? 'bg-black' : 'bg-neon-yellow'
                        }`}
                      ></div>
                    ))}
                    {count > 3 && (
                      <div
                        className={`w-1 h-1 rounded-full ${
                          isSelected ? 'bg-black' : 'bg-gray-500'
                        }`}
                      >
                        +
                      </div>
                    )}
                  </div>
                )}

                {isToday && !isSelected && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#111] text-white relative">
      <style>
        {`
          @keyframes fade-in-down {
            0% { opacity: 0; transform: translate(-50%, -20px); }
            100% { opacity: 1; transform: translate(-50%, 0); }
          }
          .animate-fade-in-down {
            animation: fade-in-down 0.3s ease-out forwards;
          }
        `}
      </style>

      {/* Toast Overlay */}
      {toastMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-black font-bold px-4 py-2 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.6)] animate-fade-in-down flex items-center gap-2 pointer-events-none">
          <CheckCircle2 size={16} /> {toastMsg}
        </div>
      )}

      {/* HEADER */}
      <div className="pt-6 px-4 md:px-6 bg-[#111] border-b border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-graffiti text-white tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            AGENDA
          </h1>
          {/* WhatsApp Share Button */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="group relative px-2 pr-4 py-1.5 bg-[#0a0a0a] border border-green-500/30 rounded-xl flex items-center gap-3 hover:border-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all overflow-hidden active:scale-95"
          >
            <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            {/* Icon Badge */}
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/30 relative z-10 group-hover:bg-green-500 group-hover:text-black transition-colors">
              <WhatsAppIcon
                width={18}
                height={18}
                className="fill-green-500 group-hover:fill-black transition-colors"
              />
            </div>

            {/* Text Stack */}
            <div className="flex flex-col items-start relative z-10">
              <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest leading-none mb-0.5 group-hover:text-green-400">
                WhatsApp
              </span>
              <span className="text-xs font-black text-white uppercase tracking-wider leading-none">
                Compartilhar
              </span>
            </div>
          </button>
        </div>

        {/* TABS */}
        <div className="flex items-center justify-between gap-2 md:gap-4 overflow-x-auto custom-scrollbar pb-1 w-full">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('daily')}
              className={`pb-3 border-b-2 text-xs md:text-sm font-bold tracking-widest transition-all whitespace-nowrap ${
                activeTab === 'daily'
                  ? 'border-neon-yellow text-neon-yellow'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              DIÁRIO
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`pb-3 border-b-2 text-xs md:text-sm font-bold tracking-widest transition-all whitespace-nowrap ${
                activeTab === 'monthly'
                  ? 'border-neon-yellow text-neon-yellow'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              CALENDÁRIO
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`pb-3 border-b-2 text-xs md:text-sm font-bold tracking-widest transition-all whitespace-nowrap ${
                activeTab === 'config'
                  ? 'border-neon-yellow text-neon-yellow'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              AJUSTES
            </button>
          </div>

          {/* WhatsApp Export Button (Right Aligned or Inline) */}
        </div>
      </div>

      {/* CONTENT BODY */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {activeTab === 'config' ? (
          // --- SETTINGS VIEW (REFINED) ---
          <div className="p-4 md:p-6 max-w-lg mx-auto animate-fade-in-up pb-24">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                  <Clock size={24} className="text-neon-yellow" />
                  Ajustes
                </h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 pl-9">
                  Personalize sua agenda
                </p>
              </div>

              {/* Voice Command Button - Floating or Inline */}
              <button
                onClick={() => {
                  if (isListening) {
                    stopListening();
                  } else {
                    startListening(action => {
                      if (!action) return;

                      if (action.type === 'SET_HOURS') {
                        // Check if specific date
                        if (action.payload.date) {
                          const dateKey = action.payload.date;
                          const currentException = shopSettings.exceptions?.[dateKey] || {};

                          const newException = { ...currentException };
                          if (action.payload.start !== undefined)
                            newException.startHour = action.payload.start;
                          if (action.payload.end !== undefined)
                            newException.endHour = action.payload.end;

                          const newExceptions = {
                            ...shopSettings.exceptions,
                            [dateKey]: newException,
                          };
                          updateShopSettings({ ...shopSettings, exceptions: newExceptions });

                          const fmtDate = new Date(dateKey + 'T12:00:00').toLocaleDateString(
                            'pt-BR',
                            { day: '2-digit', month: '2-digit' }
                          );
                          showToast(`📅 Dia ${fmtDate} atualizado!`);
                        } else {
                          // Global Setting
                          const updates: any = {};
                          if (action.payload.start !== undefined)
                            updates.startHour = action.payload.start;
                          if (action.payload.end !== undefined)
                            updates.endHour = action.payload.end;
                          updateShopSettings({ ...shopSettings, ...updates });
                          showToast(`Horário padrão atualizado!`);
                        }
                      } else if (action.type === 'SET_CLOSED') {
                        // "Dia X Fechado" (Now handling multiple dates)
                        if (action.payload.dates && action.payload.dates.length > 0) {
                          const newExceptions = { ...shopSettings.exceptions };
                          const formattedDates: string[] = [];

                          action.payload.dates.forEach(dateKey => {
                            const currentException = shopSettings.exceptions?.[dateKey] || {};
                            newExceptions[dateKey] = { ...currentException, closed: true };

                            const [y, m, d] = dateKey.split('-');
                            formattedDates.push(`${d}/${m}`);
                          });

                          updateShopSettings({
                            ...shopSettings,
                            exceptions: newExceptions,
                          });

                          const datesString = formattedDates.join(', ');
                          showToast(`🚫 Dias ${datesString} definidos como FECHADO!`);
                        }
                      } else if (action.type === 'RESET_EXCEPTIONS') {
                        updateShopSettings({
                          ...shopSettings,
                          startHour: 9,
                          endHour: 19,
                          exceptions: {},
                        });
                        showToast(`♻️ Todos os dias resetados para o padrão (9-19h)!`);
                      } else if (action.type === 'SET_INTERVAL') {
                        updateShopSettings({
                          ...shopSettings,
                          slotInterval: action.payload.minutes,
                        });
                        showToast(`Intervalo de ${action.payload.minutes}min definido!`);
                      } else {
                        // Use a visual cue for failure (if toast allows HTML/ReactNode, otherwise just a different text prefix)
                        showToast(`❌ Não entendi: "${action.transcript}"`);
                      }
                    });
                  }
                }}
                className={`
                    w-14 h-14 rounded-full flex items-center justify-center transition-all relative overflow-hidden group shadow-lg
                    ${
                      isListening
                        ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse'
                        : 'bg-[#1A1A1A] text-neon-yellow border-2 border-neon-yellow/30 hover:bg-neon-yellow hover:text-black hover:scale-105'
                    }
                  `}
              >
                {isListening ? (
                  <>
                    <div className="absolute inset-0 bg-red-500 animate-ping opacity-20"></div>
                    <MicOff size={24} />
                  </>
                ) : (
                  <Mic size={24} />
                )}
              </button>
            </div>

            {/* Main Card */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative">
              {/* Subtle Gradient Glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-yellow to-transparent opacity-50"></div>

              {/* SECTION 1: HOURS */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 bg-neon-yellow rounded-full"></div>
                  <h3 className="text-white font-bold uppercase tracking-widest text-sm">
                    Horário de Funcionamento
                  </h3>
                </div>

                <div className="grid gap-2">
                  {/* Start Hour */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#111] border border-white/5 hover:border-white/10 transition-colors group">
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest block mb-1">
                        Abertura
                      </span>
                      <span className="text-white font-black text-2xl group-hover:text-neon-yellow transition-colors">
                        {String(shopSettings.startHour).padStart(2, '0')}:00
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          const newStart = Math.max(0, shopSettings.startHour - 1);
                          updateShopSettings({ ...shopSettings, startHour: newStart });
                          showToast('Abertura salva!');
                        }}
                        className="w-10 h-10 rounded-lg bg-[#1E1E1E] hover:bg-neon-yellow hover:text-black border border-white/5 flex items-center justify-center transition-all active:scale-95 text-gray-400"
                      >
                        <Minus size={18} strokeWidth={3} />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          const newStart = Math.min(
                            shopSettings.endHour - 1,
                            shopSettings.startHour + 1
                          );
                          updateShopSettings({ ...shopSettings, startHour: newStart });
                          showToast('Abertura salva!');
                        }}
                        className="w-10 h-10 rounded-lg bg-[#1E1E1E] hover:bg-neon-yellow hover:text-black border border-white/5 flex items-center justify-center transition-all active:scale-95 text-gray-400"
                      >
                        <Plus size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                  {/* End Hour */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#111] border border-white/5 hover:border-white/10 transition-colors group">
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest block mb-1">
                        Fechamento
                      </span>
                      <span className="text-white font-black text-2xl group-hover:text-neon-yellow transition-colors">
                        {String(shopSettings.endHour).padStart(2, '0')}:00
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          const newEnd = Math.max(
                            shopSettings.startHour + 1,
                            shopSettings.endHour - 1
                          );
                          updateShopSettings({ ...shopSettings, endHour: newEnd });
                          showToast('Fechamento salvo!');
                        }}
                        className="w-10 h-10 rounded-lg bg-[#1E1E1E] hover:bg-neon-yellow hover:text-black border border-white/5 flex items-center justify-center transition-all active:scale-95 text-gray-400"
                      >
                        <Minus size={18} strokeWidth={3} />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          const newEnd = Math.min(23, shopSettings.endHour + 1);
                          updateShopSettings({ ...shopSettings, endHour: newEnd });
                          showToast('Fechamento salvo!');
                        }}
                        className="w-10 h-10 rounded-lg bg-[#1E1E1E] hover:bg-neon-yellow hover:text-black border border-white/5 flex items-center justify-center transition-all active:scale-95 text-gray-400"
                      >
                        <Plus size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/5 mx-6"></div>

              {/* SECTION 2: INTERVAL */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                  <h3 className="text-white font-bold uppercase tracking-widest text-sm">
                    Duração dos Cortes
                  </h3>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[60, 30, 20, 15].map(min => (
                    <button
                      key={min}
                      onClick={e => {
                        e.stopPropagation();
                        updateShopSettings({ ...shopSettings, slotInterval: min });
                        showToast(`${min}min salvo!`);
                      }}
                      className={`
                                        flex flex-col items-center justify-center py-4 rounded-xl border transition-all active:scale-95 group/btn relative overflow-hidden
                                        ${
                                          (shopSettings.slotInterval || 60) === min
                                            ? 'bg-neon-yellow border-neon-yellow text-black'
                                            : 'bg-[#111] border-white/5 text-gray-500 hover:border-white/20 hover:text-white'
                                        }
                                    `}
                    >
                      <span className="text-lg font-black relative z-10">{min}</span>
                      <span
                        className={`text-[8px] font-bold uppercase relative z-10 ${
                          (shopSettings.slotInterval || 60) === min
                            ? 'text-black/70'
                            : 'text-gray-600 group-hover/btn:text-gray-400'
                        }`}
                      >
                        MIN
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'monthly' ? (
          renderCalendarGrid()
        ) : (
          <>
            {/* Daily Nav */}
            <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-[#151515] border-b border-gray-800 sticky top-0 z-20 shadow-xl">
              <button
                onClick={e => {
                  e.stopPropagation();
                  changeDate(-1);
                }}
                className="text-gray-400 hover:text-white transition-colors bg-[#0a0a0a] p-2 rounded-lg border border-gray-800 relative z-50"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="text-center relative">
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] block">
                  Data Selecionada
                </span>
                <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wider flex items-center justify-center gap-3">
                  <CalendarIcon size={16} className="text-neon-yellow" />
                  <span>
                    {selectedDate
                      .toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                      })
                      .toUpperCase()}
                  </span>
                  {selectedDate.toDateString() === new Date().toDateString() && (
                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                      HOJE
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  console.log('Next Day Clicked');
                  changeDate(1);
                }}
                className="text-gray-400 hover:text-white transition-colors bg-[#0a0a0a] p-2 rounded-lg border border-gray-800 relative z-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Dynamic Timeline Flow */}
            <div className="pb-24 pt-2 relative flex flex-col">
              {(() => {
                // GENERATOR ALGORITHM
                const items: any[] = [];
                const dateKey = getLocalISODate(selectedDate);
                const exception = shopSettings.exceptions?.[dateKey];

                const startLimit = exception?.startHour ?? shopSettings.startHour;
                const endLimit = exception?.endHour ?? shopSettings.endHour;

                // SUNDAY BLOCKER (Refined Standardized UI)
                if (selectedDate.getDay() === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-500 opacity-50">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <h3 className="text-sm font-bold uppercase tracking-widest mb-1">
                        Domingo - Fechado
                      </h3>
                      <p className="text-[10px] uppercase tracking-widest opacity-60">
                        Sem horários disponíveis
                      </p>
                    </div>
                  );
                }

                // REMOVED "CLOSED" BLOCKING UI - user wants grid always visible (EXCEPT SUNDAYS)

                let currentMinutes = startLimit * 60;
                const endMinutes = endLimit * 60;

                const dailyApps = getAppointmentsForDate(selectedDate).sort((a, b) =>
                  a.time.localeCompare(b.time)
                );

                while (currentMinutes < endMinutes) {
                  const h = Math.floor(currentMinutes / 60);
                  const m = currentMinutes % 60;
                  const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

                  // 1. Find apps starting exactly here
                  const startingApps = dailyApps.filter(a => a.time === timeStr);

                  if (startingApps.length > 0) {
                    // RENDER APPOINTMENTS (Stack if multiple, but usually 1)
                    let maxDuration = 0;
                    startingApps.forEach(app => {
                      const service = getServiceDetails(app.serviceId);
                      const duration = service.duration || 30;
                      if (duration > maxDuration) maxDuration = duration;

                      items.push({ type: 'app', data: app, time: timeStr, service });
                    });

                    // Advance Cursor by the longest appointment
                    currentMinutes += maxDuration;
                  } else {
                    // RENDER EMPTY SLOT
                    // We need to determine how long this empty slot lasts.
                    // It should go until: Next App Start OR Next Hour Mark.

                    // a) Find next appointment start time (in minutes)
                    const nextApp = dailyApps.find(a => {
                      const [ah, am] = a.time.split(':').map(Number);
                      return ah * 60 + am > currentMinutes;
                    });
                    const nextAppStart = nextApp
                      ? parseInt(nextApp.time.split(':')[0]) * 60 +
                        parseInt(nextApp.time.split(':')[1])
                      : endMinutes;

                    // b) Next Hour Mark (e.g. if 9:30, next is 10:00)
                    const nextHourMark = (Math.floor(currentMinutes / 60) + 1) * 60;

                    // Target is simpler of the two (don't overlap app, but snap to grid if free)
                    let targetEnd = Math.min(nextAppStart, nextHourMark);

                    // Safety: Ensure progress
                    if (targetEnd <= currentMinutes) targetEnd = currentMinutes + 15;
                    if (targetEnd > endMinutes) targetEnd = endMinutes;

                    items.push({
                      type: 'empty',
                      time: timeStr,
                      duration: targetEnd - currentMinutes,
                    });
                    currentMinutes = targetEnd;
                  }
                }

                const handleDragStart = (e: React.DragEvent, app: any) => {
                  e.dataTransfer.setData('text/plain', app.id);
                  e.dataTransfer.effectAllowed = 'move';
                  // Create a custom drag image if needed, or rely on default
                };

                const handleDragOver = (e: React.DragEvent) => {
                  e.preventDefault(); // Essential to allow dropping
                  e.dataTransfer.dropEffect = 'move';
                };

                const handleDrop = async (e: React.DragEvent, targetTime: string) => {
                  e.preventDefault();
                  const appId = e.dataTransfer.getData('text/plain');
                  if (!appId) return;

                  const app = appointments.find(a => a.id === appId);
                  if (!app || app.time === targetTime) return;

                  // Optimistic Update
                  const updatedAppointments = appointments.map(a =>
                    a.id === appId ? { ...a, time: targetTime, date: dateKey } : a
                  );
                  updateAppointments(updatedAppointments);

                  // API Call
                  const success = await api.updateAppointment(appId, {
                    time: targetTime,
                    date: dateKey,
                  });
                  if (!success) {
                    // Revert if failed
                    alert('Erro ao mover agendamento');
                    updateAppointments(appointments); // Revert to old state
                  }
                };

                return items.map((item, idx) => {
                  // CHECK IF SLOT IS IN THE PAST
                  const isPast = (() => {
                    const now = new Date();
                    // Reset seconds for cleaner comparison
                    const current = new Date(
                      now.getFullYear(),
                      now.getMonth(),
                      now.getDate(),
                      now.getHours(),
                      now.getMinutes()
                    );

                    const slotDate = new Date(selectedDate);
                    const [h, m] = item.time.split(':').map(Number);
                    slotDate.setHours(h, m, 0, 0);

                    return slotDate < current;
                  })();

                  return (
                    <div
                      key={`${item.time}-${idx}`}
                      onDragOver={handleDragOver}
                      onDrop={e => handleDrop(e, item.time)}
                      className={`flex min-h-[100px] border-b border-white/5 group relative transition-colors duration-200 ${
                        item.type === 'empty' && !isPast ? 'hover:bg-white/5' : ''
                      }`}
                    >
                      {/* Time Column */}
                      <div
                        className={`w-16 md:w-20 py-4 pl-2 md:pl-4 text-xs md:text-sm font-mono font-bold flex flex-col items-start border-r border-white/5 ${
                          isPast ? 'text-zinc-700' : 'text-zinc-500'
                        }`}
                      >
                        <span className={item.type === 'app' ? 'text-white' : ''}>{item.time}</span>
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 px-2 md:px-3 py-2 relative">
                        {item.type === 'app' ? (
                          <div className="absolute inset-0 z-10 px-2 py-1">
                            {/* SWIPE ACTIONS (Sibling) */}
                            <div
                              className={`absolute inset-0 flex items-center justify-start gap-4 pl-4 bg-[#111] rounded-xl border border-white/5 z-0 transition-opacity duration-300 ${
                                swipedAppId === (item as any).data.id
                                  ? 'opacity-100 pointer-events-auto'
                                  : 'opacity-0 pointer-events-none'
                              }`}
                            >
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleCancelAppointment((item as any).data.id, e);
                                  setSwipedAppId(null);
                                }}
                                className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all scale-90 hover:scale-100"
                              >
                                <Trash2 size={18} />
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleEditAppointment((item as any).data, e);
                                  setSwipedAppId(null);
                                }}
                                className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/50 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all scale-90 hover:scale-100"
                              >
                                <Edit size={18} />
                              </button>
                              {/* Click area to close swipe */}
                              <div
                                className="flex-1 h-full"
                                onClick={() => setSwipedAppId(null)}
                              ></div>
                            </div>

                            {/* CARD - PREMIUM LAYOUT */}
                            <div
                              className={`w-full h-full bg-[#1A1A1A] rounded-xl overflow-hidden border border-white/10 shadow-lg relative z-10 cursor-grab active:cursor-grabbing group/card touch-pan-y flex flex-col
                                    ${
                                      swipedAppId === (item as any).data.id
                                        ? 'translate-x-[120px] opacity-50'
                                        : 'translate-x-0 opacity-100'
                                    }
                                    transition-all duration-300 hover:border-white/20 hover:shadow-xl
                                `}
                              draggable={true}
                              onDragStart={e => handleDragStart(e, (item as any).data)}
                              onTouchStart={e => setTouchStartX(e.touches[0].clientX)}
                              onTouchEnd={e => {
                                if (touchStartX === null) return;
                                const diff = e.changedTouches[0].clientX - touchStartX;
                                if (diff > 50) setSwipedAppId((item as any).data.id);
                                else if (diff < -50) setSwipedAppId(null);
                                setTouchStartX(null);
                              }}
                              onClick={() => {
                                if (swipedAppId === (item as any).data.id) setSwipedAppId(null);
                                else onSelectClient((item as any).data.clientName);
                              }}
                            >
                              {/* HEADER: NAME + BELL */}
                              <div className="flex justify-between items-center px-3 py-2 border-b border-white/5 bg-[#202020]">
                                <h3 className="font-bold text-white text-sm md:text-base uppercase tracking-wider truncate">
                                  {(item as any).data.clientName}
                                </h3>
                                <button
                                  className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                                  onClick={e => {
                                    e.stopPropagation();
                                    let phone = (item as any).data.clientPhone;
                                    if (!phone) {
                                      const found = clients.find(
                                        c =>
                                          c.name.toLowerCase() ===
                                          (item as any).data.clientName.toLowerCase()
                                      );
                                      if (found && found.phone && found.phone.length > 8)
                                        phone = found.phone;
                                    }
                                    const clean = phone?.replace(/\D/g, '') || '';

                                    const msg = `💈 *Trilha do Corte*\n\nFala *${
                                      (item as any).data.clientName
                                    }*, tudo certo? 👊\nPassando pra lembrar do seu horário hoje:\n\n✂️ *${
                                      (item as any).service.name
                                    }*\n⏰ *${
                                      (item as any).time
                                    }*\n\n📍 *Local:* Trilha do Corte\nConfirmado? ✅`;

                                    const link = clean
                                      ? `https://api.whatsapp.com/send?phone=55${clean}&text=${encodeURIComponent(
                                          msg
                                        )}`
                                      : `https://api.whatsapp.com/send?text=${encodeURIComponent(
                                          msg
                                        )}`;
                                    window.open(link, '_blank');
                                  }}
                                >
                                  <Bell size={12} />
                                </button>
                              </div>

                              {/* BODY: SPLIT LEFT/RIGHT */}
                              <div className="flex flex-1">
                                {/* LEFT: TIME BOX */}
                                <div className="w-[60px] flex flex-col items-center justify-center border-r border-white/5 bg-[#181818]">
                                  <span className="text-white font-black text-lg leading-none">
                                    {(item as any).time.split(':')[0]}
                                  </span>
                                  <span className="text-zinc-500 font-bold text-[10px] uppercase">
                                    {(item as any).time.split(':')[1]}
                                  </span>
                                </div>

                                {/* RIGHT: SERVICE INFO */}
                                <div className="flex-1 flex flex-col">
                                  {/* Service Name */}
                                  <div className="flex-1 px-3 flex items-center border-b border-white/5">
                                    <span className="text-zinc-300 text-xs font-bold uppercase tracking-wide line-clamp-1">
                                      {(item as any).service.name}
                                    </span>
                                  </div>

                                  {/* Footer (Duration + Price) */}
                                  <div className="px-3 py-1.5 flex justify-between items-center bg-[#1D1D1D]">
                                    {/* Duration Pill */}
                                    <div className="flex items-center justify-center border border-white/10 rounded-md px-2 py-0.5 bg-black/20">
                                      <span className="text-[10px] font-bold text-zinc-400">
                                        {(item as any).service.duration || '30'}m
                                      </span>
                                    </div>

                                    {/* Price */}
                                    <span className="text-neon-yellow font-black text-sm">
                                      {(item as any).service.price}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Color Accent Line (Left Edge Overlay) */}
                              <div
                                className={`absolute left-0 top-0 bottom-0 w-1 ${
                                  (item as any).data.status === 'confirmed'
                                    ? 'bg-green-500'
                                    : 'bg-yellow-500'
                                }`}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          // EMPTY SLOT
                          <div
                            className={`w-full h-full flex items-center justify-center group/empty ${
                              isPast
                                ? 'cursor-not-allowed opacity-30 select-none'
                                : 'cursor-pointer'
                            }`}
                            onClick={() => {
                              if (isPast) return; // BLOCK CLICK
                              if (item.type !== 'app') {
                                setEditId(null);
                                setQuickAddSlot({ date: selectedDate, time: item.time });
                                setIsQuickAddOpen(true);
                              }
                            }}
                          >
                            <div
                              className={`w-full h-full border-2 border-dashed rounded-xl flex items-center justify-center transition-all ${
                                isPast
                                  ? 'border-zinc-900'
                                  : 'border-zinc-900 group-hover/empty:border-zinc-800'
                              }`}
                            >
                              {isPast ? (
                                <span className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest">
                                  Encerrado
                                </span>
                              ) : (
                                <Plus
                                  className="text-zinc-800 group-hover/empty:text-zinc-600 transition-colors"
                                  size={24}
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </>
        )}
      </div>

      {/* QUICK ADD MODAL */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-[#111] w-full max-w-sm rounded-2xl border border-gray-800 shadow-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-neon-yellow shadow-[0_0_20px_#EAB308]"></div>

            <div className="flex justify-between items-center mb-8 mt-2">
              <h3 className="text-2xl font-black text-white uppercase italic tracking-wider">
                {editId ? 'Editar' : 'Novo'}
                <br />
                Agendamento
              </h3>
              <button
                onClick={() => setIsQuickAddOpen(false)}
                className="bg-gray-800 p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={20} className="rotate-180" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="bg-[#151515] p-4 rounded-xl border border-gray-800 flex justify-between items-center gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">
                    Data
                  </label>
                  {/* CUSTOM DATE SELECTOR */}
                  <div className="flex items-center justify-between bg-[#0a0a0a] border border-gray-800 rounded-xl p-2">
                    <button
                      onClick={() => {
                        if (quickAddSlot) {
                          const d = new Date(quickAddSlot.date);
                          d.setDate(d.getDate() - 1);
                          setQuickAddSlot({ ...quickAddSlot, date: d });
                        }
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <span className="text-white font-bold text-sm uppercase">
                      {quickAddSlot?.date
                        .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                        .replace('.', '')}
                    </span>

                    <button
                      onClick={() => {
                        if (quickAddSlot) {
                          const d = new Date(quickAddSlot.date);
                          d.setDate(d.getDate() + 1);
                          setQuickAddSlot({ ...quickAddSlot, date: d });
                        }
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="text-right w-32">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                    Horário
                  </label>
                  {/* CUSTOM TIME SELECTOR */}
                  <div className="relative">
                    {/* Trigger Button */}
                    <button
                      onClick={() => setIsTimeListOpen(!isTimeListOpen)}
                      className="w-full bg-transparent text-neon-yellow font-mono font-bold text-2xl text-right focus:outline-none flex items-center justify-end gap-2"
                    >
                      {quickAddSlot?.time || '--:--'}
                      <ChevronLeft
                        size={16}
                        className={`transition-transform duration-300 ${
                          isTimeListOpen ? 'rotate-90' : '-rotate-90'
                        }`}
                      />
                    </button>

                    {/* Dropdown Grid */}
                    {isTimeListOpen && (
                      <div className="absolute top-full right-0 mt-2 bg-[#0a0a0a] border border-gray-700 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.9)] z-50 w-48 max-h-48 overflow-y-auto custom-scrollbar p-1">
                        <div className="grid grid-cols-2 gap-1">
                          {Array.from(
                            {
                              length:
                                (shopSettings.endHour - shopSettings.startHour) *
                                (60 / (shopSettings.slotInterval || 60)),
                            },
                            (_, i) => {
                              const totalMinutes =
                                shopSettings.startHour * 60 + i * (shopSettings.slotInterval || 60);
                              const h = Math.floor(totalMinutes / 60);
                              const m = totalMinutes % 60;
                              const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(
                                2,
                                '0'
                              )}`;
                              return (
                                <button
                                  key={timeStr}
                                  onClick={() => {
                                    if (quickAddSlot)
                                      setQuickAddSlot({ ...quickAddSlot, time: timeStr });
                                    setIsTimeListOpen(false);
                                  }}
                                  className={`px-2 py-2 text-sm font-mono font-bold rounded-lg transition-colors ${
                                    quickAddSlot?.time === timeStr
                                      ? 'bg-neon-yellow text-black'
                                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                                  }`}
                                >
                                  {timeStr}
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 pl-1">
                  Cliente
                </label>
                <input
                  autoFocus
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full bg-[#151515] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-yellow transition-colors font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 pl-1">
                  Serviço
                </label>
                <div className="relative">
                  {/* Trigger Button */}
                  <button
                    onClick={() => setIsServiceListOpen(!isServiceListOpen)}
                    className="w-full bg-[#151515] border border-gray-800 rounded-xl px-4 py-3 text-white text-left font-bold flex items-center justify-between focus:outline-none focus:border-neon-yellow transition-all hover:bg-[#1a1a1a]"
                  >
                    <span className="truncate mr-2">
                      {services.find(s => s.id === selectedService)?.name
                        ? `${services.find(s => s.id === selectedService)?.name} - ${
                            services.find(s => s.id === selectedService)?.price
                          }`
                        : 'Selecione um serviço'}
                    </span>
                    <ChevronLeft
                      className={`text-neon-yellow transition-transform duration-300 ${
                        isServiceListOpen ? 'rotate-90' : '-rotate-90'
                      }`}
                      size={16}
                    />
                  </button>

                  {/* Dropdown List */}
                  {isServiceListOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-gray-700 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.9)] z-50 max-h-48 overflow-y-auto custom-scrollbar">
                      {services.map(s => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setSelectedService(s.id);
                            setIsServiceListOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm font-bold border-b border-white/5 transition-colors flex justify-between items-center group
                            ${
                              selectedService === s.id
                                ? 'bg-neon-yellow/10 text-neon-yellow'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                            }
                          `}
                        >
                          <span>{s.name}</span>
                          <span
                            className={`text-xs opacity-50 ${
                              selectedService === s.id
                                ? 'text-neon-yellow'
                                : 'group-hover:text-white'
                            }`}
                          >
                            {s.price}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSaveAppointment}
                className="w-full py-4 bg-neon-yellow text-black font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all mt-4 flex justify-center items-center gap-2"
              >
                {editId ? 'Salvar Alterações' : 'Confirmar'}{' '}
                <ChevronRight size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {isExportOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-[#111] w-full max-w-sm rounded-2xl border border-gray-800 shadow-2xl p-6 relative overflow-hidden">
            {/* Neon Top Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_20px_#22c55e]"></div>

            <div className="flex justify-between items-center mb-6 mt-2">
              <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Share2 size={24} className="text-green-500" />
                Exportar Agenda
              </h3>
              <button
                onClick={() => setIsExportOpen(false)}
                className="bg-gray-800 p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={20} className="rotate-180" />
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Deseja gerar a lista de agendamentos do dia{' '}
              <strong className="text-white">{selectedDate.toLocaleDateString('pt-BR')}</strong> e
              abrir no WhatsApp?
            </p>

            <button
              onClick={() => {
                handleExportWhatsApp();
                setIsExportOpen(false);
              }}
              className="w-full py-4 bg-green-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all flex justify-center items-center gap-2 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <MessageCircle size={20} fill="currentColor" />
                Abrir no WhatsApp
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
