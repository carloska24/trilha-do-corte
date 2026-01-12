import React from 'react';
import { Service } from '../../../types';
import { CheckCircle } from 'lucide-react';
import { PromoBadge } from '../../ui/PromoBadge';
import { ServiceCard } from '../../ui/ServiceCard';

interface ServiceSelectorProps {
  services: Service[];
  selectedServiceId: string | null;
  onSelect: (serviceId: string) => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  services,
  selectedServiceId,
  onSelect,
}) => {
  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <img
          src="/studio-bg.png"
          alt="Background"
          className="w-full h-full object-cover opacity-30"
          onError={e => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#111] via-transparent to-[#111] z-10"></div>
      </div>

      <div className="relative z-20 w-full px-2 py-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
        <h3 className="text-3xl md:text-4xl font-graffiti font-black text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-400 to-amber-200 mb-10 text-center uppercase tracking-wider drop-shadow-sm animate-pulse-slow">
          Selecione para Customizar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full md:max-w-6xl mx-auto">
          {services.map(service => (
            <div key={service.id} className="h-full relative w-full">
              <ServiceCard
                service={service}
                isSelected={selectedServiceId === service.id}
                onClick={() => onSelect(service.id)}
              />

              {/* Optional: Add an extra check overlay if selected, staying true to the 'Studio' feel but using the correct card base */}
              {selectedServiceId === service.id && (
                <div className="absolute -top-3 -right-3 z-50 animate-in zoom-in duration-300">
                  <div className="bg-neon-yellow text-black rounded-full p-1 shadow-[0_0_15px_rgba(234,179,8,0.8)] border-2 border-white">
                    <CheckCircle size={20} strokeWidth={3} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
