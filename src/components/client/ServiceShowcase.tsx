import React from 'react';
import { Scissors, Zap, Star } from 'lucide-react';
import { ServiceItem } from '../../types';

interface ServiceShowcaseProps {
  services: ServiceItem[];
  onBookService: (service: ServiceItem) => void;
}

const MOCK_IMAGES: Record<string, string> = {
  default:
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=400&auto=format&fit=crop',
  Corte:
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400&auto=format&fit=crop',
  Barba:
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=400&auto=format&fit=crop',
};

export const ServiceShowcase: React.FC<ServiceShowcaseProps> = ({ services, onBookService }) => {
  return (
    <div className="pt-2 pb-2">
      <div className="flex overflow-x-auto pb-8 -mx-4 px-[10vw] md:mx-0 md:px-0 gap-4 snap-x snap-mandatory hide-scrollbar">
        {services.slice(0, 5).map((service, index) => {
          if (!service || !service.name) return null; // Defensive check
          return (
            <div
              key={service.id || index}
              className="flex-shrink-0 w-[80vw] md:w-[320px] snap-center bg-white dark:bg-[#151515] rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 group hover:border-neon-yellow/50 dark:hover:border-white/20 transition-all duration-300 shadow-lg hover:shadow-2xl relative"
            >
              {/* Visual Header - Widescreen */}
              <div className="aspect-video w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#151515] to-transparent z-10 transition-colors opacity-60"></div>
                <img
                  src={MOCK_IMAGES[service.name.split(' ')[0]] || MOCK_IMAGES.default}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter brightness-100 dark:brightness-75 dark:group-hover:brightness-100"
                />
                <div className="absolute top-3 right-3 z-20 bg-white/80 dark:bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-gray-200 dark:border-white/10 flex items-center gap-1 shadow-sm">
                  <Star size={10} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-[10px] text-gray-900 dark:text-white font-bold">5.0</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col items-center text-center relative z-20 -mt-6">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-1 drop-shadow-sm transition-colors">
                  {service.name}
                </h3>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 font-mono mb-4 line-clamp-2 transition-colors">
                  Experiência completa com toalha quente e finalização premium.
                </p>

                <div className="w-full flex items-center justify-between mt-auto pt-4 border-t border-dashed border-gray-200 dark:border-gray-800 transition-colors">
                  <div className="text-left">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">
                      Investimento
                    </span>
                    <span className="text-lg font-black text-neon-yellow drop-shadow-sm dark:drop-shadow-none">
                      R${' '}
                      {typeof service.priceValue === 'number'
                        ? service.priceValue.toFixed(2)
                        : service.price || '0.00'}
                    </span>
                  </div>
                  <button
                    onClick={() => onBookService(service)}
                    className="bg-gray-900 dark:bg-white hover:bg-neon-yellow dark:hover:bg-neon-yellow text-white dark:text-black hover:text-black px-4 py-2 rounded-sm font-black text-xs uppercase transition-colors flex items-center gap-1 shadow-md hover:shadow-lg translate-x-0 translate-y-0 hover:translate-x-[1px] hover:translate-y-[1px]"
                  >
                    <Zap size={12} /> Agendar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
