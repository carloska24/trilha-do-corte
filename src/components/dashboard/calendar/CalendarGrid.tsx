import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment, ShopSettings } from '../../../types';
import { getDaysInMonth, getLocalISODate } from '../../../utils/dateUtils';

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
              <span className={`text-sm font-bold ${isSelected ? 'text-black' : 'text-gray-300'}`}>
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
                      className={`w-1 h-1 rounded-full ${isSelected ? 'bg-black' : 'bg-gray-500'}`}
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
