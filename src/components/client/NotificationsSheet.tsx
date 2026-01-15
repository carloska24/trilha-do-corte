import React, { useEffect } from 'react';
import {
  X,
  Bell,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Calendar,
  Trash2,
  Gift,
} from 'lucide-react';
import { Appointment } from '../../types';
import {
  useNotifications,
  getRelativeTime,
  deleteNotification,
  clearAllNotifications,
} from '../../utils/notificationUtils';

interface NotificationsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  onConfirmAppointment: (id: string) => void;
  onOpenBooking?: () => void;
}

export const NotificationsSheet: React.FC<NotificationsSheetProps> = ({
  isOpen,
  onClose,
  appointments,
  onConfirmAppointment,
  onOpenBooking,
}) => {
  const { notifications: broadcastNotifications, markAllAsRead } = useNotifications();

  // Mark read when opening
  useEffect(() => {
    if (isOpen) {
      markAllAsRead();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. BROADCAST NOTIFICATIONS (From Admin)
  const broadcasts = broadcastNotifications.map(n => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    action: !!n.actionLink,
    time: getRelativeTime(n.timestamp),
    timestamp: n.timestamp,
    isBroadcast: true,
  }));

  // 2. APPOINTMENT NOTIFICATIONS (Existing Logic)
  const systemNotifications = appointments
    .filter(app => ['confirmed', 'pending'].includes(app.status))
    .map(app => {
      const appDate = new Date(`${app.date}T${app.time}`);
      const now = new Date();
      const diffMs = appDate.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / 1000 / 60);

      if (diffMinutes > 0 && diffMinutes <= 30) {
        return {
          id: app.id,
          type: 'urgent',
          title: 'Corre que dá tempo! 🏃',
          message: `Seu corte é em ${diffMinutes} minutos. Estamos te esperando!`,
          action: false,
          time: `Em ${diffMinutes}min`,
          timestamp: appDate.toISOString(),
          isBroadcast: false,
        };
      } else if (diffMinutes > 30 && diffMinutes <= 120) {
        return {
          id: app.id,
          type: 'info',
          title: 'Lembrete Amigável 📅',
          message: `Você tem um horário hoje às ${app.time}.`,
          action: app.status === 'pending',
          time: `Às ${app.time}`,
          timestamp: appDate.toISOString(),
          isBroadcast: false,
        };
      } else if (app.status === 'confirmed' && diffMinutes > 0) {
        return {
          id: app.id,
          type: 'success',
          title: 'Agendamento Confirmado ✅',
          message: `Tudo certo para hoje às ${app.time}.`,
          action: false,
          time: `Às ${app.time}`,
          timestamp: appDate.toISOString(),
          isBroadcast: false,
        };
      }
      return null;
    })
    .filter(n => n !== null);

  // MERGE ALL
  const allNotifications = [...broadcasts, ...systemNotifications];

  // Has any broadcast notifications?
  const hasBroadcasts = broadcasts.length > 0;

  // Get icon for notification type
  const getIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Zap size={18} fill="currentColor" />;
      case 'urgent':
        return <AlertTriangle size={18} />;
      case 'success':
        return <CheckCircle size={18} />;
      case 'promo':
      case 'loyalty':
        return <Gift size={18} />;
      default:
        return <Clock size={18} />;
    }
  };

  // Get styles for notification type
  const getStyles = (type: string) => {
    switch (type) {
      case 'opportunity':
        return {
          bg: 'bg-gradient-to-br from-amber-500/15 to-orange-500/10',
          border: 'border-amber-500/40',
          icon: 'text-amber-400',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
        };
      case 'urgent':
        return {
          bg: 'bg-gradient-to-br from-red-500/15 to-rose-500/10',
          border: 'border-red-500/40',
          icon: 'text-red-400',
          glow: 'shadow-[0_0_15px_rgba(239,68,68,0.1)]',
        };
      case 'success':
        return {
          bg: 'bg-gradient-to-br from-green-500/15 to-emerald-500/10',
          border: 'border-green-500/40',
          icon: 'text-green-400',
          glow: '',
        };
      case 'promo':
      case 'loyalty':
        return {
          bg: 'bg-gradient-to-br from-purple-500/15 to-violet-500/10',
          border: 'border-purple-500/40',
          icon: 'text-purple-400',
          glow: '',
        };
      default:
        return {
          bg: 'bg-white/5',
          border: 'border-white/10',
          icon: 'text-yellow-400',
          glow: '',
        };
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-y-0 right-0 w-[90%] max-w-[380px] bg-gradient-to-b from-zinc-900 to-black border-l border-white/10 z-50 shadow-2xl flex flex-col animate-[slideLeft_0.3s_ease-out]">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-900/30">
              <Bell className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Notificações</h2>
              <p className="text-gray-500 text-xs">
                {allNotifications.length === 0
                  ? 'Nenhuma nova'
                  : `${allNotifications.length} ${
                      allNotifications.length === 1 ? 'nova' : 'novas'
                    }`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Clear All Button */}
        {hasBroadcasts && (
          <div className="px-4 py-2 border-b border-white/5">
            <button
              onClick={() => clearAllNotifications()}
              className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 size={14} />
              Limpar todas
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {allNotifications.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Bell size={32} className="text-gray-600" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Tudo em dia!</h3>
              <p className="text-gray-500 text-sm max-w-[200px]">
                Fique de olho aqui para receber lembretes e ofertas exclusivas.
              </p>
            </div>
          ) : (
            allNotifications.map((notif: any, index: number) => {
              const styles = getStyles(notif.type);
              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border relative overflow-hidden transition-all hover:scale-[1.01] ${styles.bg} ${styles.border} ${styles.glow}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Delete Button for Broadcasts */}
                  {notif.isBroadcast && (
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-black/30 text-gray-500 hover:text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      <X size={12} />
                    </button>
                  )}

                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`mt-0.5 ${styles.icon} ${
                        notif.type === 'opportunity' ? 'animate-pulse' : ''
                      }`}
                    >
                      {getIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pr-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-white font-bold text-sm leading-tight">
                          {notif.title}
                        </h3>
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed mb-2">{notif.message}</p>

                      {/* Timestamp */}
                      <span className="text-[10px] text-gray-600 font-medium uppercase tracking-wider">
                        {notif.time}
                      </span>

                      {/* ACTION BUTTONS */}
                      {notif.action && notif.isBroadcast && onOpenBooking && (
                        <button
                          onClick={() => {
                            onOpenBooking();
                            onClose();
                          }}
                          className="mt-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all w-full shadow-lg shadow-amber-900/30 active:scale-95"
                        >
                          <Calendar size={14} />
                          Agendar Agora
                        </button>
                      )}

                      {notif.action && !notif.isBroadcast && (
                        <button
                          onClick={() => onConfirmAppointment(notif.id)}
                          className="mt-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all w-full justify-center shadow-lg shadow-green-900/30 active:scale-95"
                        >
                          <CheckCircle size={14} />
                          Confirmar Presença
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
