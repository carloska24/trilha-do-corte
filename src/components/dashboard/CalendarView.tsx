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
  Bot,
  Sparkles,
  X,
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useOutletContext } from 'react-router-dom';
import { useVoiceCommand } from '../../hooks/useVoiceCommand';
import { ConfirmModal } from '../ui/ConfirmModal';

interface DashboardOutletContext {
  setSelectedClient: (client: Client) => void;
}

export const CalendarView: React.FC = () => {
  const { appointments, services, updateAppointments, clients, shopSettings, updateShopSettings } =
    useData();
  const { setSelectedClient } = useOutletContext<DashboardOutletContext>();

  const onNewAppointment = (data: BookingData) => {
    // Basic implementation for adding appointment - in a real app this would generate ID etc.
    // For now we assume the parent usually handled it.
    // Let's create a partial appointment object compatible with the type
    const newApp: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      status: 'pending', // Default status
      clientName: data.name,
      price: parseFloat(
        services
          .find(s => s.id === data.serviceId)
          ?.price.replace('R$', '')
          .replace(',', '.') || '0'
      ),
      photoUrl: undefined, // Placeholder
    };
    updateAppointments([...appointments, newApp]);
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
        img: undefined,
        status: 'new',
        notes: 'Agendamento rápido.',
      } as Client);
    setSelectedClient(found);
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [longPressedId, setLongPressedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'config'>('daily');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Quick Add State with Context
  const [quickAddSlot, setQuickAddSlot] = useState<{ date: Date; time: string } | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

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

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

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

    if (editId) {
      // UPDATE EXISTING
      const updated = appointments.map(app =>
        app.id === editId
          ? {
              ...app,
              clientName,
              serviceId: selectedService,
              date: quickAddSlot.date.toISOString(),
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
          date: quickAddSlot.date.toISOString(),
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
        date: quickAddSlot.date.toISOString(),
        time: quickAddSlot.time,
      };
      onNewAppointment(bookingData);
      showToast('Agendamento criado!');
    }

    setClientName('');
    setIsQuickAddOpen(false);
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(a => {
      const d = new Date(a.date);
      const dStr = d.toISOString().split('T')[0];
      const targetStr = date.toISOString().split('T')[0];
      return dStr === targetStr && a.status !== 'cancelled';
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

    // 📅 = %F0%9F%93%85 | 💈 = %F0%9F%92%88 | ✂️ = %E2%9C%82%EF%B8%8F | ✅ = %E2%9C%85 | ⏳ = %E2%8F%B3

    let msg = `%F0%9F%93%85%20*AGENDA%20-%20${encodeURIComponent(dateStr)}*%0A%0A`;

    dailyApps.forEach(app => {
      const service = getServiceDetails(app.serviceId);
      // Pre-encoded icons to prevent diamong-question-marks issue
      const icon = service.category === 'Barba' ? '%F0%9F%92%88' : '%E2%9C%82%EF%B8%8F';
      const statusIcon = app.status === 'confirmed' ? '%E2%9C%85' : '%E2%8F%B3';

      const clientName = encodeURIComponent((app.clientName || 'Cliente').split(' ')[0]);
      const serviceName = encodeURIComponent(service.name);

      msg += `${app.time}%20-%20${clientName}%20${icon}%20${serviceName}%20${statusIcon}%0A`;
    });

    msg += `%0A_%20Trilha%20do%20Corte%20_`;

    window.open(`https://wa.me/?text=${msg}`, '_blank');
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
  const getServiceDetails = (id: string) => {
    const s = services.find(serv => serv.id === id) || ALL_SERVICES.find(serv => serv.id === id);
    return s || { name: 'Serviço', category: 'Geral', icon: 'scissors', price: 'R$-' };
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
          <button
            onClick={() => {
              const now = new Date();
              const nextHour = now.getHours() + 1;
              const time = `${String(nextHour).padStart(2, '0')}:00`;
              setQuickAddSlot({ date: selectedDate, time });
              setIsQuickAddOpen(true);
            }}
            className="w-10 h-10 md:w-12 md:h-12 bg-neon-yellow rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform shadow-[0_0_20px_rgba(234,179,8,0.4)]"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-6 md:gap-8 overflow-x-auto custom-scrollbar pb-1">
          <button
            onClick={() => setActiveTab('daily')}
            className={`pb-3 border-b-2 text-sm md:text-base font-bold tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'daily'
                ? 'border-neon-yellow text-neon-yellow'
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            DIÁRIO
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`pb-3 border-b-2 text-sm md:text-base font-bold tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'monthly'
                ? 'border-neon-yellow text-neon-yellow'
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            CALENDÁRIO
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 border-b-2 text-sm md:text-base font-bold tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-neon-yellow text-neon-yellow'
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            AJUSTES
          </button>

          {/* WhatsApp Export Button (Right Aligned or Inline) */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="ml-auto pb-3 text-green-500 hover:text-green-400 transition-colors flex items-center gap-2 font-bold tracking-widest text-xs md:text-sm uppercase whitespace-nowrap"
          >
            <Share2 size={18} />
            <span className="hidden md:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* CONTENT BODY */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {activeTab === 'config' ? (
          // --- SETTINGS VIEW (REFINED) ---
          <div className="p-6 max-w-lg mx-auto animate-fade-in-up">
            {/* Main Card */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative">
              {/* Subtle Gradient Glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-yellow to-transparent opacity-50"></div>

              <div className="p-6 border-b border-white/5 bg-[#1E1E1E] flex items-center justify-between">
                <div>
                  <h3 className="text-white font-black uppercase tracking-widest flex items-center gap-3 text-lg">
                    <Clock size={20} className="text-neon-yellow" />
                    Configuração
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider pl-8">
                    Defina o horário de funcionamento
                  </p>
                </div>

                {/* Voice Command Button */}
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
                    w-12 h-12 rounded-full flex items-center justify-center transition-all relative overflow-hidden group
                    ${
                      isListening
                        ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse'
                        : 'bg-[#111] text-neon-yellow border border-neon-yellow/30 hover:bg-neon-yellow hover:text-black shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                    }
                  `}
                >
                  {isListening ? (
                    <>
                      <div className="absolute inset-0 bg-red-500 animate-ping opacity-20"></div>
                      <MicOff size={20} />
                    </>
                  ) : (
                    <Mic size={20} />
                  )}
                </button>
              </div>

              <div className="p-2">
                {/* Start Hour */}
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors group mb-2">
                  <div>
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest block mb-1">
                      Abertura
                    </span>
                    <span className="text-white font-black text-2xl group-hover:text-neon-yellow transition-colors">
                      {String(shopSettings.startHour).padStart(2, '0')}:00
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-lg border border-white/5">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        const newStart = Math.max(0, shopSettings.startHour - 1);
                        updateShopSettings({ ...shopSettings, startHour: newStart });
                        showToast('Abertura salva!');
                      }}
                      className="w-10 h-10 rounded-md bg-[#111] hover:bg-neon-yellow hover:text-black border border-white/10 flex items-center justify-center transition-all active:scale-95 text-gray-400 hover:text-black"
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
                      className="w-10 h-10 rounded-md bg-[#111] hover:bg-neon-yellow hover:text-black border border-white/10 flex items-center justify-center transition-all active:scale-95 text-gray-400 hover:text-black"
                    >
                      <Plus size={18} strokeWidth={3} />
                    </button>
                  </div>
                </div>

                {/* End Hour */}
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors group">
                  <div>
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest block mb-1">
                      Fechamento
                    </span>
                    <span className="text-white font-black text-2xl group-hover:text-neon-yellow transition-colors">
                      {String(shopSettings.endHour).padStart(2, '0')}:00
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-lg border border-white/5">
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
                      className="w-10 h-10 rounded-md bg-[#111] hover:bg-neon-yellow hover:text-black border border-white/10 flex items-center justify-center transition-all active:scale-95 text-gray-400 hover:text-black"
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
                      className="w-10 h-10 rounded-md bg-[#111] hover:bg-neon-yellow hover:text-black border border-white/10 flex items-center justify-center transition-all active:scale-95 text-gray-400 hover:text-black"
                    >
                      <Plus size={18} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Interval Section */}
              <div className="p-6 bg-[#151515] border-t border-white/5">
                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest block mb-4 flex items-center gap-2">
                  <Clock size={12} /> Intervalo entre cortes
                </span>
                <div className="grid grid-cols-4 gap-3">
                  {[60, 30, 20, 15].map(min => (
                    <button
                      key={min}
                      onClick={e => {
                        e.stopPropagation();
                        updateShopSettings({ ...shopSettings, slotInterval: min });
                        showToast(`${min}min salvo!`);
                      }}
                      className={`
                                        flex flex-col items-center justify-center py-3 rounded-xl border transition-all active:scale-95 group/btn
                                        ${
                                          (shopSettings.slotInterval || 60) === min
                                            ? 'bg-neon-yellow border-neon-yellow text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                                            : 'bg-[#111] border-gray-800 text-gray-500 hover:border-gray-600 hover:bg-[#1A1A1A] hover:text-white'
                                        }
                                    `}
                    >
                      <span className="text-lg font-black">{min}</span>
                      <span
                        className={`text-[8px] font-bold uppercase ${
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

              {/* AI COMMAND ZONE */}
              <div className="p-6 bg-[#151515] border-t border-white/5">
                <button
                  onClick={async () => {
                    if (
                      window.confirm(
                        '🤖 IA SYSTEM: \n\nAtenção, operador. O protocolo de reset irá WIPE em toda a base de dados temporal (agenda). \n\nConfirmar execução?'
                      )
                    ) {
                      const success = await import('../../services/api').then(m =>
                        m.api.clearAppointments()
                      );
                      if (success) {
                        alert('✅ Execução concluída. Sistema reiniciando...');
                        window.location.reload();
                      } else {
                        alert('❌ Erro no protocolo de comunicação.');
                      }
                    }
                  }}
                  className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-4 flex items-center justify-center gap-3 rounded-xl shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all transform hover:scale-[1.02] group mt-4 border border-white/10 relative overflow-hidden"
                >
                  {/* Animated Glare */}
                  <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>

                  <Bot
                    size={24}
                    className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                  />
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] font-bold text-purple-200 uppercase tracking-[0.2em] mb-0.5">
                      Protocolo de Limpeza
                    </span>
                    <span className="text-sm font-black uppercase tracking-widest drop-shadow-md">
                      AI SYSTEM RESET
                    </span>
                  </div>
                  <Sparkles size={16} className="text-purple-300 animate-pulse ml-1" />
                </button>
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
                onClick={() => changeDate(-1)}
                className="text-gray-400 hover:text-white transition-colors bg-[#0a0a0a] p-2 rounded-lg border border-gray-800"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="text-center">
                <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wider flex items-center justify-center gap-2 md:gap-3">
                  <CalendarIcon size={16} className="text-neon-yellow" />
                  {selectedDate
                    .toLocaleDateString('pt-BR', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                    })
                    .toUpperCase()}
                </h2>
                {selectedDate.toDateString() === new Date().toDateString() && (
                  <span className="text-[9px] text-green-500 font-bold uppercase tracking-widest block -mt-1">
                    Hoje
                  </span>
                )}
              </div>
              <button
                onClick={() => changeDate(1)}
                className="text-gray-400 hover:text-white transition-colors bg-[#0a0a0a] p-2 rounded-lg border border-gray-800"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Timeline */}
            <div className="pb-24 pt-2 relative">
              {getTimeSlots().map(hour => {
                const hourStr = String(hour).padStart(2, '0');
                const apps = getAppointmentsForDate(selectedDate).filter(a =>
                  a.time.startsWith(hourStr)
                );

                // Check if this hour is in the past for today
                const isPast =
                  selectedDate.toDateString() === new Date().toDateString() &&
                  hour < new Date().getHours();

                return (
                  <div
                    key={hour}
                    id={`hour-${hour}`}
                    className={`flex min-h-[110px] border-b border-gray-800/30 group relative transition-colors duration-200 ${
                      isPast ? 'opacity-60 bg-black/40' : ''
                    }`}
                    onDragOver={e => {
                      e.preventDefault(); // Allow Drop
                      e.currentTarget.classList.add('bg-white/5');
                      e.currentTarget.classList.add('border-dashed');
                      e.currentTarget.classList.add('border-neon-yellow/50');
                    }}
                    onDragLeave={e => {
                      e.currentTarget.classList.remove('bg-white/5');
                      e.currentTarget.classList.remove('border-dashed');
                      e.currentTarget.classList.remove('border-neon-yellow/50');
                    }}
                    onDrop={e => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('bg-white/5');
                      e.currentTarget.classList.remove('border-dashed');
                      e.currentTarget.classList.remove('border-neon-yellow/50');

                      const appId = draggedAppId;
                      if (appId) {
                        const newTime = `${String(hour).padStart(2, '0')}:00`;
                        handleMoveAppointment(appId, newTime);
                        setDraggedAppId(null);
                      }
                    }}
                  >
                    {/* Time Column */}
                    <div className="w-16 md:w-20 py-4 pl-2 md:pl-4 text-xs md:text-sm font-mono font-bold text-gray-500 flex flex-col items-start border-r border-gray-800/50 bg-[#111]">
                      <span>{hourStr}:00</span>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 p-2 md:p-3 bg-transparent relative pointer-events-none">
                      <div className="pointer-events-auto contents">
                        {apps.length > 0 ? (
                          apps.map(app => {
                            const service = getServiceDetails(app.serviceId);
                            // Mock Payment Status logic (random for display if not real)
                            const isPaid = app.status === 'confirmed';

                            return (
                              <div
                                key={app.id}
                                draggable
                                onDragStart={() => {
                                  setDraggedAppId(app.id);
                                  setLongPressedId(null);
                                }}
                                onDragEnd={() => setDraggedAppId(null)}
                                className={`mb-3 last:mb-0 relative group/card-wrapper select-none touch-none
                                ${draggedAppId === app.id ? 'opacity-40 scale-95 grayscale' : ''}
                                transition-all duration-200
                              `}
                                onContextMenu={e => e.preventDefault()} // Disable native context menu
                              >
                                {longPressedId === app.id ? (
                                  /* --- ACTION OVERLAY (Revealed on Long Press) --- */
                                  <div
                                    draggable
                                    onDragStart={e => {
                                      // Allow dragging from the overlay
                                      e.stopPropagation();
                                      setDraggedAppId(app.id);
                                      setLongPressedId(null);
                                    }}
                                    onDragEnd={() => setDraggedAppId(null)}
                                    className="absolute inset-0 z-20 bg-black/90 backdrop-blur-sm rounded-2xl flex items-center justify-around p-2 animate-[fadeIn_0.2s_ease-out] border border-gray-800 cursor-grab active:cursor-grabbing"
                                  >
                                    <button
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleCancelAppointment(app.id, e);
                                        setLongPressedId(null);
                                      }}
                                      className="flex flex-col items-center justify-center gap-1 text-red-500 hover:text-red-400 active:scale-95 transition-all"
                                    >
                                      <div className="w-10 h-10 rounded-full bg-red-900/20 flex items-center justify-center border border-red-900/50 pointer-events-none">
                                        <Trash2 size={20} />
                                      </div>
                                      <span className="text-[9px] font-black uppercase tracking-widest pointer-events-none">
                                        Cancelar
                                      </span>
                                    </button>

                                    <div className="w-[1px] h-10 bg-gray-800"></div>

                                    <button
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleEditAppointment(app, e);
                                        setLongPressedId(null);
                                      }}
                                      className="flex flex-col items-center justify-center gap-1 text-blue-500 hover:text-blue-400 active:scale-95 transition-all"
                                    >
                                      <div className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center border border-blue-900/50 pointer-events-none">
                                        <Edit size={20} />
                                      </div>
                                      <span className="text-[9px] font-black uppercase tracking-widest pointer-events-none">
                                        Editar
                                      </span>
                                    </button>

                                    {/* Close Overlay Button */}
                                    <button
                                      onClick={e => {
                                        e.stopPropagation();
                                        setLongPressedId(null);
                                      }}
                                      className="absolute top-1 right-2 text-gray-600 hover:text-white"
                                    >
                                      <X size={14} />
                                    </button>

                                    {/* Drag Hint inside Overlay */}
                                    <div className="absolute bottom-1 w-full text-center pointer-events-none">
                                      <div className="w-8 h-1 bg-gray-700 rounded-full mx-auto opacity-50"></div>
                                    </div>
                                  </div>
                                ) : null}

                                {/* --- MAIN CARD --- */}
                                <div
                                  className={`w-full bg-[#151515] border transition-all duration-300 shadow-xl relative rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing
                                    ${
                                      longPressedId === app.id
                                        ? 'opacity-0'
                                        : 'hover:border-gray-600 border-gray-800'
                                    }
                                  `}
                                  // Long Press Handlers
                                  onPointerDown={() => {
                                    if (draggedAppId) return;
                                    const timer = setTimeout(() => {
                                      setLongPressedId(app.id);
                                      if (navigator.vibrate) navigator.vibrate(50);
                                    }, 600);
                                    (window as any)._longPressTimer = timer;
                                  }}
                                  onPointerUp={() => {
                                    if ((window as any)._longPressTimer)
                                      clearTimeout((window as any)._longPressTimer);
                                  }}
                                  onPointerLeave={() => {
                                    if ((window as any)._longPressTimer)
                                      clearTimeout((window as any)._longPressTimer);
                                  }}
                                  onPointerMove={() => {
                                    if ((window as any)._longPressTimer)
                                      clearTimeout((window as any)._longPressTimer);
                                  }}
                                  onClick={e => {
                                    if (!longPressedId) onSelectClient(app.clientName);
                                  }}
                                >
                                  {/* Left Status Bar with Glow */}
                                  <div
                                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                                      app.status === 'confirmed'
                                        ? 'bg-neon-yellow shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                                        : app.status === 'in_progress'
                                        ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                                        : 'bg-zinc-700'
                                    }`}
                                  ></div>

                                  <div className="flex flex-row justify-between items-center p-4 gap-3">
                                    <div className="flex-1 min-w-0 pl-3">
                                      {/* Client Name + Time */}
                                      <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-black text-white text-lg md:text-xl truncate leading-none tracking-wide uppercase drop-shadow-md">
                                          {app.clientName}
                                        </h4>
                                        <span className="text-[10px] font-black text-black bg-white/90 px-1.5 py-0.5 rounded-[4px] border border-gray-400">
                                          {app.time}
                                        </span>
                                      </div>

                                      {/* Service Ticker & Price */}
                                      <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex items-center gap-1.5 text-neon-yellow text-[10px] md:text-xs font-black uppercase tracking-widest bg-yellow-900/10 px-2 py-1 rounded border border-neon-yellow/20">
                                          {service.category === 'Barba' ? (
                                            <Zap
                                              size={10}
                                              className="text-neon-yellow fill-neon-yellow"
                                            />
                                          ) : (
                                            <Scissors
                                              size={10}
                                              className="text-neon-yellow fill-neon-yellow"
                                            />
                                          )}
                                          <span className="truncate max-w-[120px]">
                                            {service.name}
                                          </span>
                                        </div>
                                        <div className="text-[10px] font-mono text-green-400 font-bold bg-green-900/10 px-2 py-1 rounded border border-green-500/20">
                                          {service.price}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right Side Info: Payment & Status */}
                                    <div className="text-right flex flex-col items-end gap-2 shrink-0">
                                      {/* Payment Badge */}
                                      <div
                                        className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded border ${
                                          isPaid
                                            ? 'text-green-400 bg-green-950/30 border-green-500/30'
                                            : 'text-zinc-500 bg-zinc-900/50 border-zinc-800'
                                        }`}
                                      >
                                        <Wallet size={10} />
                                        {isPaid ? 'PAGO' : 'PEND.'}
                                      </div>

                                      {/* Status Text */}
                                      <div
                                        className={`px-2 py-1 rounded-[4px] text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                                          app.status === 'confirmed'
                                            ? 'bg-neon-yellow text-black border-neon-yellow'
                                            : 'text-zinc-400 border-zinc-700 bg-zinc-800'
                                        }`}
                                      >
                                        {app.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Press Hint (Visual cue) */}
                                  <div className="absolute right-0 bottom-0 p-1 opacity-20 pointer-events-none">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          // Empty Slot Interaction (Ghost Slot)
                          <div
                            onClick={() => handleSlotClick(hour)}
                            className="w-full h-full flex items-center justify-center rounded-xl border border-dashed border-gray-800/50 hover:border-gray-600 hover:bg-[#151515] transition-all cursor-pointer group/empty opacity-50 hover:opacity-100"
                          >
                            <div className="flex items-center gap-2 text-gray-700 group-hover/empty:text-gray-400 transition-colors">
                              <Plus size={18} />
                              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest hidden group-hover/empty:inline-block">
                                Disponível
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={quickAddSlot ? getLocalISODate(quickAddSlot.date) : ''}
                    onChange={e => {
                      if (e.target.valueAsDate && quickAddSlot) {
                        // Correct date timezone issue by using valueAsDate or manual parsing if needed,
                        // but simple string split is safer for local date input
                        const [y, m, d] = e.target.value.split('-').map(Number);
                        const newDate = new Date(y, m - 1, d);
                        setQuickAddSlot({ ...quickAddSlot, date: newDate });
                      }
                    }}
                    className="bg-transparent text-white font-bold w-full focus:outline-none focus:text-neon-yellow transition-colors"
                  />
                </div>
                <div className="text-right w-24">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={quickAddSlot?.time || ''}
                    onChange={e => {
                      if (quickAddSlot) setQuickAddSlot({ ...quickAddSlot, time: e.target.value });
                    }}
                    className="bg-transparent text-neon-yellow font-mono font-bold text-lg text-right w-full focus:outline-none"
                  />
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
                  <select
                    value={selectedService}
                    onChange={e => setSelectedService(e.target.value)}
                    className="w-full bg-[#151515] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-yellow transition-colors appearance-none font-bold"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} - {s.price}
                      </option>
                    ))}
                  </select>
                  <ChevronLeft
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 -rotate-90 pointer-events-none"
                    size={16}
                  />
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
