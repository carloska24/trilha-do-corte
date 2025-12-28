import React from 'react';
import { ServiceItem } from '../../types';
import { ServiceCard } from '../ui/ServiceCard';

interface ServiceShowcaseProps {
  services: ServiceItem[];
  onBookService: (service: ServiceItem) => void;
}

export const ServiceShowcase: React.FC<ServiceShowcaseProps> = ({ services, onBookService }) => {
  return (
    <div className="pt-2 pb-2">
      <div className="flex overflow-x-auto pb-8 -mx-4 px-[10vw] md:mx-0 md:px-0 gap-4 snap-x snap-mandatory hide-scrollbar">
        {services.map((service, index) => {
          if (!service || !service.name) return null;
          return (
            <div
              key={`${service.id}-${JSON.stringify(service.badges || [])}`}
              className="flex-shrink-0 w-[85vw] md:w-[320px] snap-center h-auto"
            >
              <ServiceCard
                service={service}
                onClick={() => onBookService(service)}
                variant="default"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
