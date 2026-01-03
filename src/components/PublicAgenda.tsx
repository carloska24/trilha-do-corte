import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { BookingData } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
  const [isExpanded, setIsExpanded] = useState(false); // New state for expansion
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
  // --- LOGICA DE HORARIOS INTELIGENTE (SMART SLOTS) ---
  const generateTimeSlots = () => {
    // 1. Validar dia fechado (Domingo ou Exceção)
    if (selectedDate.getDay() === 0) return [];

    const dateKey =
      selectedDate.getFullYear() +
      '-' +
      String(selectedDate.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(selectedDate.getDate()).padStart(2, '0');
    const exception = shopSettings.exceptions?.[dateKey];

    const startH = exception?.startHour ?? shopSettings.startHour;
    const endH = exception?.endHour ?? shopSettings.endHour;

    if (exception?.closed || startH >= endH) return [];

    // 2. Definir intervalo de "Grade" (Fina p/ Smart) = 15min
    const GRID_INTERVAL = 15;

    // 3. Mapear Agendamentos do Dia (Occupied Ranges)
    const dateStr = selectedDate.toISOString().split('T')[0];
    const dayAppointments = appointments.filter(app => {
      // Ajuste para garantir comparação correta de data (timezone safe basic)
      return app.date.startsWith(dateStr) && app.status !== 'cancelled';
    });

    const occupiedRanges = dayAppointments.map(app => {
      const [h, m] = app.time.split(':').map(Number);
      const startMin = h * 60 + m;

      const service = services.find(s => s.id === app.serviceId);
      const duration = service?.duration || 30; // Fallback

      return { start: startMin, end: startMin + duration };
    });

    // 4. Gerar Slots Disponíveis
    const slots = [];
    const startOfDayMin = startH * 60;
    const endOfDayMin = endH * 60;

    // Duração "minima" para verificar se cabe UM serviço (usando o primeiro serviço ou 30min)
    const minServiceDuration = services[0]?.duration || 30;

    for (let time = startOfDayMin; time < endOfDayMin; time += GRID_INTERVAL) {
      const currentSlotStart = time;
      const currentSlotEnd = time + minServiceDuration;

      // Verificar Colisão (Overlap)
      const isOccupied = occupiedRanges.some(range => {
        return currentSlotStart < range.end && currentSlotEnd > range.start;
      });

      // Verificar Passado
      const now = new Date();
      const isToday = dateStr === now.toISOString().split('T')[0];
      const nowTotalMinutes = now.getHours() * 60 + now.getMinutes();
      const isPassed = isToday && currentSlotStart < nowTotalMinutes;

      // Format Label
      const h = Math.floor(time / 60);
      const m = time % 60;
      const timeLabel = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      // Regra de Exibição:
      // Se estiver ocupado, NÃO MOSTRAR (para "Smart" behavior), ou mostrar como ocupado?
      // O usuário pediu "o próximo horário disponível deve ser...".
      // Vamos incluir todos na lista, e o render decide a cor.

      slots.push({
        label: timeLabel,
        minutes: time,
        status: isOccupied ? 'occupied' : isPassed ? 'passed' : 'available',
      });
    }

    // Filter out passed slots here to hide them completely
    return slots.filter(s => s.status !== 'passed');
  };

  const timeSlotsObjects = generateTimeSlots();
  // Filter only meaningful slots? For now return mapped labels for compatibility but use objects for status
  const timeSlots = timeSlotsObjects.map(s => s.label);

  // Is current day closed?
  const dateKey =
    selectedDate.getFullYear() +
    '-' +
    String(selectedDate.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(selectedDate.getDate()).padStart(2, '0');
  const isClosed = shopSettings.exceptions?.[dateKey]?.closed;

  const getSlotStatus = (timeStr: string) => {
    const slot = timeSlotsObjects.find(s => s.label === timeStr);
    return slot?.status || 'available';
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
      className="py-4 pb-8 bg-[#050505] relative border-t border-white/5 overflow-hidden scroll-mt-20"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-zinc-900/20 via-[#050505] to-[#050505] pointer-events-none"></div>

      <div className="max-w-md mx-auto px-4 relative z-10">
        {/* HEADER COMPACTO */}
        <div
          className="text-center mb-6 cursor-pointer group"
          onClick={() => document.getElementById('agenda')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-1 block group-hover:text-neon-yellow transition-colors">
            Agendamento Expresso
          </span>
          <h2 className="text-3xl font-graffiti text-white leading-none drop-shadow-lg group-hover:scale-105 transition-transform duration-300">
            AGENDA <span className="text-neon-yellow">TRILHA</span>
          </h2>
        </div>

        {/* DATA SELECIONADA (DISPARADOR DO MODAL) */}
        <div
          onClick={() => setIsCalendarOpen(true)}
          className={`
            bg-[#111] border rounded-xl p-3 mb-6 flex justify-between items-center cursor-pointer transition-all group shadow-lg
            ${
              isClosed
                ? 'border-red-900/50 bg-red-900/10'
                : 'border-gray-800 hover:border-neon-yellow'
            }
          `}
        >
          <button className="p-2 text-gray-400 group-hover:text-neon-yellow transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block">
              DATA SELECIONADA
            </span>
            <div className="flex items-center justify-center gap-2">
              <CalendarIcon
                size={16}
                className={`${isClosed ? 'text-red-500' : 'text-neon-yellow'}`}
              />
              <span
                className={`text-lg font-black uppercase tracking-wider transition-colors ${
                  isClosed ? 'text-red-500' : 'text-white group-hover:text-neon-yellow'
                }`}
              >
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
              {isClosed && (
                <span className="bg-red-500/20 text-red-500 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-500/30 ml-2">
                  FECHADO
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

            // Helper local date key
            const dKey =
              day.getFullYear() +
              '-' +
              String(day.getMonth() + 1).padStart(2, '0') +
              '-' +
              String(day.getDate()).padStart(2, '0');
            const dayClosed = shopSettings.exceptions?.[dKey]?.closed;

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center border transition-all snap-center
                            ${
                              dayClosed
                                ? isSelected
                                  ? 'bg-red-900/30 border-red-500 text-red-500'
                                  : 'bg-[#150505] border-red-900/30 text-red-700 opacity-70'
                                : isSelected
                                ? 'bg-neon-yellow border-neon-yellow text-black scale-105 shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                                : 'bg-[#111] border-gray-800 text-gray-500 hover:border-gray-600 hover:bg-[#151515] hover:text-white'
                            }
                        `}
              >
                <span className="text-[10px] font-bold uppercase">
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                </span>
                <span
                  className={`text-2xl font-black ${
                    isSelected
                      ? dayClosed
                        ? 'text-red-500'
                        : 'text-black'
                      : dayClosed
                      ? 'text-red-700'
                      : 'text-white'
                  }`}
                >
                  {day.getDate()}
                </span>
                {isToday && !isSelected && (
                  <div className="w-1 h-1 bg-green-500 rounded-full mt-1"></div>
                )}
                {dayClosed && !isToday && (
                  <div className="text-[8px] uppercase mt-0.5 font-bold">OFF</div>
                )}
              </button>
            );
          })}
        </div>

        {/* GRADE DE HORARIOS COMPACTA */}
        {isClosed ? (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-red-900/30 rounded-xl bg-red-900/5">
            <X size={32} className="text-red-500 mb-2 opacity-50" />
            <span className="text-red-500 font-bold uppercase tracking-widest text-sm">
              Não haverá atendimento
            </span>
            <span className="text-red-800 text-xs mt-1">Selecione outro dia</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2 transition-all duration-500">
              {timeSlots
                .slice(0, isExpanded ? undefined : 12) // Show only 12 initially
                .map(timeStr => {
                  const status = getSlotStatus(timeStr);

                  let baseClasses =
                    'flex flex-col items-center justify-center py-3 rounded-lg border transition-all duration-300';

                  if (status === 'passed') {
                    // Should be hidden by filter, but safely handle if logic changes
                    return null;
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

            {/* Expand/Collapse Button */}
            {timeSlots.length > 12 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-center gap-2 mt-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronDown className="rotate-180" size={16} /> Menos Horários
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} /> Ver Mais Horários ({timeSlots.length - 12})
                  </>
                )}
              </button>
            )}

            {/* Empty State if all filtered */}
            {timeSlots.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs uppercase tracking-widest">Sem horários disponíveis</p>
              </div>
            )}
          </>
        )}

        {/* Navigation Arrow to Estilo Trilha */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() =>
              document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="animate-bounce text-white/50 hover:text-neon-yellow transition-colors cursor-pointer bg-transparent border-none p-2 outline-none"
            aria-label="Ir para Estilo Trilha"
          >
            <ChevronDown size={24} />
          </button>
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

                  // Closed check
                  const dKey =
                    day.getFullYear() +
                    '-' +
                    String(day.getMonth() + 1).padStart(2, '0') +
                    '-' +
                    String(day.getDate()).padStart(2, '0');
                  const dayClosed = shopSettings.exceptions?.[dKey]?.closed;

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
                                          dayClosed
                                            ? 'bg-red-900/20 text-red-500 border border-red-900/30'
                                            : isSelected
                                            ? 'bg-neon-yellow text-black shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                                            : 'bg-[#1a1a1a] text-white hover:bg-[#222]'
                                        }
                                        ${
                                          isToday && !isSelected && !dayClosed
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
