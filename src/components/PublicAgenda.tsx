import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { BookingData } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  User,
  Calendar as CalendarIcon,
  X,
} from 'lucide-react';
import { useUI } from '../contexts/UIContext';

export const PublicAgenda: React.FC = () => {
  const { appointments, services, shopSettings } = useData();
  const { openBooking } = useUI();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- LOGICA DE CARROSSEL DE DIAS ---
  // Gerar proximos 30 dias
  const generateDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  };
  const daysList = generateDays();

  // Scroll para o dia selecionado
  useEffect(() => {
    if (scrollRef.current) {
      // Encontrar o elemento selecionado e scrollar
      // Simplificação: apenas garantir que não quebre
    }
  }, [selectedDate]);

  // --- LOGICA DO CALENDÁRIO MENSAL (MODAL) ---
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Dom

    const result = [];
    for (let i = 0; i < firstDay; i++) result.push(null);
    for (let i = 1; i <= days; i++) result.push(new Date(year, month, i));
    return result;
  };

  const changeMonth = (val: number) => {
    const newM = new Date(currentMonth);
    newM.setMonth(currentMonth.getMonth() + val);
    setCurrentMonth(newM);
  };

  // --- LOGICA DE HORARIOS ---
  const generateTimeSlots = () => {
    const slots = [];
    const interval = shopSettings.slotInterval || 60;
    const startMin = shopSettings.startHour * 60;
    const endMin = shopSettings.endHour * 60;

    for (let time = startMin; time < endMin; time += interval) {
      const h = Math.floor(time / 60);
      const m = time % 60;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const getSlotStatus = (timeStr: string) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const [h, m] = timeStr.split(':').map(Number);
    const slotTotalMinutes = h * 60 + m;

    // Check if passed
    const now = new Date();
    const isToday = dateStr === now.toISOString().split('T')[0];
    const nowTotalMinutes = now.getHours() * 60 + now.getMinutes();

    if (isToday && slotTotalMinutes < nowTotalMinutes) return 'passed';

    // Check availability
    // Simple check: Is there any appointment starting exactly at this time?
    // Enhanced: Check if any appointment overlaps significantly?
    // For now, let's keep it simple mapping "start time" matches.
    // If user asks for overlap logic, we will add it.
    const isOccupied = appointments.some(app => {
      const appDate = new Date(app.date).toISOString().split('T')[0];
      return appDate === dateStr && app.time === timeStr;
    });

    return isOccupied ? 'occupied' : 'available';
  };

  const handleSlotClick = (timeStr: string) => {
    const status = getSlotStatus(timeStr);
    if (status !== 'available') return;

    const bookingData: Partial<BookingData> = {
      date: selectedDate.toISOString(),
      time: timeStr,
      serviceId: services[0]?.id,
    };

    openBooking(bookingData);
  };

  return (
    <section
      id="agenda"
      className="py-12 bg-[#050505] relative border-t border-white/5 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-zinc-900/20 via-[#050505] to-[#050505] pointer-events-none"></div>

      <div className="max-w-md mx-auto px-4 relative z-10">
        {/* HEADER COMPACTO */}
        <div className="text-center mb-6">
          <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-1 block">
            Agendamento Expresso
          </span>
          <h2 className="text-3xl font-graffiti text-white leading-none drop-shadow-lg">
            AGENDA <span className="text-neon-yellow">TRILHA</span>
          </h2>
        </div>

        {/* DATA SELECIONADA (DISPARADOR DO MODAL) */}
        <div
          onClick={() => setIsCalendarOpen(true)}
          className="bg-[#111] border border-gray-800 rounded-xl p-3 mb-6 flex justify-between items-center cursor-pointer hover:border-neon-yellow transition-all group shadow-lg"
        >
          <button className="p-2 text-gray-400 group-hover:text-neon-yellow transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block">
              DATA SELECIONADA
            </span>
            <div className="flex items-center justify-center gap-2">
              <CalendarIcon size={16} className="text-neon-yellow" />
              <span className="text-lg font-black text-white uppercase tracking-wider group-hover:text-neon-yellow transition-colors">
                {selectedDate
                  .toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
                  .replace('.', '')
                  .toUpperCase()}
              </span>
              {selectedDate.toDateString() === new Date().toDateString() && (
                <span className="bg-green-500/20 text-green-500 text-[9px] font-bold px-1.5 py-0.5 rounded border border-green-500/30">
                  HOJE
                </span>
              )}
            </div>
          </div>
          <button className="p-2 text-gray-400 group-hover:text-neon-yellow transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* CARROSSEL DE DIAS */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 pb-4 mb-2 custom-scrollbar snap-x"
        >
          {daysList.map(day => {
            const isSelected = day.toDateString() === selectedDate.toDateString();
            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center border transition-all snap-center
                            ${
                              isSelected
                                ? 'bg-neon-yellow border-neon-yellow text-black scale-105 shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                                : 'bg-[#111] border-gray-800 text-gray-500 hover:border-gray-600 hover:bg-[#151515] hover:text-white'
                            }
                        `}
              >
                <span className="text-[10px] font-bold uppercase">
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                </span>
                <span className={`text-2xl font-black ${isSelected ? 'text-black' : 'text-white'}`}>
                  {day.getDate()}
                </span>
                {isToday && !isSelected && (
                  <div className="w-1 h-1 bg-green-500 rounded-full mt-1"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* GRADE DE HORARIOS COMPACTA */}
        <div className="grid grid-cols-4 gap-2">
          {timeSlots.map(timeStr => {
            const status = getSlotStatus(timeStr);

            let baseClasses =
              'flex flex-col items-center justify-center py-3 rounded-lg border transition-all duration-300';

            if (status === 'passed') {
              return (
                <div
                  key={timeStr}
                  className={`${baseClasses} bg-[#0a0a0a] border-transparent opacity-30 cursor-not-allowed`}
                >
                  <span className="text-sm font-bold text-gray-500 font-mono line-through">
                    {timeStr}
                  </span>
                  <span className="text-[8px] font-bold uppercase text-gray-600">Encerrado</span>
                </div>
              );
            }

            if (status === 'occupied') {
              return (
                <div
                  key={timeStr}
                  className={`${baseClasses} bg-red-900/5 border-red-900/20 opacity-50 cursor-not-allowed`}
                >
                  <span className="text-sm font-bold text-red-800 font-mono">{timeStr}</span>
                  <span className="text-[8px] font-bold uppercase text-red-900">Ocupado</span>
                </div>
              );
            }

            return (
              <button
                key={timeStr}
                onClick={() => handleSlotClick(timeStr)}
                className={`${baseClasses} bg-[#111] border-gray-800 text-white hover:bg-neon-yellow hover:text-black hover:border-neon-yellow hover:shadow-[0_0_15px_rgba(234,179,8,0.3)] active:scale-95 group`}
              >
                <span className="text-sm font-bold font-mono group-hover:font-black">
                  {timeStr}
                </span>
                <span className="text-[8px] font-bold uppercase text-green-500 group-hover:text-black mt-0.5">
                  Livre
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODAL CALENDARIO (IGUAL BARBEIRO) */}
      {isCalendarOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-[#111] w-full max-w-sm rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
            {/* Header Modal */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#151515]">
              <h3 className="font-black text-white uppercase tracking-wider text-sm flex items-center gap-2">
                <CalendarIcon size={16} className="text-neon-yellow" /> Selecionar Data
              </h3>
              <button
                onClick={() => setIsCalendarOpen(false)}
                className="text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              {/* Navegação Mês */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-2 hover:bg-white/10 rounded-full text-white"
                >
                  <ChevronLeft />
                </button>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-2 hover:bg-white/10 rounded-full text-white"
                >
                  <ChevronRight />
                </button>
              </div>

              {/* Grid Dias */}
              <div className="grid grid-cols-7 gap-2 text-center mb-4">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                  <div key={i} className="text-[10px] font-bold text-gray-500">
                    {d}
                  </div>
                ))}
                {getDaysInMonth(currentMonth).map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`}></div>;
                  const isSelected = day.toDateString() === selectedDate.toDateString();
                  const isToday = day.toDateString() === new Date().toDateString();

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedDate(day);
                        setIsCalendarOpen(false);
                      }}
                      className={`
                                        aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all
                                        ${
                                          isSelected
                                            ? 'bg-neon-yellow text-black shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                                            : 'bg-[#1a1a1a] text-white hover:bg-[#222]'
                                        }
                                        ${
                                          isToday && !isSelected
                                            ? 'border border-blue-500 text-blue-500'
                                            : ''
                                        }
                                    `}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
