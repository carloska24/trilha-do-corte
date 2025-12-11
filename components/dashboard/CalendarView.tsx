import React, { useState, useEffect } from 'react';
import { Appointment, BookingData, Service } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Scissors,
  Zap,
} from 'lucide-react';

interface CalendarViewProps {
  appointments: Appointment[];
  services: Service[];
  onNewAppointment: (data: BookingData) => void;
  onSelectClient: (clientName: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  appointments,
  services,
  onNewAppointment,
  onSelectClient,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Quick Add State with Context
  const [quickAddSlot, setQuickAddSlot] = useState<{ date: Date; time: string } | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Form State
  const [clientName, setClientName] = useState('');
  const [selectedService, setSelectedService] = useState(services[0]?.id || '');

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
      document.head.removeChild(style);
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

  const getTimeSlots = () => Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 - 21:00

  // Helper to get service details
  const getServiceDetails = (id: string) => {
    const s = services.find(serv => serv.id === id);
    // Fallback if not found (e.g. legacy ID)
    return s || { name: 'Serviço', category: 'Geral', icon: 'scissors' };
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
    <div className="flex flex-col h-full bg-[#111] text-white">
      {/* 1. HEADER */}
      <div className="pt-6 px-4 md:px-6 bg-[#111] border-b border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-graffiti text-white tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            AGENDA
          </h1>
          <button
            onClick={() => {
              const nextTime = calculateNextAvailableSlot();
              setQuickAddSlot({ date: selectedDate, time: nextTime });
              setIsQuickAddOpen(true);
            }}
            className="w-10 h-10 md:w-12 md:h-12 bg-neon-yellow rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform shadow-[0_0_20px_rgba(234,179,8,0.4)]"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>

        <div className="flex items-center gap-6 md:gap-8">
          <button
            onClick={() => setActiveTab('daily')}
            className={`pb-3 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
              activeTab === 'daily' ? 'text-neon-yellow' : 'text-gray-500 hover:text-white'
            }`}
          >
            Diário
            {activeTab === 'daily' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-yellow shadow-[0_0_15px_#EAB308]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`pb-3 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
              activeTab === 'weekly' || activeTab === 'monthly'
                ? 'text-neon-yellow'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            Calendário
            {(activeTab === 'weekly' || activeTab === 'monthly') && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-yellow shadow-[0_0_15px_#EAB308]"></div>
            )}
          </button>
        </div>
      </div>

      {/* 2. BODY */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'daily' ? (
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
              </div>
              <button
                onClick={() => changeDate(1)}
                className="text-gray-400 hover:text-white transition-colors bg-[#0a0a0a] p-2 rounded-lg border border-gray-800"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Timeline */}
            <div className="pb-24 pt-2">
              {getTimeSlots().map(hour => {
                const hourStr = String(hour).padStart(2, '0');
                const apps = getAppointmentsForDate(selectedDate).filter(a =>
                  a.time.startsWith(hourStr)
                );

                return (
                  <div key={hour} className="flex min-h-[110px] border-b border-gray-800/30 group">
                    {/* Time Column */}
                    <div className="w-16 md:w-20 py-4 pl-2 md:pl-4 text-xs md:text-sm font-mono font-bold text-gray-500 flex flex-col items-start border-r border-gray-800/50 bg-[#111]">
                      <span>{hourStr}:00</span>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 p-2 md:p-3 bg-[#111] relative">
                      {apps.length > 0 ? (
                        apps.map(app => {
                          const service = getServiceDetails(app.serviceId);

                          return (
                            <div
                              key={app.id}
                              onClick={() => onSelectClient(app.clientName)}
                              className="mb-3 last:mb-0 relative overflow-hidden rounded-xl border border-gray-800 bg-[#1A1A1A] hover:border-neon-yellow transition-all duration-300 cursor-pointer group/card shadow-lg hover:-translate-y-1"
                            >
                              {/* Status Stripe */}
                              <div
                                className={`absolute left-0 top-0 bottom-0 w-1 ${
                                  app.status === 'confirmed'
                                    ? 'bg-neon-yellow'
                                    : app.status === 'in_progress'
                                    ? 'bg-blue-500'
                                    : 'bg-gray-600'
                                }`}
                              ></div>

                              <div className="flex flex-row justify-between items-center p-3 md:p-4 pl-4 md:pl-5 gap-2">
                                <div className="flex-1 min-w-0">
                                  {/* Client Name */}
                                  <h4 className="font-black text-white text-base md:text-lg truncate mb-1.5 leading-tight">
                                    {app.clientName}
                                  </h4>

                                  {/* Service Info with Ticker */}
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <div className="flex items-center gap-2 text-gray-300 text-[10px] md:text-xs font-bold uppercase tracking-wider bg-black/40 w-[140px] px-2 py-1 rounded border border-gray-800 overflow-hidden relative">
                                      <Scissors
                                        size={10}
                                        className="text-neon-yellow shrink-0 z-10 bg-black/40"
                                      />
                                      <div className="overflow-hidden w-full relative h-[16px]">
                                        <div className="animate-marquee absolute top-0 left-0">
                                          <span className="mr-8">{service.name}</span>
                                          <span className="mr-8">{service.name}</span>
                                          <span className="mr-8">{service.name}</span>
                                          <span className="mr-8">{service.name}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-[10px] font-mono text-gray-500 bg-black/20 px-1.5 py-0.5 rounded border border-white/5 shrink-0">
                                      {service.duration || 45}min
                                    </div>
                                  </div>
                                </div>

                                {/* Right Side Info - Simplified for Mobile */}
                                <div className="text-right flex flex-col items-end gap-1 md:gap-2 shrink-0">
                                  <div
                                    className={`px-1.5 py-0.5 rounded-[4px] text-[8px] md:text-[10px] font-black uppercase tracking-widest border ${
                                      app.status === 'confirmed'
                                        ? 'bg-green-900/20 text-green-500 border-green-900'
                                        : 'bg-yellow-900/20 text-yellow-500 border-yellow-900'
                                    }`}
                                  >
                                    {app.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                                  </div>

                                  {/* Service Tag Badge (Combo etc) */}
                                  {service.category === 'Combo' && (
                                    <div className="flex items-center gap-1 text-[9px] font-bold text-purple-400">
                                      <Zap size={10} fill="currentColor" /> COMBO
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        // Empty Slot Interaction
                        <div
                          onClick={() => handleSlotClick(hour)}
                          className="w-full h-full flex items-center justify-center rounded-xl border border-dashed border-gray-800 hover:border-neon-yellow hover:bg-[#151515] transition-all cursor-pointer group/empty"
                        >
                          <div className="flex items-center gap-2 text-gray-600 group-hover/empty:text-neon-yellow transition-colors">
                            <Plus size={18} />
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest hidden group-hover/empty:inline-block">
                              Agendar
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
        ) : (
          renderCalendarGrid()
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
