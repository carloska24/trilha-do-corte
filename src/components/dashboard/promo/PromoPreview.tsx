import React from 'react';
import { Service, BadgeConfig } from '../../../types';
import { MonitorPlay, Clock, Trash2 } from 'lucide-react';
import { PromoBadge } from '../../ui/PromoBadge';
import { ServiceCard } from '../../ui/ServiceCard';

interface PromoPreviewProps {
  selectedService: Service | undefined;
  badges: BadgeConfig[];
}

export const PromoPreview: React.FC<PromoPreviewProps> = ({ selectedService, badges }) => {
  if (!selectedService) return null;

  return (
    <div className="flex-1 bg-black relative flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Bg Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-2xl animate-[fadeIn_0.5s_ease-out]">
        <div className="flex items-center gap-3 text-gray-500 font-graffiti text-2xl uppercase tracking-widest opacity-50 select-none">
          <MonitorPlay size={24} /> Preview em Tempo Real
        </div>

        {/* CARD PREVIEW SCALE WRAPPER */}
        <div className="transform scale-110 md:scale-125 lg:scale-135 transition-transform duration-500 hover:scale-[1.15] md:hover:scale-[1.3] relative z-20">
          <div className="w-[320px] pointer-events-none select-none shadow-2xl rounded-xl">
            <ServiceCard
              service={{
                ...selectedService,
                badges: badges,
              }}
              variant="default"
            />
          </div>
        </div>

        <p className="text-gray-600 text-xs font-mono mt-6 text-center max-w-md">
          * Design fiel ao cartão de serviço público final.
        </p>
      </div>
    </div>
  );
};
