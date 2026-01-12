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

    const startingApps = dailyApps.filter(a => a.time === timeStr);

    if (startingApps.length > 0) {
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
      const nextApp = dailyApps.find(a => {
        const [ah, am] = a.time.split(':').map(Number);
        return ah * 60 + am > currentMinutes;
      });
      const nextAppStart = nextApp
        ? parseInt(nextApp.time.split(':')[0]) * 60 + parseInt(nextApp.time.split(':')[1])
        : endMinutes;
      const nextHourMark = (Math.floor(currentMinutes / 60) + 1) * 60;
      let targetEnd = Math.min(nextAppStart, nextHourMark);
      if (targetEnd <= currentMinutes) targetEnd = currentMinutes + 15;
      if (targetEnd > endMinutes) targetEnd = endMinutes;

      items.push({
        type: 'empty',
        time: timeStr,
        duration: targetEnd - currentMinutes,
      });
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
              {item.type === 'app' ? (
                <div className="h-full px-1">
                  {/* Premium Appointment Card */}
                  <motion.div
                    draggable={item.data.status !== 'completed'}
                    onDragStart={e => handleDragStart(e as unknown as React.DragEvent, item.data)}
                    className={`w-full h-full rounded-xl border relative group/card transition-all duration-300 cursor-grab active:cursor-grabbing ${
                      item.data.status === 'completed'
                        ? 'bg-gradient-to-br from-emerald-950/80 to-zinc-950 border-emerald-500/40'
                        : 'bg-gradient-to-br from-zinc-800/50 to-zinc-900/80 border-zinc-700/50 hover:border-yellow-500/40'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => {
                      if (menuOpenId === item.data.id) {
                        setMenuOpenId(null);
                      } else {
                        onSelectClient(item.data.clientName);
                      }
                    }}
                  >
                    {/* Status Accent Line */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 ${
                        item.data.status === 'completed'
                          ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]'
                          : item.data.status === 'confirmed'
                          ? 'bg-green-500 shadow-[0_0_8px_#22c55e]'
                          : 'bg-yellow-500 shadow-[0_0_8px_#eab308]'
                      }`}
                    />

                    {/* Card Content */}
                    <div className="flex flex-col h-full pl-3">
                      {/* Header Row */}
                      <div className="flex items-center justify-between py-2 pr-2 border-b border-zinc-700/30">
                        <h3
                          className={`font-bold text-sm uppercase tracking-wide truncate flex items-center gap-2 ${
                            item.data.status === 'completed' ? 'text-emerald-200' : 'text-white'
                          }`}
                        >
                          {formatName(item.data.clientName)}
                          {item.data.status === 'completed' && (
                            <CheckCircle2 size={14} className="text-emerald-400" />
                          )}
                        </h3>

                        {/* Quick Actions */}
                        {item.data.status !== 'completed' && (
                          <div className="flex items-center gap-1">
                            {/* WhatsApp Reminder */}
                            <button
                              onClick={e => handleWhatsAppReminder(e, item.data, item.service.name)}
                              className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-all"
                              title="Enviar lembrete"
                            >
                              <Bell size={14} />
                            </button>

                            {/* Complete Action */}
                            <button
                              onClick={e => handleCompleteAppointment(item.data.id, e)}
                              className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-all"
                              title="Concluir"
                            >
                              <CheckCircle2 size={14} />
                            </button>

                            {/* More Menu */}
                            <div className="relative">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setMenuOpenId(menuOpenId === item.data.id ? null : item.data.id);
                                }}
                                className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-700 rounded-lg transition-all"
                              >
                                <MoreVertical size={14} />
                              </button>

                              {/* Dropdown Menu */}
                              <AnimatePresence>
                                {menuOpenId === item.data.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                    className="absolute right-0 top-full mt-1 z-[999] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden min-w-[140px]"
                                  >
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
                          </div>
                        )}

                        {/* Completed Badge */}
                        {item.data.status === 'completed' && (
                          <div className="flex items-center gap-1 bg-emerald-500 text-black px-2 py-0.5 rounded-lg text-[9px] font-black uppercase">
                            <Wallet size={10} />
                            PAGO
                          </div>
                        )}
                      </div>

                      {/* Body Row */}
                      <div className="flex-1 flex items-center justify-between py-2 pr-3">
                        <div className="flex flex-col">
                          <span
                            className={`text-xs font-bold uppercase tracking-wide ${
                              item.data.status === 'completed'
                                ? 'text-emerald-300/70'
                                : 'text-zinc-400'
                            }`}
                          >
                            ✂️ {item.service.name}
                          </span>
                          <span
                            className={`text-[10px] mt-0.5 ${
                              item.data.status === 'completed'
                                ? 'text-emerald-500/60'
                                : 'text-zinc-600'
                            }`}
                          >
                            ⏱️ {item.service.duration || 30} min
                          </span>
                        </div>

                        <span
                          className={`font-black text-sm ${
                            item.data.status === 'completed'
                              ? 'text-emerald-400'
                              : 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]'
                          }`}
                        >
                          R$ {item.data.price || item.service.priceValue || 0}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ) : (
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
