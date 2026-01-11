import React, { useState } from 'react';
import { Clock, Trash2, Edit, CheckCircle2, Bell, Wallet, Plus } from 'lucide-react';
import { ConfirmModal } from '../../ui/ConfirmModal';
import { useData } from '../../../contexts/DataContext';
import { api } from '../../../services/api'; // Adjust path
import { Appointment, Service } from '../../../types';
import { getLocalISODate } from '../../../utils/dateUtils';
import { SERVICES as ALL_SERVICES } from '../../../constants';

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

    const dateKey = getLocalISODate(selectedDate); // Move to selected date/time

    // Optimistic Update
    const updatedAppointments = appointments.map(a =>
      a.id === appId ? { ...a, time: targetTime, date: dateKey } : a
    );
    updateAppointments(updatedAppointments);

    // API Call
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

    setConfirmModal({
      isOpen: true,
      title: 'Confirmar Ausência',
      description:
        'Deseja marcar este agendamento como "Não Veio"? O cliente será penalizado e notificado via WhatsApp.',
      variant: 'danger',
      onConfirm: async () => {
        // 1. WhatsApp Notification
        let phone = app.clientPhone;
        let client = clients.find(c => c.id === app.clientId);

        // Fallback search by name
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

        // 2. Downgrade Level (Penalty)
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

        // 3. Cancel Appointment
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

  if (selectedDate.getDay() === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500 opacity-50">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <h3 className="text-sm font-bold uppercase tracking-widest mb-1">Domingo - Fechado</h3>
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
          <div
            key={`${item.time}-${idx}`}
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, item.time)}
            className={`flex min-h-[100px] border-b border-[var(--border-color)] group relative transition-colors duration-200 ${
              item.type === 'empty' && !isPast ? 'hover:bg-[var(--bg-secondary)]' : ''
            }`}
          >
            {/* Time Column */}
            <div
              id={`hour-${item.time.split(':')[0]}`} // ID for scroll target
              className={`w-16 md:w-20 py-4 pl-2 md:pl-4 text-xs md:text-sm font-mono font-bold flex flex-col items-start border-r border-[var(--border-color)] ${
                isPast ? 'text-[var(--text-secondary)] opacity-50' : 'text-[var(--text-secondary)]'
              }`}
            >
              <span className={item.type === 'app' ? 'text-[var(--text-primary)]' : ''}>
                {item.time}
              </span>
            </div>

            {/* Content Column */}
            <div className="flex-1 px-2 md:px-3 py-2 relative overflow-hidden">
              {item.type === 'app' ? (
                <div className="absolute inset-0 z-10 px-2 py-1">
                  {/* SWIPE ACTIONS (LEFT - EDIT/CANCEL) */}
                  <div
                    className={`absolute inset-0 flex items-center justify-start gap-4 pl-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] z-0 transition-opacity duration-300 ${
                      swipedAppId === item.data.id && swipeDirection === 'right'
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <button
                      onClick={e => {
                        handleCancelAppointment(item.data.id, e);
                        setSwipedAppId(null);
                        setSwipeDirection(null);
                      }}
                      className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all scale-90 hover:scale-100"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onEditAppointment(item.data);
                        setSwipedAppId(null);
                        setSwipeDirection(null);
                      }}
                      className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/50 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all scale-90 hover:scale-100"
                    >
                      <Edit size={18} />
                    </button>
                  </div>

                  {/* SWIPE ACTIONS (RIGHT - COMPLETE/NOSHOW) */}
                  <div
                    className={`absolute inset-0 flex flex-col items-end justify-center gap-2 pr-2 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] z-0 transition-opacity duration-300 ${
                      swipedAppId === item.data.id && swipeDirection === 'left'
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <button
                      onClick={e => {
                        handleNoShow(item.data.id, e, item.data);
                      }}
                      className="w-24 h-8 rounded-lg bg-red-500/10 border border-red-500/50 flex items-center justify-center gap-2 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                    >
                      <span className="text-[9px] font-black uppercase tracking-wider">
                        Não Veio
                      </span>
                    </button>

                    <div className="h-[1px] w-16 bg-[var(--border-color)]/50"></div>

                    <button
                      onClick={e => handleCompleteAppointment(item.data.id, e)}
                      className="w-24 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/50 flex items-center justify-center gap-2 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                    >
                      <CheckCircle2 size={14} />
                      <span className="text-[9px] font-black uppercase tracking-wider">
                        Concluir
                      </span>
                    </button>
                  </div>

                  {/* CARD */}
                  <div
                    className={`w-full h-full rounded-xl overflow-hidden border shadow-lg relative z-10 cursor-grab active:cursor-grabbing group/card touch-pan-y flex flex-col
                        ${
                          swipedAppId === item.data.id
                            ? swipeDirection === 'right'
                              ? 'translate-x-[120px] opacity-50'
                              : 'translate-x-[-120px] opacity-50'
                            : 'translate-x-0 opacity-100'
                        }
                        ${
                          item.data.status === 'completed'
                            ? 'bg-linear-to-br from-[#064e3b] via-[#022c22] to-black border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'bg-linear-to-br from-[var(--bg-secondary)] to-[var(--bg-card)] border-[var(--border-color)] hover:border-yellow-500/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
                        }
                        transition-all duration-300
                    `}
                    draggable={true}
                    onDragStart={e => handleDragStart(e, item.data)}
                    onTouchStart={e => setTouchStartX(e.touches[0].clientX)}
                    onTouchEnd={e => {
                      if (touchStartX === null) return;
                      const diff = e.changedTouches[0].clientX - touchStartX;

                      // Handling logic based on current state
                      if (swipedAppId === item.data.id) {
                        // Already swiped, check if swipe back
                        if (swipeDirection === 'right' && diff < -30) {
                          setSwipedAppId(null);
                          setSwipeDirection(null);
                        } else if (swipeDirection === 'left' && diff > 30) {
                          setSwipedAppId(null);
                          setSwipeDirection(null);
                        }
                      } else {
                        // Not swiped yet
                        if (diff > 50) {
                          setSwipedAppId(item.data.id);
                          setSwipeDirection('right');
                        } else if (diff < -50) {
                          setSwipedAppId(item.data.id);
                          setSwipeDirection('left');
                        }
                      }

                      setTouchStartX(null);
                    }}
                    onClick={() => {
                      if (swipedAppId === item.data.id) {
                        setSwipedAppId(null);
                        setSwipeDirection(null);
                      } else onSelectClient(item.data.clientName);
                    }}
                  >
                    {/* HEADER */}
                    <div
                      className={`flex justify-between items-center px-3 py-2 border-b ${
                        item.data.status === 'completed'
                          ? 'bg-black/20 border-emerald-500/20'
                          : 'bg-white/5 border-[var(--border-color)]'
                      }`}
                    >
                      <h3
                        className={`font-black text-sm md:text-base uppercase tracking-wider truncate flex items-center gap-2 ${
                          item.data.status === 'completed'
                            ? 'text-emerald-100 drop-shadow-sm'
                            : 'text-[var(--text-primary)] drop-shadow-md'
                        }`}
                      >
                        {item.data.clientName}
                        {item.data.status === 'completed' && (
                          <CheckCircle2 size={14} className="text-emerald-400" />
                        )}
                      </h3>
                      {item.data.status !== 'completed' && (
                        <button
                          className="w-6 h-6 flex items-center justify-center text-[var(--text-secondary)] hover:text-neon-yellow transition-all focus:outline-none active:scale-95"
                          onClick={e => handleWhatsAppReminder(e, item.data, item.service.name)}
                        >
                          <Bell size={18} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>

                    {/* BODY */}
                    <div className="flex flex-1">
                      {/* TIME */}
                      <div
                        className={`w-[60px] flex flex-col items-center justify-center border-r  ${
                          item.data.status === 'completed'
                            ? 'bg-black/20 border-emerald-500/20'
                            : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
                        }`}
                      >
                        <span
                          className={`font-black text-lg leading-none ${
                            item.data.status === 'completed'
                              ? 'text-emerald-400'
                              : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {item.time.split(':')[0]}
                        </span>
                        <span
                          className={`font-bold text-[10px] uppercase ${
                            item.data.status === 'completed'
                              ? 'text-emerald-600'
                              : 'text-[var(--text-secondary)]'
                          }`}
                        >
                          {item.time.split(':')[1]}
                        </span>
                      </div>

                      {/* SERVICE */}
                      <div className="flex-1 flex flex-col">
                        <div
                          className={`flex-1 px-3 flex items-center border-b ${
                            item.data.status === 'completed'
                              ? 'bg-transparent border-emerald-500/10'
                              : 'bg-transparent border-[var(--border-color)]'
                          }`}
                        >
                          <span
                            className={`text-xs font-black uppercase tracking-wide line-clamp-1 ${
                              item.data.status === 'completed'
                                ? 'text-emerald-200/80'
                                : 'text-[var(--text-secondary)] group-hover/card:text-[var(--text-primary)] transition-colors'
                            }`}
                          >
                            {item.service.name}
                          </span>
                        </div>

                        {/* FOOTER */}
                        <div
                          className={`relative px-3 py-1.5 flex justify-between items-center ${
                            item.data.status === 'completed'
                              ? 'bg-black/40'
                              : 'bg-[var(--bg-secondary)]'
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center border rounded px-2 py-0.5 ${
                              item.data.status === 'completed'
                                ? 'bg-emerald-900/30 border-emerald-500/30'
                                : 'bg-white/5 border-[var(--border-color)]'
                            }`}
                          >
                            <span
                              className={`text-xs font-bold ${
                                item.data.status === 'completed'
                                  ? 'text-emerald-400'
                                  : 'text-[var(--text-secondary)]'
                              }`}
                            >
                              {item.service.duration || '30'}m
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.data.status === 'completed' ? (
                              <div className="flex items-center gap-1 bg-emerald-500 text-black px-2 py-0.5 rounded shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                                <Wallet size={10} strokeWidth={3} />
                                <span className="text-[10px] uppercase tracking-widest font-black">
                                  PAGO
                                </span>
                              </div>
                            ) : (
                              <span className="text-yellow-400 font-black text-sm drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]">
                                {item.service.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ACCENT LINE */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 ${
                        item.data.status === 'completed'
                          ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                          : item.data.status === 'confirmed'
                          ? 'bg-green-500 shadow-[0_0_8px_#22c55e]'
                          : 'bg-yellow-500 shadow-[0_0_8px_#EAB308]'
                      }`}
                    ></div>
                  </div>
                </div>
              ) : (
                // EMPTY SLOT
                <div
                  className={`w-full h-full flex items-center justify-center group/empty ${
                    isPast ? 'cursor-not-allowed opacity-30 select-none' : 'cursor-pointer'
                  }`}
                  onClick={() => {
                    if (isPast) return;
                    onNewAppointment(item.time);
                  }}
                >
                  <div
                    className={`w-full h-full border-2 border-dashed rounded-xl flex items-center justify-center transition-all ${
                      isPast
                        ? 'border-[var(--border-color)]'
                        : 'border-[var(--border-color)] group-hover/empty:border-neon-yellow/50 group-hover/empty:bg-neon-yellow/5'
                    }`}
                  >
                    {isPast ? (
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                        Encerrado
                      </span>
                    ) : (
                      <Plus
                        className="text-[var(--text-secondary)] group-hover/empty:text-neon-yellow transition-colors"
                        size={24}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
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
