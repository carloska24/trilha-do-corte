import React, { useState, useEffect } from 'react';
import {
  X,
  Edit,
  Calendar,
  Phone,
  Star,
  MessageSquare,
  History,
  ChevronDown,
  ChevronUp,
  Clock,
  Scissors,
  MapPin,
  Link,
  Sparkles,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Client, Appointment, Service } from '../types';
import { generateWhatsAppLink } from '../../utils/whatsappUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface ClientProfileModalProps {
  client: Client;
  onClose: () => void;
  onNewBooking?: (client: Client) => void;
  appointments: Appointment[];
  services: Service[];
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({
  client,
  onClose,
  appointments = [],
  services = [],
}) => {
  if (!client) return null;

  /* State for Notes & History */
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(client.notes || '');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [animatedRating, setAnimatedRating] = useState(0);
  const [animatedVisits, setAnimatedVisits] = useState(0);

  // Check if needs formalization
  const isTemp =
    client.status === 'new' ||
    client.status === 'guest' ||
    !client.email ||
    !client.phone ||
    client.phone === '00000000000' ||
    client.phone.replace(/\D/g, '').length < 8;

  /* --- ACTIONS --- */
  const handleWhatsApp = () => {
    const phone = client.phone?.replace(/\D/g, '') || '';

    if (isTemp) {
      const magicLink = `${window.location.origin}/login?action=register&name=${encodeURIComponent(
        client.name
      )}&phone=${encodeURIComponent(client.phone)}`;

      const message = `Olá ${client.name}! ✂️\n\nAqui é da Trilha do Corte. Seu pré-cadastro foi feito via IA.\n\nClique no link abaixo para finalizar seu cadastro e ter acesso exclusivo aos horários:\n\n${magicLink}`;

      const link = generateWhatsAppLink(phone.length >= 10 ? client.phone : '', message);
      window.open(link, '_blank');
    } else {
      const msg = `Ola, ${client.name}! \uD83D\uDC88\n\nTudo bem?`;
      const whatsappUrl = `https://api.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent(
        msg
      )}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleSaveNotes = () => {
    setIsEditingNotes(false);
  };

  /* --- HELPERS --- */
  const getServiceName = (app: Appointment | undefined) => {
    if (!app) return 'Serviço Personalizado';

    if (app.serviceId) {
      const s = services.find(serv => serv.id === app.serviceId);
      if (s) return s.name;
    }

    if (app.notes && app.notes.includes('Serviço Solicitado:')) {
      try {
        return app.notes.split('Serviço Solicitado:')[1].trim();
      } catch (e) {}
    }

    return 'Serviço Personalizado';
  };

  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatAppDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    return date
      .toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      })
      .toUpperCase();
  };

  /* --- DATA LOGIC --- */
  const clientApps = appointments.filter(
    app => app.clientName.toLowerCase() === client.name.toLowerCase()
  );

  const now = new Date();
  const isFuture = (app: Appointment) => {
    const appDateTime = new Date(`${app.date}T${app.time}:00`);
    return appDateTime >= now;
  };

  const completedApps = clientApps.filter(a => a.status === 'completed');
  const futureApps = clientApps
    .filter(a => a.status !== 'cancelled' && a.status !== 'completed' && isFuture(a))
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
    );

  const totalVisits = completedApps.length;
  const rating = Math.min(5, totalVisits);

  // ========== HOT CLIENT DETECTION ==========
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const appointmentsThisMonth = clientApps.filter(apt => {
    if (apt.status === 'completed' || apt.status === 'confirmed' || apt.status === 'pending') {
      try {
        const [year, month] = apt.date.split('-').map(Number);
        return year === currentYear && month - 1 === currentMonth;
      } catch (e) {
        return false;
      }
    }
    return false;
  }).length;
  const isHotClient = appointmentsThisMonth >= 3;

  // ========== RECURRENCE STATUS (Same as ClientCard) ==========
  const getRecurrenceStatus = () => {
    if (!client.lastVisit || client.lastVisit === 'Nunca') {
      return { color: 'bg-blue-500', label: 'Novo', glow: 'shadow-[0_0_10px_#3b82f6]' };
    }
    try {
      const parts = client.lastVisit.split('/');
      if (parts.length === 3) {
        const visitDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const diffDays = Math.ceil(
          Math.abs(new Date().getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays > 60)
          return { color: 'bg-red-500', label: 'Risco', glow: 'shadow-[0_0_10px_#ef4444]' };
        if (diffDays > 30)
          return { color: 'bg-yellow-500', label: 'Atenção', glow: 'shadow-[0_0_10px_#eab308]' };
        return { color: 'bg-green-500', label: 'Ativo', glow: 'shadow-[0_0_10px_#22c55e]' };
      }
    } catch (e) {}
    return { color: 'bg-green-500', label: 'Ativo', glow: 'shadow-[0_0_10px_#22c55e]' };
  };
  const recurrence = getRecurrenceStatus();

  // Animate counters
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedRating(rating);
      setAnimatedVisits(totalVisits);
    }, 300);
    return () => clearTimeout(timer);
  }, [rating, totalVisits]);

  // Tier Logic - SYNCED with ClientCard (using client.level)
  const level = client.level || 1;
  type Tier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

  const getTier = (): {
    name: Tier;
    color: string;
    border: string;
    bg: string;
    glow: string;
    ringColor: string;
    icon: string;
    badge: string;
  } => {
    if (level >= 8)
      return {
        name: 'PLATINUM',
        color: 'text-purple-400',
        border: 'border-purple-400/50',
        bg: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20',
        glow: 'shadow-[0_0_30px_rgba(168,85,247,0.5)]',
        ringColor: 'border-purple-400',
        icon: '💎',
        badge: 'from-purple-500 to-pink-500 text-purple-100',
      };
    if (level >= 5)
      return {
        name: 'GOLD',
        color: 'text-yellow-400',
        border: 'border-yellow-400/50',
        bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
        glow: 'shadow-[0_0_25px_rgba(250,204,21,0.5)]',
        ringColor: 'border-yellow-400',
        icon: '🏆',
        badge: 'from-yellow-500 to-orange-500 text-yellow-100',
      };
    if (level >= 3)
      return {
        name: 'SILVER',
        color: 'text-cyan-400',
        border: 'border-cyan-400/50',
        bg: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20',
        glow: 'shadow-[0_0_20px_rgba(34,211,238,0.5)]',
        ringColor: 'border-cyan-400',
        icon: '⭐',
        badge: 'from-cyan-500 to-blue-600 text-cyan-100',
      };
    return {
      name: 'BRONZE',
      color: 'text-green-400',
      border: 'border-green-500/50',
      bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
      glow: 'shadow-[0_0_15px_rgba(34,197,94,0.4)]',
      ringColor: 'border-green-500',
      icon: '🌱',
      badge: 'from-green-600 to-green-800 text-green-100',
    };
  };

  const tier = getTier();

  const getDateParts = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date
      .toLocaleDateString('pt-BR', { month: 'short' })
      .toUpperCase()
      .replace('.', '');
    const weekday = date
      .toLocaleDateString('pt-BR', { weekday: 'short' })
      .toUpperCase()
      .replace('.', '');
    return { day, month, weekday };
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
      >
        {/* MAIN CARD */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-sm bg-zinc-950 rounded-3xl border border-zinc-800/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* === HEADER - HERO SECTION === */}
          <div
            className={`relative pt-8 pb-6 px-6 text-center border-b transition-all duration-500 ${
              isHotClient
                ? 'bg-gradient-to-b from-orange-900/30 via-zinc-900/95 to-zinc-950 border-orange-500/30'
                : 'bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-zinc-950 border-zinc-800/50'
            }`}
          >
            {/* Decorative Background Glow */}
            <div
              className={`absolute inset-0 ${
                isHotClient
                  ? 'bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10'
                  : tier.bg
              } opacity-30 blur-3xl`}
            />

            {/* 🔥 HOT Client Flame Effect */}
            {isHotClient && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute bottom-0 left-1/4 w-3 h-12 bg-gradient-to-t from-orange-600/40 to-transparent rounded-full blur-sm animate-[flicker_0.5s_ease-in-out_infinite]" />
                <div className="absolute bottom-0 left-1/2 w-4 h-16 bg-gradient-to-t from-red-500/30 to-yellow-500/10 rounded-full blur-sm animate-[flicker_0.3s_ease-in-out_infinite_0.1s]" />
                <div className="absolute bottom-0 right-1/4 w-3 h-10 bg-gradient-to-t from-orange-500/40 to-transparent rounded-full blur-sm animate-[flicker_0.4s_ease-in-out_infinite_0.2s]" />
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-all bg-zinc-800/50 hover:bg-zinc-700 p-2.5 rounded-xl backdrop-blur-md z-50 group"
            >
              <X size={16} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Avatar with Animated Tier Ring */}
            <div className="relative inline-block mb-4">
              {/* Pulsing Glow Ring */}
              <div
                className={`absolute inset-[-8px] rounded-full ${
                  isHotClient ? 'bg-gradient-to-br from-orange-500/40 to-red-500/40' : tier.bg
                } animate-pulse blur-xl opacity-60`}
              />
              <div
                className={`absolute inset-[-4px] rounded-full border-2 ${
                  isHotClient ? 'border-orange-400/50' : tier.border
                } animate-[spin_8s_linear_infinite] opacity-40`}
              />

              {/* Avatar Container with Tier Ring Color */}
              <div
                className={`relative w-24 h-24 rounded-full p-[3px] border-2 ${
                  isHotClient ? 'border-orange-400' : tier.ringColor
                } ${
                  isHotClient ? 'shadow-[0_0_25px_rgba(249,115,22,0.5)]' : tier.glow
                } transition-all duration-300`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-black/50 border border-white/5 relative">
                  <img
                    src={
                      client.img ||
                      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
                    }
                    alt={client.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>

                {/* Recurrence Status Indicator (Bottom Right) */}
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-zinc-900 ${
                    recurrence.color
                  } ${recurrence.glow} z-20 transition-all ${
                    isTemp ? 'animate-pulse bg-neon-yellow' : ''
                  }`}
                />

                {/* 🔥 HOT Badge on Avatar */}
                {isHotClient && (
                  <div className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.6)] animate-bounce z-30">
                    <span className="text-sm">🔥</span>
                  </div>
                )}

                {/* Tier Icon Badge (Top Right) */}
                <div
                  className={`absolute -top-1 -right-1 w-7 h-7 rounded-full ${tier.bg} border-2 border-zinc-900 flex items-center justify-center text-sm ${tier.glow}`}
                >
                  {tier.icon}
                </div>
              </div>
            </div>

            {/* Name & Badges */}
            <div className="relative z-10">
              <h2
                className={`text-2xl font-black uppercase tracking-wide mb-3 drop-shadow-lg transition-colors ${
                  isHotClient ? 'text-orange-100' : 'text-white'
                }`}
              >
                {client.name}
              </h2>

              <div className="flex items-center justify-center gap-2 flex-wrap">
                {/* Level Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring' }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r ${tier.badge} shadow-lg`}
                >
                  <Star size={10} className="fill-current" />
                  <span className="text-[9px] font-black tracking-wider">LVL {level}</span>
                </motion.div>

                {/* Tier Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className={`px-3 py-1.5 rounded-lg border ${tier.border} bg-white/5 flex items-center gap-2 backdrop-blur-sm`}
                >
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${tier.color}`}
                  >
                    {tier.name}
                  </span>
                </motion.div>

                {/* PROVISÓRIO Badge */}
                {isTemp && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.25, type: 'spring' }}
                    className="px-2.5 py-1.5 rounded-lg bg-neon-yellow/20 border border-neon-yellow/30 animate-pulse"
                  >
                    <span className="text-[9px] font-bold text-neon-yellow tracking-wider">
                      PROVISÓRIO
                    </span>
                  </motion.div>
                )}

                {/* 🔥 HOT Badge */}
                {isHotClient && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_10px_rgba(249,115,22,0.4)] animate-pulse"
                  >
                    <span className="text-sm">🔥</span>
                    <span className="text-[9px] font-black text-white tracking-wider">HOT</span>
                  </motion.div>
                )}
              </div>

              {/* Recurrence Status Label */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-3 flex items-center justify-center gap-2"
              >
                <div className={`w-2 h-2 rounded-full ${recurrence.color} ${recurrence.glow}`} />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {recurrence.label} • {appointmentsThisMonth}x este mês
                </span>
              </motion.div>
            </div>

            {/* Action Buttons - Glassmorphism */}
            <div className="grid grid-cols-2 gap-3 mt-6 relative z-10">
              <a
                href={`tel:${client.phone}`}
                className="group flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-zinc-700/50 hover:border-zinc-600 transition-all backdrop-blur-md"
              >
                <Phone
                  size={18}
                  className="text-zinc-400 group-hover:text-white transition-colors"
                />
                <span className="text-xs font-bold text-zinc-400 group-hover:text-white uppercase tracking-wider">
                  Ligar
                </span>
              </a>

              <button
                onClick={handleWhatsApp}
                className="group flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 transition-all backdrop-blur-md"
              >
                <svg viewBox="0 0 512 512" className="w-5 h-5 text-green-500 fill-current">
                  <path d="m317.12 285.93c-9.69 3.96-15.88 19.13-22.16 26.88-3.22 3.97-7.06 4.59-12.01 2.6-36.37-14.49-64.25-38.76-84.32-72.23-3.4-5.19-2.79-9.29 1.31-14.11 6.06-7.14 13.68-15.25 15.32-24.87 3.64-21.28-24.18-87.29-60.92-57.38-105.72 86.15 176.36 314.64 227.27 191.06 14.4-35.03-48.43-58.53-64.49-51.95zm-61.12 181.35c-37.39 0-74.18-9.94-106.39-28.76-5.17-3.03-11.42-3.83-17.2-2.26l-69.99 19.21 24.38-53.71c3.32-7.31 2.47-15.82-2.22-22.32-26.08-36.15-39.87-78.83-39.87-123.44 0-116.51 94.78-211.29 211.29-211.29s211.28 94.78 211.28 211.29c0 116.5-94.78 211.28-211.28 211.28zm0-467.28c-141.16 0-256 114.84-256 256 0 49.66 14.1 97.35 40.89 138.74l-38.89 85.65c-3.59 7.91-2.28 17.17 3.34 23.76 4.32 5.05 10.57 7.85 17.02 7.85 14.42 0 93.05-24.71 113.06-30.2 36.99 19.79 78.48 30.2 120.58 30.2 141.15 0 256-114.85 256-256 0-141.16-114.85-256-256-256z" />
                </svg>
                <span className="text-xs font-bold text-green-500 uppercase tracking-wider">
                  WhatsApp
                </span>
              </button>
            </div>
          </div>

          {/* === SCROLLABLE CONTENT === */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 custom-scrollbar">
            {/* METRICS ROW - Premium Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Rating Card with Radial */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={`relative bg-zinc-900/80 rounded-2xl p-4 border ${tier.border} overflow-hidden group`}
              >
                <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                  <Star size={80} className={tier.color} />
                </div>

                {/* Radial Progress */}
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-zinc-800"
                    />
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      className={tier.color}
                      initial={{ strokeDasharray: '0 176' }}
                      animate={{ strokeDasharray: `${(animatedRating / 5) * 176} 176` }}
                      transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-black ${tier.color}`}>
                      {animatedRating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-center">
                  Rating
                </span>
              </motion.div>

              {/* Visits Card with Counter */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800 overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                  <History size={80} className="text-zinc-500" />
                </div>

                <div className="text-center">
                  <motion.span
                    className="text-4xl font-black text-white block"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {animatedVisits}
                  </motion.span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                    Visitas
                  </span>

                  {/* Progress to next tier */}
                  {tier.next && (
                    <div className="mt-3">
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${tier.bg}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${tier.progress}%` }}
                          transition={{ duration: 1, delay: 0.6 }}
                        />
                      </div>
                      <span className="text-[8px] text-zinc-600 mt-1 block">→ {tier.next}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* NEXT APPOINTMENTS - Premium Ticket Style */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-yellow-500" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                  {futureApps.length > 1 ? 'Próximas Viagens' : 'Próxima Viagem'}
                </span>
              </div>

              {futureApps.length > 0 ? (
                <div className="space-y-3">
                  {futureApps.slice(0, 3).map((app, idx) => {
                    const parts = getDateParts(app.date);
                    return (
                      <motion.div
                        key={app.id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                        className="group relative bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden hover:border-yellow-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.1)]"
                      >
                        {/* Ticket Background Pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage:
                                'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)',
                            }}
                          />
                        </div>

                        <div className="flex relative">
                          {/* Date Section */}
                          <div className="w-20 bg-zinc-800/50 border-r border-dashed border-zinc-700 flex flex-col items-center justify-center py-4">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                              {parts.weekday}
                            </span>
                            <span className="text-3xl font-black text-white leading-none my-1">
                              {parts.day}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                              {parts.month}
                            </span>
                          </div>

                          {/* Details Section */}
                          <div className="flex-1 p-4 flex flex-col justify-center">
                            <div className="flex items-start justify-between">
                              <span className="text-sm font-black text-white uppercase tracking-wide leading-tight">
                                {getServiceName(app)}
                              </span>
                              {idx === 0 && (
                                <span className="text-[8px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                                  PRÓXIMO
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-1.5 text-zinc-400 bg-zinc-800/50 px-2.5 py-1 rounded-lg">
                                <Clock size={12} />
                                <span className="text-xs font-bold font-mono text-zinc-300">
                                  {app.time}
                                </span>
                              </div>
                              <span className="text-base font-black text-yellow-500">
                                R$ {app.price}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Scissors decoration */}
                        <div className="absolute left-[76px] top-1/2 -translate-y-1/2 -translate-x-1/2 text-zinc-600 rotate-90">
                          ✂️
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-dashed border-zinc-800 rounded-2xl p-8 text-center">
                  <Calendar size={24} className="mx-auto text-zinc-700 mb-2" />
                  <p className="text-xs text-zinc-600 font-medium">Nenhum agendamento futuro</p>
                </div>
              )}
            </div>

            {/* HISTORY - Timeline Style */}
            <div className="border-t border-zinc-800/50 pt-4">
              <button
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="w-full flex justify-between items-center py-3 group hover:bg-zinc-900/50 px-3 -mx-3 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  <History size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Histórico de Cortes ({completedApps.length})
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isHistoryOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={14} className="text-zinc-600" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isHistoryOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 border-l-2 border-zinc-800 ml-2 space-y-4 py-4">
                      {completedApps.length === 0 ? (
                        <p className="text-[10px] text-zinc-600 italic">Nenhum corte finalizado.</p>
                      ) : (
                        completedApps
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .slice(0, 5)
                          .map((app, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="relative flex justify-between items-baseline group"
                            >
                              {/* Timeline Dot with Glow */}
                              <div
                                className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-zinc-900 border-2 ${tier.border} group-hover:scale-125 transition-transform`}
                              >
                                <div
                                  className={`absolute inset-0 rounded-full ${tier.bg} opacity-0 group-hover:opacity-100 blur-sm transition-opacity`}
                                />
                              </div>

                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
                                  {formatAppDate(app.date)}
                                </span>
                                <span className="text-[10px] text-zinc-500">
                                  {getServiceName(app)}
                                </span>
                              </div>

                              <span className="text-[10px] font-mono text-zinc-500">
                                R$ {app.price}
                              </span>
                            </motion.div>
                          ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* NOTES - Terminal Style */}
            <div className="pb-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare size={12} />
                  Notas do Barbeiro
                </span>
                <button
                  onClick={() => (isEditingNotes ? handleSaveNotes() : setIsEditingNotes(true))}
                  className="text-zinc-600 hover:text-yellow-500 transition-colors p-1"
                >
                  <Edit size={12} />
                </button>
              </div>

              <div
                className={`bg-zinc-900/80 border rounded-xl p-4 min-h-[80px] font-mono text-sm transition-all ${
                  isEditingNotes
                    ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                    : 'border-zinc-800'
                }`}
              >
                {isEditingNotes ? (
                  <div className="relative">
                    <span className="text-green-500 select-none">{'> '}</span>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full bg-transparent text-zinc-300 focus:outline-none resize-none inline"
                      placeholder="Digite uma observação..."
                      autoFocus
                      rows={3}
                    />
                    <span className="animate-pulse text-green-500">▋</span>
                  </div>
                ) : (
                  <div className="text-zinc-400">
                    <span className="text-zinc-600 select-none">{'> '}</span>
                    {notes || <span className="italic text-zinc-600">Sem observações...</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
