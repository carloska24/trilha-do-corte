import React, { useEffect } from 'react';
import { X, Bell, Clock, CheckCircle, AlertTriangle, Zap, Calendar } from 'lucide-react';
import { Appointment } from '../../types';
import { useNotifications } from '../../utils/notificationUtils';

interface NotificationsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  onConfirmAppointment: (id: string) => void;
  onOpenBooking?: () => void /* New Prop */;
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
    type: n.type, // 'opportunity' usually
    title: n.title,
    message: n.message,
    action: !!n.actionLink, // If it has a link, show action
    time: 'Agora',
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
          time: app.time,
          isBroadcast: false,
        };
      } else if (diffMinutes > 30 && diffMinutes <= 120) {
        return {
          id: app.id,
          type: 'info',
          title: 'Lembrete Amigável 📅',
          message: `Você tem um horário hoje às ${app.time}.`,
          action: app.status === 'pending',
          time: app.time,
          isBroadcast: false,
        };
      } else if (app.status === 'confirmed' && diffMinutes > 0) {
        return {
          id: app.id,
          type: 'success',
          title: 'Agendamento Confirmado ✅',
          message: `Tudo certo para hoje às ${app.time}.`,
          action: false,
          time: app.time,
          isBroadcast: false,
        };
      }
      return null;
    })
    .filter(n => n !== null);

  // MERGE ALL
  const allNotifications = [...broadcasts, ...systemNotifications];

  // Fallback empty state
  if (allNotifications.length === 0) {
    allNotifications.push({
      id: 'welcome',
      type: 'info',
      title: 'Bem-vindo à Trilha! 💈',
      message: 'Fique de olho aqui para receber lembretes e ofertas exclusivas.',
      action: false,
      time: '',
      isBroadcast: false,
    });
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      ></div>
      <div className="fixed inset-y-0 right-0 w-[85%] max-w-[350px] bg-[#1a1a1a] border-l border-white/10 z-[70] animate-[slideLeft_0.3s_ease-out] shadow-2xl flex flex-col">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Bell className="text-neon-yellow" size={20} /> Notificações
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {allNotifications.map((notif: any) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border relative overflow-hidden transition-all hover:scale-[1.02] ${
                notif.type === 'opportunity'
                  ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                  : notif.type === 'urgent'
                  ? 'bg-red-500/10 border-red-500/30'
                  : notif.type === 'success'
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 ${
                    notif.type === 'opportunity'
                      ? 'text-amber-400 animate-pulse'
                      : notif.type === 'urgent'
                      ? 'text-red-500'
                      : notif.type === 'success'
                      ? 'text-green-500'
                      : 'text-neon-yellow'
                  }`}
                >
                  {notif.type === 'opportunity' && <Zap size={20} fill="currentColor" />}
                  {notif.type === 'urgent' && <AlertTriangle size={18} />}
                  {notif.type === 'success' && <CheckCircle size={18} />}
                  {notif.type === 'info' && <Clock size={18} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-white font-bold text-sm mb-1">{notif.title}</h3>
                    {notif.time && (
                      <span className="text-[10px] text-gray-500 font-mono">{notif.time}</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">{notif.message}</p>

                  {/* ACTION BUTTONS */}
                  {notif.action && notif.isBroadcast && onOpenBooking && (
                    <button
                      onClick={() => {
                        onOpenBooking();
                        onClose();
                      }}
                      className="mt-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all w-full shadow-lg"
                    >
                      <Calendar size={14} /> Agendar Agora
                    </button>
                  )}

                  {notif.action && !notif.isBroadcast && (
                    <button
                      onClick={() => onConfirmAppointment(notif.id)}
                      className="mt-3 bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors w-full justify-center"
                    >
                      <CheckCircle size={14} /> Confirmar Presença
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
