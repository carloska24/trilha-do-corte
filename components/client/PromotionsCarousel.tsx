import React, { useState, useEffect } from 'react';
import { ChevronRight, Sparkles, Clock, Ticket } from 'lucide-react';

const PROMOS = [
  {
    id: 1,
    title: 'COMBO VIP',
    subtitle: 'Cabelo + Barba + Sobrancelha',
    discount: '20% OFF',
    image:
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop',
    color: 'from-purple-600 to-blue-600',
    validUntil: 'Hoje',
  },
  {
    id: 2,
    title: 'DIA DO NOIVO',
    subtitle: 'Preparação completa para o grande dia',
    discount: 'PRESENTE SURPRESA',
    image:
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=800&auto=format&fit=crop',
    color: 'from-emerald-500 to-teal-500',
    validUntil: 'Consulte',
  },
  {
    id: 3,
    title: 'QUINZENA DO BIGODE',
    subtitle: 'Alinhamento e Hidratação',
    discount: 'R$ 15,00',
    image:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800&auto=format&fit=crop',
    color: 'from-orange-500 to-red-500',
    validUntil: '15/Dez',
  },
];

export const PromotionsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % PROMOS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-[21/9] md:aspect-[21/7] rounded-xl overflow-hidden shadow-2xl group">
      {PROMOS.map((promo, index) => (
        <div
          key={promo.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image */}
          <img
            src={promo.image}
            alt={promo.title}
            className="w-full h-full object-cover filter brightness-[0.6]"
          />

          {/* Content Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent p-6 md:p-10 flex flex-col justify-center items-start">
            <div
              className={`mb-4 px-3 py-1 rounded-sm bg-gradient-to-r ${promo.color} flex items-center gap-2 transform -skew-x-12 shadow-lg`}
            >
              <Ticket size={14} className="text-white transform skew-x-12" />
              <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest transform skew-x-12">
                Oferta Relâmpago
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-graffiti text-white mb-2 leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              {promo.title}
            </h2>
            <p className="text-gray-300 font-medium text-sm md:text-lg mb-6 max-w-md">
              {promo.subtitle}
            </p>

            <div className="flex items-center gap-4">
              <button className="bg-white text-black hover:bg-neon-yellow transition-colors font-black uppercase text-xs md:text-sm px-6 py-3 rounded-sm flex items-center gap-2 group/btn shadow-[4px_4px_0px_0px_#000]">
                Resgatar{' '}
                <span className="font-graffiti text-lg text-purple-600 group-hover/btn:text-black">
                  {promo.discount}
                </span>
              </button>
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px] uppercase font-bold tracking-widest bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                <Clock size={12} className="text-neon-yellow" />
                Válido: {promo.validUntil}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Indicators */}
      <div className="absolute bottom-4 right-4 z-20 flex gap-1.5">
        {PROMOS.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-8 bg-neon-yellow' : 'w-2 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
