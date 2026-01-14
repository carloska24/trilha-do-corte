import React from 'react';
import { CalendarDays, Share2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// Custom SVG Icons - FULL ORIGINAL DESIGN WITH COLORS
const DailyIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = '',
}) => (
  <svg width={size} height={size} viewBox="0 0 512 512" className={className}>
    <g clipRule="evenodd" fillRule="evenodd">
      <path
        d="m45.47 50.66h421.06c16.61 0 30.22 13.61 30.22 30.22v400.88c0 16.64-13.61 30.25-30.22 30.25h-421.06c-16.61 0-30.22-13.61-30.22-30.25v-400.88c0-16.62 13.61-30.22 30.22-30.22z"
        fill="#ebf5fc"
      />
      <path
        d="m45.47 50.66h421.06c16.61 0 30.22 13.61 30.22 30.22v62.99h-481.5v-62.99c0-16.62 13.61-30.22 30.22-30.22z"
        fill="#ff4646"
      />
      <path
        d="m100.49 0c11.85 0 21.54 9.69 21.54 21.54v58.22c0 11.85-9.69 21.54-21.54 21.54-11.85 0-21.57-9.69-21.57-21.54v-58.21c0-11.85 9.72-21.55 21.57-21.55z"
        fill="#2f5274"
      />
      <path
        d="m204.15 0c11.85 0 21.58 9.7 21.58 21.55v58.22c0 11.85-9.72 21.54-21.57 21.54-11.85 0-21.54-9.69-21.54-21.54v-58.22c-.01-11.85 9.69-21.55 21.53-21.55z"
        fill="#2f5274"
      />
      <path
        d="m307.85 0c11.85 0 21.54 9.69 21.54 21.54v58.22c0 11.85-9.69 21.54-21.54 21.54-11.85 0-21.57-9.69-21.57-21.54v-58.21c-.01-11.85 9.72-21.55 21.57-21.55z"
        fill="#2f5274"
      />
      <path
        d="m411.51 0c11.85 0 21.57 9.69 21.57 21.54v58.22c0 11.85-9.72 21.54-21.57 21.54-11.85 0-21.54-9.69-21.54-21.54v-58.21c0-11.85 9.69-21.55 21.54-21.55z"
        fill="#2f5274"
      />
    </g>
    <path
      d="m247.75 275.67c0-4.56 3.69-8.25 8.25-8.25s8.25 3.68 8.25 8.25v59.1h59.1c4.56 0 8.28 3.71 8.28 8.28s-3.71 8.25-8.28 8.25h-67.35c-4.56 0-8.25-3.69-8.25-8.25zm-30.27-51.59c-1.47-1.08-2.61-2.64-3.12-4.54-.74-2.81.03-5.64 1.81-7.63l27.75-34.36c2.83-3.54 8.02-4.11 11.57-1.28 3.54 2.86 4.11 8.05 1.28 11.59l-14.12 17.46c29.34-2.86 58.08 3.83 82.52 17.92 30.64 17.72 54.57 47.11 64.43 83.99 9.89 36.88 3.88 74.3-13.83 104.97-17.69 30.64-47.08 54.54-83.96 64.43s-74.3 3.88-104.97-13.83c-30.64-17.69-54.57-47.08-64.43-83.99-6.01-22.37-6.15-44.99-1.36-66.16 4.99-21.97 15.25-42.38 29.76-59.41 2.98-3.46 8.16-3.88 11.62-.91 3.46 2.95 3.86 8.16.91 11.59-12.78 15.02-21.86 33-26.22 52.36-4.2 18.62-4.08 38.52 1.22 58.28 8.7 32.51 29.76 58.39 56.75 73.98 27.01 15.59 59.95 20.86 92.44 12.16 32.51-8.7 58.39-29.76 73.98-56.78 15.59-26.99 20.86-59.92 12.16-92.44-8.7-32.49-29.76-58.39-56.75-73.98-22.37-12.9-48.78-18.74-75.66-15.42l20.92 16.89c3.54 2.86 4.11 8.05 1.28 11.59-2.86 3.54-8.05 4.11-11.59 1.25z"
      fill="#0593fc"
    />
    <path
      clipRule="evenodd"
      d="m38.47 143.86v337.89c0 16.64 13.61 30.25 30.25 30.25h-23.25c-16.61 0-30.22-13.61-30.22-30.25v-337.89z"
      fill="#d4dde3"
      fillRule="evenodd"
    />
    <path
      clipRule="evenodd"
      d="m45.47 50.66h23.24c-16.64 0-30.25 13.61-30.25 30.22v62.99h-23.21v-62.99c0-16.62 13.61-30.22 30.22-30.22z"
      fill="#e63f3f"
      fillRule="evenodd"
    />
  </svg>
);

const MonthIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = '',
}) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <path
      d="m247.121 79.995h-238.242v-38.022c0-5.523 4.477-10 10-10h218.241c5.523 0 10 4.477 10 10v38.022z"
      fill="#fc5d3d"
    />
    <path
      d="m59.61 31.97v14.47c0 9.12-7.42 16.54-16.54 16.54s-16.54-7.42-16.54-16.54v-14.47z"
      fill="#b25035"
    />
    <path
      d="m116.23 31.97v14.47c0 9.12-7.42 16.54-16.54 16.54s-16.54-7.42-16.54-16.54v-14.47z"
      fill="#b25035"
    />
    <path
      d="m172.85 31.97v14.47c0 9.12-7.42 16.54-16.54 16.54s-16.54-7.42-16.54-16.54v-14.47z"
      fill="#b25035"
    />
    <path
      d="m229.47 31.97v14.47c0 9.12-7.42 16.54-16.54 16.54s-16.54-7.42-16.54-16.54v-14.47z"
      fill="#b25035"
    />
    <path
      d="m43.069 55.984c-5.27 0-9.543-4.272-9.543-9.543v-30.169c0-5.27 4.272-9.543 9.543-9.543 5.27 0 9.543 4.272 9.543 9.543v30.169c0 5.27-4.273 9.543-9.543 9.543z"
      fill="#efefef"
    />
    <path
      d="m99.69 55.984c-5.27 0-9.543-4.272-9.543-9.543v-30.169c0-5.27 4.272-9.543 9.543-9.543 5.27 0 9.543 4.272 9.543 9.543v30.169c-.001 5.27-4.273 9.543-9.543 9.543z"
      fill="#efefef"
    />
    <path
      d="m156.31 55.984c-5.27 0-9.543-4.272-9.543-9.543v-30.169c0-5.27 4.272-9.543 9.543-9.543 5.27 0 9.543 4.272 9.543 9.543v30.169c0 5.27-4.272 9.543-9.543 9.543z"
      fill="#efefef"
    />
    <path
      d="m212.931 55.984c-5.27 0-9.543-4.272-9.543-9.543v-30.169c0-5.27 4.272-9.543 9.543-9.543 5.27 0 9.543 4.272 9.543 9.543v30.169c0 5.27-4.272 9.543-9.543 9.543z"
      fill="#efefef"
    />
    <path
      d="m237.121 249.271h-218.242c-5.523 0-10-4.477-10-10v-159.276h238.241v159.276c.001 5.523-4.477 10-9.999 10z"
      fill="#efefef"
    />
    <path
      d="m57.93 139.426c-1.052-.319-2.19.084-2.804.997l-13.261 19.729-13.261-19.729c-.614-.913-1.752-1.317-2.804-.997-1.052.321-1.771 1.292-1.771 2.392v45.631c0 1.381 1.119 2.5 2.5 2.5s2.5-1.119 2.5-2.5v-37.431l10.761 16.009c.464.691 1.242 1.105 2.075 1.105s1.61-.415 2.075-1.105l10.761-16.009v37.431c0 1.381 1.119 2.5 2.5 2.5s2.5-1.119 2.5-2.5v-45.631c0-1.101-.719-2.071-1.771-2.392z"
      fill="#333"
    />
    <path
      d="m84.933 139.317c-9.834 0-17.835 8.001-17.835 17.835v14.96c0 9.834 8.001 17.835 17.835 17.835 9.835 0 17.836-8.001 17.836-17.835v-14.96c0-9.834-8.001-17.835-17.836-17.835zm12.836 32.796c0 7.078-5.758 12.835-12.836 12.835s-12.835-5.758-12.835-12.835v-14.96c0-7.078 5.758-12.835 12.835-12.835s12.836 5.758 12.836 12.835z"
      fill="#333"
    />
    <path
      d="m143.336 139.317c-1.381 0-2.5 1.119-2.5 2.5v37.431l-26.097-38.825c-.614-.913-1.751-1.317-2.804-.997-1.052.32-1.771 1.291-1.771 2.391v45.631c0 1.381 1.119 2.5 2.5 2.5s2.5-1.119 2.5-2.5v-37.431l26.096 38.825c.474.704 1.259 1.106 2.075 1.105.243 0 .488-.035.729-.109 1.053-.32 1.771-1.291 1.771-2.391v-45.631c.001-1.379-1.118-2.499-2.499-2.499z"
      fill="#333"
    />
    <path
      d="m186.402 139.317h-30.671c-1.381 0-2.5 1.119-2.5 2.5s1.119 2.5 2.5 2.5h12.836v43.131c0 1.381 1.119 2.5 2.5 2.5s2.5-1.119 2.5-2.5v-43.131h12.835c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5z"
      fill="#333"
    />
    <path
      d="m198.799 189.949c1.381 0 2.5-1.119 2.5-2.5v-20.316h25.671v20.316c0 1.381 1.119 2.5 2.5 2.5s2.5-1.119 2.5-2.5v-45.631c0-1.381-1.119-2.5-2.5-2.5s-2.5 1.119-2.5 2.5v20.315h-25.671v-20.315c0-1.381-1.119-2.5-2.5-2.5s-2.5 1.119-2.5 2.5v45.631c0 1.381 1.119 2.5 2.5 2.5z"
      fill="#333"
    />
  </svg>
);

const ConfigIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = '',
}) => (
  <svg width={size} height={size} viewBox="0 0 512 512" className={className}>
    <path
      fill="#57555C"
      d="M286,90H15C6.709,90,0,83.291,0,75s6.709-15,15-15h271c8.291,0,15,6.709,15,15S294.291,90,286,90z"
    />
    <path
      fill="#3C3A41"
      d="M497,90h-91c-8.291,0-15-6.709-15-15s6.709-15,15-15h91c8.291,0,15,6.709,15,15S505.291,90,497,90z"
    />
    <path
      fill="#57555C"
      d="M106,271H15c-8.291,0-15-6.709-15-15s6.709-15,15-15h91c8.291,0,15,6.709,15,15C121,264.291,114.291,271,106,271z"
    />
    <path
      fill="#57555C"
      d="M497,271H226c-8.291,0-15-6.709-15-15s6.709-15,15-15h271c8.291,0,15,6.709,15,15C512,264.291,505.291,271,497,271z"
    />
    <path
      fill="#57555C"
      d="M286,452H15c-8.291,0-15-6.709-15-15s6.709-15,15-15h271c8.291,0,15,6.709,15,15S294.291,452,286,452z"
    />
    <path
      fill="#3C3A41"
      d="M497,452h-91c-8.291,0-15-6.709-15-15s6.709-15,15-15h91c8.291,0,15,6.709,15,15S505.291,452,497,452z"
    />
    <circle fill="#549CFF" cx="166" cy="256" r="75" />
    <circle fill="#1689FC" cx="346" cy="75" r="75" />
    <circle fill="#1689FC" cx="346" cy="437" r="75" />
  </svg>
);

