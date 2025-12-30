import React, { useState, useEffect } from 'react';
import { Appointment, BookingData, Service, Client } from '../../types';
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
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useOutletContext } from 'react-router-dom';

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
      clients.find(c => c.name.toLowerCase() === clientName.toLowerCase()) ||
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
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'config'>('daily');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Quick Add State with Context
  const [quickAddSlot, setQuickAddSlot] = useState<{ date: Date; time: string } | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Helper for Toasts (Local implementation since CalendarView doesn't have the full toast system of Settings yet, or we can use a simple alert/log for now, user asked for toast feedback in settingsView, duplicating minimal toast here or omitting if not strictly required, but let's add a simple one)
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

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
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style); // Safe cleanup
    };
  }, []);

  const handleSaveAppointment = () => {
    if (!clientName.trim() || !quickAddSlot || !selectedService) return;

    const bookingData = {
      name: clientName,
      phone: '',
      serviceId: selectedService,
      date: quickAddSlot.date.toISOString(),
      time: quickAddSlot.time,
    };

    onNewAppointment(bookingData);
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
    const time = `${String(hour).padStart(2, '0')}:00`;
    setQuickAddSlot({ date: selectedDate, time });
    setIsQuickAddOpen(true);
  };

  const getTimeSlots = () =>
    Array.from(
      { length: shopSettings.endHour - shopSettings.startHour },
      (_, i) => i + shopSettings.startHour
    );

  // Helper to get service details
  const getServiceDetails = (id: string) => {
    const s = services.find(serv => serv.id === id);
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

            return (
              <div
                key={day.toISOString()}
                onClick={() => {
                  setSelectedDate(day);
                  setActiveTab('daily');
                }}
                className={`
                  aspect-square rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 group relative
                  ${
                    isSelected
                      ? 'bg-neon-yellow border-neon-yellow text-black'
                      : 'bg-[#1a1a1a] border-gray-800 text-white hover:border-gray-600'
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

              <div className="p-6 border-b border-white/5 bg-[#1E1E1E]">
                <h3 className="text-white font-black uppercase tracking-widest flex items-center gap-3 text-lg">
                  <Clock size={20} className="text-neon-yellow" />
                  Configuração
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider pl-8">
                  Defina o horário de funcionamento
                </p>
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
                    className={`flex min-h-[110px] border-b border-gray-800/30 group ${
                      isPast ? 'opacity-60 bg-black/40' : ''
                    }`}
                  >
                    {/* Time Column */}
                    <div className="w-16 md:w-20 py-4 pl-2 md:pl-4 text-xs md:text-sm font-mono font-bold text-gray-500 flex flex-col items-start border-r border-gray-800/50 bg-[#111]">
                      <span>{hourStr}:00</span>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 p-2 md:p-3 bg-[#111] relative">
                      {apps.length > 0 ? (
                        apps.map(app => {
                          const service = getServiceDetails(app.serviceId);
                          // Mock Payment Status logic (random for display if not real)
                          const isPaid = app.status === 'confirmed';

                          return (
                            <div
                              key={app.id}
                              onClick={() => onSelectClient(app.clientName)}
                              className="mb-3 last:mb-0 relative overflow-hidden rounded-xl border border-gray-800 bg-[#1A1A1A] hover:border-neon-yellow transition-all duration-300 cursor-pointer group/card shadow-lg hover:-translate-y-1 block"
                            >
                              {/* Left Status Bar */}
                              <div
                                className={`absolute left-0 top-0 bottom-0 w-1 ${
                                  app.status === 'confirmed'
                                    ? 'bg-neon-yellow'
                                    : app.status === 'in_progress'
                                    ? 'bg-blue-500'
                                    : 'bg-gray-600'
                                }`}
                              ></div>

                              <div className="flex flex-row justify-between items-center p-3 gap-2">
                                <div className="flex-1 min-w-0 pl-2">
                                  {/* Client Name + Time */}
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-black text-white text-base md:text-lg truncate leading-tight">
                                      {app.clientName}
                                    </h4>
                                    <span className="text-[10px] font-mono text-gray-500 bg-black px-1 rounded border border-gray-800">
                                      {app.time}
                                    </span>
                                  </div>

                                  {/* Service Ticker & Price */}
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <div className="flex items-center gap-2 text-gray-300 text-[10px] md:text-xs font-bold uppercase tracking-wider bg-black/40 px-2 py-1 rounded border border-gray-800">
                                      {service.category === 'Barba' ? (
                                        <Zap size={10} className="text-neon-yellow" />
                                      ) : (
                                        <Scissors size={10} className="text-neon-yellow" />
                                      )}
                                      <span className="truncate max-w-[100px]">{service.name}</span>
                                    </div>
                                    <div className="text-[10px] font-mono text-green-400 font-bold bg-green-950/30 px-1.5 py-0.5 rounded border border-green-900/50">
                                      {service.price}
                                    </div>
                                  </div>
                                </div>

                                {/* Right Side Info: Payment & Status */}
                                <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                                  {/* Payment Badge */}
                                  <div
                                    className={`flex items-center gap-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                      isPaid
                                        ? 'text-green-500 bg-green-500/10'
                                        : 'text-zinc-500 bg-zinc-800'
                                    }`}
                                  >
                                    <Wallet size={10} />
                                    {isPaid ? 'PAGO' : 'PEND.'}
                                  </div>

                                  {/* Status Text */}
                                  <div
                                    className={`px-1.5 py-0.5 rounded-[4px] text-[8px] md:text-[10px] font-black uppercase tracking-widest border ${
                                      app.status === 'confirmed'
                                        ? 'bg-green-900/20 text-green-500 border-green-900'
                                        : 'bg-yellow-900/20 text-yellow-500 border-yellow-900'
                                    }`}
                                  >
                                    {app.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                                  </div>
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
                Novo
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
              <div className="bg-[#151515] p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                    Data
                  </span>
                  <span className="text-white font-bold">
                    {quickAddSlot?.date.toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                    Horário
                  </span>
                  <span className="text-neon-yellow font-mono font-bold text-lg">
                    {quickAddSlot?.time}
                  </span>
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
                Confirmar <ChevronRight size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
