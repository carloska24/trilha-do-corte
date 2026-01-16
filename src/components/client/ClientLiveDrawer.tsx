import React, { useMemo } from 'react';
import { Appointment, ServiceItem, Client } from '../../types';
import { X, Star, Armchair } from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import { SERVICES as ALL_SERVICES, LOCAL_AVATARS } from '../../constants';
// Re-using TicketCard for the queue visualization if helpful, or custom tick
// We will build a custom view for the chair similar to DashboardHome

interface ClientLiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentAppointment: Appointment | null; // The one in the chair
  queue: Appointment[];
  services: ServiceItem[];
  clients: Client[];
  onOpenBooking: () => void;
}

export const ClientLiveDrawer: React.FC<ClientLiveDrawerProps> = ({
  isOpen,
  onClose,
  currentAppointment,
  queue,
  services,
  clients,
  onOpenBooking,
}) => {
  // Helper to get client image (Duplicate logic from DashboardHome for consistency)
  const getClientImage = (app: Appointment | null | undefined, size = 100) => {
    if (!app) {
      const seed = 'Guest'.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return getOptimizedImageUrl(LOCAL_AVATARS[seed % LOCAL_AVATARS.length], size, size);
    }
    const clientProfile = clients.find(c => c.id === app.clientId);
    if (clientProfile && clientProfile.img && clientProfile.img.trim() !== '') {
      return getOptimizedImageUrl(clientProfile.img, size, size);
    }
    const OLD_PLACEHOLDER = 'photo-1500648767791';
    if (app.photoUrl && app.photoUrl.trim() !== '' && !app.photoUrl.includes(OLD_PLACEHOLDER)) {
      return getOptimizedImageUrl(app.photoUrl, size, size);
    }
    const seed = (app.clientName || 'Visitor')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const avatarIndex = seed % LOCAL_AVATARS.length;
    return getOptimizedImageUrl(LOCAL_AVATARS[avatarIndex], size, size);
  };

  const currentService = useMemo(() => {
    if (!currentAppointment) return null;
    return (
      services.find(s => s.id === currentAppointment.serviceId) ||
      ALL_SERVICES.find(s => s.id === currentAppointment.serviceId)
    );
  }, [currentAppointment, services]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity pointer-events-auto"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative w-full max-w-md bg-[#121212] rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/10 shadow-2xl transform transition-transform duration-300 pointer-events-auto flex flex-col max-h-[90vh]">
        {/* Handle Bar (Mobile) */}
        <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-12 h-1.5 rounded-full bg-zinc-800" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors z-50"
        >
          <X size={20} />
        </button>

        {/* --- LIVE STATUS HEADER (Compact) --- */}
        <div className="px-6 pt-2 pb-2 text-center relative z-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-2 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
              Ao Vivo
            </span>
          </div>
        </div>

        {/* --- LIVE CHAIR VISUALIZATION (ADMIN PORT) --- */}
        <div className="relative w-full aspect-square max-h-[400px] mx-auto mb-0 bg-black overflow-hidden shadow-2xl border-y border-white/10 group">
          {/* 1. BACKGROUND CONTAINER */}
          <div className="absolute inset-0 bg-[#121212] z-0 transition-colors">
            <img
              src="/background-teste.png"
              className="absolute inset-0 w-full h-full object-cover object-top opacity-60"
              alt="Background"
              onError={e => {
                const target = e.currentTarget;
                if (target.src.includes('background-teste.png')) {
                  target.src = '/background-teste.jpg';
                } else {
                  target.style.display = 'none';
                }
              }}
            />
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-[#121212]/50" />
          </div>

          {currentAppointment ? (
            <div className="w-full h-full relative animate-[fadeIn_0.5s_ease-out]">
              {/* 1.5 MINI HANGING SIGN */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center w-full pointer-events-none">
                <div className="relative flex flex-col items-center transform hover:scale-105 transition-transform duration-500">
                  <Star className="absolute top-0 -left-6 text-yellow-400 w-4 h-4 animate-pulse drop-shadow-[0_0_4px_#FACC15] fill-yellow-400" />
                  <Star className="absolute top-0 -right-6 text-yellow-400 w-4 h-4 animate-pulse drop-shadow-[0_0_4px_#FACC15] fill-yellow-400" />
                  <span
                    className="font-script text-4xl text-[#FFD700] -rotate-2 drop-shadow-[0_0_15px_#FACC15] block"
                    style={{ textShadow: '2px 2px 0px #000' }}
                  >
                    Bem Vindo
                  </span>
                </div>
              </div>

              {/* 2. CENTRALIZED SUPREME CLIENT CIRCLE */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none mt-4">
                <div className="relative group pointer-events-auto scale-90 sm:scale-100">
                  <div className="absolute inset-0 bg-cyan-500 rounded-full blur-[60px] opacity-20 animate-pulse group-hover:opacity-40 transition-opacity duration-500"></div>
                  <div className="absolute -inset-8 border border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none"></div>
                  <div className="absolute -inset-2 border-2 border-dashed border-cyan-400/40 rounded-full animate-[spin_20s_linear_infinite_reverse] pointer-events-none"></div>
                  <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full p-2 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_40px_rgba(6,182,212,0.4)] relative overflow-hidden ring-4 ring-black/50">
                    <div className="w-full h-full rounded-full border-[4px] border-white/20 overflow-hidden relative bg-black">
                      <img
                        src={getClientImage(currentAppointment, 300)}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt="Cliente"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Neon Sign (Bottom) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[80%] max-w-[280px]">
                <div className="relative border-2 border-green-400/80 rounded-xl px-4 pt-4 pb-2 bg-black/80 backdrop-blur-md shadow-[0_0_20px_rgba(74,222,128,0.3),inset_0_0_10px_rgba(74,222,128,0.1)] flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                  <div className="absolute -top-5 left-0 right-0 text-center z-20">
                    <span
                      className="font-script text-3xl text-[#FFD700] -rotate-3 drop-shadow-[0_0_5px_#FACC15] block"
                      style={{ textShadow: '2px 2px 0px #000' }}
                    >
                      Em Atendimento
                    </span>
                  </div>
                  <Star className="absolute top-2 left-2 text-yellow-400 w-3 h-3 animate-pulse drop-shadow-[0_0_4px_#FACC15] fill-yellow-400" />
                  <Star className="absolute top-2 right-2 text-yellow-400 w-3 h-3 animate-pulse drop-shadow-[0_0_4px_#FACC15] fill-yellow-400" />
                  <div className="flex flex-col items-center relative z-10 w-full mt-1">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter text-center leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                      {currentAppointment.clientName
                        ? currentAppointment.clientName.split(' ')[0]
                        : 'Cliente'}
                    </h2>
                    <div className="w-1/2 h-[2px] bg-gradient-to-r from-transparent via-green-500 to-transparent mt-1 mb-1"></div>
                    <span className="text-[9px] font-bold text-green-300 uppercase tracking-[0.2em]">
                      Visual Confirmado
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              <div className="absolute inset-0 bg-[#121212] z-0">
                <img
                  src="/chair-closed.png"
                  className="w-full h-full object-cover opacity-20"
                  alt=""
                />
              </div>
              <div className="relative z-10 flex flex-col items-center text-zinc-500">
                <Armchair size={48} className="mb-2 opacity-50" />
                <p className="text-xs font-bold uppercase tracking-widest opacity-60">
                  Cadeira Disponível
                </p>
              </div>
            </div>
          )}
        </div>

        {/* --- QUEUE SECTION --- */}
        <div className="flex-1 bg-zinc-900/50 border-t border-white/5 p-6 rounded-b-3xl">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            Próximos da Fila
          </h3>

          {queue.length > 0 ? (
            <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
              {queue.map((app, idx) => (
                <div
                  key={app.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5"
                >
                  <div className="font-mono text-neon-yellow font-black text-sm w-6 text-center">
                    #{idx + 1}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                    <img
                      src={getClientImage(app, 50)}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{app.clientName}</p>
                    <p className="text-[10px] text-zinc-500 uppercase">
                      {app.time} • {services.find(s => s.id === app.serviceId)?.name || 'Serviço'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-zinc-500 text-sm">Sem fila de espera.</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="mt-4 px-6 py-2 bg-neon-yellow text-black font-black uppercase text-xs rounded-full hover:bg-yellow-400 transition-colors"
              >
                Seja o Próximo!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