interface CalendarHeaderProps {
  activeTab: 'daily' | 'weekly' | 'monthly' | 'config';
  setActiveTab: (tab: 'daily' | 'weekly' | 'monthly' | 'config') => void;
  onExportClick: () => void;
  appointmentCount?: number;
  totalRevenue?: number;
  completedRevenue?: number;
  selectedDate?: Date;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  activeTab,
  setActiveTab,
  onExportClick,
  appointmentCount = 0,
  totalRevenue = 0,
  completedRevenue = 0,
  selectedDate = new Date(),
}) => {
  const tabs = [
    { id: 'daily' as const, label: 'Diário', CustomIcon: DailyIcon, description: 'Lista de hoje' },
    { id: 'monthly' as const, label: 'Mês', CustomIcon: MonthIcon, description: 'Ver calendário' },
    { id: 'config' as const, label: 'Config', CustomIcon: ConfigIcon, description: 'Preferências' },
  ];

  const formatDate = (date: Date) => {
    return date
      .toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'long',
      })
      .replace('.', '');
  };

  return (
    <div className="bg-linear-to-b from-zinc-900 via-zinc-900/95 to-zinc-900 border-b border-zinc-800/50 transition-colors">
      {/* Top Section - Centered Title with Custom Icon */}
      <div className="px-4 md:px-6 pt-5 pb-4">
        {/* Header Row: Export Left | Title Center | Share Right */}
        <div className="flex items-center justify-between mb-4">
          {/* Left Spacer for centering */}
          <div className="w-12" />

          {/* Center - Icon + Title */}
          <div className="flex flex-col items-center gap-1">
            {/* Custom Notebook SVG Icon */}
            <svg width={36} height={36} viewBox="0 0 102 102">
              <path
                d="m96.76453 23.80137v7.53586c0 2.1396-1.7345 3.8741-3.8741 3.8741h-4.62545v-15.28406h4.62545c2.13961 0 3.8741 1.7345 3.8741 3.8741z"
                fill="#fc6559"
              />
              <path
                d="m96.76453 47.23207v7.53586c0 2.13961-1.7345 3.8741-3.8741 3.8741h-4.62545v-15.28406h4.62545c2.13961 0 3.8741 1.73449 3.8741 3.8741z"
                fill="#7979f7"
              />
              <path
                d="m96.76453 70.66277v7.53587c0 2.1396-1.7345 3.87409-3.8741 3.87409h-4.62545v-15.28406h4.62545c2.13961 0 3.8741 1.73449 3.8741 3.8741z"
                fill="#5bc658"
              />
              <path
                d="m88.26694 14.65692v72.68616c0 6.43794-5.21898 11.65692-11.65692 11.65692h-59.3516c-2.94556 0-5.3334-2.38785-5.3334-5.3334v-85.3332c0-2.94556 2.38785-5.3334 5.3334-5.3334h59.3516c6.43794 0 11.65692 5.21898 11.65692 11.65692z"
                fill="#e4e3ff"
              />
              <path
                d="m77.36259 16.79341v14.64317c0 1.72502-1.39841 3.12342-3.12342 3.12342h-29.64452c-1.72502 0-3.12342-1.3984-3.12342-3.12342v-14.64317c0-1.72502 1.3984-3.12342 3.12342-3.12342h29.64453c1.72501-.00001 3.12341 1.3984 3.12341 3.12342z"
                fill="#f9b938"
              />
              <path
                d="m31.66788 3h-14.40946c-2.94556 0-5.3334 2.38785-5.3334 5.3334v85.3332c0 2.94556 2.38785 5.3334 5.3334 5.3334h14.40946z"
                fill="#fc6559"
              />
              <g fill="#474646">
                <path d="m23.03349 21.51642c0 2.15944-1.75057 3.91001-3.91 3.91001h-9.97847c-2.15943 0-3.91-1.75057-3.91-3.91v-.00001c0-2.15943 1.75057-3.91 3.91-3.91h9.97848c2.15943 0 3.90999 1.75057 3.90999 3.91z" />
                <path d="m23.03349 41.17214c0 2.15944-1.75057 3.91001-3.91 3.91001h-9.97847c-2.15943 0-3.91-1.75057-3.91-3.91v-.00001c0-2.15944 1.75057-3.91 3.91-3.91h9.97848c2.15943 0 3.90999 1.75056 3.90999 3.91z" />
                <path d="m23.03349 60.82785c0 2.15944-1.75057 3.91001-3.91 3.91001h-9.97847c-2.15943 0-3.91-1.75056-3.91-3.91v-.00001c0-2.15943 1.75057-3.91 3.91-3.91h9.97848c2.15943 0 3.90999 1.75057 3.90999 3.91z" />
                <path d="m23.03349 80.48357c0 2.15944-1.75057 3.91-3.91 3.91h-9.97847c-2.15943 0-3.91-1.75056-3.91-3.91v-.00001c0-2.15944 1.75057-3.91 3.91-3.91h9.97848c2.15943.00001 3.90999 1.75057 3.90999 3.91001z" />
              </g>
            </svg>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-graffiti text-white tracking-wider drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              AGENDA
            </h1>

            {/* Date */}
            <p className="text-xs text-zinc-500 font-medium capitalize tracking-wide">
              {formatDate(selectedDate)}
            </p>
          </div>

          {/* Right - Export Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExportClick}
            className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center hover:border-green-500/60 hover:bg-green-500/20 transition-all"
          >
            <Share2 size={18} className="text-green-500" />
          </motion.button>
        </div>

        {/* Summary Stats - Premium Design */}
        {activeTab === 'daily' && (appointmentCount > 0 || totalRevenue > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3"
          >
            {/* Clients Badge */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-500/20">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Sparkles size={12} className="text-purple-400" />
              </div>
              <span className="text-lg font-black text-white">{appointmentCount}</span>
              <span className="text-[10px] text-purple-300/70 uppercase tracking-wider font-bold">
                {appointmentCount === 1 ? 'cliente' : 'clientes'}
              </span>
            </div>

            {/* Revenue Badge */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500/10 to-emerald-600/5 rounded-xl border border-green-500/20">
              <span className="text-lg font-black text-green-400">
                R${completedRevenue.toFixed(0)}
              </span>
              <span className="text-zinc-600 font-bold">/</span>
              <span className="text-sm text-zinc-400 font-semibold">
                R${totalRevenue.toFixed(0)}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Tabs - Premium Segmented Control */}
      <div className="px-4 md:px-6 pb-4">
        <div className="flex gap-1.5 bg-zinc-800/40 p-1.5 rounded-2xl border border-zinc-700/30 backdrop-blur-sm">
          {tabs.map(tab => {
            const { CustomIcon } = tab;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale: 0.97 }}
                className={`relative flex-1 flex flex-col items-center justify-between py-3 px-2 rounded-xl transition-all duration-300 min-h-[72px] ${
                  isActive ? 'text-black' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/30'
                }`}
              >
                {/* Active Background with Glow */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-yellow-500 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}

                {/* Custom SVG Icon - LARGER */}
                <div
                  className={`relative z-10 flex-1 flex items-center justify-center ${
                    isActive ? 'drop-shadow-sm' : ''
                  }`}
                >
                  <CustomIcon size={28} />
                </div>

                {/* Label - AT BOTTOM */}
                <span
                  className={`relative z-10 text-[9px] font-bold uppercase tracking-widest ${
                    isActive ? 'text-black' : ''
                  }`}
                >
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
