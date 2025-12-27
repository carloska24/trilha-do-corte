import React from 'react';
import { Menu, Bell, User, MapPin } from 'lucide-react';
import { ClientProfile } from '../../types';
import { getStoreStatusMessage } from '../../utils/dateHelpers';
import { useNotifications } from '../../utils/notificationUtils';

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
  const status = getStoreStatusMessage();
  const { unreadCount } = useNotifications();

  const photo = client.photoUrl || (client as any).img;

  // Get initials
  const initials = client.name
    ? client.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '??';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300 h-20">
      {/* Top Neon Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent ${
          status.isOpen ? 'via-green-500' : 'via-red-500'
        } to-transparent opacity-50`}
      ></div>

      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Left: Identity Zone */}
        <div className="flex items-center gap-4">
          {/* Holographic Avatar */}
          <div className="relative group cursor-pointer">
            {/* Spinning Ring (Only if Open) */}
            {status.isOpen && (
              <div className="absolute -inset-[3px] rounded-full border border-dashed border-green-500/40 animate-[spin_10s_linear_infinite]"></div>
            )}

            {/* Main Ring */}
            <div
              className={`w-12 h-12 rounded-full p-[2px] transition-all duration-500 ${
                status.isOpen
                  ? 'bg-gradient-to-tr from-green-400 to-emerald-600 shadow-[0_0_15px_rgba(74,222,128,0.3)]'
                  : 'bg-gradient-to-tr from-red-500 to-red-900 grayscale-[0.5]'
              }`}
            >
              <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                {photo ? (
                  <img
                    src={photo}
                    alt={client.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={e => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#111]">
                    <span
                      className={`font-bold text-sm ${
                        status.isOpen ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {initials}
                    </span>
                  </div>
                )}
                {/* Glitch Overlay on Hover */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>

            {/* Status Dot (Absolute) */}
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${
                status.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}
            ></div>
          </div>

          {/* Typography Stack */}
          <div className="flex flex-col justify-center">
            <span className="text-[9px] font-mono font-bold text-gray-500 tracking-[0.2em] leading-tight mb-0.5">
              E AÍ,
            </span>
            <span className="text-white font-graffiti text-2xl leading-none drop-shadow-md tracking-wide group cursor-default">
              <span className="group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-neon-yellow group-hover:to-white transition-all duration-300">
                {(client.name || 'VISITANTE').split(' ')[0]}
              </span>
            </span>
          </div>
        </div>

        {/* Right: Actions Zone */}
        <div className="flex items-center gap-2">
          {/* Status Pill */}
          <div
            className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md mr-4 ${
              status.isOpen
                ? 'bg-green-950/20 border-green-500/20'
                : 'bg-red-950/20 border-red-500/20'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                status.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}
            ></span>
            <span
              className={`text-[10px] font-mono font-bold tracking-widest ${
                status.isOpen ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {status.isOpen ? 'ABERTO' : 'FECHADO'}
            </span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-all group relative border border-transparent hover:border-white/10"
          >
            <Bell
              size={20}
              className="text-gray-400 group-hover:text-neon-yellow transition-colors"
            />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-[ping_2s_linear_infinite]"></span>
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-600 rounded-full border border-[#050505]"></span>
              </>
            )}
          </button>

          {/* Menu Button */}
          <button
            onClick={onOpenMenu}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:border-neon-yellow/50 hover:bg-neon-yellow/10 transition-all group"
          >
            <Menu size={20} className="text-white group-hover:text-neon-yellow transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
};
