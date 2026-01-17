import React, { useEffect, useRef, useState } from 'react';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import { ChairIcon } from '../icons/ChairIcon';
import { RadarIcon } from '../icons/RadarIcon';
import { Appointment, AppointmentStatus, ServiceItem } from '../../types';
import { SERVICES as ALL_SERVICES, LOCAL_AVATARS } from '../../constants';
import {
  Armchair,
  ChevronLeft,
  ChevronRight,
  User,
  Star,
  X,
  Play,
  SkipForward,
} from 'lucide-react';
import { sendBroadcastNotification } from '../../utils/notificationUtils';
import { useData } from '../../contexts/DataContext';
import { useShopStatus } from '../../hooks/useShopStatus';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../services/api';

interface DashboardOutletContext {
  initiateFinish: (id: string) => void;
}

import { Client } from '../../types'; // Import Client type

const formatName = (name: string | undefined | null) => {
  if (!name) return '';
  return name.split(' ')[0];
};

// --- ISOLATED COMPONENTS (PREVENT RE-RENDERS) ---
const QueueTicker = React.memo(
  ({
    queue,
    services,
    clients,
  }: {
    queue: Appointment[];
    services: ServiceItem[];
    clients: Client[];
  }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    // Auto-Scroll Logic (Faster Speed)
    useEffect(() => {
      const scrollContainer = scrollRef.current;
      if (!scrollContainer || queue.length === 0) return;

      let animationFrameId: number;
      const speed = 1.6; // Pixels per frame (Adjusted: "um pouco mais rápido")

      const animate = () => {
        if (!isPaused && scrollContainer) {
          scrollContainer.scrollLeft += speed;

          // Silent Loop Reset
          // Assumes content is duplicated 3 times [...items, ...items, ...items]
          const scrollWidth = scrollContainer.scrollWidth;
          const clientWidth = scrollContainer.clientWidth;

          if (scrollWidth > clientWidth) {
            // We have 3 sets.
            // Total width ~ 3 * SingleSetWidth.
            // We start at 0 (Set A visible).
            // We want to reset when Set A is fully scrolled out and Set B is fully visible.
            // Set A width = scrollWidth / 3.
            // So when scrollLeft >= scrollWidth / 3, we subtract scrollWidth / 3.
            // This jumps from Start of B back to Start of A.

            const singleSetWidth = scrollWidth / 3;

            if (scrollContainer.scrollLeft >= singleSetWidth) {
              scrollContainer.scrollLeft -= singleSetWidth;
            }
          }
        }
        animationFrameId = requestAnimationFrame(animate);
      };

      animationFrameId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrameId);
    }, [isPaused, queue.length]);

    // Manual Navigation Controls
    const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
        const amount = 310; // Approx item width + gap
        scrollRef.current.scrollBy({
          left: direction === 'left' ? -amount : amount,
          behavior: 'smooth',
        });
      }
    };

    return (
      <div className="w-full relative mt-6 group">
        {/* Title Label */}
        <div className="absolute -top-7 left-4 z-20 flex items-end pointer-events-none">
          <span
            className="font-script text-4xl text-[#FFD700] -rotate-6 drop-shadow-[0_0_4px_#FACC15] z-20 relative"
            style={{ textShadow: '2px 2px 0px #000' }}
          >
            Próximos
          </span>
        </div>

        <div className="w-full h-40 relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/5 pt-4 group/carousel transition-colors duration-300">
          {/* Premium Dark Background with Texture */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-[#0a0a0a] to-zinc-950">
            {/* Grid Pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5" />
          </div>

          {/* Neon Glow Decoration */}
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-30"></div>
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-cyan-500/20 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-purple-500/20 rounded-br-2xl" />
          </div>

          {/* Navigation Buttons (Visible on Hover/Focus) */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-30 w-12 bg-gradient-to-r from-[var(--bg-card)] to-transparent flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 cursor-pointer text-[var(--text-secondary)] hover:text-cyan-400"
            aria-label="Previous"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-30 w-12 bg-gradient-to-l from-[var(--bg-card)] to-transparent flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 cursor-pointer text-[var(--text-secondary)] hover:text-cyan-400"
            aria-label="Next"
          >
            <ChevronRight size={32} />
          </button>

          {queue.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center text-gray-500 z-10 opacity-60">
              <Armchair size={24} className="mb-2 text-gray-600" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-600">
                Terminal Vazio
              </span>
            </div>
          ) : (
            // Scroll Container
            <div
              ref={scrollRef}
              className="flex items-center pl-5 py-2 overflow-x-auto no-scrollbar w-full h-full relative z-10"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => {
                // Delay resume on mobile to allow momentum scroll to finish
                setTimeout(() => setIsPaused(false), 3000);
              }}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                scrollBehavior: 'auto', // Force auto to prevent fighting JS loop
              }}
            >
              {/* Render items 3 times to ensure smooth infinite loop buffer */}
              {[...queue, ...queue, ...queue].map((client, i) => {
                const service =
                  services.find(s => s.id === client.serviceId) ||
                  ALL_SERVICES.find(s => s.id === client.serviceId);
                const serviceName = service ? service.name : 'Corte & Estilo';

                // Get client tier for avatar styling
                const clientData = clients.find(
                  c =>
                    c.id === client.clientId ||
                    c.name.toLowerCase() === client.clientName?.toLowerCase()
                );
                const level = clientData?.level || 1;
                const tierColor =
                  level >= 8
                    ? 'from-purple-400 via-pink-500 to-purple-600'
                    : level >= 5
                      ? 'from-yellow-400 via-amber-500 to-orange-500'
                      : level >= 3
                        ? 'from-cyan-400 via-blue-500 to-cyan-600'
                        : 'from-green-400 via-emerald-500 to-green-600';
                const tierGlow =
                  level >= 8
                    ? 'shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                    : level >= 5
                      ? 'shadow-[0_0_20px_rgba(250,204,21,0.5)]'
                      : level >= 3
                        ? 'shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                        : 'shadow-[0_0_15px_rgba(34,197,94,0.4)]';

                return (
                  <div
                    key={`${client.id}-${i}`}
                    className="flex-shrink-0 w-[280px] h-[110px] mr-5 relative overflow-hidden group/card select-none rounded-2xl transition-all duration-500 hover:scale-[1.02]"
                  >
                    {/* === CARD BACKGROUND === */}
                    {/* Premium Dark Glassmorphism */}
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/95 via-black/90 to-zinc-950/95 backdrop-blur-xl" />

                    {/* Animated Holographic Shine on Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000" />
                    </div>

                    {/* Subtle Grid Pattern */}
                    <div
                      className="absolute inset-0 opacity-[0.02]"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                        backgroundSize: '12px 12px',
                      }}
                    />

                    {/* Border Glow */}
                    <div className="absolute inset-0 rounded-2xl border border-white/[0.08] group-hover/card:border-cyan-500/30 transition-colors duration-300" />

                    {/* Decorative Accent Line (Left) */}
                    <div
                      className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b ${tierColor} ${tierGlow}`}
                    />

                    {/* === CARD CONTENT === */}
                    <div className="relative z-10 flex items-center h-full pl-4 pr-3 py-3 gap-3">
                      {/* Avatar Section - Fixed 56px */}
                      <div className="relative flex-shrink-0 w-14 h-14">
                        {/* Subtle Glow */}
                        <div
                          className={`absolute -inset-0.5 rounded-full bg-gradient-to-tr ${tierColor} opacity-40 blur-sm`}
                        />

                        {/* Avatar Container */}
                        <div
                          className={`relative w-full h-full rounded-full p-[2px] bg-gradient-to-tr ${tierColor} ${tierGlow}`}
                        >
                          <div className="w-full h-full rounded-full overflow-hidden bg-black border border-white/10">
                            <img
                              src={getOptimizedImageUrl(
                                clientData?.img ||
                                  (client.photoUrl && client.photoUrl.trim() !== ''
                                    ? client.photoUrl
                                    : null) ||
                                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
                                100,
                                100
                              )}
                              className="w-full h-full object-cover"
                              alt={client.clientName}
                              loading="lazy"
                              onError={e => {
                                const target = e.currentTarget;
                                target.onerror = null;
                                target.src =
                                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop';
                              }}
                            />
                          </div>

                          {/* Live Indicator */}
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-black shadow-[0_0_6px_#22c55e]" />
                        </div>
                      </div>

                      {/* Main Content - Flex 1 */}
                      <div className="flex-1 flex flex-col justify-center min-w-0 relative">
                        {/* Top Row: Name + Time */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                          {/* Client Name - Priority */}
                          <h3 className="text-lg font-black text-white uppercase leading-none tracking-tight truncate">
                            {formatName(client.clientName) || 'CLIENTE'}
                          </h3>

                          {/* Time Badge - Compact */}
                          <div className="flex-shrink-0 px-2 py-1 rounded-md bg-cyan-500/15 border border-cyan-400/25">
                            <span className="text-xs font-black text-cyan-400 font-mono tracking-wide">
                              {client.time}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Row: Service */}
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_#22d3ee] animate-pulse" />
                          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider truncate">
                            {serviceName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Accent Line */}
                    <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
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
  const { appointments, services, clients, updateAppointments } = useData();
  const { currentTime, shopStatus } = useShopStatus(); // Using Centralized Logic
  const { initiateFinish } = useOutletContext<DashboardOutletContext>();
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0); // Índice do cliente atual no card
  const [radarToast, setRadarToast] = useState<string | null>(null);

  const onInitiateFinish = initiateFinish;

  const handleSkipConfirm = async () => {
    if (!nextClient) return;
    setIsSkipModalOpen(false);

    // Optimistic Update
    const updated = appointments.map(app =>
      app.id === nextClient.id ? { ...app, status: 'cancelled' as const } : app
    );
    updateAppointments(updated);

    try {
      await api.updateAppointment(nextClient.id, { status: 'cancelled' });
    } catch (err) {
      console.error('Failed to cancel', err);
    }
  };

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

  // Calculate Today's Date String (YYYY-MM-DD) for filtering
  const todayString = React.useMemo(() => {
    const year = currentTime.getFullYear();
    const month = String(currentTime.getMonth() + 1).padStart(2, '0');
    const day = String(currentTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [currentTime.toDateString()]); // Only recalc when date changes

  // Memoized Derived Data to prevent recalc on every clock tick
  const { queue, inProgress, nextClient } = React.useMemo(() => {
    const q = appointments
      .filter(a => (a.status === 'pending' || a.status === 'confirmed') && a.date === todayString)
      .sort((a, b) => a.time.localeCompare(b.time));

    return {
      queue: q,
      inProgress: appointments.find(a => a.status === 'in_progress'),
      nextClient: q.length > 0 ? q[0] : null,
    };
  }, [appointments, todayString]);

  // Cliente atualmente exibido no card (pode ser diferente do primeiro da fila se o usuário pulou)
  const previewedClient = React.useMemo(() => {
    // Reset previewIndex se ultrapassar o tamanho da fila
    const safeIndex = Math.min(previewIndex, queue.length - 1);
    return queue.length > 0 ? queue[Math.max(0, safeIndex)] : null;
  }, [queue, previewIndex]);

  // Resetar previewIndex quando a fila mudar significativamente
  React.useEffect(() => {
    if (previewIndex >= queue.length) {
      setPreviewIndex(0);
    }
  }, [queue.length, previewIndex]);

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

  // Helper to get client image
  const getClientImage = (app: Appointment | null | undefined, size = 100) => {
    if (!app) {
      // Placeholder for empty state (Deterministic based on 'Guest')
      const seed = 'Guest'.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return getOptimizedImageUrl(LOCAL_AVATARS[seed % LOCAL_AVATARS.length], size, size);
    }

    // 1. Try to find client in the list (Most reliable/up-to-date)
    const clientProfile = clients.find(
      c => c.id === app.clientId || c.name.toLowerCase() === app.clientName?.toLowerCase()
    );
    if (clientProfile && clientProfile.img && clientProfile.img.trim() !== '') {
      return getOptimizedImageUrl(clientProfile.img, size, size);
    }

    // 2. Fallback to appointment photoUrl (if any, e.g. guest or snapshot)
    // BLOCK: Explicitly ignore the old generic placeholder if it was saved to DB
    const OLD_PLACEHOLDER = 'photo-1500648767791';
    if (app.photoUrl && app.photoUrl.trim() !== '' && !app.photoUrl.includes(OLD_PLACEHOLDER)) {
      return getOptimizedImageUrl(app.photoUrl, size, size);
    }

    // 3. Fallback placeholder (Deterministic Random Avatar)
    const seed = (app.clientName || 'Visitor')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const avatarIndex = seed % LOCAL_AVATARS.length;
    return getOptimizedImageUrl(LOCAL_AVATARS[avatarIndex], size, size);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto h-full animate-[fadeIn_0.5s_ease-out] transition-colors duration-300">
      {/* 1. CLOCK & DATE - iPhone Style */}
      <div className="flex flex-col items-center pt-2 mb-2 py-2 px-8">
        <h1 className="text-6xl font-bold text-white tracking-tighter leading-none font-sans">
          {currentTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
          {dateString}
        </p>
      </div>

      {/* 2. UNIFIED VISUAL LAYOUT (OPEN & CLOSED) */}
      <>
        {/* RECTANGULAR STATUS AREA (BLUE ZONE) */}
        <div
          className={`w-full relative flex-1 flex flex-col justify-center ${
            shopStatus.isOpen || inProgress ? 'mb-4' : 'mb-8'
          }`}
        >
          {/* Main Status Container */}
          <div className="w-full aspect-square md:aspect-auto md:h-[500px] relative bg-[var(--bg-card)] rounded-md overflow-hidden shadow-2xl border border-[var(--border-color)] group transition-colors duration-300">
            {/* 1. STATUS SIGNAGE (TOP ABSOLUTE) - Hide when In Progress */}
            {/* 1. STATUS SIGNAGE (TOP ABSOLUTE) - Hide when In Progress */}
            {!inProgress && (
              <div className="absolute top-8 left-2 z-30 pointer-events-none transform rotate-[-8deg] scale-[0.6] origin-top-left">
                <div className="relative rounded-2xl px-10 py-3 bg-black/90 flex flex-col items-center shadow-lg backdrop-blur-sm border border-white/10">
                  {/* DYNAMIC GLOW & BORDER LAYER */}
                  <div
                    className={`absolute inset-0 border-[5px] rounded-2xl animate-pulse z-0 ${
                      shopStatus.isOpen
                        ? 'border-[#00ff00] shadow-[0_0_25px_rgba(0,255,0,0.6),inset_0_0_15px_rgba(0,255,0,0.4)]'
                        : 'border-[#ff0000] shadow-[0_0_25px_rgba(255,0,0,0.6),inset_0_0_15px_rgba(255,0,0,0.4)]'
                    }`}
                  ></div>

                  {/* Inner White/Pastel Line */}
                  <div
                    className={`absolute inset-[3px] rounded-[14px] border-[2px] opacity-70 z-0 ${
                      shopStatus.isOpen ? 'border-[#ccffcc]' : 'border-[#ff9999]'
                    }`}
                  ></div>

                  {/* Text */}
                  <h2
                    className={`relative z-10 text-5xl font-bold tracking-widest leading-none ${
                      shopStatus.isOpen ? 'text-[#ccffcc]' : 'text-[#ffcccc]'
                    }`}
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
            )}

            {/* 2. MAIN CONTENT (FULL COVER) */}
            {inProgress ? (
              /* --- IN PROGRESS (FULL COVER + ROTATION) --- */
              <div className="w-full h-full relative animate-[flipInY_0.8s_ease-out] [perspective:1000px]">
                {/* 1. BACKGROUND CONTAINER */}
                <div className="absolute inset-0 bg-[var(--bg-card)] z-0 transition-colors">
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
                </div>

                {/* 1.5 MINI HANGING SIGN */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center w-full pointer-events-none">
                  <div className="relative flex flex-col items-center transform hover:scale-105 transition-transform duration-500">
                    <Star className="absolute top-0 -left-6 text-yellow-400 w-4 h-4 animate-pulse drop-shadow-[0_0_4px_#FACC15] fill-yellow-400" />
                    <Star className="absolute top-0 -right-6 text-yellow-400 w-4 h-4 animate-pulse drop-shadow-[0_0_4px_#FACC15] fill-yellow-400" />
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
                    <div className="absolute inset-0 bg-cyan-500 rounded-full blur-[60px] opacity-20 animate-pulse group-hover:opacity-40 transition-opacity duration-500"></div>
                    <div className="absolute -inset-8 border border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none"></div>
                    <div className="absolute -inset-2 border-2 border-dashed border-cyan-400/40 rounded-full animate-[spin_20s_linear_infinite_reverse] pointer-events-none"></div>
                    <div className="w-56 h-56 md:w-72 md:h-72 rounded-full p-2 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_40px_rgba(6,182,212,0.4)] relative overflow-hidden ring-4 ring-black/50">
                      <div className="w-full h-full rounded-full border-[4px] border-white/20 overflow-hidden relative bg-black">
                        <img
                          src={getClientImage(inProgress, 300)}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          alt="Cliente"
                          onError={e => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1618077553780-75539862f629?q=80&w=400&auto=format&fit=crop';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Neon Sign (Bottom) */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[80%] max-w-[280px]">
                  <div className="relative border-2 border-green-400/80 rounded-xl px-4 pt-4 pb-2 bg-[var(--bg-card)]/80 backdrop-blur-md shadow-[0_0_20px_rgba(74,222,128,0.3),inset_0_0_10px_rgba(74,222,128,0.1)] flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                    <div className="absolute -top-5 left-0 right-0 text-center z-20">
                      <span
                        className="font-script text-4xl text-[#FFD700] -rotate-3 drop-shadow-[0_0_5px_#FACC15] block"
                        style={{ textShadow: '2px 2px 0px #000' }}
                      >
                        Em Atendimento
                      </span>
                    </div>
                    <Star className="absolute top-2 left-2 text-yellow-400 w-4 h-4 animate-pulse drop-shadow-[0_0_4px_#FACC15] fill-yellow-400" />
                    <Star className="absolute top-2 right-2 text-yellow-400 w-4 h-4 animate-pulse drop-shadow-[0_0_4px_#FACC15] fill-yellow-400" />
                    <div className="flex flex-col items-center relative z-10 w-full mt-1">
                      <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter text-center leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                        {inProgress.clientName ? inProgress.clientName.split(' ')[0] : 'Cliente'}
                      </h2>
                      <div className="w-1/2 h-[2px] bg-gradient-to-r from-transparent via-green-500 to-transparent mt-1 mb-1"></div>
                      <span className="text-[10px] font-bold text-green-300 uppercase tracking-[0.2em]">
                        Visual Confirmado
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* --- SHOP STATUS (CHAIR) - STATIC (OPEN/CLOSED) --- */
              <div className="w-full h-full relative flex items-end justify-center overflow-hidden">
                <div
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    shopStatus.isOpen ? 'opacity-30 bg-blue-900/20' : 'opacity-60 bg-red-900/10'
                  }`}
                ></div>
                <img
                  src={shopStatus.isOpen ? '/chair-open.png' : '/chair-closed.png'}
                  className={`w-full h-full object-contain object-center transition-all duration-1000 transform ${
                    shopStatus.isOpen
                      ? 'scale-100 drop-shadow-[0_0_50px_rgba(0,100,255,0.2)]'
                      : 'scale-110 drop-shadow-[0_0_50px_rgba(255,0,0,0.15)]'
                  }`}
                  alt="Barbearia"
                  onError={e => {
                    e.currentTarget.src =
                      'https://png.pngtree.com/png-vector/20230906/ourmid/pngtree-barber-shop-chair-3d-illustration-png-image_9963953.png';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* 3. NEXT CLIENT ACTION BUTTON */}
        {(shopStatus.isOpen || inProgress) && (
          <div className="w-full mb-4">
            {inProgress ? (
              <button
                onClick={() => onInitiateFinish(inProgress.id)}
                className="w-full h-24 bg-gradient-to-r from-emerald-800 via-green-600 to-emerald-900 rounded-lg flex items-center px-0 relative overflow-hidden shadow-[0_4px_20px_rgba(16,185,129,0.4)] active:scale-[0.98] cursor-pointer hover:shadow-[0_6px_25px_rgba(16,185,129,0.5)] transition-all duration-300 group"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                <div className="w-[30%] h-full flex items-center justify-center relative z-10 pl-1">
                  <div className="w-[3.5rem] h-[3.5rem] rounded-full bg-gradient-to-br from-green-400 to-emerald-700 p-[2px] shadow-lg flex items-center justify-center">
                    <img
                      src={getClientImage(inProgress, 100)}
                      className="w-full h-full object-cover rounded-full filter contrast-110"
                      alt="Client"
                      onError={e => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop';
                      }}
                    />
                  </div>
                </div>
                <div className="w-[70%] h-full flex items-center justify-between px-4 z-10 pl-2">
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-[10px] font-black text-green-200/80 uppercase tracking-[0.2em] mb-0.5 shadow-sm">
                      AÇÃO NECESSÁRIA
                    </span>
                    <span className="text-2xl font-black text-white uppercase leading-none drop-shadow-md tracking-tighter truncate w-full">
                      FINALIZAR
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white text-emerald-900 transition-all">
                    <Star
                      size={16}
                      fill="currentColor"
                      className="animate-[spin_4s_linear_infinite]"
                    />
                  </div>
                </div>
              </button>
            ) : previewedClient ? (
              /* === COMMAND CENTER CARD === */
              <div className="w-full rounded-2xl relative overflow-hidden transition-all duration-500 group/card">
                {/* Animated Neon Yellow Border */}
                <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 animate-[borderGlow_3s_ease-in-out_infinite]">
                  <div className="absolute inset-[2px] rounded-2xl bg-[#0a0a0a]"></div>
                </div>

                {/* Card Content */}
                <div className="relative z-10 p-4">
                  {/* Top Section: Avatar + Info */}
                  <div className="flex items-center gap-4 mb-4">
                    {/* Avatar with Glow */}
                    <div className="relative flex-shrink-0">
                      <div className="absolute -inset-1 rounded-full bg-yellow-500/40 blur-md animate-pulse"></div>
                      <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-600 shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                        <div className="w-full h-full rounded-full overflow-hidden bg-black border border-white/10">
                          <img
                            src={getClientImage(previewedClient, 100)}
                            className="w-full h-full object-cover"
                            alt="Client"
                            onError={e => {
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop';
                            }}
                          />
                        </div>
                        {/* Status Indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-black shadow-[0_0_8px_#22c55e]"></div>
                      </div>
                    </div>

                    {/* Client Info */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] block">
                        PRÓXIMO DA FILA
                      </span>
                      <h2 className="text-2xl font-black text-white uppercase leading-none tracking-tight truncate">
                        {previewedClient.clientName
                          ? previewedClient.clientName.split(' ')[0]
                          : 'CLIENTE'}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">
                          {(() => {
                            const service =
                              services.find(s => s.id === previewedClient.serviceId) ||
                              ALL_SERVICES.find(s => s.id === previewedClient.serviceId);
                            return service ? service.name : 'Corte & Estilo';
                          })()}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="text-xs font-mono text-yellow-500 font-bold">
                          {previewedClient.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="grid grid-cols-[1fr_1fr_2fr] gap-2">
                    {/* CANCELAR Button - Cancela agendamento diretamente */}
                    <button
                      onClick={async e => {
                        e.stopPropagation();
                        // Cancelar diretamente sem confirmação
                        const updated = appointments.map(app =>
                          app.id === previewedClient.id
                            ? { ...app, status: 'cancelled' as const }
                            : app
                        );
                        updateAppointments(updated);
                        setPreviewIndex(0); // Reset para o próximo da fila
                        try {
                          await api.updateAppointment(previewedClient.id, { status: 'cancelled' });
                        } catch (err) {
                          console.error('Failed to cancel', err);
                        }
                      }}
                      className="flex items-center justify-center gap-2 py-3.5 px-3 rounded-lg bg-gradient-to-b from-red-900/40 to-red-950/60 border border-red-500/50 text-red-400 hover:border-red-400 hover:text-red-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all active:scale-95 relative overflow-hidden group"
                    >
                      {/* Tech corner accents */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500/70"></div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-500/70"></div>
                      <X
                        size={20}
                        strokeWidth={3}
                        className="drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                      />
                    </button>

                    {/* PULAR Button - Move o cliente atual para o fim da fila */}
                    <button
                      onClick={async e => {
                        e.stopPropagation();
                        // Persistir o pulo: adiciona sufixo ao horário para ir para o fim da fila
                        const currentTime = previewedClient.time;
                        // Se já foi pulado antes (tem :99), ignora
                        if (currentTime.includes(':99')) return;

                        const newTime = currentTime + ':99'; // Sufixo para ordenação

                        // Atualizar localmente
                        const updated = appointments.map(app =>
                          app.id === previewedClient.id ? { ...app, time: newTime } : app
                        );
                        updateAppointments(updated);

                        // Persistir no banco
                        try {
                          await api.updateAppointment(previewedClient.id, {
                            time: newTime,
                          } as Partial<typeof previewedClient>);
                        } catch (err) {
                          console.error('Failed to skip', err);
                        }
                      }}
                      disabled={queue.length <= 1 || previewedClient.time.includes(':99')}
                      className="flex items-center justify-center gap-2 py-3.5 px-3 rounded-lg bg-gradient-to-b from-slate-800/60 to-slate-900/80 border border-slate-500/40 text-slate-300 hover:border-slate-400 hover:text-white hover:shadow-[0_0_15px_rgba(148,163,184,0.2)] transition-all active:scale-95 relative overflow-hidden"
                    >
                      {/* Tech corner accents */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-slate-500/50"></div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-slate-500/50"></div>
                      {/* Custom Double Chevron SVG */}
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 -42 469 469"
                        fill="currentColor"
                        className="drop-shadow-sm"
                      >
                        <path d="m90.667969 384.167969h-53.335938c-20.585937 0-37.332031-16.746094-37.332031-37.335938 0-7.742187 2.390625-15.273437 6.71875-21.183593l92.226562-133.480469-92.480468-133.847657c-4.074219-5.546874-6.464844-13.078124-6.464844-20.820312 0-20.585938 16.746094-37.332031 37.332031-37.332031h53.335938c12.4375 0 24.019531 6.25 31.015625 16.722656l106.519531 154.476563c4.074219 5.523437 6.464844 13.054687 6.464844 20.800781 0 7.742187-2.390625 15.273437-6.722657 21.183593l-106.410156 154.28125c-6.847656 10.28125-18.429687 16.535157-30.867187 16.535157zm-53.335938-352c-2.898437 0-5.332031 2.429687-5.332031 5.332031 0 1.152344.363281 2.046875.535156 2.261719l99.027344 143.296875c3.777344 5.460937 3.777344 12.714844 0 18.195312l-98.773438 142.933594c-.425781.597656-.789062 1.492188-.789062 2.644531 0 2.902344 2.433594 5.335938 5.332031 5.335938h53.335938c2.386719 0 3.773437-1.558594 4.394531-2.496094l106.816406-154.859375c.425782-.597656.789063-1.492188.789063-2.644531 0-1.152344-.363281-2.050781-.535157-2.261719l-106.921874-155.050781c-.769532-1.132813-2.15625-2.6875-4.542969-2.6875zm0 0"></path>
                        <path d="m325.332031 384.167969h-53.332031c-20.585938 0-37.332031-16.746094-37.332031-37.335938 0-7.742187 2.386719-15.273437 6.71875-21.183593l92.222656-133.480469-92.480469-133.847657c-4.074218-5.546874-6.460937-13.078124-6.460937-20.820312 0-20.585938 16.746093-37.332031 37.332031-37.332031h53.332031c12.4375 0 24.023438 6.25 31.019531 16.722656l106.519532 154.476563c4.074218 5.523437 6.460937 13.054687 6.460937 20.800781 0 7.742187-2.386719 15.273437-6.71875 21.183593l-106.410156 154.28125c-6.847656 10.28125-18.433594 16.535157-30.871094 16.535157zm-53.332031-352c-2.902344 0-5.332031 2.429687-5.332031 5.332031 0 1.152344.363281 2.046875.53125 2.261719l99.03125 143.296875c3.773437 5.460937 3.773437 12.714844 0 18.195312l-98.773438 142.933594c-.425781.597656-.789062 1.492188-.789062 2.644531 0 2.902344 2.429687 5.335938 5.332031 5.335938h53.332031c2.390625 0 3.777344-1.558594 4.394531-2.496094l106.816407-154.859375c.425781-.597656.789062-1.492188.789062-2.644531 0-1.152344-.363281-2.050781-.53125-2.261719l-106.921875-155.050781c-.769531-1.132813-2.15625-2.6875-4.546875-2.6875zm0 0"></path>
                      </svg>
                    </button>

                    {/* CHAMAR PRÓXIMO Button (Primary) */}
                    <button
                      onClick={() => {
                        onStatusChange(previewedClient.id, 'in_progress');
                        setPreviewIndex(0); // Reset após chamar
                      }}
                      className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg bg-gradient-to-b from-yellow-400 via-yellow-500 to-amber-600 text-black font-black shadow-[0_4px_20px_rgba(234,179,8,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.7)] hover:scale-[1.02] transition-all active:scale-95 relative overflow-hidden border border-yellow-400/50"
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      {/* Tech corner accents */}
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-300/80"></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-700/80"></div>
                      {/* Custom Play Icon SVG */}
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 30.065 30.065"
                        fill="currentColor"
                        className="drop-shadow-md"
                      >
                        <path d="M26.511,12.004L6.233,0.463c-2.151-1.228-4.344,0.115-4.344,2.53v24.093c0,2.046,1.332,2.979,2.57,2.979c0.583,0,1.177-0.184,1.767-0.543l20.369-12.468c1.024-0.629,1.599-1.56,1.581-2.555C28.159,13.503,27.553,12.593,26.511,12.004z M25.23,14.827L4.862,27.292c-0.137,0.084-0.245,0.126-0.319,0.147c-0.02-0.074-0.04-0.188-0.04-0.353V2.994c0-0.248,0.045-0.373,0.045-0.404c0.08,0.005,0.22,0.046,0.396,0.146l20.275,11.541c0.25,0.143,0.324,0.267,0.348,0.24C25.554,14.551,25.469,14.678,25.23,14.827z"></path>
                      </svg>
                      <span className="text-sm font-black uppercase tracking-wider drop-shadow-sm">
                        CHAMAR
                      </span>
                    </button>
                  </div>
                </div>

                {/* Animated Circuit Lines - Energy Flow Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none overflow-hidden">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Base circuit paths (dim) */}
                    <path
                      d="M0 20 L30 20 L50 40 L100 40"
                      stroke="rgba(234,179,8,0.15)"
                      fill="none"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M0 50 L20 50 L40 70 L100 70"
                      stroke="rgba(234,179,8,0.15)"
                      fill="none"
                      strokeWidth="1.5"
                    />

                    {/* Animated energy flow on path 1 */}
                    <path
                      d="M0 20 L30 20 L50 40 L100 40"
                      stroke="url(#energyGradient)"
                      fill="none"
                      strokeWidth="2"
                      strokeDasharray="20 80"
                      style={{
                        animation: 'circuitFlow 2s linear infinite',
                      }}
                    />

                    {/* Animated energy flow on path 2 */}
                    <path
                      d="M0 50 L20 50 L40 70 L100 70"
                      stroke="url(#energyGradient)"
                      fill="none"
                      strokeWidth="2"
                      strokeDasharray="15 85"
                      style={{
                        animation: 'circuitFlow 2.5s linear infinite',
                        animationDelay: '0.5s',
                      }}
                    />

                    {/* Junction nodes - pulsing */}
                    <circle
                      cx="50"
                      cy="40"
                      r="3"
                      fill="#eab308"
                      className="animate-pulse"
                      style={{ filter: 'drop-shadow(0 0 4px #eab308)' }}
                    />
                    <circle
                      cx="40"
                      cy="70"
                      r="3"
                      fill="#eab308"
                      className="animate-pulse"
                      style={{ filter: 'drop-shadow(0 0 4px #eab308)', animationDelay: '0.3s' }}
                    />
                    <circle
                      cx="30"
                      cy="20"
                      r="2"
                      fill="#eab308"
                      className="animate-pulse opacity-60"
                    />
                    <circle
                      cx="20"
                      cy="50"
                      r="2"
                      fill="#eab308"
                      className="animate-pulse opacity-60"
                      style={{ animationDelay: '0.6s' }}
                    />

                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Scanning line effect (horizontal) */}
                <div
                  className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
                  style={{ opacity: 0.3 }}
                >
                  <div
                    className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
                    style={{
                      animation: 'scanLine 3s ease-in-out infinite',
                    }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  sendBroadcastNotification(
                    '⚡ HORÁRIO LIVRE AGORA!',
                    'Seu barbeiro está disponível! Garanta antes que outro cliente agende.',
                    'opportunity'
                  );
                  // Show styled toast instead of native alert
                  setRadarToast(`🔔 Notificação enviada para ${clients.length} clientes!`);
                  setTimeout(() => setRadarToast(null), 3000);
                }}
                className="w-full rounded-2xl relative overflow-hidden transition-all duration-500 active:scale-[0.97] cursor-pointer group/idle"
              >
                {/* Background - Pure black gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 group-hover/idle:via-green-500/10 transition-all duration-700" />

                {/* Subtle grid pattern */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(110,237,74,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(110,237,74,0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />

                {/* Animated border glow - green */}
                <div className="absolute inset-0 rounded-2xl border border-green-500/20 group-hover/idle:border-green-500/40 transition-colors duration-500" />
                <div className="absolute inset-0 rounded-2xl group-hover/idle:shadow-[0_0_40px_rgba(84,198,56,0.2)] transition-all duration-500" />

                {/* Content */}
                <div className="relative z-10 flex items-center justify-center p-4 gap-4">
                  {/* Left: Radar Icon */}
                  <RadarIcon size={56} />

                  {/* Center: Status Text */}
                  <div className="flex flex-col items-center text-center gap-1">
                    {/* Status label with pulsing dot */}
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#54C638] animate-pulse" />
                      <span className="text-[10px] font-bold text-green-500/80 uppercase tracking-[0.2em]">
                        Aguardando Cliente
                      </span>
                    </div>

                    {/* Main CTA */}
                    <span className="text-lg font-black text-white uppercase tracking-wide group-hover/idle:text-green-400 transition-colors duration-300">
                      🔔 Notificar Clientes
                    </span>

                    {/* Client count badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 group-hover/idle:bg-green-500/15 transition-colors">
                      <span className="text-green-400 text-[10px]">📱</span>
                      <span className="text-[10px] font-bold text-green-400/80">
                        {clients.length} clientes receberão
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scanning line effect */}
                <div
                  className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
                  style={{ opacity: 0.4 }}
                >
                  <div
                    className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                    style={{ animation: 'scanLine 4s ease-in-out infinite' }}
                  />
                </div>
              </button>
            )}
          </div>
        )}

        {/* 5. CONFIRMATION MODAL (CUSTOM STYLE) */}
        {isSkipModalOpen && nextClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsSkipModalOpen(false)}
            ></div>
            <div className="relative w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
              {/* Warning Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2 animate-pulse">
                  <User size={32} className="text-red-500" />
                  <div className="absolute text-red-500 transform translate-x-3 translate-y-3">
                    <X size={16} strokeWidth={4} />
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-2">
                Cliente não veio?
              </h3>
              <p className="text-[var(--text-secondary)] text-center text-sm mb-6">
                Isso irá marcar{' '}
                <span className="text-[var(--text-primary)] font-bold">
                  {nextClient.clientName}
                </span>{' '}
                como "Não Compareceu" e chamar o próximo da fila.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsSkipModalOpen(false)}
                  className="py-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold hover:bg-[var(--bg-primary)] transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSkipConfirm}
                  className="py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-800 text-white font-bold shadow-lg shadow-red-900/30 hover:scale-105 active:scale-95 transition-transform"
                >
                  Pular Cliente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. QUEUE TICKER (ISOLATED) */}
        <QueueTicker queue={queue} services={services} clients={clients} />

        {/* RADAR TOAST NOTIFICATION */}
        {radarToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-[fadeInUp_0.3s_ease-out]">
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 border border-green-400/30 shadow-[0_0_30px_rgba(34,197,94,0.4)] backdrop-blur-xl">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <span className="text-lg">📡</span>
              </div>
              <span className="text-white font-bold text-sm">{radarToast}</span>
            </div>
          </div>
        )}
      </>
    </div>
  );
};
