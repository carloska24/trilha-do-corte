import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  Target,
  TicketPercent,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Scissors,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Settings,
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { SERVICES as ALL_SERVICES } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'daily' | 'monthly';

export const FinanceiroPage: React.FC = () => {
  const navigate = useNavigate();
  const { appointments, services } = useData();
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Format date for filtering
  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = formatDateString(date);
    return appointments.filter(a => a.date === dateStr);
  };

  // Get completed appointments for selected date
  const completedToday = useMemo(() => {
    return getAppointmentsForDate(selectedDate).filter(a => a.status === 'completed');
  }, [appointments, selectedDate]);

  // Calculate daily stats
  const dailyStats = useMemo(() => {
    const dayAppts = getAppointmentsForDate(selectedDate);
    const completed = dayAppts.filter(a => a.status === 'completed');
    const totalPrevisto = dayAppts.reduce((sum, a) => sum + (a.price || 0), 0);
    const totalRealizado = completed.reduce((sum, a) => sum + (a.price || 0), 0);
    const ticketMedio = completed.length > 0 ? totalRealizado / completed.length : 0;

    return {
      totalPrevisto,
      totalRealizado,
      ticketMedio,
      atendimentos: completed.length,
      pendentes: dayAppts.filter(a => a.status === 'pending' || a.status === 'confirmed').length,
    };
  }, [appointments, selectedDate]);

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const monthAppts = appointments.filter(a => {
      const [aYear, aMonth] = a.date.split('-').map(Number);
      return aYear === year && aMonth === month + 1;
    });
    const completed = monthAppts.filter(a => a.status === 'completed');
    const total = completed.reduce((sum, a) => sum + (a.price || 0), 0);

    return {
      total,
      atendimentos: completed.length,
      ticketMedio: completed.length > 0 ? total / completed.length : 0,
    };
  }, [appointments, currentMonth]);

  // Get service name
  const getServiceName = (serviceId: string) => {
    const service =
      services.find(s => s.id === serviceId) || ALL_SERVICES.find(s => s.id === serviceId);
    return service?.name || 'Servico';
  };

  // Navigation
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const changeMonth = (months: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + months);
    setCurrentMonth(newMonth);
  };

  // Generate calendar days for monthly view
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: { date: Date; revenue: number; appointments: number }[] = [];

    // Add empty slots for days before the first day
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: new Date(0), revenue: 0, appointments: 0 });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayAppts = getAppointmentsForDate(date).filter(a => a.status === 'completed');
      const revenue = dayAppts.reduce((sum, a) => sum + (a.price || 0), 0);
      days.push({ date, revenue, appointments: dayAppts.length });
    }

    return days;
  };

  return (
    <div className="flex flex-col min-h-full bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Header */}
      <div className="bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-zinc-900 border-b border-zinc-800/50 px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <button className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <Settings size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
            <Wallet size={24} className="text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-graffiti text-white tracking-wide">FLUXO CAIXA</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
                Sistema Operante
              </span>
            </div>
          </div>
        </div>

        {/* Total do Dia */}
        <div className="mt-6 text-center">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
            Total do Dia
          </p>
          <p className="text-5xl font-black text-white">
            <span className="text-xl text-green-500 mr-1">R$</span>
            {dailyStats.totalRealizado.toFixed(2).replace('.', ',')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {/* Meta Diaria */}
          <div className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Meta Diaria
              </span>
              <Target size={14} className="text-yellow-500" />
            </div>
            <p className="text-lg font-black text-white">
              R$ {dailyStats.totalRealizado.toFixed(0)}{' '}
              <span className="text-xs text-zinc-500 font-normal">/ 500</span>
            </p>
            <div className="mt-2 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((dailyStats.totalRealizado / 500) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Ticket Medio */}
          <div className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Ticket Medio
              </span>
              <TicketPercent size={14} className="text-cyan-500" />
            </div>
            <p className="text-lg font-black text-white">
              R$ {dailyStats.ticketMedio.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">{dailyStats.atendimentos} atendimentos</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-3 bg-zinc-900/50 border-b border-zinc-800/50">
        <div className="flex gap-1.5 bg-zinc-800/40 p-1.5 rounded-xl border border-zinc-700/30">
          {[
            { id: 'daily' as const, label: 'Diario', icon: Clock },
            { id: 'monthly' as const, label: 'Mensal', icon: Calendar },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale: 0.97 }}
                className={`relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 ${
                  isActive ? 'text-black' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="financeiroTab"
                    className="absolute inset-0 bg-yellow-500 rounded-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Icon size={16} className="relative z-10" />
                <span className="relative z-10 text-xs font-bold uppercase tracking-wider">
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'daily' ? (
            <motion.div
              key="daily"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4"
            >
              {/* Date Selector */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => changeDate(-1)}
                  className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                  <span className="text-sm font-bold text-white">
                    {selectedDate.toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                    })}
                  </span>
                </div>
                <button
                  onClick={() => changeDate(1)}
                  className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Transactions List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Historico Recente
                  </h3>
                  <span className="text-[10px] text-zinc-600 uppercase">
                    {completedToday.length} servicos
                  </span>
                </div>

                {completedToday.length === 0 ? (
                  <div className="text-center py-12 text-zinc-600">
                    <Scissors size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Nenhum atendimento finalizado</p>
                  </div>
                ) : (
                  completedToday.map(appt => (
                    <div
                      key={appt.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50"
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                        <Scissors size={16} className="text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {getServiceName(appt.serviceId || '')}
                        </p>
                        <p className="text-[10px] text-zinc-500">{appt.time}</p>
                      </div>
                      <span className="text-sm font-bold text-green-500">
                        +R$ {(appt.price || 0).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="monthly"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              {/* Month Selector */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => changeMonth(-1)}
                  className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-bold text-white uppercase">
                  {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => changeMonth(1)}
                  className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Monthly Summary */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-500/30 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-green-500" />
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">
                    Total do Mes
                  </span>
                </div>
                <p className="text-3xl font-black text-white">
                  R$ {monthlyStats.total.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {monthlyStats.atendimentos} atendimentos | Ticket: R${' '}
                  {monthlyStats.ticketMedio.toFixed(0)}
                </p>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-[10px] text-zinc-600 font-bold py-2">
                    {day}
                  </div>
                ))}
                {getCalendarDays().map((day, i) => {
                  if (day.date.getTime() === 0) {
                    return <div key={i} className="aspect-square" />;
                  }
                  const isToday = day.date.toDateString() === new Date().toDateString();
                  const hasRevenue = day.revenue > 0;

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedDate(day.date);
                        setActiveTab('daily');
                      }}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${
                        isToday
                          ? 'bg-yellow-500 text-black'
                          : hasRevenue
                          ? 'bg-green-500/20 border border-green-500/30 text-white'
                          : 'bg-zinc-800/30 text-zinc-500 hover:bg-zinc-700/50'
                      }`}
                    >
                      <span className="text-xs font-bold">{day.date.getDate()}</span>
                      {hasRevenue && (
                        <span className="text-[8px] text-green-400 font-bold">{day.revenue}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
