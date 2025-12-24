import React from 'react';
import { ChairIcon } from '../icons/ChairIcon';
import { Appointment, AppointmentStatus, ServiceItem } from '../../types';
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
  services: ServiceItem[];
}

// --- ISOLATED COMPONENTS (PREVENT RE-RENDERS) ---
const QueueTicker = React.memo(
  ({ queue, services }: { queue: Appointment[]; services: ServiceItem[] }) => {
    return (
      <div className="w-full relative mt-6 group">
        {/* Title Label - Bem Vindo Style - Corrected */}
        <div className="absolute -top-7 left-4 z-20 flex items-end pointer-events-none">
          <span
            className="font-script text-4xl text-[#FFD700] -rotate-6 drop-shadow-[0_0_4px_#FACC15] z-20 relative"
            style={{ textShadow: '2px 2px 0px #000' }}
          >
            Próximos
          </span>
        </div>

        <div className="w-full h-40 bg-[#050505] border border-gray-800 rounded-2xl overflow-hidden relative flex items-center shadow-2xl transform-gpu ring-1 ring-white/5 pt-4">
          {/* Neon Glow Decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-30"></div>
          </div>

          {queue.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center text-gray-500 z-10 opacity-60">
              <Armchair size={24} className="mb-2 text-gray-600" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-600">
                Terminal Vazio
              </span>
            </div>
          ) : (
            // Marquee Container
            <div className="flex animate-ticker items-center pl-4 py-2 hover:pause-animation will-change-transform">
              {[...queue, ...queue].map((client, i) => {
                // Find Service Name
                const service = services.find(s => s.id === client.serviceId);
                const serviceName = service ? service.name : 'Corte & Estilo';
                // const servicePrice = service ? service.price : 'R$ -';

                return (
                  <div
                    key={`${client.id}-${i}`}
                    className="flex-shrink-0 w-72 h-24 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 mr-5 flex flex-col relative overflow-hidden group/card hover:border-cyan-400 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                  >
                    {/* Vibrant Gradient Background on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/10 via-blue-900/10 to-purple-900/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>

                    {/* Decorative Side Bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600"></div>

                    <div className="flex items-center h-full pl-4 pr-3 py-2 z-10">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-white to-purple-500 shadow-lg">
                        <div className="w-full h-full rounded-full overflow-hidden bg-black relative">
                          <img
                            src={
                              client.photoUrl ||
                              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
                            }
                            className="w-full h-full object-cover filter contrast-110"
                            alt={client.clientName}
                          />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="ml-4 flex flex-col flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest bg-cyan-950/30 px-1.5 rounded border border-cyan-500/20">
                            {client.time}
                          </span>
                        </div>

                        <span className="text-white font-black text-lg uppercase truncate leading-none tracking-tight group-hover/card:text-transparent group-hover/card:bg-clip-text group-hover/card:bg-gradient-to-r group-hover/card:from-white group-hover/card:to-cyan-200 transition-all">
                          {client.clientName.split(' ')[0]}
                        </span>

                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="w-full h-[1px] bg-white/10 flex-1"></div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate max-w-[100px] group-hover/card:text-gray-300">
                            {serviceName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
);

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  appointments,
  onStatusChange,
  currentTime,
  onInitiateFinish,
  services,
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
    return { isShopOpen: day !== 0 && hour >= 8 && hour < 21 };
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
          {/* 1. STATUS SIGNAGE (TOP ABSOLUTE) - Hide when In Progress */}
          {!inProgress && (
            <div className="absolute top-12 left-0 right-0 z-30 flex flex-col items-center pointer-events-none">
              {isShopOpen ? (
                // OPEN STATE (Hanging Retro Neon Sign - Green)
                <div className="relative flex flex-col items-center mt-2 w-full">
                  {/* Hanging Rope Effect */}
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[1px] h-16 bg-gradient-to-b from-gray-800 to-green-500/50 opacity-80"></div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 border-t border-l border-green-500/10 rotate-45 transform origin-bottom opacity-30"></div>

                  {/* The Board - Compact Vertical (Green) */}
                  <div className="relative border-2 border-green-400 rounded-xl px-4 pt-3 pb-1 bg-black/90 backdrop-blur-xl shadow-[0_0_15px_#4ade80,inset_0_0_10px_rgba(74,222,128,0.2)] flex flex-col items-center w-[50%] max-w-[200px]">
                    {/* Cursive Text Top (Floating) */}
                    <div className="absolute -top-4 left-0 right-0 text-center z-20">
                      <span
                        className="font-script text-3xl text-[#FFD700] -rotate-6 drop-shadow-[0_0_3px_#FACC15] block"
                        style={{ textShadow: '1px 1px 0px #000' }}
                      >
                        Bem Vindo
                      </span>
                    </div>

                    {/* Inner Content */}
                    <div className="flex flex-col items-center pt-1 relative z-10 w-full">
                      {/* Stars */}
                      <Star className="absolute top-1 left-1 text-yellow-400 w-3 h-3 animate-pulse drop-shadow-[0_0_4px_#FACC15] fill-yellow-400" />
                      <Star className="absolute top-1 right-1 text-yellow-400 w-3 h-3 animate-pulse drop-shadow-[0_0_4px_#FACC15] fill-yellow-400" />

                      {/* "BARBER SHOP" */}
                      <span className="text-[#ff00ff] font-bold tracking-[0.15em] text-[10px] drop-shadow-[0_0_3px_#ff00ff] animate-pulse mb-0.5">
                        BARBER SHOP
                      </span>
                      {/* "ABERTO" */}
                      <h2
                        className="text-4xl font-black text-[#4ade80] tracking-wider leading-none"
                        style={{ textShadow: '0 0 10px #4ade80, 1px 1px 0px #14532d' }}
                      >
                        ABERTO
                      </h2>
                    </div>

                    {/* Bottom Hours logic */}
                    <div className="mt-2 pt-1.5 border-t border-green-500/30 w-full text-center">
                      <span className="text-[11px] font-bold text-green-300 font-mono tracking-[0.1em] drop-shadow-[0_0_1px_#4ade80]">
                        08H ÀS 19H
                      </span>
                    </div>
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
                    <div className="mt-2 pt-1.5 border-t border-cyan-500/30 w-full text-center">
                      <span className="text-[11px] font-bold text-cyan-300 font-mono tracking-[0.1em] drop-shadow-[0_0_1px_cyan]">
                        DAS 19H ÀS 08H
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. MAIN CONTENT (FULL COVER) */}
          {inProgress ? (
            /* --- IN PROGRESS (FULL COVER + ROTATION) --- */
            <div className="w-full h-full relative animate-[flipInY_0.8s_ease-out] [perspective:1000px]">
              {/* 1. BACKGROUND CONTAINER (User to add custom image here) */}
              <div className="absolute inset-0 bg-[#050505] z-0">
                {/* Custom User Background */}
                <img
                  src="/background-teste.png"
                  className="absolute inset-0 w-full h-full object-cover opacity-100"
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

                {/* Overlays for atmosphere */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-black/50 to-black opacity-80"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              </div>

              {/* 1.5 MINI HANGING SIGN (TOP) - CLEAN VERSION (Text Only) */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center w-full pointer-events-none">
                <div className="relative flex flex-col items-center transform hover:scale-105 transition-transform duration-500">
                  {/* Stars */}
                  <Star className="absolute top-0 -left-6 text-yellow-400 w-4 h-4 animate-pulse drop-shadow-[0_0_4px_#FACC15] fill-yellow-400" />
                  <Star className="absolute top-0 -right-6 text-yellow-400 w-4 h-4 animate-pulse drop-shadow-[0_0_4px_#FACC15] fill-yellow-400" />

                  {/* Text */}
                  <span
                    className="font-script text-5xl text-[#FFD700] -rotate-2 drop-shadow-[0_0_15px_#FACC15] block"
                    style={{ textShadow: '2px 2px 0px #000' }}
                  >
                    Bem Vindo
                  </span>
                </div>
              </div>

              {/* 2. CENTRALIZED SUPREME CLIENT CIRCLE */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="relative group pointer-events-auto">
                  {/* Pulse Glow Behind */}
                  <div className="absolute inset-0 bg-cyan-500 rounded-full blur-[60px] opacity-20 animate-pulse group-hover:opacity-40 transition-opacity duration-500"></div>

                  {/* Rotating Rings */}
                  <div className="absolute -inset-8 border border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none"></div>
                  <div className="absolute -inset-2 border-2 border-dashed border-cyan-400/40 rounded-full animate-[spin_20s_linear_infinite_reverse] pointer-events-none"></div>

                  {/* Main Circle Container */}
                  <div className="w-56 h-56 md:w-72 md:h-72 rounded-full p-2 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_40px_rgba(6,182,212,0.4)] relative overflow-hidden ring-4 ring-black/50">
                    <div className="w-full h-full rounded-full border-[4px] border-white/20 overflow-hidden relative bg-black">
                      <img
                        src={inProgress.photoUrl || '/cliente-teste.png'}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt="Cliente"
                        onError={e => {
                          const target = e.currentTarget;
                          if (target.src.includes('cliente-teste.png')) {
                            target.src = '/cliente-teste.jpg';
                          } else if (target.src.includes('cliente-teste.jpg')) {
                            target.src =
                              'https://images.unsplash.com/photo-1618077553780-75539862f629?q=80&w=400&auto=format&fit=crop';
                          }
                        }}
                      />
                      {/* Inner Shine */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Label (Bottom) */}
              {/* Client Neon Sign (Bottom) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[80%] max-w-[280px]">
                {/* Neon Board */}
                <div className="relative border-2 border-green-400/80 rounded-xl px-4 pt-4 pb-2 bg-black/80 backdrop-blur-md shadow-[0_0_20px_rgba(74,222,128,0.3),inset_0_0_10px_rgba(74,222,128,0.1)] flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                  {/* Top Script Text */}
                  <div className="absolute -top-5 left-0 right-0 text-center z-20">
                    <span
                      className="font-script text-4xl text-[#FFD700] -rotate-3 drop-shadow-[0_0_5px_#FACC15] block"
                      style={{ textShadow: '2px 2px 0px #000' }}
                    >
                      Em Atendimento
                    </span>
                  </div>

                  {/* Stars Decorations */}
                  <Star className="absolute top-2 left-2 text-yellow-400 w-4 h-4 animate-pulse drop-shadow-[0_0_4px_#FACC15] fill-yellow-400" />
                  <Star className="absolute top-2 right-2 text-yellow-400 w-4 h-4 animate-pulse drop-shadow-[0_0_4px_#FACC15] fill-yellow-400" />

                  {/* Client Name */}
                  <div className="flex flex-col items-center relative z-10 w-full mt-1">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter text-center leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                      {inProgress.clientName.split(' ')[0]}
                    </h2>
                    {/* Underline/Decoration */}
                    <div className="w-1/2 h-[2px] bg-gradient-to-r from-transparent via-green-500 to-transparent mt-1 mb-1"></div>

                    <span className="text-[10px] font-bold text-green-300 uppercase tracking-[0.2em]">
                      Visual Confirmado
                    </span>
                  </div>
                </div>

                {/* Hanging "Strings" (Visual Connection to sides or top? No, let's make it look like a floating badge for now as it is at the bottom) */}
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
                src={isShopOpen ? '/chair-open.jpg' : '/chair-closed.png'}
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
      <QueueTicker queue={queue} services={services} />
    </div>
  );
};
