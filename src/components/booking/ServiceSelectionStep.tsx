import React, { useState } from 'react';
import { ServiceItem } from '../../types';
import { ServiceCard } from '../ui/ServiceCard';

interface ServiceSelectionStepProps {
  services: ServiceItem[];
  selectedServiceId: string;
  onSelect: (id: string) => void;
}

export const ServiceSelectionStep: React.FC<ServiceSelectionStepProps> = ({
  services,
  selectedServiceId,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-[slideRight_0.3s_ease-out]">
      <div className="relative mb-4 group">
        {/* Search Icon */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 pl-2 pointer-events-none">
          <div className="w-4 h-4 border-2 border-gray-600 rounded-full group-focus-within:border-neon-yellow transition-colors relative">
            <div className="absolute -bottom-1 -right-1 w-2 h-0.5 bg-gray-600 group-focus-within:bg-neon-yellow rotate-45 origin-top-left transition-colors"></div>
          </div>
        </div>
        <input
          type="text"
          placeholder="ESCOLHA SEU DESTINO"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-b border-gray-800 focus:border-neon-yellow text-sm font-bold text-white uppercase tracking-widest pl-8 py-2 focus:outline-none placeholder-gray-600 transition-colors"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
        {filteredServices.map(s => (
          <div key={s.id} className="h-full">
            <ServiceCard
              service={s}
              isSelected={selectedServiceId === s.id}
              onClick={() => onSelect(s.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
