import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment, ShopSettings } from '../../../types';
import { getDaysInMonth, getLocalISODate } from '../../../utils/dateUtils';
import { motion } from 'framer-motion';

interface CalendarGridProps {
  currentMonth: Date;
  changeMonth: (months: number) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  setActiveTab: (tab: 'daily' | 'weekly' | 'monthly' | 'config') => void;
  getAppointmentsForDate: (date: Date) => Appointment[];
  shopSettings: ShopSettings;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentMonth,
  changeMonth,
  selectedDate,
  setSelectedDate,
  setActiveTab,
  getAppointmentsForDate,
  shopSettings,
}) => {
  const days = getDaysInMonth(currentMonth);
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <div className="p-4 pb-28">
      {/* Month Header - Premium Style */}
      <div className="flex justify-between items-center mb-6 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => changeMonth(-1)}
          className="w-10 h-10 flex items-center justify-center hover:bg-zinc-700 rounded-xl transition-colors"
        >
          <ChevronLeft className="text-zinc-400" size={20} />
        </motion.button>
        <div className="text-center">
          <h3 className="text-lg font-black text-white uppercase tracking-wider">
            {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => changeMonth(1)}
          className="w-10 h-10 flex items-center justify-center hover:bg-zinc-700 rounded-xl transition-colors"
        >
          <ChevronRight className="text-zinc-400" size={20} />
        </motion.button>
      </div>

      {/* Calendar Container */}
      <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {weekDays.map((d, i) => (
            <div
              key={`${d}-${i}`}
              className={`text-center text-[11px] font-bold uppercase tracking-widest py-2 ${
                i === 0 ? 'text-red-500/50' : 'text-zinc-600'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="aspect-square" />;

            const count = getAppointmentsForDate(day).length;
            const isSelected = day.toDateString() === selectedDate.toDateString();
            const isToday = day.toDateString() === new Date().toDateString();
            const dateKey = getLocalISODate(day);
            const isSunday = day.getDay() === 0;
            const isClosed = shopSettings.exceptions?.[dateKey]?.closed;

            return (
              <motion.div
                key={day.toISOString()}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (isSunday) return;
                  setSelectedDate(day);
                  setActiveTab('daily');
                }}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all relative cursor-pointer ${
                  isSunday
                    ? 'bg-zinc-900/30 text-zinc-700 cursor-not-allowed'
                    : isClosed
                    ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                    : isSelected
                    ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                    : isToday
                    ? 'bg-zinc-800 border-2 border-yellow-500/50 text-white'
                    : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50'
                }`}
              >
                {/* Day Number */}
                <span
                  className={`text-sm font-bold ${
                    isSelected ? 'text-black' : isSunday ? 'text-zinc-700' : ''
                  }`}
                >
                  {day.getDate()}
                </span>

                {/* Appointment Indicators */}
                {count > 0 && !isSunday && (
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(Math.min(count, 3))].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-1 rounded-full ${
                          isSelected ? 'bg-black/50' : 'bg-yellow-500'
                        }`}
                      />
                    ))}
                    {count > 3 && (
                      <span
                        className={`text-[8px] font-bold ml-0.5 ${
                          isSelected ? 'text-black/50' : 'text-yellow-500'
                        }`}
                      >
                        +
                      </span>
                    )}
                  </div>
                )}

                {/* Today Indicator (when not selected) */}
                {isToday && !isSelected && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_6px_#eab308]" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-4 text-[10px] text-zinc-600">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span>Agendamentos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/50" />
          <span>Fechado</span>
        </div>
      </div>
    </div>
  );
};
