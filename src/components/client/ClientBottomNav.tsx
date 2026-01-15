import React from 'react';
import { Home, Scissors, Wallet, User, CalendarPlus } from 'lucide-react';

interface ClientBottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenBooking: () => void;
}

export const ClientBottomNav: React.FC<ClientBottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenBooking,
}) => {
  const tabs = [
    { id: 'dash', label: 'Início', icon: Home },
    { id: 'services', label: 'Serviços', icon: Scissors },
    { id: 'wallet', label: 'Carteira', icon: Wallet },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-t border-white/10" />

      {/* Gradient Top Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />

      {/* Navigation Container */}
      <div className="relative flex items-end justify-around h-20 pb-safe px-2">
        {/* Left Tabs */}
        {tabs.slice(0, 2).map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 active:scale-90 ${
                isActive
                  ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/10'
                  : 'hover:bg-white/5'
              }`}
            >
              {/* Icon */}
              <Icon
                size={24}
                className={`transition-all duration-300 ${
                  isActive
                    ? 'text-yellow-400 drop-shadow-[0_0_12px_rgba(234,179,8,0.8)]'
                    : 'text-gray-500'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />

              {/* Label */}
              <span
                className={`text-[10px] font-bold uppercase tracking-wide mt-1 transition-colors ${
                  isActive ? 'text-yellow-400' : 'text-gray-600'
                }`}
              >
                {tab.label}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
              )}
            </button>
          );
        })}

        {/* CENTER BOOKING BUTTON */}
        <div className="relative -mt-6 mx-2">
          {/* Glow Ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 blur-lg opacity-40 animate-pulse" />

          {/* Button */}
          <button
            onClick={onOpenBooking}
            className="relative w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-[0_4px_20px_rgba(234,179,8,0.5)] border-4 border-black active:scale-90 transition-all duration-200 group"
          >
            <CalendarPlus
              size={26}
              className="text-black stroke-[2.5] group-hover:rotate-12 transition-transform"
            />
          </button>

          {/* Label */}
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-wider text-gray-500 whitespace-nowrap">
            Agendar
          </span>
        </div>

        {/* Right Tabs */}
        {tabs.slice(2).map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 active:scale-90 ${
                isActive
                  ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/10'
                  : 'hover:bg-white/5'
              }`}
            >
              {/* Icon */}
              <Icon
                size={24}
                className={`transition-all duration-300 ${
                  isActive
                    ? 'text-yellow-400 drop-shadow-[0_0_12px_rgba(234,179,8,0.8)]'
                    : 'text-gray-500'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />

              {/* Label */}
              <span
                className={`text-[10px] font-bold uppercase tracking-wide mt-1 transition-colors ${
                  isActive ? 'text-yellow-400' : 'text-gray-600'
                }`}
              >
                {tab.label}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
