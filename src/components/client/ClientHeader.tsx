import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
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
  const photo = client.photoUrl || (client as any).img;

  // Dynamic Store Status
  const [status, setStatus] = useState(getStoreStatusMessage());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getStoreStatusMessage());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const isOpen = status.isOpen;

  // Get client initials (first letter of first and last name)
  const getInitials = (name: string | undefined) => {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 h-full flex items-center justify-between">
        {/* LEFT: BRANDING */}
        <div className="flex items-center gap-2">
          {/* Logo */}
          <div className="flex items-center justify-center p-1 group transition-transform active:scale-95">
            <TrilhaLogoIcon
              size={45}
              className="drop-shadow-[0_0_10px_rgba(234,179,8,0.4)] group-hover:scale-105 transition-transform"
            />
          </div>

          <div className="flex flex-col justify-center translate-y-px">
            {/* Main Title */}
            <h1 className="text-2xl md:text-3xl text-white tracking-wide leading-none font-rye drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Trilha do Corte
            </h1>
            <div className="flex items-center gap-2 pl-1">
              {/* Subtitle */}
              <span className="text-[10px] md:text-xs font-bold text-[#FFD700] uppercase tracking-[0.35em] drop-shadow-sm opacity-90 font-sans">
                Barber Club
              </span>

              {/* Status Badge - Mobile: Dot, Desktop: Full Text */}
              <div className="flex items-center gap-1.5">
                {/* Pulsing Dot */}
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOpen
                      ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]'
                      : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                  } animate-pulse`}
                />
                {/* Desktop Text */}
                <span
                  className={`hidden md:inline text-[9px] font-bold uppercase tracking-wider ${
                    isOpen ? 'text-green-500' : 'text-red-400'
                  }`}
                >
                  {isOpen ? 'Aberto' : 'Fechado'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: ACTIONS & PROFILE */}
        <div className="flex items-center gap-3">
          {/* NOTIFICATIONS BUTTON */}
          <button
            onClick={onOpenNotifications}
            className={`relative w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-300 active:scale-90 ${
              unreadCount > 0
                ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/20'
                : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10'
            }`}
            style={{
              animation: unreadCount > 0 ? 'wiggle 2.5s ease-in-out infinite' : 'none',
            }}
          >
            <Bell
              size={20}
              className={`transition-all duration-300 ${
                unreadCount > 0
                  ? 'text-[#FFD700] drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]'
                  : 'text-gray-400 group-hover:text-white'
              }`}
            />
            {/* Numeric Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] flex items-center justify-center bg-gradient-to-br from-red-500 to-rose-600 rounded-full border-2 border-[#050505] shadow-[0_0_12px_rgba(239,68,68,0.9)] text-[10px] font-black text-white px-1 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* PROFILE AVATAR BUTTON */}
          <button
            onClick={onOpenMenu}
            className="relative group cursor-pointer transition-all duration-300 active:scale-90"
          >
            {/* Avatar Container */}
            <div
              className={`w-11 h-11 rounded-xl p-[2px] transition-all duration-500 ${
                isOpen
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                  : 'bg-gradient-to-br from-red-500 to-rose-600 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
              }`}
            >
              {/* Inner content */}
              <div className="w-full h-full rounded-[10px] bg-[#0a0a0a] overflow-hidden relative flex items-center justify-center">
                {photo ? (
                  <img
                    src={photo}
                    alt="Profile"
                    className="w-full h-full object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-300"
                  />
                ) : (
                  // Beautiful Initials Avatar
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                    <span className="text-sm font-black text-white/80 group-hover:text-white transition-colors tracking-tight">
                      {getInitials(client.name)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tooltip on Hover (Desktop) */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 pointer-events-none hidden md:block">
              <div className="flex flex-col items-center gap-1 mt-2">
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-transparent border-b-zinc-800" />
                <div className="px-3 py-2 rounded-lg bg-zinc-800 border border-white/10 shadow-xl">
                  <p className="text-white font-bold text-xs">{client.name || 'Cliente'}</p>
                  <p
                    className={`text-[10px] font-medium ${
                      isOpen ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {isOpen ? '● Barbearia Aberta' : '● Fechada Agora'}
                  </p>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
