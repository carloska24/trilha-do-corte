import React from 'react';
import { WhatsAppIcon } from '../../icons/WhatsAppIcon';

interface CalendarHeaderProps {
  activeTab: 'daily' | 'weekly' | 'monthly' | 'config';
  setActiveTab: (tab: 'daily' | 'weekly' | 'monthly' | 'config') => void;
  onExportClick: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  activeTab,
  setActiveTab,
  onExportClick,
}) => {
  return (
    <div className="pt-6 px-4 md:px-6 bg-[#111] border-b border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-graffiti text-white tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          AGENDA
        </h1>
        {/* WhatsApp Share Button */}
        <button
          onClick={onExportClick}
          className="group relative px-2 pr-4 py-1.5 bg-[#0a0a0a] border border-green-500/30 rounded-xl flex items-center gap-3 hover:border-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all overflow-hidden active:scale-95"
        >
          <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

          {/* Icon Badge */}
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/30 relative z-10 group-hover:bg-green-500 group-hover:text-black transition-colors">
            <WhatsAppIcon
              width={18}
              height={18}
              className="fill-green-500 group-hover:fill-black transition-colors"
            />
          </div>

          {/* Text Stack */}
          <div className="flex flex-col items-start relative z-10">
            <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest leading-none mb-0.5 group-hover:text-green-400">
              WhatsApp
            </span>
            <span className="text-xs font-black text-white uppercase tracking-wider leading-none">
              Compartilhar
            </span>
          </div>
        </button>
      </div>

      {/* TABS */}
      <div className="flex items-center justify-between gap-2 md:gap-4 overflow-x-auto custom-scrollbar pb-1 w-full">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('daily')}
            className={`pb-3 border-b-2 text-xs md:text-sm font-bold tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'daily'
                ? 'border-neon-yellow text-neon-yellow'
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            DIÁRIO
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`pb-3 border-b-2 text-xs md:text-sm font-bold tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'monthly'
                ? 'border-neon-yellow text-neon-yellow'
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            CALENDÁRIO
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 border-b-2 text-xs md:text-sm font-bold tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-neon-yellow text-neon-yellow'
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            AJUSTES
          </button>
        </div>
      </div>
    </div>
  );
};
