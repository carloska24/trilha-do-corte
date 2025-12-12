import React from 'react';
import { ChairIcon } from '../icons/ChairIcon';
import { Appointment, AppointmentStatus } from '../../types';
import { SERVICES } from '../../constants';
import { Armchair, ChevronRight, User, Star } from 'lucide-react';

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

      {/* 2. RECTANGULAR STATUS AREA (BLUE ZONE) */}
      <div className="w-full relative mb-4 flex-1 flex flex-col justify-center">
        {/* Main Status Container */}
        {/* Main Status Container - FULL COVER REFACTOR */}
        <div className="w-full aspect-square md:aspect-auto md:h-[500px] relative bg-[#050505] rounded-3xl overflow-hidden shadow-2xl border border-white/5 group">
          {/* 1. STATUS SIGNAGE (TOP ABSOLUTE) */}
          <div className="absolute top-12 left-0 right-0 z-30 flex flex-col items-center pointer-events-none">
            {isShopOpen ? (
              // OPEN STATE (Standard Neon Plate)
              <div className="relative px-12 py-4 rounded-xl border-2 backdrop-blur-md shadow-[0_0_30px_rgba(74,222,128,0.5)] bg-black/40 border-green-500/30">
                <h2 className="text-6xl md:text-7xl font-black uppercase tracking-tighter leading-none text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">
                  ABERTO
                </h2>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <div className="h-[1px] w-12 bg-green-500/50"></div>
                  <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] font-mono text-green-400/80">
                    08:00 - 19:00
                  </p>
                  <div className="h-[1px] w-12 bg-green-500/50"></div>
                </div>
              </div>
            ) : (
              // CLOSED STATE (Hanging Retro Neon Sign)
              <div className="relative flex flex-col items-center mt-2 w-full">
                {/* Hanging Rope Effect */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[1px] h-16 bg-gradient-to-b from-gray-800 to-cyan-500/50 opacity-80"></div>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 border-t border-l border-cyan-500/10 rotate-45 transform origin-bottom opacity-30"></div>

                {/* The Board - Scaled Down ~50% & Vertically Compacted */}
                <div className="relative border-2 border-cyan-400 rounded-xl px-4 pt-3 pb-1 bg-black/90 backdrop-blur-xl shadow-[0_0_15px_#06b6d4,inset_0_0_10px_rgba(6,182,212,0.2)] flex flex-col items-center w-[50%] max-w-[200px]">
                  {/* Cursive Text Top (Floating) */}
                  <div className="absolute -top-4 left-0 right-0 text-center z-20">
                    <span
                      className="font-script text-3xl text-[#FFD700] -rotate-6 drop-shadow-[0_0_3px_#FACC15] block"
                      style={{ textShadow: '1px 1px 0px #000' }}
                    >
                      Desculpe
                    </span>
                  </div>

                  {/* Inner Content */}
                  <div className="flex flex-col items-center pt-1 relative z-10 w-full">
                    {/* Stars */}
                    <Star className="absolute top-1 left-1 text-yellow-400 w-3 h-3 animate-pulse drop-shadow-[0_0_4px_#FACC15] fill-yellow-400" />
                    <Star className="absolute top-1 right-1 text-yellow-400 w-3 h-3 animate-pulse drop-shadow-[0_0_4px_#FACC15] fill-yellow-400" />

                    {/* "ESTAMOS" */}
                    <span className="text-[#ff00ff] font-bold tracking-[0.15em] text-[10px] drop-shadow-[0_0_3px_#ff00ff] animate-pulse mb-0.5">
                      ESTAMOS
                    </span>
                    {/* "FECHADO" */}
                    <h2
                      className="text-3xl font-black text-[#A855F7] tracking-wider leading-none"
                      style={{ textShadow: '0 0 8px #A855F7, 1px 1px 0px #4a044e' }}
                    >
                      FECHADO
                    </h2>
                  </div>

                  {/* Bottom Hours logic */}
                  <div className="mt-1 pt-0.5 border-t border-cyan-500/30 w-full text-center">
                    <span className="text-[8px] text-cyan-300 font-mono tracking-[0.1em] drop-shadow-[0_0_1px_cyan]">
                      DAS 19H ÀS 08H
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. MAIN CONTENT (FULL COVER) */}
          <div className="absolute inset-0 z-10 transition-all duration-700 ease-out">
            {inProgress ? (
              /* --- IN PROGRESS (FULL COVER) --- */
              <div className="w-full h-full relative">
                <img
                  src={
                    inProgress.photoUrl ||
                    'https://images.unsplash.com/photo-1618077553780-75539862f629?q=80&w=400&auto=format&fit=crop'
                  }
                  className="w-full h-full object-cover filter brightness-[0.8]"
                  alt="Cliente"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60"></div>

                {/* Client Label (Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center">
                  <span className="text-neon-yellow font-black text-sm uppercase tracking-[0.2em] mb-1 drop-shadow-lg">
                    Em Atendimento
                  </span>
                  <h2 className="text-4xl text-white font-black uppercase tracking-tighter drop-shadow-xl">
                    {inProgress.clientName}
                  </h2>
                </div>
              </div>
            ) : (
              /* --- SHOP STATUS (CHAIR) --- */
              <div className="w-full h-full relative flex items-end justify-center overflow-hidden">
                {/* Background Atmosphere */}
                <div
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    isShopOpen ? 'opacity-30 bg-blue-900/20' : 'opacity-20 bg-red-900/10'
                  }`}
                ></div>

                {/* Chair Image (Full Cover, Full Color) */}
                <img
                  src={isShopOpen ? '/chair-open.png' : '/chair-closed.png'}
                  className={`
                      w-full h-full object-cover object-center transition-all duration-1000 transform
                      ${
                        isShopOpen
                          ? 'scale-105 filter contrast-125 saturate-110 drop-shadow-[0_0_50px_rgba(0,100,255,0.2)]'
                          : 'scale-100 contrast-110 saturate-110'
                      }
                    `}
                  alt="Cadeira"
                  onError={e => {
                    e.currentTarget.src = isShopOpen
                      ? 'https://png.pngtree.com/png-vector/20230906/ourmid/pngtree-barber-shop-chair-3d-illustration-png-image_9963953.png'
                      : 'https://png.pngtree.com/png-vector/20230906/ourmid/pngtree-vintage-barber-chair-3d-illustration-png-image_9963943.png';
                  }}
                />

                {/* Closed Overlay Effect */}
                {!isShopOpen && (
                  <div className="absolute inset-0 bg-black/40 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-50 mix-blend-overlay pointer-events-none"></div>
                )}
              </div>
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
