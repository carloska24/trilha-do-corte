import React, { useEffect, useRef, useState } from 'react';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import { ChairIcon } from '../icons/ChairIcon';
import { Appointment, AppointmentStatus, ServiceItem } from '../../types';
import { SERVICES as ALL_SERVICES, LOCAL_AVATARS } from '../../constants';
import { Armchair, ChevronLeft, ChevronRight, User, Star } from 'lucide-react';
import { sendBroadcastNotification } from '../../utils/notificationUtils';
import { useData } from '../../contexts/DataContext';
import { useShopStatus } from '../../hooks/useShopStatus';
import { useOutletContext } from 'react-router-dom';

interface DashboardOutletContext {
  initiateFinish: (id: string) => void;
}

import { Client } from '../../types'; // Import Client type

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

        <div className="w-full h-40 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden relative flex items-center shadow-2xl transform-gpu ring-1 ring-white/5 pt-4 group/carousel transition-colors duration-300">
          {/* Neon Glow Decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-30"></div>
          </div>

          {/* Navigation Buttons (Visible on Hover/Focus) */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-30 w-12 bg-gradient-to-r from-black/80 to-transparent flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 hover:from-black/90 cursor-pointer text-white/70 hover:text-cyan-400"
            aria-label="Previous"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-30 w-12 bg-gradient-to-l from-black/80 to-transparent flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 hover:from-black/90 cursor-pointer text-white/70 hover:text-cyan-400"
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

                return (
                  <div
                    key={`${client.id}-${i}`}
                    className="flex-shrink-0 w-72 h-28 bg-[var(--bg-secondary)] backdrop-blur-md rounded-xl border border-[var(--border-color)] mr-5 flex flex-col relative overflow-hidden group/card hover:border-cyan-400 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] select-none"
                  >
                    {/* Vibrant Gradient Background on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/10 via-blue-900/10 to-purple-900/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>

                    {/* Decorative Side Bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600"></div>

                    <div className="flex items-center h-full pl-4 pr-3 py-2 z-10 relative">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-white to-purple-500 shadow-lg shrink-0 self-center">
                        <div className="w-full h-full rounded-full overflow-hidden bg-black relative">
                          <img
                            src={getOptimizedImageUrl(
                              clients.find(c => c.id === client.clientId)?.img ||
                                (client.photoUrl && client.photoUrl.trim() !== ''
                                  ? client.photoUrl
                                  : null) ||
                                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
                              100,
                              100
                            )}
                            className="w-full h-full object-cover filter contrast-110"
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
                      </div>

                      {/* Info Container */}
                      <div className="ml-3 flex flex-col justify-between flex-1 min-w-0 h-full py-1">
                        {/* Top: Client Name (Only First Name, Higher Up) */}
                        <div className="flex items-start w-full mt-0.5">
                          <span className="text-[var(--text-primary)] font-black text-2xl uppercase truncate leading-none tracking-tight group-hover/card:text-cyan-200 transition-colors">
                            {client.clientName ? client.clientName.split(' ')[0] : 'Cliente'}
                          </span>
                        </div>

                        {/* Middle: Service Name (Larger font, centered vertically relative to spacing) */}
                        <div className="flex items-center w-full mt-1 mb-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2 flex-shrink-0 animate-pulse"></div>
                          <span className="text-base font-bold text-[var(--text-secondary)] font-mono uppercase tracking-wide truncate">
                            {serviceName}
                          </span>
                        </div>

                        {/* Bottom: Divider & Time */}
                        <div className="relative w-full pt-1 border-t border-[var(--border-color)] mt-auto flex justify-end">
                          <div className="flex items-center justify-center bg-cyan-500/10 border border-cyan-400/20 rounded-md px-3 py-1 shadow-[0_0_10px_rgba(6,182,212,0.1)] group-hover/card:border-cyan-400/50 transition-all">
                            <span className="text-sm font-black text-cyan-400 font-mono tracking-wider leading-none">
                              {client.time}
                            </span>
                          </div>
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
  const { appointments, services, clients, updateAppointments } = useData();
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
    const clientProfile = clients.find(c => c.id === app.clientId);
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
      {/* 1. CLOCK & DATE */}
      <div className="flex flex-col items-center mt-0 mb-4">
        <h1 className="text-6xl font-bold text-[var(--text-primary)] tracking-tighter leading-none font-sans drop-shadow-lg transition-colors">
          {currentTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </h1>
        <p className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest mt-1 opacity-80 transition-colors">
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
                <div className="relative rounded-2xl px-10 py-3 bg-black/90 flex flex-col items-center">
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
                  <div className="relative border-2 border-green-400/80 rounded-xl px-4 pt-4 pb-2 bg-black/80 backdrop-blur-md shadow-[0_0_20px_rgba(74,222,128,0.3),inset_0_0_10px_rgba(74,222,128,0.1)] flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
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
                      <h2 className="text-3xl font-black text-white uppercase tracking-tighter text-center leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
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
                      : 'scale-110 drop-shadow-[0_0_50px_rgba(255,0,0,0.1)] grayscale-[50%] brightness-75'
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
            ) : nextClient ? (
              <button
                onClick={() => onStatusChange(nextClient.id, 'in_progress')}
                className="w-full h-24 rounded-lg flex items-center px-0 relative overflow-hidden transition-all duration-500 bg-gradient-to-r from-amber-700 via-orange-600 to-red-800 shadow-[0_4px_20px_rgba(185,28,28,0.4)] active:scale-[0.98] cursor-pointer hover:shadow-[0_6px_25px_rgba(234,88,12,0.5)]"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                <div className="w-[30%] h-full flex items-center justify-center relative z-10 pl-1">
                  <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-gradient-to-br from-yellow-500 to-red-600 p-[2px] shadow-lg transform scale-105">
                    <img
                      src={getClientImage(nextClient, 100)}
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
                    <span className="text-[11px] font-black text-amber-100/80 uppercase tracking-[0.2em] mb-0.5 shadow-sm">
                      PRÓXIMO DA FILA
                    </span>
                    <span className="text-3xl font-black text-white uppercase leading-none drop-shadow-md tracking-tighter truncate w-full">
                      {nextClient.clientName ? nextClient.clientName.split(' ')[0] : 'CLIENTE'}
                    </span>
                  </div>
                  <ChevronRight
                    className="text-amber-200/60 animate-pulse flex-shrink-0 ml-2"
                    size={36}
                  />
                </div>
              </button>
            ) : (
              <button
                onClick={() => {
                  sendBroadcastNotification(
                    'VAGA DISPONÍVEL! ⚡',
                    'Um horário acabou de vagar! Agende agora e garanta seu visual.',
                    'opportunity'
                  );
                  alert('Notificação enviada para todos os clientes!');
                }}
                className="w-full h-24 rounded-lg flex items-center px-0 relative overflow-hidden transition-all duration-500 bg-gradient-to-r from-neutral-900 via-stone-900 to-neutral-900 shadow-[0_4px_20px_rgba(0,0,0,0.5)] active:scale-[0.95] cursor-pointer hover:shadow-[0_0_30px_rgba(251,191,36,0.15)] border border-white/5 group/radar"
              >
                {/* Radar Content */}
                <div className="w-full h-full flex items-center justify-between px-6 relative z-10">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-amber-500/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                    <div className="absolute inset-0 rounded-full border border-amber-400/5 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] delay-500"></div>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-inner relative overflow-hidden backdrop-blur-sm">
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-500/10 to-transparent animate-spin [animation-duration:4s]"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 shadow-[0_0_10px_#f59e0b] z-10"></div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start flex-1 ml-4 leading-tight opacity-50 group-hover/radar:opacity-100 transition-opacity duration-300">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                      Status: Ocioso
                    </span>
                    <span className="text-xl font-bold text-white uppercase leading-none tracking-tight mt-0.5">
                      Buscar Cliente
                    </span>
                  </div>
                  <ChevronRight
                    className="text-white/10 group-hover/radar:text-amber-500/50 transition-colors duration-300"
                    size={24}
                  />
                </div>
              </button>
            )}
          </div>
        )}

        {/* 4. QUEUE TICKER (ISOLATED) */}
        <QueueTicker queue={queue} services={services} clients={clients} />
      </>
    </div>
  );
};
