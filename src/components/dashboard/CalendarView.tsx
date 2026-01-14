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

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleCancelAppointment = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal

    setConfirmModal({
      isOpen: true,
      title: 'Cancelar Agendamento',
      message: 'Deseja realmente cancelar este agendamento?',
      onConfirm: async () => {
        const updated = appointments.map(a =>
          a.id === id ? { ...a, status: 'cancelled' as const } : a
        );
        updateAppointments(updated);

        // Persist to API
        await api.updateAppointment(id, { status: 'cancelled' });
        showToast('Agendamento cancelado.');
      },
    });
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
    <div className="flex flex-col h-full bg-[var(--bg-primary)] text-[var(--text-primary)] relative transition-colors duration-300">
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
        appointmentCount={getAppointmentsForDate(selectedDate).length}
        totalRevenue={getAppointmentsForDate(selectedDate).reduce(
          (sum, a) => sum + (a.price || 0),
          0
        )}
        completedRevenue={getAppointmentsForDate(selectedDate)
          .filter(a => a.status === 'completed')
          .reduce((sum, a) => sum + (a.price || 0), 0)}
        selectedDate={selectedDate}
      />

      {/* CONTENT BODY */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {activeTab === 'config' ? (
          // --- SETTINGS VIEW - PREMIUM REDESIGN ---
          <div className="p-4 md:p-6 max-w-lg mx-auto pb-24">
            {/* Hero Header */}
            <div className="relative mb-6 p-5 rounded-2xl bg-linear-to-br from-zinc-800/80 to-zinc-900 border border-zinc-700/50 overflow-hidden">
              {/* Glow Effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl" />

              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                  <Clock size={28} className="text-yellow-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wide">
                    Configurações
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">
                    Personalize sua agenda e horários
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 1: HOURS - Card Style */}
            <div className="mb-4 p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                  <Clock size={16} className="text-green-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Horário de Funcionamento
                  </h3>
                  <p className="text-[10px] text-zinc-600">
                    Defina quando a barbearia abre e fecha
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Start Hour - Slider Style */}
                <div className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Abertura
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          const newStart = Math.max(0, shopSettings.startHour - 1);
                          updateShopSettings({ ...shopSettings, startHour: newStart });
                          showToast('Abertura salva!');
                        }}
                        className="w-9 h-9 rounded-lg bg-zinc-700/50 hover:bg-zinc-600 border border-zinc-600/50 flex items-center justify-center transition-all active:scale-95 text-zinc-400 hover:text-white"
                      >
                        <Minus size={16} strokeWidth={3} />
                      </button>
                      <span className="w-16 text-center text-xl font-black text-white">
                        {String(shopSettings.startHour).padStart(2, '0')}:00
                      </span>
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
                        className="w-9 h-9 rounded-lg bg-zinc-700/50 hover:bg-zinc-600 border border-zinc-600/50 flex items-center justify-center transition-all active:scale-95 text-zinc-400 hover:text-white"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* End Hour - Slider Style */}
                <div className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Fechamento
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
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
                        className="w-9 h-9 rounded-lg bg-zinc-700/50 hover:bg-zinc-600 border border-zinc-600/50 flex items-center justify-center transition-all active:scale-95 text-zinc-400 hover:text-white"
                      >
                        <Minus size={16} strokeWidth={3} />
                      </button>
                      <span className="w-16 text-center text-xl font-black text-white">
                        {String(shopSettings.endHour).padStart(2, '0')}:00
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          const newEnd = Math.min(23, shopSettings.endHour + 1);
                          updateShopSettings({ ...shopSettings, endHour: newEnd });
                          showToast('Fechamento salvo!');
                        }}
                        className="w-9 h-9 rounded-lg bg-zinc-700/50 hover:bg-zinc-600 border border-zinc-600/50 flex items-center justify-center transition-all active:scale-95 text-zinc-400 hover:text-white"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: INTERVAL - Card Style */}
            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                  <Scissors size={16} className="text-purple-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Intervalo entre Cortes
                  </h3>
                  <p className="text-[10px] text-zinc-600">Duração padrão de cada atendimento</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[60, 30, 20, 15].map(min => {
                  const isActive = (shopSettings.slotInterval || 60) === min;
                  return (
                    <button
                      key={min}
                      onClick={e => {
                        e.stopPropagation();
                        updateShopSettings({ ...shopSettings, slotInterval: min });
                        showToast(`${min}min salvo!`);
                      }}
                      className={`relative flex flex-col items-center justify-center py-4 rounded-xl border transition-all active:scale-95 group/btn overflow-hidden ${
                        isActive
                          ? 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                          : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent" />
                      )}
                      <span className="text-xl font-black relative z-10">{min}</span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-widest relative z-10 ${
                          isActive ? 'text-black/60' : 'text-zinc-600'
                        }`}
                      >
                        min
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Visual indicator of selected duration */}
              <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
                <div className="flex-1">
                  <div className="h-1.5 rounded-full bg-zinc-700 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${((shopSettings.slotInterval || 60) / 60) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-bold text-zinc-500">
                  {shopSettings.slotInterval || 60} min por cliente
                </span>
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
            {/* Daily Nav - Compact Premium */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800/50 sticky top-0 z-20">
              <button
                onClick={e => {
                  e.stopPropagation();
                  changeDate(-1);
                }}
                className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors bg-zinc-800/50 hover:bg-zinc-700 rounded-xl border border-zinc-700/50"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white uppercase tracking-wide">
                  {selectedDate
                    .toLocaleDateString('pt-BR', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                    })
                    .toUpperCase()
                    .replace('.', '')}
                </span>
                {selectedDate.toDateString() === new Date().toDateString() && (
                  <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/30">
                    HOJE
                  </span>
                )}
              </div>

              <button
                onClick={e => {
                  e.stopPropagation();
                  changeDate(1);
                }}
                className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors bg-zinc-800/50 hover:bg-zinc-700 rounded-xl border border-zinc-700/50"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[var(--bg-card)] w-full max-w-sm rounded-2xl border border-[var(--border-color)] shadow-2xl p-6 relative overflow-hidden transition-colors">
            {/* Neon Top Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_20px_#22c55e]"></div>

            <div className="flex justify-between items-center mb-6 mt-2">
              <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                <Share2 size={24} className="text-green-500" />
                Exportar Agenda
              </h3>
              <button
                onClick={() => setIsExportOpen(false)}
                className="bg-[var(--bg-secondary)] p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ChevronLeft size={20} className="rotate-180" />
              </button>
            </div>

            <p className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">
              Deseja gerar a lista de agendamentos do dia{' '}
              <strong className="text-[var(--text-primary)]">
                {selectedDate.toLocaleDateString('pt-BR')}
              </strong>{' '}
              e abrir no WhatsApp?
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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDanger={true}
      />
    </div>
  );
};
