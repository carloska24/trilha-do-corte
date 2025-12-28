import React, { useEffect, useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { ClientProfile } from '../../types';
import { useNotifications } from '../../utils/notificationUtils';
import { TrilhaLogoIcon } from '../icons/TrilhaLogoIcon';
import { getStoreStatusMessage } from '../../utils/dateHelpers';

interface ClientHeaderProps {
  client: ClientProfile;
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
  client,
  onOpenMenu,
  onOpenNotifications,
}) => {
  const { unreadCount } = useNotifications();
  // const unreadCount = 3; // SIMULATION FOR USER REVIEW
  const photo = client.photoUrl || (client as any).img;

  // Dynamic Store Status
  const [status, setStatus] = useState(getStoreStatusMessage());

  useEffect(() => {
    // Update status every minute
    const interval = setInterval(() => {
      setStatus(getStoreStatusMessage());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const isOpen = status.isOpen;
  // Status Colors
  const ringColor = isOpen ? 'border-green-500' : 'border-red-500';
  const glowShadow = isOpen ? 'shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'shadow-none';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 h-full flex items-center justify-between">
        {/* LEFT: BRANDING */}
        <div className="flex items-center gap-2">
          {/* Logo - No Container, Just Icon */}
          <div className="flex items-center justify-center p-1 group transition-transform">
            <TrilhaLogoIcon
              size={45}
              className="drop-shadow-[0_0_10px_rgba(234,179,8,0.4)] group-hover:scale-105 transition-transform"
            />
          </div>

          <div className="flex flex-col justify-center translate-y-[1px]">
            {/* Main Title with Glow */}
            <h1 className="text-2xl md:text-3xl text-white tracking-wide leading-none font-rye drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Trilha do Corte
            </h1>
            <div className="flex items-center gap-2 pl-1">
              {/* Subtitle with brand color */}
              <span className="text-[10px] md:text-xs font-bold text-[#FFD700] uppercase tracking-[0.35em] drop-shadow-sm opacity-90 font-sans">
                Barber Club
              </span>
              {/* Mobile Dot Indicator */}
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                } md:hidden`}
              ></div>
            </div>
          </div>
        </div>

        {/* RIGHT: ACTIONS & PROFILE */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="flex relative w-10 h-10 items-center justify-center rounded-full hover:bg-white/5 transition-colors group"
          >
            <Bell
              size={22}
              className="text-gray-400 group-hover:text-[#FFD700] transition-colors"
            />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#050505] animate-bounce"></span>
            )}
          </button>

          {/* DYNAMIC PROFILE RING */}
          <button
            onClick={onOpenMenu}
            className={`relative group cursor-pointer transition-transform active:scale-95`}
          >
            {/* Status Text Tooltip (Desktop) */}
            <div
              className={`absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 pointer-events-none hidden md:block`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-black border border-white/10 ${
                  isOpen ? 'text-green-500 border-green-900/50' : 'text-red-500 border-red-900/50'
                }`}
              >
                {isOpen ? 'Barbearia Aberta' : 'Fechada Agora'}
              </span>
            </div>

            {/* The Ring Container */}
            <div
              className={`w-12 h-12 rounded-full p-[2px] border-2 ${ringColor} ${glowShadow} bg-[#050505] transition-all duration-500 relative`}
            >
              {/* Spinning/Pulsing Effect if Open */}
              {isOpen && (
                <div className="absolute inset-0 rounded-full border border-green-500/30 animate-[spin_4s_linear_infinite]"></div>
              )}

              {/* Avatar Image */}
              <div className="w-full h-full rounded-full bg-[#111] overflow-hidden relative border border-white/10">
                {photo ? (
                  <img
                    src={photo}
                    alt="Profile"
                    className="w-full h-full object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#222]">
                    <span className="text-sm font-black text-gray-500 group-hover:text-white transition-colors uppercase">
                      {client.name?.charAt(0) || 'C'}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Badge (Corner) */}
              <div
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-[2px] border-[#050505] ${
                  isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
              ></div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
