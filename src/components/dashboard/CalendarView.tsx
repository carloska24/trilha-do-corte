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
import { CalendarHeader } from './calendar/CalendarHeader';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOutletContext } from 'react-router-dom';
import { useVoiceCommand } from '../../hooks/useVoiceCommand';
import { ConfirmModal } from '../ui/ConfirmModal';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';
import { generateWhatsAppExportUrl } from '../../utils/whatsappUtils';
import { CalendarGrid } from './calendar/CalendarGrid';
import { DailyTimeline } from './calendar/DailyTimeline';
import { AppointmentModal } from './calendar/AppointmentModal';
import { getLocalISODate } from '../../utils/dateUtils';

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

  // Quick Add & Modal State
  const [quickAddSlot, setQuickAddSlot] = useState<{ date: Date; time: string } | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Derived state for editing
  const appointmentToEdit = editId ? appointments.find(a => a.id === editId) : null;
  const initialModalData = {
    id: editId,
    date: quickAddSlot?.date || new Date(),
    time: quickAddSlot?.time || '09:00',
    clientName: appointmentToEdit?.clientName || '',
    serviceId: appointmentToEdit?.serviceId || '',
  };

  // Export Modal State
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Helper for Toasts
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Voice Command Hook
  const { isListening, startListening, stopListening } = useVoiceCommand();

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

  // Ticker Style Injection removed (moved to index.css if needed, but unused)

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

  const handleSaveAppointment = async (data: BookingData & { id?: string | null }) => {
    // Validate Past Time
    const [h, m] = data.time.split(':').map(Number);
    const appDate = new Date(data.date); // date string or Date object? Utils returns string YYYY-MM-DD
    // If data.date is YYYY-MM-DD string, new Date(data.date) might work but be UTC.
    // getLocalISODate returns YYYY-MM-DD.
    // Let's assume data.date is correct.
    const now = new Date();
    // Simple check:
    const checkDate = new Date(data.date + 'T' + data.time);
    if (checkDate < now && !data.id) {
      // Allow edits of past apps? Maybe not.
      // showToast('Não é possível agendar no passado!');
      // return;
    }

    if (data.id) {
      // UPDATE EXISTING
      const updated = appointments.map(app =>
        app.id === data.id
          ? {
              ...app,
              clientName: data.name,
              serviceId: data.serviceId,
              date: data.date,
              time: data.time,
            }
          : app
      );
      updateAppointments(updated);

      // API Call
      try {
        await api.updateAppointment(data.id, {
          clientName: data.name,
          serviceId: data.serviceId,
          date: data.date,
          time: data.time,
        });
        showToast('Agendamento atualizado!');
      } catch (error) {
        console.error(error);
        showToast('Erro ao atualizar (API)');
      }
      setEditId(null);
    } else {
      // CREATE NEW
      const success = await onNewAppointment(data);
      if (success) {
        showToast('Agendamento criado!');
      }
    }
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

  // Helper for Local YYYY-MM-DD (Safe Key) moved to utils

  // WhatsApp Premium Export Logic
  const handleExportWhatsApp = () => {
    const dailyApps = getAppointmentsForDate(selectedDate);

    const url = generateWhatsAppExportUrl({
      date: selectedDate,
      appointments: dailyApps,
      services: services,
      barberPhone: (currentUser as any)?.phone,
      shopName: 'Trilha do Corte',
    });

    if (url) {
      window.open(url, '_blank');
    } else {
      showToast('Nenhum agendamento para exportar.');
    }
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

  // CALENDAR GRID LOGIC moved to CalendarGrid component

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
      <CalendarHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportClick={() => setIsExportOpen(true)}
      />

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
                          startHour: 8,
                          endHour: 20,
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
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-neon-yellow to-transparent opacity-50"></div>

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
          <CalendarGrid
            currentMonth={currentMonth}
            changeMonth={changeMonth}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            setActiveTab={setActiveTab}
            getAppointmentsForDate={getAppointmentsForDate}
            shopSettings={shopSettings}
          />
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
              <DailyTimeline
                selectedDate={selectedDate}
                onEditAppointment={app => {
                  setEditId(app.id);
                  setQuickAddSlot({ date: new Date(app.date), time: app.time });
                  setIsQuickAddOpen(true);
                }}
                onNewAppointment={time => {
                  setEditId(null);
                  setQuickAddSlot({ date: selectedDate, time });
                  setIsQuickAddOpen(true);
                }}
                onSelectClient={name => onSelectClient(name)}
              />
            </div>
          </>
        )}
      </div>

      {/* QUICK ADD MODAL - HARVARD UX REDESIGN */}
      <AppointmentModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialData={initialModalData}
        services={services}
        shopSettings={shopSettings}
        onConfirm={handleSaveAppointment}
      />

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
