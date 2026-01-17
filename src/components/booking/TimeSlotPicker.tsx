import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from 'lucide-react';
import { Appointment, ShopSettings, User } from '../../types';

interface TimeSlotPickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  serviceDuration: number;
  shopSettings: ShopSettings | null;
  appointments: Appointment[];
  currentUser: User | null;
  clientPhone?: string; // For drafting/conflict check
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeSelect,
  serviceDuration,
  shopSettings,
  appointments,
  currentUser,
  clientPhone,
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  // Sync current month with selected date if it changes externally
  useEffect(() => {
    setCurrentMonth(new Date(selectedDate));
  }, [selectedDate]);

  // --- LOGIC: DATE HELPERS ---
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

  // --- LOGIC: SLOT GENERATION ---
  const generateTimeSlots = () => {
    // 0 = Sunday
    if (
      selectedDate.getDay() === 0 &&
      (!shopSettings?.closedDays || shopSettings.closedDays.includes(0))
    )
      return [];

    // Check Exceptions
    const dateKey = selectedDate.toISOString().split('T')[0];
    const exception = shopSettings?.exceptions?.[dateKey];

    // Default hours or Exception hours
    const startH = exception?.startHour ?? (shopSettings?.startHour || 9);
    const endH = exception?.endHour ?? (shopSettings?.endHour || 19);

    if (exception?.closed || startH >= endH) return [];

    const GRID_INTERVAL = shopSettings?.slotInterval || 15;

    // Occupied Ranges
    const dayAppointments = appointments.filter(app => {
      // Handle both String and DateTime format (backend update compatibility)
      const appDateStr =
        typeof app.date === 'string'
          ? app.date
          : (app.date as any)?.toISOString?.().split('T')[0] || '';

      return appDateStr === dateKey && app.status !== 'cancelled';
    });

    const occupiedRanges = dayAppointments.map(app => {
      const [h, m] = app.time.split(':').map(Number);
      const startMin = h * 60 + m;

      // We don't have full service list here to know duration of *other* appointments precisely
      // unless passed. But usually we assume standard slot or fetch.
      // For simplicity/robustness, we can assume a default if not found,
      // OR we rely on `app.duration` if we added it to the model (we didn't yet).
      // Assuming 30 for now or trying to infer?
      // Actually `BookingModal` looked up service in `services`.
      // To keep it pure, we might miss exact duration of existing bookings if not in `Appointment` type.
      // Let's assume 30min default for others to be safe, or 45.
      const duration = 30;

      // CHECK IF THIS IS MINE
      const isMine =
        (currentUser?.id && String(app.clientId) === String(currentUser.id)) ||
        (clientPhone && app.clientPhone === clientPhone);

      return { start: startMin, end: startMin + duration, isMine };
    });

    // Generate Slots
    const slots = [];
    const startOfDayMin = startH * 60;
    const endOfDayMin = endH * 60;

    for (let time = startOfDayMin; time < endOfDayMin; time += GRID_INTERVAL) {
      const currentSlotStart = time;
      const currentSlotEnd = time + serviceDuration;

      // Check Overlap
      let slotStatus = 'available';
      const conflict = occupiedRanges.find(range => {
        // Simple overlap check
        return currentSlotStart < range.end && currentSlotEnd > range.start;
      });

      if (conflict) {
        slotStatus = conflict.isMine ? 'user_appointment' : 'occupied';
      }

      // Check Past
      const now = new Date();
      const localNowDateKey = now.toISOString().split('T')[0];
      const isToday = dateKey === localNowDateKey;
      const nowTotalMinutes = now.getHours() * 60 + now.getMinutes();

      if (isToday && currentSlotStart < nowTotalMinutes) slotStatus = 'passed';

      // Check Lunch Break
      const lunchStart = exception?.lunchStart;
      const lunchEnd = exception?.lunchEnd;
      if (lunchStart !== undefined && lunchEnd !== undefined) {
        const slotHour = Math.floor(currentSlotStart / 60);
        if (slotHour >= lunchStart && slotHour < lunchEnd) {
          slotStatus = 'lunch';
        }
      }

      const h = Math.floor(time / 60);
      const m = time % 60;
      const timeLabel = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      slots.push({
        label: timeLabel,
        minutes: time,
        status: slotStatus,
      });
    }

    return slots.filter(s => s.status !== 'passed' && s.status !== 'lunch');
  };

  const timeSlotsObjects = generateTimeSlots();

  // Is Closed Day?
  const dateKey = selectedDate.toISOString().split('T')[0];
  const isClosed = shopSettings?.exceptions?.[dateKey]?.closed;

  const changeDay = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    onDateChange(newDate);
  };

  return (
    <div className="space-y-4 animate-[slideRight_0.3s_ease-out]">
      {/* HEADER: DATE & NAV */}
      <div
        className={`bg-[#111] border rounded-xl p-3 mb-2 flex justify-between items-center transition-all group hover:border-gray-700
            ${isClosed ? 'border-red-900/50 bg-red-900/10' : 'border-gray-800'}
        `}
      >
        <button
          onClick={e => {
            e.stopPropagation();
            changeDay(-1);
          }}
          className="p-2 text-gray-400 hover:text-neon-yellow transition-colors cursor-pointer rounded-full hover:bg-white/5"
        >
          <ChevronLeft size={18} />
        </button>

        <div
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className="text-center cursor-pointer hover:scale-105 transition-transform select-none"
        >
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block">
            DATA DA PARTIDA
          </span>
          <div className="flex items-center justify-center gap-2">
            <CalendarIcon
              size={16}
              className={`${isClosed ? 'text-red-500' : 'text-neon-yellow'}`}
            />
            <span
              className={`text-lg font-black uppercase tracking-wider transition-colors ${
                isClosed ? 'text-red-500' : 'text-white'
              }`}
            >
              {selectedDate
                .toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                })
                .replace('.', '')
                .toUpperCase()}
            </span>
          </div>
        </div>

        <button
          onClick={e => {
            e.stopPropagation();
            changeDay(1);
          }}
          className="p-2 text-gray-400 hover:text-neon-yellow transition-colors cursor-pointer rounded-full hover:bg-white/5"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* HORIZONTAL DAYS SCROLL */}
      <div ref={scrollRef} className="flex overflow-x-auto gap-2 pb-2 mb-2 custom-scrollbar snap-x">
        {daysList.map(day => {
          const isSelected = day.toDateString() === selectedDate.toDateString();
          const isToday = day.toDateString() === new Date().toDateString();

          const dKey = day.toISOString().split('T')[0];
          const dayClosed = shopSettings?.exceptions?.[dKey]?.closed;

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateChange(day)}
              className={`flex-shrink-0 w-14 h-16 rounded-xl flex flex-col items-center justify-center border transition-all snap-center
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
              <span className="text-[9px] font-bold uppercase">
                {day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
              </span>
              <span className="text-xl font-black">{day.getDate()}</span>
              {isToday && !isSelected && (
                <div className="w-1 h-1 bg-green-500 rounded-full mt-0.5"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* TIME SLOTS GRID */}
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">
          Horário de Embarque
        </label>

        {isClosed ? (
          <div className="flex flex-col items-center justify-center py-6 border border-dashed border-red-900/30 rounded-xl bg-red-900/5">
            <X size={24} className="text-red-500 mb-2 opacity-50" />
            <span className="text-red-500 font-bold uppercase tracking-widest text-xs">
              Não haverá atendimento
            </span>
            <span className="text-red-800 text-[10px] mt-1">Selecione outro dia</span>
          </div>
        ) : (
          <>
            {timeSlotsObjects.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Clock className="w-6 h-6 mx-auto mb-2 opacity-20" />
                <p className="text-[10px] uppercase tracking-widest">Sem horários disponíveis</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 md:grid-cols-5 gap-2 transition-all duration-500">
                  {timeSlotsObjects.slice(0, isExpanded ? undefined : 15).map(slot => {
                    let baseClasses =
                      'flex flex-col items-center justify-center py-2.5 rounded-lg border transition-all duration-200';

                    if (slot.status === 'occupied') {
                      return (
                        <div
                          key={slot.label}
                          className={`${baseClasses} bg-gray-900/50 border-gray-800 opacity-30 cursor-not-allowed`}
                        >
                          <span className="text-sm font-bold text-gray-500 font-mono line-through">
                            {slot.label}
                          </span>
                        </div>
                      );
                    }

                    if (slot.status === 'user_appointment') {
                      return (
                        <div
                          key={slot.label}
                          className={`${baseClasses} bg-neon-yellow/10 border-neon-yellow/50 cursor-not-allowed`}
                        >
                          <span className="text-sm font-black text-neon-yellow font-mono">
                            {slot.label}
                          </span>
                          <span className="text-[7px] font-bold uppercase text-neon-yellow leading-none mt-0.5">
                            Seu Horário
                          </span>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={slot.label}
                        onClick={() => onTimeSelect(slot.label)}
                        className={`
                            ${baseClasses}
                            ${
                              selectedTime === slot.label
                                ? 'bg-neon-yellow border-neon-yellow text-black shadow-[0_0_10px_rgba(234,179,8,0.3)] scale-105'
                                : 'bg-[#111] border-gray-800 text-white hover:bg-neon-yellow hover:text-black hover:border-neon-yellow hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                            }
                            group
                        `}
                      >
                        <span className="text-sm font-bold font-mono group-hover:font-black">
                          {slot.label}
                        </span>
                        {selectedTime !== slot.label && (
                          <span className="text-[8px] font-bold uppercase text-green-500 group-hover:text-black mt-0.5 leading-none">
                            Livre
                          </span>
                        )}
                        {selectedTime === slot.label && (
                          <span className="text-[8px] font-bold uppercase text-black mt-0.5 leading-none">
                            OK
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {timeSlotsObjects.length > 15 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-center gap-2 mt-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronDown className="rotate-180" size={14} /> Menos Horários
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} /> Ver Mais Horários ({timeSlotsObjects.length - 15})
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
