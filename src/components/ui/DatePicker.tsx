import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DatePickerProps {
  value: string; // ISO date string YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  accentColor?: 'yellow' | 'orange' | 'purple' | 'green' | 'red';
}

const DAYS_PT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Selecionar data',
  minDate,
  maxDate,
  accentColor = 'orange',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value + 'T00:00:00');
    return new Date();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Theme colors with gradients
  const themes = {
    yellow: {
      gradient: 'from-yellow-600 via-amber-600 to-orange-600',
      bg: 'bg-yellow-500',
      bgHover: 'hover:bg-yellow-500/30',
      text: 'text-yellow-400',
      border: 'border-yellow-500',
      ring: 'ring-yellow-500/50',
      glow: 'shadow-[0_0_30px_rgba(234,179,8,0.4)]',
    },
    orange: {
      gradient: 'from-orange-600 via-red-600 to-pink-600',
      bg: 'bg-orange-500',
      bgHover: 'hover:bg-orange-500/30',
      text: 'text-orange-400',
      border: 'border-orange-500',
      ring: 'ring-orange-500/50',
      glow: 'shadow-[0_0_30px_rgba(249,115,22,0.4)]',
    },
    purple: {
      gradient: 'from-purple-600 via-violet-600 to-indigo-600',
      bg: 'bg-purple-500',
      bgHover: 'hover:bg-purple-500/30',
      text: 'text-purple-400',
      border: 'border-purple-500',
      ring: 'ring-purple-500/50',
      glow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]',
    },
    green: {
      gradient: 'from-green-600 via-emerald-600 to-teal-600',
      bg: 'bg-green-500',
      bgHover: 'hover:bg-green-500/30',
      text: 'text-green-400',
      border: 'border-green-500',
      ring: 'ring-green-500/50',
      glow: 'shadow-[0_0_30px_rgba(34,197,94,0.4)]',
    },
    red: {
      gradient: 'from-red-600 via-rose-600 to-pink-600',
      bg: 'bg-red-500',
      bgHover: 'hover:bg-red-500/30',
      text: 'text-red-400',
      border: 'border-red-500',
      ring: 'ring-red-500/50',
      glow: 'shadow-[0_0_30px_rgba(239,68,68,0.4)]',
    },
  };

  const theme = themes[accentColor];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Get calendar days
  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: {
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isDisabled: boolean;
    }[] = [];

    // Previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: true,
      });
    }

    // Current month
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      let isDisabled = false;
      if (minDate && dateStr < minDate) isDisabled = true;
      if (maxDate && dateStr > maxDate) isDisabled = true;
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        isSelected: value === dateStr,
        isDisabled,
      });
    }

    // Next month (fill to 35 or 42)
    const totalNeeded = days.length <= 35 ? 35 : 42;
    const remaining = totalNeeded - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: true,
      });
    }

    return days;
  };

  const days = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleSelectDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">
          {label}
        </label>
      )}

      {/* Input Button */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full flex items-center justify-between gap-2 bg-black/50 backdrop-blur-sm border ${
          isOpen ? theme.border : 'border-zinc-800'
        } px-3 py-2 rounded-lg text-left transition-all duration-300 cursor-pointer outline-none ${
          isOpen ? theme.glow : 'hover:border-zinc-700'
        }`}
      >
        <div className="flex items-center gap-3 pointer-events-none">
          <div
            className={`p-1.5 rounded-lg ${
              value ? `bg-gradient-to-br ${theme.gradient}` : 'bg-zinc-800'
            }`}
          >
            <Calendar size={14} className={value ? 'text-white' : 'text-zinc-500'} />
          </div>
          <span
            className={
              value
                ? 'text-white font-bold tracking-wide text-xs'
                : 'text-zinc-500 font-medium text-xs'
            }
          >
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </div>
        {value && (
          <button
            onClick={e => {
              e.stopPropagation();
              handleClear(e);
            }}
            className="text-zinc-500 hover:text-red-400 transition-colors p-1 hover:bg-red-500/10 rounded"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Calendar Modal - Fixed position, centered */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[320px] rounded-2xl overflow-hidden ${theme.glow}`}
              onClick={e => e.stopPropagation()}
            >
              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${theme.gradient} p-4`}>
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevMonth}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all active:scale-90"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="text-center">
                    <span className="text-white font-black text-lg uppercase tracking-widest">
                      {MONTHS_PT[viewDate.getMonth()]}
                    </span>
                    <span className="text-white/80 font-bold text-lg ml-2">
                      {viewDate.getFullYear()}
                    </span>
                  </div>
                  <button
                    onClick={handleNextMonth}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all active:scale-90"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Calendar body */}
              <div className="bg-zinc-900 p-3">
                {/* Days of week */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAYS_PT.map((day, i) => (
                    <div
                      key={i}
                      className={`text-center text-[11px] font-black uppercase py-2 ${
                        i === 0 ? 'text-red-400' : 'text-zinc-500'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, i) => {
                    const isWeekend = day.date.getDay() === 0;
                    return (
                      <button
                        key={i}
                        disabled={day.isDisabled}
                        onClick={() => handleSelectDate(day.date)}
                        className={`
                          relative w-full aspect-square rounded-xl text-sm font-bold transition-all duration-200
                          ${day.isDisabled ? 'text-zinc-800 cursor-not-allowed' : ''}
                          ${
                            !day.isDisabled && !day.isSelected && day.isCurrentMonth
                              ? `text-white ${theme.bgHover} hover:scale-110`
                              : ''
                          }
                          ${
                            day.isSelected
                              ? `bg-gradient-to-br ${theme.gradient} text-white scale-110 shadow-lg`
                              : ''
                          }
                          ${
                            day.isToday && !day.isSelected
                              ? `ring-2 ${theme.ring} ${theme.text}`
                              : ''
                          }
                          ${!day.isCurrentMonth ? 'text-zinc-700' : ''}
                          ${
                            isWeekend && day.isCurrentMonth && !day.isSelected ? 'text-red-400' : ''
                          }
                        `}
                      >
                        {day.date.getDate()}
                        {day.isToday && !day.isSelected && (
                          <span
                            className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${theme.bg}`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800">
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      onChange(today);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${theme.gradient} text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all active:scale-95`}
                  >
                    <Calendar size={12} />
                    Hoje
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400 font-bold text-xs uppercase tracking-wider hover:bg-zinc-700 hover:text-white transition-all"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
