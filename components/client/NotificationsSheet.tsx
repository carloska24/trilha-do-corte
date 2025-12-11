import React from 'react';
import { X, Bell, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Appointment } from '../../types';

interface NotificationsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  onConfirmAppointment: (id: string) => void;
}

export const NotificationsSheet: React.FC<NotificationsSheetProps> = ({
  isOpen,
  onClose,
  appointments,
  onConfirmAppointment,
}) => {
  if (!isOpen) return null;

  // Filtrar agendamentos relevantes para notificar
  const notifications = appointments
    .filter(app => ['confirmed', 'pending'].includes(app.status))
    .map(app => {
      const appDate = new Date(`${app.date}T${app.time}`);
      const now = new Date();
      const diffMs = appDate.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / 1000 / 60);

      // Lógica de Alertas
      if (diffMinutes > 0 && diffMinutes <= 30) {
        return {
          id: app.id,
          type: 'urgent',
          title: 'Corre que dá tempo! 🏃',
          message: `Seu corte é em ${diffMinutes} minutos. Estamos te esperando!`,
          action: false,
          time: app.time,
        };
      } else if (diffMinutes > 30 && diffMinutes <= 120) {
        // 2 horas antes
        return {
          id: app.id,
          type: 'info',
          title: 'Lembrete Amigável 📅',
          message: `Você tem um horário hoje às ${app.time}.`,
          action: app.status === 'pending', // Mostrar botão confirmar se estiver pendente
          time: app.time,
        };
      } else if (app.status === 'confirmed' && diffMinutes > 0) {
        // Apenas informativo de confirmação
        return {
          id: app.id,
          type: 'success',
          title: 'Agendamento Confirmado ✅',
          message: `Tudo certo para hoje às ${app.time}.`,
          action: false,
          time: app.time,
        };
      }
      return null;
    })
    .filter(n => n !== null); // Remove nulls

  // Adicionar notificação de boas-vindas se não houver nada
  if (notifications.length === 0) {
    notifications.push({
      id: 'welcome',
      type: 'info',
      title: 'Bem-vindo à Trilha! 💈',
      message: 'Fique de olho aqui para receber lembretes dos seus cortes.',
      action: false,
      time: '',
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
          {notifications.map((notif: any) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border relative overflow-hidden ${
                notif.type === 'urgent'
                  ? 'bg-red-500/10 border-red-500/30'
                  : notif.type === 'success'
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 ${
                    notif.type === 'urgent'
                      ? 'text-red-500'
                      : notif.type === 'success'
                      ? 'text-green-500'
                      : 'text-neon-yellow'
                  }`}
                >
                  {notif.type === 'urgent' && <AlertTriangle size={18} />}
                  {notif.type === 'success' && <CheckCircle size={18} />}
                  {notif.type === 'info' && <Clock size={18} />}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">{notif.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{notif.message}</p>

                  {notif.action && (
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
