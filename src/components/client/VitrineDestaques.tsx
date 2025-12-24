import React, { useRef } from 'react';
import { ChevronRight, Star, Sparkles, Scissors, Clock, Ticket } from 'lucide-react';
import { ServiceItem } from '../../types';

interface VitrineDestaquesProps {
  services: ServiceItem[];
  onBook: (serviceId?: string) => void;
}

export const VitrineDestaques: React.FC<VitrineDestaquesProps> = ({ services, onBook }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // MOCK PROMOTIONS (COMBOS)
  const promotions = [
    {
      id: 'promo-1',
      type: 'combo',
      title: 'DIA DO NOIVO',
      subtitle: 'Preparação completa para o grande dia',
      price: 'R$ 250,00',
      image:
        'https://images.unsplash.com/photo-1503951914875-452162b7f30a?auto=format&fit=crop&q=80',
      badge: 'PREMIUM',
      color: 'from-purple-600 to-blue-600',
    },
    {
      id: 'promo-2',
      type: 'combo',
      title: 'PAI & FILHO',
      subtitle: 'O legado continua. Experiência em dobro.',
      price: 'R$ 60,00',
      image:
        'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80',
      badge: '-15% OFF',
      color: 'from-neon-orange to-red-600',
    },
  ];

  // TOP SERVICES (Highlight 2 services)
  const topServices = services.slice(0, 3).map(s => ({
    ...s,
    type: 'service',
  }));

  const items = [...promotions, ...topServices];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 px-4">
        <div
          onClick={() => {
            const el = document.getElementById('vitrine-section');
            if (el) {
              const headerOffset = 90;
              const elementPosition = el.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
              window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-2 cursor-pointer select-none active:scale-95 transition-transform"
        >
          <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
            <Sparkles className="text-neon-yellow hidden md:block" size={20} />
            Destaques{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-yellow to-neon-orange">
              Da Trilha
            </span>
          </h2>
        </div>
        <button className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1">
          Ver tudo <ChevronRight size={12} />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-[10vw] pb-8 hide-scrollbar"
      >
        {items.map((item: any, idx) => (
          <div
            key={item.id || idx}
            onClick={() => onBook(item.type === 'service' ? item.id : undefined)}
            className="flex-shrink-0 w-[80vw] md:w-[600px] snap-center relative group cursor-pointer"
          >
            <div
              className={`
                    relative h-[220px] md:h-[300px] rounded-2xl overflow-hidden shadow-lg border border-white/10 transition-transform duration-300 group-hover:scale-[1.02]
                    ${item.type === 'combo' ? 'shadow-[0_0_20px_rgba(0,0,0,0.5)]' : ''}
                `}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={
                    item.image ||
                    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80'
                  }
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={item.title || item.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                {item.type === 'combo' && (
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${item.color} mix-blend-overlay opacity-60`}
                  ></div>
                )}
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end items-start text-left z-20">
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {item.type === 'combo' ? (
                    <span className="bg-neon-yellow text-black text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg">
                      {item.badge}
                    </span>
                  ) : (
                    <span className="bg-black/60 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold uppercase px-2 py-1 rounded flex items-center gap-1">
                      <Star size={10} className="text-yellow-400 fill-yellow-400" /> 5.0
                    </span>
                  )}
                </div>

                {/* Title & Desc */}
                <div className="w-full">
                  <h3 className="text-3xl font-black text-white uppercase italic leading-none mb-1 drop-shadow-lg font-graffiti">
                    {item.title || item.name}
                  </h3>
                  <p className="text-sm text-gray-200 font-medium mb-4 max-w-[80%] line-clamp-1">
                    {item.subtitle || item.description || 'Experiência completa e exclusiva.'}
                  </p>

                  {/* Footer Action */}
                  <div className="flex items-center justify-between w-full border-t border-white/20 pt-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">
                        Investimento
                      </span>
                      <span className="text-xl font-black text-neon-yellow">
                        {item.price ||
                          (typeof item.priceValue === 'number'
                            ? `R$ ${item.priceValue.toFixed(2)}`
                            : 'R$ 0,00')}
                      </span>
                    </div>
                    <button className="bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 backdrop-blur-md px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all flex items-center gap-2">
                      <Ticket size={14} /> Reservar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
