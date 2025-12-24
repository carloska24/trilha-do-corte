import React from 'react';
import { Home, CalendarPlus, Wallet, User, Grid } from 'lucide-react';

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
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111]/95 backdrop-blur-xl border-t border-white/10 pb-safe md:hidden">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => onTabChange('dash')}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            currentTab === 'dash' ? 'text-neon-yellow' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Home
            size={20}
            className={currentTab === 'dash' ? 'drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : ''}
          />
          <span className="text-[9px] font-bold uppercase tracking-wide">Início</span>
        </button>

        <button
          onClick={() => onTabChange('services')}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            currentTab === 'services' ? 'text-neon-yellow' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Grid
            size={20}
            className={currentTab === 'services' ? 'drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : ''}
          />
          <span className="text-[9px] font-bold uppercase tracking-wide">Serviços</span>
        </button>

        {/* Central Action Button (Floating) */}
        <div className="relative -top-5">
          <button
            onClick={onOpenBooking}
            className="w-14 h-14 bg-neon-yellow rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(234,179,8,0.4)] border-4 border-[#111] transform active:scale-95 transition-all"
          >
            <CalendarPlus size={24} className="stroke-[2.5]" />
          </button>
        </div>

        <button
          onClick={() => onTabChange('wallet')}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            currentTab === 'wallet' ? 'text-neon-yellow' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Wallet
            size={20}
            className={currentTab === 'wallet' ? 'drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : ''}
          />
          <span className="text-[9px] font-bold uppercase tracking-wide">Carteira</span>
        </button>

        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            currentTab === 'profile' ? 'text-neon-yellow' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <User
            size={20}
            className={currentTab === 'profile' ? 'drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : ''}
          />
          <span className="text-[9px] font-bold uppercase tracking-wide">Perfil</span>
        </button>
      </div>
    </div>
  );
};
