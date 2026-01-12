import React from 'react';
import { CalendarDays, SlidersHorizontal, Share2, Sparkles, ListTodo } from 'lucide-react';
import { motion } from 'framer-motion';

interface CalendarHeaderProps {
  activeTab: 'daily' | 'weekly' | 'monthly' | 'config';
  setActiveTab: (tab: 'daily' | 'weekly' | 'monthly' | 'config') => void;
  onExportClick: () => void;
  appointmentCount?: number;
  totalRevenue?: number;
  selectedDate?: Date;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  activeTab,
  setActiveTab,
  onExportClick,
  appointmentCount = 0,
  totalRevenue = 0,
  selectedDate = new Date(),
}) => {
  const tabs = [
    { id: 'daily' as const, label: 'Diário', icon: ListTodo, description: 'Lista de hoje' },
    { id: 'monthly' as const, label: 'Mês', icon: CalendarDays, description: 'Ver calendário' },
    {
      id: 'config' as const,
      label: 'Config',
      icon: SlidersHorizontal,
      description: 'Preferências',
    },
  ];

  const formatDate = (date: Date) => {
    return date
      .toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'long',
      })
      .replace('.', '');
  };

  return (
    <div className="bg-linear-to-b from-zinc-900 via-zinc-900/95 to-zinc-900 border-b border-zinc-800/50 transition-colors">
      {/* Top Section - Title & Export */}
      <div className="px-4 md:px-6 pt-5 pb-4">
        <div className="flex justify-between items-start">
          {/* Left - Title & Date */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                <CalendarDays size={20} className="text-yellow-500" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-graffiti text-white tracking-wide">
                  AGENDA
                </h1>
                <p className="text-[11px] text-zinc-500 font-medium capitalize">
                  {formatDate(selectedDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Right - Export Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExportClick}
            className="group relative px-4 py-2.5 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2.5 hover:border-green-500/60 hover:bg-green-500/15 transition-all"
          >
            <Share2 size={16} className="text-green-500" />
            <span className="text-xs font-bold text-green-500 uppercase tracking-wider hidden sm:block">
              Enviar
            </span>
          </motion.button>
        </div>

        {/* Summary Card */}
        {activeTab === 'daily' && (appointmentCount > 0 || totalRevenue > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-4 p-3 bg-zinc-800/40 rounded-xl border border-zinc-700/50"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-yellow-500" />
              <span className="text-sm font-bold text-white">{appointmentCount}</span>
              <span className="text-xs text-zinc-500">
                {appointmentCount === 1 ? 'cliente' : 'clientes'}
              </span>
            </div>
            <div className="h-4 w-px bg-zinc-700" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-green-500">R$ {totalRevenue.toFixed(0)}</span>
              <span className="text-xs text-zinc-500">hoje</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Tabs - Premium Segmented Control */}
      <div className="px-4 md:px-6 pb-4">
        <div className="flex gap-1.5 bg-zinc-800/40 p-1.5 rounded-2xl border border-zinc-700/30 backdrop-blur-sm">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale: 0.97 }}
                className={`relative flex-1 flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 rounded-xl transition-all duration-300 ${
                  isActive ? 'text-black' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/30'
                }`}
              >
                {/* Active Background with Glow */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-yellow-500 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}

                {/* Icon with Badge Effect */}
                <div className={`relative z-10 ${isActive ? 'drop-shadow-sm' : ''}`}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>

                {/* Label */}
                <span
                  className={`relative z-10 text-[10px] font-bold uppercase tracking-widest ${
                    isActive ? 'text-black' : ''
                  }`}
                >
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
