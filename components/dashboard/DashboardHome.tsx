import React from 'react';
import { ChairIcon } from '../icons/ChairIcon';
import { Appointment, AppointmentStatus } from '../../types';
import { SERVICES } from '../../constants';
import { Armchair, ChevronRight, User } from 'lucide-react';

interface DashboardHomeProps {
  appointments: Appointment[];
  onStatusChange: (
    id: string,
    status: AppointmentStatus,
    photoUrl?: string,
    notes?: string
  ) => void;
  currentTime: Date;
  shopStatus: any;
  onInitiateFinish: (id: string) => void;
}

// --- ISOLATED COMPONENTS (PREVENT RE-RENDERS) ---
const QueueTicker = React.memo(({ queue }: { queue: Appointment[] }) => {
  return (
    <div className="w-full relative mt-2 group">
      {/* Header Label */}
      <div className="absolute -top-3 left-4 z-20">
        <span className="bg-white dark:bg-street-dark px-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary border border-border-color rounded-sm">
          Fila de Espera
        </span>
      </div>

      <div className="w-full h-28 bg-[#111] border border-gray-800 rounded-xl overflow-hidden relative flex items-center shadow-inner transform-gpu">
        {/* Neon Glow Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-50"></div>

        {queue.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center text-text-secondary z-10 opacity-60">
            <Armchair size={24} className="mb-2" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Ninguém na fila</span>
          </div>
        ) : (
          // Marquee Container
          <div className="flex animate-ticker items-center pl-4 py-2 hover:pause-animation will-change-transform">
            {[...queue, ...queue].map((client, i) => (
              <div
                key={`${client.id}-${i}`}
                className="flex-shrink-0 w-52 h-16 bg-[#F5F5F7] dark:bg-[#0a0a0a] rounded-lg border-l-4 border-[#FFD700] mr-4 flex items-center p-3 relative overflow-hidden border border-white/5 transform-gpu"
              >
                {/* Background Pattern - Simplified */}
                <div className="absolute inset-0 opacity-5 bg-black"></div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border border-white/20 shadow-sm z-10">
                  <img
                    src={
                      client.photoUrl ||
                      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
                    }
                    className="w-full h-full object-cover"
                    alt={client.clientName}
                  />
                </div>

                {/* Info */}
                <div className="ml-3 flex flex-col min-w-0 z-10">
                  <span className="text-text-primary font-black text-xs uppercase truncate leading-tight tracking-tight">
                    {client.clientName.split(' ')[0]}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-text-secondary font-bold font-mono bg-black/5 dark:bg-white/10 px-1.5 rounded-sm">
                      {client.time}
                    </span>
                    {/* Status Dot */}
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  appointments,
  onStatusChange,
  currentTime,
  onInitiateFinish,
}) => {
  // Memoized Derived Data to prevent recalc on every clock tick
  const { queue, inProgress, nextClient } = React.useMemo(() => {
    const q = appointments
      .filter(a => a.status === 'pending' || a.status === 'confirmed')
      .sort((a, b) => a.time.localeCompare(b.time));

    return {
      queue: q,
      inProgress: appointments.find(a => a.status === 'in_progress'),
      nextClient: q.length > 0 ? q[0] : null,
    };
  }, [appointments]);

  // Format Date: "QUARTA-FEIRA, 3 DE DEZEMBRO"
  const dateString = React.useMemo(
    () =>
      currentTime
        .toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
        .toUpperCase(),
    [currentTime.toDateString()]
  );

  // Shop Status Logic
  const { isShopOpen } = React.useMemo(() => {
    const hour = currentTime.getHours();
    const day = currentTime.getDay();
    return { isShopOpen: day !== 0 && hour >= 8 && hour < 19 };
  }, [currentTime.getHours(), currentTime.getDay()]);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto h-full animate-[fadeIn_0.5s_ease-out] transition-colors duration-300">
      {/* 1. CLOCK & DATE */}
      <div className="flex flex-col items-center mt-4 mb-8">
        <h1 className="text-6xl font-bold text-text-primary tracking-tighter leading-none font-sans drop-shadow-lg">
          {currentTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </h1>
        <p className="text-text-secondary text-xs font-bold uppercase tracking-widest mt-1 opacity-80">
          {dateString}
        </p>
      </div>

      {/* 2. CENTRAL STATUS CIRCLE (3D FLIP) */}
      <div className="relative mb-8 w-72 h-72 perspective-1000">
        <div
          className={`relative w-full h-full transition-all duration-700 transform-style-3d ${
            inProgress ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT FACE: STATION FREE / CLOSED */}
          <div className="absolute inset-0 backface-hidden flex flex-col justify-between items-center text-center bg-street-gray dark:bg-arcade-texture rounded-full border-8 border-white dark:border-street-dark shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden py-8 transition-colors duration-300">
            {/* 1. TOP SECTION: CHAIR ICON */}
            <div className="flex-1 flex items-center justify-center w-full animate-fade-in-up">
              <div className={`relative z-10 ${isShopOpen ? 'animate-pulse-neon' : ''}`}>
                <ChairIcon
                  size={80}
                  className={`${
                    isShopOpen
                      ? 'text-cyan-600 dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] dark:drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]'
                      : 'text-red-900/50 drop-shadow-none'
                  }`}
                />
              </div>
            </div>

            {/* 2. MIDDLE SECTION: TEXTS */}
            <div className="flex-1 flex flex-col items-center justify-center w-full animate-fade-in-up delay-100">
              <h2
                className={`text-3xl font-bold uppercase leading-none mb-2 tracking-tight ${
                  isShopOpen ? 'text-text-primary' : 'text-red-900'
                }`}
              >
                {isShopOpen ? 'ESTAÇÃO LIVRE' : 'FECHADO'}
              </h2>
              <p
                className={`text-xs font-bold uppercase tracking-[0.2em] max-w-[220px] leading-relaxed ${
                  isShopOpen ? 'text-text-secondary' : 'text-red-900/60'
                }`}
              >
                {isShopOpen ? 'NENHUM ATENDIMENTO EM ANDAMENTO' : 'HORÁRIO: 08H ÀS 19H (SEG-SÁB)'}
              </p>
            </div>

            {/* 3. BOTTOM SECTION: BADGE */}
            <div className="flex-1 flex items-end justify-center w-full pb-2 animate-fade-in-up delay-200">
              <div
                className={`px-6 py-2 rounded-full flex items-center gap-2 group cursor-default transition-colors ${
                  isShopOpen
                    ? 'badge-premium animate-pulse-slow'
                    : 'bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30'
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isShopOpen ? 'bg-cyan-500 badge-dot-glow' : 'bg-red-500 dark:bg-red-900'
                  }`}
                ></div>
                <span
                  className={`text-xs font-black uppercase tracking-widest transition-colors ${
                    isShopOpen
                      ? 'text-white group-hover:text-cyan-400'
                      : 'text-red-600 dark:text-red-800'
                  }`}
                >
                  {isShopOpen ? 'PISTA LIVRE' : 'LOJA FECHADA'}
                </span>
              </div>
            </div>

            {/* Decorative Inner Ring */}
            <div className="absolute inset-4 rounded-full border border-gray-200 dark:border-white/5 pointer-events-none"></div>
          </div>

          {/* BACK FACE: IN PROGRESS */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center text-center bg-street-gray border-8 border-street-dark shadow-[0_0_30px_rgba(0,0,0,0.2)] dark:shadow-[0_0_60px_rgba(0,0,0,0.8)] rounded-full overflow-hidden transition-colors duration-300">
            {inProgress && (
              <>
                <div className="mb-2 relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                    <img
                      src={
                        inProgress.photoUrl ||
                        'https://images.unsplash.com/photo-1618077553780-75539862f629?q=80&w=400&auto=format&fit=crop'
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-text-primary uppercase leading-none mb-1">
                  EM ANDAMENTO
                </h2>
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest max-w-[180px]">
                  {inProgress.clientName}
                </p>

                {/* Status Indicators */}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div>
                    <span className="text-[10px] font-bold text-green-500 uppercase">OCUPADO</span>
                  </div>
                </div>

                {/* Decorative Inner Ring */}
                <div className="absolute inset-4 rounded-full border border-border-color pointer-events-none"></div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. NEXT CLIENT ACTION BUTTON */}
      <div className="w-full mb-4">
        {inProgress ? (
          <button
            onClick={() => onInitiateFinish(inProgress.id)}
            className="w-full h-20 bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl flex items-center px-4 relative overflow-hidden shadow-lg active:scale-[0.98] transition-transform"
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:24px_24px] opacity-20"></div>
            <div className="flex-1 flex items-center gap-4 z-10">
              <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center border border-white/20">
                <User className="text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold text-black/60 uppercase tracking-widest">
                  AÇÃO NECESSÁRIA
                </span>
                <span className="text-2xl font-bold text-white uppercase leading-none">
                  FINALIZAR
                </span>
              </div>
            </div>
          </button>
        ) : (
          <button
            onClick={() => nextClient && onStatusChange(nextClient.id, 'in_progress')}
            disabled={!nextClient}
            className={`w-full h-20 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-2xl flex items-center justify-between px-4 relative overflow-hidden shadow-[0_4px_20px_rgba(255,215,0,0.3)] transition-all
              ${
                !nextClient
                  ? 'opacity-50 grayscale cursor-not-allowed'
                  : 'active:scale-[0.98] cursor-pointer hover:shadow-[0_6px_25px_rgba(255,215,0,0.5)]'
              }
            `}
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-multiply"></div>
            <div className="flex items-center gap-4 z-10">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-black/20 p-0.5 border border-white/30">
                <img
                  src={
                    nextClient?.photoUrl ||
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
                  }
                  className="w-full h-full object-cover rounded-full filter contrast-110"
                  alt="Client"
                />
              </div>

              {/* Text */}
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-black text-black/60 uppercase tracking-[0.2em] mb-0.5">
                  PRÓXIMO DA FILA
                </span>
                <span className="text-2xl font-black text-white uppercase leading-none drop-shadow-md tracking-tighter">
                  {nextClient ? `CHAMAR ${nextClient.clientName.split(' ')[0]}` : 'AGUARDANDO...'}
                </span>
              </div>
            </div>

            {/* Arrow Icon */}
            {nextClient && <ChevronRight className="text-black/40 animate-pulse" size={32} />}
          </button>
        )}
      </div>

      {/* 4. QUEUE TICKER (ISOLATED) */}
      <QueueTicker queue={queue} />
    </div>
  );
};
