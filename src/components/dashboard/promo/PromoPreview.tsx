import React from 'react';
import { Service, BadgeConfig } from '../../../types';
import { MonitorPlay, Zap, Eye } from 'lucide-react';
import { ServiceCard } from '../../ui/ServiceCard';

interface PromoPreviewProps {
  selectedService: Service | undefined;
  badges: BadgeConfig[];
}

export const PromoPreview: React.FC<PromoPreviewProps> = ({ selectedService, badges }) => {
  if (!selectedService) return null;

  return (
    <div className="flex-1 bg-gradient-to-br from-[#0a0a0f] via-[#0f0f18] to-[#0a0a0f] relative flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        {/* Carbon Fiber Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />

        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-900/20 blur-[150px] rounded-full pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-900/15 blur-[120px] rounded-full pointer-events-none animate-pulse delay-1000" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Top/Bottom Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-2xl animate-[fadeIn_0.5s_ease-out]">
        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
              <MonitorPlay size={14} className="text-white" />
            </div>
            <span className="text-white/80 font-bold text-sm uppercase tracking-widest">
              Preview
            </span>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">
                LIVE
              </span>
            </div>
          </div>
          <p className="text-gray-600 text-[10px] font-medium">Visualização em tempo real</p>
        </div>

        {/* Card Preview Container */}
        <div className="relative group">
          {/* Glow Effect Behind Card */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 rounded-3xl" />

          {/* Card Scale Wrapper */}
          <div className="relative transform scale-100 md:scale-110 lg:scale-125 transition-transform duration-500 group-hover:scale-[1.05] md:group-hover:scale-[1.15]">
            {/* Decorative Frame */}
            <div className="absolute -inset-3 border border-white/5 rounded-2xl pointer-events-none" />
            <div className="absolute -inset-1 border border-white/10 rounded-xl pointer-events-none" />

            {/* The Card */}
            <div className="w-[320px] pointer-events-none select-none shadow-2xl rounded-xl overflow-hidden ring-1 ring-white/10">
              <ServiceCard
                service={{
                  ...selectedService,
                  badges: badges,
                }}
                variant="default"
              />
            </div>

            {/* Corner Accents */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-purple-500/50 rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-purple-500/50 rounded-br-lg" />
          </div>
        </div>

        {/* Info Footer */}
        <div className="flex flex-col items-center gap-3 mt-4">
          <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center gap-2">
              <Eye size={12} className="text-gray-500" />
              <span className="text-[10px] text-gray-500 font-medium">Representação fiel</span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-cyan-500/70" />
              <span className="text-[10px] text-cyan-500/70 font-medium">
                Atualização instantânea
              </span>
            </div>
          </div>
          <p className="text-gray-600 text-[9px] font-mono text-center max-w-xs">
            Este é exatamente como o badge aparecerá no catálogo de serviços
          </p>
        </div>
      </div>
    </div>
  );
};
