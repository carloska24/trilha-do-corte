import React from 'react';
import { ChairIcon } from '../icons/ChairIcon';
import { Appointment, AppointmentStatus, ServiceItem } from '../../types';
import { SERVICES as ALL_SERVICES } from '../../constants';
import { Armchair, ChevronRight, User, Star } from 'lucide-react';
import { sendBroadcastNotification } from '../../utils/notificationUtils';
import { useData } from '../../contexts/DataContext';
import { useShopStatus } from '../../hooks/useShopStatus';
import { useOutletContext } from 'react-router-dom';

interface DashboardOutletContext {
  initiateFinish: (id: string) => void;
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
                const service =
                  services.find(s => s.id === client.serviceId) ||
                  ALL_SERVICES.find(s => s.id === client.serviceId);
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
                          {client.clientName ? client.clientName.split(' ')[0] : 'Cliente'}
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

export const DashboardHome: React.FC = () => {
  const { appointments, services, updateAppointments } = useData();
  const { currentTime, shopStatus } = useShopStatus(); // Using Centralized Logic
  const { initiateFinish } = useOutletContext<DashboardOutletContext>();

  const onInitiateFinish = initiateFinish;

  const onStatusChange = (
    id: string,
    status: AppointmentStatus,
    photoUrl?: string,
    notes?: string
  ) => {
    const updated = appointments.map(app =>
      app.id === id ? { ...app, status, photoUrl, notes } : app
    );
    updateAppointments(updated);
  };

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

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto h-full animate-[fadeIn_0.5s_ease-out] transition-colors duration-300">
      {/* 1. CLOCK & DATE */}
      <div className="flex flex-col items-center mt-0 mb-4">
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
        <div className="w-full aspect-square md:aspect-auto md:h-[500px] relative bg-[#050505] rounded-md overflow-hidden shadow-2xl border border-white/5 group">
          {/* 1. STATUS SIGNAGE (TOP ABSOLUTE) - Hide when In Progress */}
          {!inProgress && (
            <>
              {/* STATUS NEON SIGNS */}
              <div className="absolute top-8 left-2 z-30 pointer-events-none transform rotate-[-8deg] scale-[0.6] origin-top-left">
                {/* Main Frame Container */}
                <div className="relative rounded-2xl px-10 py-3 bg-black/90 flex flex-col items-center">
                  {/* PULSING GLOW & BORDER LAYER */}
                  <div
                    className={`absolute inset-0 border-[5px] rounded-2xl animate-pulse z-0
                                  ${
                                    shopStatus.isOpen
                                      ? 'border-[#00ff00] shadow-[0_0_25px_rgba(0,255,0,0.6),inset_0_0_15px_rgba(0,255,0,0.4)]'
                                      : 'border-[#ff0000] shadow-[0_0_25px_rgba(255,0,0,0.6),inset_0_0_15px_rgba(255,0,0,0.4)]'
                                  }`}
                  ></div>

                  {/* Inner White/Pastel Line (Tube Center) */}
                  <div
                    className={`absolute inset-[3px] rounded-[14px] border-[2px] opacity-70 z-0
                                  ${shopStatus.isOpen ? 'border-[#ccffcc]' : 'border-[#ff9999]'}`}
                  ></div>

                  {/* Text */}
                  <h2
                    className={`relative z-10 text-5xl font-bold tracking-widest leading-none
                               ${shopStatus.isOpen ? 'text-[#ccffcc]' : 'text-[#ffcccc]'}`}
                    style={{
                      fontFamily: '"Tilt Neon", "Neon", sans-serif',
                      textShadow: shopStatus.isOpen
                        ? '0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 40px #00ff00'
                        : '0 0 5px #ff0000, 0 0 10px #ff0000, 0 0 20px #ff0000, 0 0 40px #ff0000',
                    }}
                  >
                    {shopStatus.isOpen ? 'ABERTO' : 'FECHADO'}
                  </h2>
                </div>
              </div>
            </>
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
                  className="absolute inset-0 w-full h-full object-cover object-top opacity-100"
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
                {/* Overlays removed for clarity */}
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
                      {inProgress.clientName ? inProgress.clientName.split(' ')[0] : 'Cliente'}
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
                  shopStatus.isOpen ? 'opacity-30 bg-blue-900/20' : 'opacity-20 bg-red-900/10'
                }`}
              ></div>

              {/* Chair Image (Full Cover, Full Color) */}
              <img
                src={shopStatus.isOpen ? '/chair-open.png' : '/chair-closed.png'}
                className={`
                      w-full h-full object-center transition-all duration-1000 transform
                      ${
                        shopStatus.isOpen
                          ? 'object-contain scale-100 drop-shadow-[0_0_50px_rgba(0,100,255,0.2)]'
                          : 'object-cover scale-100 contrast-110 saturate-110'
                      }
                    `}
                alt="Cadeira"
                onError={e => {
                  e.currentTarget.src = shopStatus.isOpen
                    ? 'https://png.pngtree.com/png-vector/20230906/ourmid/pngtree-barber-shop-chair-3d-illustration-png-image_9963953.png'
                    : 'https://png.pngtree.com/png-vector/20230906/ourmid/pngtree-vintage-barber-chair-3d-illustration-png-image_9963943.png';
                }}
              />

              {/* Closed Overlay Effect */}
              {!shopStatus.isOpen && (
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
            className="w-full h-24 bg-gradient-to-r from-emerald-800 via-green-600 to-emerald-900 rounded-lg flex items-center px-0 relative overflow-hidden shadow-[0_4px_20px_rgba(16,185,129,0.4)] active:scale-[0.98] cursor-pointer hover:shadow-[0_6px_25px_rgba(16,185,129,0.5)] transition-all duration-300 group"
          >
            {/* Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>

            {/* 1. Icon/Avatar Area (30%) */}
            <div className="w-[30%] h-full flex items-center justify-center relative z-10 pl-1">
              <div className="w-[3.5rem] h-[3.5rem] rounded-full bg-gradient-to-br from-green-400 to-emerald-700 p-[2px] shadow-lg flex items-center justify-center">
                <img
                  src={
                    inProgress?.photoUrl ||
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
                  }
                  className="w-full h-full object-cover rounded-full filter contrast-110"
                  alt="Client"
                />
              </div>
            </div>

            {/* 2. Content Area (70%) */}
            <div className="w-[70%] h-full flex items-center justify-between px-4 z-10 pl-2">
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[10px] font-black text-green-200/80 uppercase tracking-[0.2em] mb-0.5 shadow-sm">
                  AÇÃO NECESSÁRIA
                </span>
                <span className="text-2xl font-black text-white uppercase leading-none drop-shadow-md tracking-tighter truncate w-full">
                  FINALIZAR
                </span>
              </div>

              {/* Arrow/Action Icon */}
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white text-emerald-900 transition-all">
                <Star size={16} fill="currentColor" className="animate-[spin_4s_linear_infinite]" />
              </div>
            </div>
          </button>
        ) : shopStatus.isOpen || nextClient ? (
          <button
            onClick={() => {
              if (nextClient) {
                onStatusChange(nextClient.id, 'in_progress');
              } else {
                sendBroadcastNotification(
                  'VAGA DISPONÍVEL! ⚡',
                  'Um horário acabou de vagar! Agende agora e garanta seu visual.',
                  'opportunity'
                );
                alert('Notificação enviada para todos os clientes!');
              }
            }}
            disabled={false}
            className={`w-full h-24 rounded-lg flex items-center px-0 relative overflow-hidden transition-all duration-500
              ${
                nextClient
                  ? 'bg-gradient-to-r from-amber-700 via-orange-600 to-red-800 shadow-[0_4px_20px_rgba(185,28,28,0.4)] active:scale-[0.98] cursor-pointer hover:shadow-[0_6px_25px_rgba(234,88,12,0.5)]'
                  : 'bg-gradient-to-r from-neutral-900 via-stone-900 to-neutral-900 shadow-[0_4px_20px_rgba(0,0,0,0.5)] active:scale-[0.95] cursor-pointer hover:shadow-[0_0_30px_rgba(251,191,36,0.15)] border border-white/5 group/radar'
              }
            `}
          >
            {/* Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>

            {/* CONDITIONAL RENDER: CLIENT vs RADAR */}
            {nextClient ? (
              <>
                {/* 1. Client Avatar Area */}
                <div className="w-[30%] h-full flex items-center justify-center relative z-10 pl-1">
                  <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-gradient-to-br from-yellow-500 to-red-600 p-[2px] shadow-lg transform scale-105">
                    <img
                      src={
                        nextClient?.photoUrl ||
                        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
                      }
                      className="w-full h-full object-cover rounded-full filter contrast-110"
                      alt="Client"
                    />
                  </div>
                </div>

                {/* 2. Client Info Area */}
                <div className="w-[70%] h-full flex items-center justify-between px-4 z-10 pl-2">
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-[11px] font-black text-amber-100/80 uppercase tracking-[0.2em] mb-0.5 shadow-sm">
                      PRÓXIMO DA FILA
                    </span>
                    <span className="text-3xl font-black text-white uppercase leading-none drop-shadow-md tracking-tighter truncate w-full">
                      {nextClient.clientName ? nextClient.clientName.split(' ')[0] : 'CLIENTE'}
                    </span>
                  </div>
                  {/* Arrow Icon */}
                  <ChevronRight
                    className="text-amber-200/60 animate-pulse flex-shrink-0 ml-2"
                    size={36}
                  />
                </div>
              </>
            ) : (
              /* --- RADAR MODE (IDLE - DARK THEME) --- */
              <div className="w-full h-full flex items-center justify-between px-6 relative z-10">
                {/* Radar Visual (Left) - Amber/Gold */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  {/* Pulsing Rings */}
                  <div className="absolute inset-0 rounded-full border border-amber-500/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                  <div className="absolute inset-0 rounded-full border border-amber-400/5 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] delay-500"></div>
                  {/* Center Icon */}
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-inner relative overflow-hidden backdrop-blur-sm">
                    {/* Radar Sweep Animation (Subtle) */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-500/10 to-transparent animate-spin [animation-duration:4s]"></div>
                    {/* Static Dot */}
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 shadow-[0_0_10px_#f59e0b] z-10"></div>
                  </div>
                </div>

                {/* Text Info */}
                <div className="flex flex-col items-start flex-1 ml-4 leading-tight opacity-50 group-hover/radar:opacity-100 transition-opacity duration-300">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                    Status: Ocioso
                  </span>
                  <span className="text-xl font-bold text-white uppercase leading-none tracking-tight mt-0.5">
                    Buscar Cliente
                  </span>
                </div>

                {/* Chevron (Subtle) instead of Dots */}
                <ChevronRight
                  className="text-white/10 group-hover/radar:text-amber-500/50 transition-colors duration-300"
                  size={24}
                />
              </div>
            )}
          </button>
        ) : null}
      </div>

      {/* 4. QUEUE TICKER (ISOLATED) */}
      <QueueTicker queue={queue} services={services} />
    </div>
  );
};
