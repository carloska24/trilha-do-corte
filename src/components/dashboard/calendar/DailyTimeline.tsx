import React, { useState } from 'react';
import { formatName } from '../../../utils/formatters';
import {
  Clock,
  Trash2,
  Edit,
  CheckCircle2,
  Bell,
  Wallet,
  Plus,
  X,
  MoreVertical,
} from 'lucide-react';
import { ConfirmModal } from '../../ui/ConfirmModal';
import { useData } from '../../../contexts/DataContext';
import { api } from '../../../services/api';
import { Appointment, Service } from '../../../types';
import { getLocalISODate } from '../../../utils/dateUtils';
import { SERVICES as ALL_SERVICES } from '../../../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyTimelineProps {
  selectedDate: Date;
  onEditAppointment: (app: Appointment) => void;
  onNewAppointment: (time: string) => void;
  onSelectClient: (name: string) => void;
}

export const DailyTimeline: React.FC<DailyTimelineProps> = ({
  selectedDate,
  onEditAppointment,
  onNewAppointment,
  onSelectClient,
}) => {
  const { appointments, services, shopSettings, updateAppointments, clients } = useData();
  const [swipedAppId, setSwipedAppId] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    variant: 'danger',
    onConfirm: () => {},
  });

  // Helper to get service details
  const getServiceDetails = (id: string | number) => {
    if (!id)
      return { name: 'Serviço', category: 'Geral', icon: 'scissors', price: 'R$-', duration: 30 };

    const searchId = String(id).trim();
    const s =
      services.find(serv => String(serv.id).trim() === searchId) ||
      ALL_SERVICES.find(serv => String(serv.id).trim() === searchId);

    return (
      s || { name: 'Serviço', category: 'Geral', icon: 'scissors', price: 'R$-', duration: 30 }
    );
  };

  const getAppointmentsForDate = (date: Date) => {
    const targetDateKey = getLocalISODate(date);
    return appointments.filter(a => {
      const appDateKey = a.date.includes('T') ? a.date.split('T')[0] : a.date;
      return appDateKey === targetDateKey && a.status !== 'cancelled';
    });
  };

  const handleDragStart = (e: React.DragEvent, app: Appointment) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', app.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetTime: string) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain');
    if (!appId) return;

    const app = appointments.find(a => a.id === appId);
    if (!app || app.time === targetTime) return;

    const dateKey = getLocalISODate(selectedDate);

    // Get duration of the dragged appointment's service
    const service = services.find(s => s.id === app.serviceId);
    const appDuration = service?.duration || 30;

    // Parse target time to minutes
    const [targetHour, targetMin] = targetTime.split(':').map(Number);
    const targetStartMinutes = targetHour * 60 + targetMin;
    const targetEndMinutes = targetStartMinutes + appDuration;

    // Check for collisions with other appointments (excluding the one being moved)
    const hasCollision = appointments.some(other => {
      if (other.id === appId) return false;
      if (other.status === 'cancelled') return false;

      // Only check same date
      const otherDateKey = other.date.includes('T') ? other.date.split('T')[0] : other.date;
      if (otherDateKey !== dateKey) return false;

      const otherService = services.find(s => s.id === other.serviceId);
      const otherDuration = otherService?.duration || 30;

      const [otherHour, otherMin] = other.time.split(':').map(Number);
      const otherStartMinutes = otherHour * 60 + otherMin;
      const otherEndMinutes = otherStartMinutes + otherDuration;

      // Check if ranges overlap
      return !(targetEndMinutes <= otherStartMinutes || targetStartMinutes >= otherEndMinutes);
    });

    if (hasCollision) {
      // Show error toast - blocked by another appointment
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('showToast', {
          detail: '⚠️ Horário ocupado! Mova o outro cliente primeiro.',
        });
        window.dispatchEvent(event);
      }
      return;
    }

    const updatedAppointments = appointments.map(a =>
      a.id === appId ? { ...a, time: targetTime, date: dateKey } : a
    );
    updateAppointments(updatedAppointments);

    try {
      await api.updateAppointment(appId, {
        time: targetTime,
        date: dateKey,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelAppointment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenId(null);
    setConfirmModal({
      isOpen: true,
      title: 'Cancelar Agendamento',
      description: 'Deseja realmente cancelar este agendamento? O horário ficará livre novamente.',
      variant: 'danger',
      onConfirm: async () => {
        const updated = appointments.map(a =>
          a.id === id ? { ...a, status: 'cancelled' as const } : a
        );
        updateAppointments(updated);
        await api.updateAppointment(id, { status: 'cancelled' });

        setSwipedAppId(null);
        setSwipeDirection(null);
      },
    });
  };

  const handleNoShow = (id: string, e: React.MouseEvent, app: Appointment) => {
    e.stopPropagation();
    setMenuOpenId(null);

    setConfirmModal({
      isOpen: true,
      title: 'Confirmar Ausência',
      description:
        'Deseja marcar este agendamento como "Não Veio"? O cliente será penalizado e notificado via WhatsApp.',
      variant: 'danger',
      onConfirm: async () => {
        let phone = app.clientPhone;
        let client = clients.find(c => c.id === app.clientId);

        if (!client) {
          client = clients.find(c => c.name.toLowerCase() === app.clientName.toLowerCase());
        }

        if (!phone && client) phone = client.phone;

        const cleanPhone = phone?.replace(/\D/g, '') || '';
        const firstName = app.clientName.split(' ')[0];

        const message = `Olá *${firstName}*, notamos que você não compareceu ao seu horário hoje na *Trilha do Corte* 😕\n\n⚠️ *Aviso de Penalidade*: Para manter a qualidade da nossa agenda, pedimos que cancelamentos sejam feitos com **30 minutos de antecedência**.\n\n📉 Devido à ausência sem aviso, seu nível de fidelidade foi rebaixado.\n\nContamos com sua compreensão na próxima! 👊`;

        if (cleanPhone) {
          const link = `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(
            message
          )}`;
          window.open(link, '_blank');
        }

        if (client && client.id) {
          const currentLevel = client.level || 1;
          if (currentLevel > 1) {
            try {
              await api.updateClient(client.id, { level: currentLevel - 1 });
            } catch (err) {
              console.error('Failed to downgrade client', err);
            }
          }
        }

        const updated = appointments.map(a =>
          a.id === id ? { ...a, status: 'cancelled' as const } : a
        );
        updateAppointments(updated);
        await api.updateAppointment(id, { status: 'cancelled' });

        setSwipedAppId(null);
        setSwipeDirection(null);
      },
    });
  };

  const handleCompleteAppointment = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenId(null);
    const updated = appointments.map(a =>
      a.id === id ? { ...a, status: 'completed' as const } : a
    );
    updateAppointments(updated);
    await api.updateAppointment(id, { status: 'completed' });
    setSwipedAppId(null);
    setSwipeDirection(null);
  };

  const handleWhatsAppReminder = (
    e: React.MouseEvent,
    itemData: Appointment,
    serviceName: string
  ) => {
    e.stopPropagation();
    let phone = itemData.clientPhone;
    if (!phone) {
      const found = clients.find(c => c.name.toLowerCase() === itemData.clientName.toLowerCase());
      if (found && found.phone && found.phone.length > 8) phone = found.phone;
    }
    const clean = phone?.replace(/\D/g, '') || '';

    let sIcon = '✂️';
    const lowerName = serviceName.toLowerCase();
    if (lowerName.includes('barba') || lowerName.includes('pezinho')) sIcon = '💈';
    if (
      lowerName.includes('alisamento') ||
      lowerName.includes('selagem') ||
      lowerName.includes('hidrata')
    )
      sIcon = '🧴';
    if (lowerName.includes('sobrancelha')) sIcon = '📐';

    const msg = `🗓️ *Lembrete de Agendamento*\n💈 *Trilha do Corte*\n\nFala *${itemData.clientName}*, tudo certo? 👊\n\n${sIcon} *${serviceName}*\n⏰ *${itemData.time}*\n\n📍 *Local:* Trilha do Corte\n✅ Confirmado?`;

    const link = clean
      ? `https://api.whatsapp.com/send?phone=55${clean}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(link, '_blank');
  };

  // GENERATOR LOGIC
  const items: any[] = [];
  const dateKey = getLocalISODate(selectedDate);
  const exception = shopSettings.exceptions?.[dateKey];

  const startLimit = exception?.startHour ?? shopSettings.startHour;
  const endLimit = exception?.endHour ?? shopSettings.endHour;

  const isClosed = exception?.closed;

  if (
    selectedDate.getDay() === 0 ||
    (isClosed && !shopSettings.closedDays?.includes(selectedDate.getDay()))
  ) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500 opacity-50">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <h3 className="text-sm font-bold uppercase tracking-widest mb-1">
          {isClosed ? 'Agenda Fechada' : 'Domingo - Fechado'}
        </h3>
        <p className="text-[10px] uppercase tracking-widest opacity-60">Sem horários disponíveis</p>
      </div>
    );
  }

  let currentMinutes = startLimit * 60;
  const endMinutes = endLimit * 60;

  const dailyApps = getAppointmentsForDate(selectedDate).sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  while (currentMinutes < endMinutes) {
    const h = Math.floor(currentMinutes / 60);
    const m = currentMinutes % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    // Check if this is lunch time
    const lunchStart = exception?.lunchStart;
    const lunchEnd = exception?.lunchEnd;
    const isLunchTime =
      lunchStart !== undefined && lunchEnd !== undefined && h >= lunchStart && h < lunchEnd;

    const startingApps = dailyApps.filter(a => a.time === timeStr);

    if (isLunchTime && startingApps.length === 0) {
      // Show lunch break slot
      const lunchEndMinutes = lunchEnd * 60;
      const duration = Math.min(lunchEndMinutes - currentMinutes, 60);
      items.push({
        type: 'lunch',
        time: timeStr,
        duration: duration,
      });
      currentMinutes += duration;
    } else if (startingApps.length > 0) {
      let maxDuration = 0;
      startingApps.forEach(app => {
        const service = getServiceDetails(app.serviceId);
        const duration = service.duration || 30;
        if (duration > maxDuration) maxDuration = duration;
        items.push({ type: 'app', data: app, time: timeStr, service });
      });

      const nextStep = currentMinutes + maxDuration;
      const upcomingApp = dailyApps.find(a => {
        const [ah, am] = a.time.split(':').map(Number);
        const appStart = ah * 60 + am;
        return appStart > currentMinutes && appStart < nextStep;
      });

      if (upcomingApp) {
        const [uh, um] = upcomingApp.time.split(':').map(Number);
        currentMinutes = uh * 60 + um;
      } else {
        currentMinutes = nextStep;
      }
    } else {
      // Empty slot - use slotInterval from settings
      const slotInterval = shopSettings.slotInterval || 30;

      const nextApp = dailyApps.find(a => {
        const [ah, am] = a.time.split(':').map(Number);
        return ah * 60 + am > currentMinutes;
      });
      const nextAppStart = nextApp
        ? parseInt(nextApp.time.split(':')[0]) * 60 + parseInt(nextApp.time.split(':')[1])
        : endMinutes;

      // Calculate target end based on slotInterval
      let targetEnd = currentMinutes + slotInterval;

      // If there's an appointment before the next slot ends, stop there
      if (nextAppStart < targetEnd) {
        targetEnd = nextAppStart;
      }

      // Don't go past end of day
      if (targetEnd > endMinutes) targetEnd = endMinutes;

      // Check if this empty slot is in the past (only for today)
      const now = new Date();
      const isToday =
        selectedDate.getDate() === now.getDate() &&
        selectedDate.getMonth() === now.getMonth() &&
        selectedDate.getFullYear() === now.getFullYear();

      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const nowMinutes = currentHour * 60 + currentMin;

      // Only add empty slot if it's NOT in the past (or if it's a future date)
      if (!isToday || currentMinutes >= nowMinutes) {
        items.push({
          type: 'empty',
          time: timeStr,
          duration: targetEnd - currentMinutes,
        });
      }

      currentMinutes = targetEnd;
    }
  }

  return (
    <>
      {items.map((item, idx) => {
        const isPast = (() => {
          const now = new Date();
          const current = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours(),
            now.getMinutes()
          );
          const slotDate = new Date(selectedDate);
          const [h, m] = item.time.split(':').map(Number);
          slotDate.setHours(h, m, 0, 0);
          return slotDate < current;
        })();

        return (
          <motion.div
            key={`${item.time}-${idx}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, item.time)}
            className={`flex border-b border-zinc-800/50 group transition-colors duration-200 ${
              item.type === 'app' ? 'min-h-[90px]' : 'min-h-[50px]'
            } ${item.type === 'empty' && !isPast ? 'hover:bg-zinc-900/30' : ''} ${
              menuOpenId === item.data?.id ? 'z-50 relative' : 'relative'
            }`}
          >
            {/* Time Column */}
            <div
              id={`hour-${item.time.split(':')[0]}`}
              className={`w-16 py-3 pl-3 text-sm font-mono font-bold flex flex-col items-start justify-center border-r border-zinc-800/50 ${
                isPast ? 'text-zinc-600 opacity-50' : 'text-zinc-500'
              }`}
            >
              <span className={item.type === 'app' ? 'text-white' : ''}>{item.time}</span>
            </div>

            {/* Content Column */}
            <div className="flex-1 px-2 py-2 relative">
              {item.type === 'app' && (
                <motion.div
                  draggable={item.data.status !== 'completed'}
                  onDragStart={e => handleDragStart(e as unknown as React.DragEvent, item.data)}
                  className={`w-full h-full rounded-2xl relative group/card cursor-grab active:cursor-grabbing transition-all duration-300 ${
                    item.data.status === 'completed'
                      ? 'bg-gradient-to-br from-emerald-950/90 via-emerald-900/40 to-zinc-950 border border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                      : 'bg-gradient-to-br from-amber-950/50 via-zinc-900/90 to-zinc-950 border border-amber-500/40 hover:border-amber-400/70 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                  }`}
                  whileHover={{ scale: 1.015, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    if (menuOpenId === item.data.id) {
                      setMenuOpenId(null);
                    } else {
                      onSelectClient(item.data.clientName);
                    }
                  }}
                >
                  {/* Status Accent Line with Glow */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      item.data.status === 'completed'
                        ? 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 shadow-[0_0_12px_#10b981]'
                        : 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 shadow-[0_0_10px_#f59e0b]'
                    }`}
                  />

                  {/* Main Content - Layout: Avatar (esq) + 3 Linhas (dir) */}
                  <div className="flex items-stretch h-full pl-4 pr-2 py-3 gap-3">
                    {/* === COLUNA 1: AVATAR (Fixo 56px) === */}
                    {(() => {
                      const clientData = clients.find(c => c.id === item.data.clientId);
                      const avatarUrl = clientData?.img || item.data.photoUrl;
                      return (
                        <div
                          className={`relative flex-shrink-0 self-center ${
                            item.data.status !== 'completed'
                              ? 'group-hover/card:scale-105 transition-transform duration-300'
                              : ''
                          }`}
                        >
                          <div
                            className={`w-14 h-14 rounded-xl overflow-hidden ring-2 ${
                              item.data.status === 'completed'
                                ? 'ring-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                : 'ring-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            }`}
                          >
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={item.data.clientName}
                                className="w-full h-full object-cover"
                                onError={e => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (
                                    e.target as HTMLImageElement
                                  ).nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-full h-full flex items-center justify-center text-xl font-black ${
                                avatarUrl ? 'hidden' : ''
                              } ${
                                item.data.status === 'completed'
                                  ? 'bg-emerald-900/60 text-emerald-400'
                                  : 'bg-amber-900/50 text-amber-400'
                              }`}
                            >
                              {item.data.clientName?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          </div>
                          {/* Status Check for Completed */}
                          {item.data.status === 'completed' && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-zinc-900 flex items-center justify-center shadow-[0_0_8px_#10b981]">
                              <CheckCircle2 size={11} className="text-black" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* === COLUNA 2: CONTEÚDO (3 Linhas) === */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                      {/* LINHA 1: Nome + Badge Status */}
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          className={`font-black text-base uppercase tracking-wide truncate ${
                            item.data.status === 'completed' ? 'text-emerald-100' : 'text-white'
                          }`}
                        >
                          {formatName(item.data.clientName)}
                        </h3>

                        {/* Status Badge */}
                        {item.data.status === 'completed' ? (
                          <span className="flex-shrink-0 flex items-center gap-1 bg-emerald-500 text-black px-2 py-0.5 rounded text-[8px] font-black uppercase">
                            <Wallet size={9} />
                            PAGO
                          </span>
                        ) : (
                          <span className="flex-shrink-0 bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">
                            AGUARDA
                          </span>
                        )}
                      </div>

                      {/* LINHA 2: Serviço */}
                      <div className="flex items-center">
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider truncate ${
                            item.data.status === 'completed'
                              ? 'text-emerald-300/80'
                              : 'text-zinc-400'
                          }`}
                        >
                          ✂️ {item.service.name}
                        </span>
                      </div>

                      {/* LINHA 3: Duração + Preço */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[11px] font-medium ${
                            item.data.status === 'completed'
                              ? 'text-emerald-500/60'
                              : 'text-zinc-500'
                          }`}
                        >
                          {item.service.duration || 30}min
                        </span>

                        <span
                          className={`font-black text-base ${
                            item.data.status === 'completed'
                              ? 'text-emerald-400'
                              : 'text-yellow-500'
                          }`}
                        >
                          R${item.data.price || item.service.priceValue || 0}
                        </span>
                      </div>
                    </div>

                    {/* === COLUNA 3: MENU (somente se pendente) === */}
                    {item.data.status !== 'completed' && (
                      <div className="relative flex-shrink-0 self-center">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setMenuOpenId(menuOpenId === item.data.id ? null : item.data.id);
                          }}
                          className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-all"
                        >
                          <MoreVertical size={16} />
                        </button>
                        <AnimatePresence>
                          {menuOpenId === item.data.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -5 }}
                              className="absolute right-0 top-full mt-1 z-[999] bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-xl shadow-2xl overflow-hidden min-w-[130px]"
                            >
                              <button
                                onClick={e => handleCompleteAppointment(item.data.id, e)}
                                className="w-full px-3 py-2.5 flex items-center gap-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                              >
                                <CheckCircle2 size={14} />
                                Finalizar
                              </button>
                              <button
                                onClick={e =>
                                  handleWhatsAppReminder(e, item.data, item.service.name)
                                }
                                className="w-full px-3 py-2.5 flex items-center gap-2 text-xs font-bold text-green-400 hover:bg-green-500/10 transition-colors"
                              >
                                <Bell size={14} />
                                Lembrar
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setMenuOpenId(null);
                                  onEditAppointment(item.data);
                                }}
                                className="w-full px-3 py-2.5 flex items-center gap-2 text-xs font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                              >
                                <Edit size={14} />
                                Editar
                              </button>
                              <button
                                onClick={e => handleNoShow(item.data.id, e, item.data)}
                                className="w-full px-3 py-2.5 flex items-center gap-2 text-xs font-bold text-orange-400 hover:bg-orange-500/10 transition-colors"
                              >
                                <X size={14} />
                                Não Veio
                              </button>
                              <button
                                onClick={e => handleCancelAppointment(item.data.id, e)}
                                className="w-full px-3 py-2.5 flex items-center gap-2 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 size={14} />
                                Cancelar
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              {item.type === 'lunch' && (
                // LUNCH BREAK SLOT
                <div className="w-full h-full flex items-center justify-center cursor-not-allowed">
                  <div className="w-full h-full flex items-center justify-center bg-amber-950/30 border border-dashed border-amber-500/30 rounded-lg mx-1">
                    <div className="flex items-center gap-2 text-amber-500/70">
                      <span className="text-lg">🍔</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Almoço
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {item.type === 'empty' && (
                // EMPTY SLOT - Minimal
                <div
                  className={`w-full h-full flex items-center justify-center ${
                    isPast ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'
                  }`}
                  onClick={() => {
                    if (isPast) return;
                    onNewAppointment(item.time);
                  }}
                >
                  <div
                    className={`w-full h-full flex items-center justify-center transition-all ${
                      isPast ? '' : 'group-hover:bg-yellow-500/5'
                    }`}
                  >
                    {isPast ? (
                      <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">
                        ─
                      </span>
                    ) : (
                      <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                        <div className="h-px w-8 bg-zinc-700 group-hover:bg-yellow-500/50" />
                        <Plus
                          className="text-zinc-600 group-hover:text-yellow-500 transition-colors"
                          size={16}
                        />
                        <div className="h-px w-8 bg-zinc-700 group-hover:bg-yellow-500/50" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.description}
        isDanger={confirmModal.variant === 'danger'}
        confirmLabel="Confirmar"
        cancelLabel="Voltar"
      />
    </>
  );
};
