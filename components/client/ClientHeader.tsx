import React from 'react';
import { Menu, Bell, User, MapPin } from 'lucide-react';
import { ClientProfile } from '../../types';

interface ClientHeaderProps {
  client: ClientProfile;
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
}

import { getStoreStatusMessage } from '../../utils/dateHelpers';

export const ClientHeader: React.FC<ClientHeaderProps> = ({
  client,
  onOpenMenu,
  onOpenNotifications,
}) => {
  const status = getStoreStatusMessage();
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-street-dark/95 backdrop-blur-md border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Profile & Greeting */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-yellow to-neon-orange p-[2px]">
              <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
                {photo ? (
                  <img
                    src={photo}
                    alt={client.name}
                    className="w-full h-full object-cover"
                    onError={e => {
                      // Fallback on error to hiding image and showing fallback div (handled by parent logic usually, but here simple hide)
                      e.currentTarget.style.display = 'none';
                      // Logic to show fallback text would require state, but let's assume valid URL or fallback
                    }}
                  />
                ) : (
                  <span className="text-neon-yellow font-bold text-xs">{initials}</span>
                )}
              </div>
            </div>
            {/* Online Status Badge */}
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${status.color}`}
            ></div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${status.color} ${
                  status.isOpen ? 'animate-pulse' : ''
                }`}
              ></span>
              {status.text}
            </span>
            <span className="text-white font-graffiti text-lg leading-none">
              Olá,{' '}
              <span className="text-neon-yellow">{(client.name || 'Visitante').split(' ')[0]}</span>
            </span>
          </div>
        </div>

        {/* Center: Logo (Optional/Mobile Hidden or Compact) */}
        {/* <div className="hidden md:flex text-neon-yellow font-graffiti text-xl">TRILHA</div> */}

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenNotifications}
            className="text-gray-400 hover:text-neon-yellow transition-colors relative"
          >
            <Bell size={22} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-neon-orange rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-neon-orange rounded-full"></span>
          </button>

          <button
            onClick={onOpenMenu}
            className="text-white hover:text-neon-yellow transition-colors p-1"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};
