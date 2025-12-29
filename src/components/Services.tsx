import React from 'react';
import { ServiceItem } from '../types';
import {
  Calendar,
  Star,
  Zap,
  Crown,
  Clock,
  ArrowRight,
  Sparkles,
  Gift,
  Ghost,
  Sun,
  Heart,
  Percent,
  PartyPopper,
  Briefcase,
  Flower2,
  Tag,
  Megaphone,
  Rocket,
} from 'lucide-react';

const MOCK_IMAGES: Record<string, string> = {
  default:
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=400&auto=format&fit=crop',
  Corte:
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400&auto=format&fit=crop',
  Barba:
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=400&auto=format&fit=crop',
};

interface ServicesProps {
  onOpenBooking: () => void;
  services: ServiceItem[];
}

export const Services: React.FC<ServicesProps> = ({ onOpenBooking, services }) => {
  // Theme Configuration Mapping
  const getThemeConfig = (theme: string) => {
    switch (theme) {
      case 'christmas':
        return {
          icon: Gift,
          color:
            'bg-gradient-to-r from-red-600 to-green-700 text-white border-b border-l border-white/20',
        };
      case 'easter':
        return {
          icon: PartyPopper,
          color:
            'bg-gradient-to-r from-pink-400 to-purple-400 text-white border-b border-l border-white/20',
        }; // Lucide doesn't have Rabbit, using PartyPopper/Egg concept
      case 'halloween':
        return {
          icon: Ghost,
          color:
            'bg-gradient-to-r from-orange-500 to-purple-900 text-white border-b border-l border-white/20',
        };
      case 'summer':
        return {
          icon: Sun,
          color:
            'bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-b border-l border-white/20',
        }; // Black text for contrast
      case 'valentine':
        return {
          icon: Heart,
          color:
            'bg-gradient-to-r from-red-500 to-pink-500 text-white border-b border-l border-white/20',
        };
      case 'black_friday':
        return {
          icon: Tag,
          color:
            'bg-gradient-to-r from-black via-gray-900 to-black text-neon-yellow border-b border-l border-neon-yellow/50',
        };
      case 'fathers_day':
        return {
          icon: Briefcase,
          color:
            'bg-gradient-to-r from-blue-800 to-blue-600 text-white border-b border-l border-white/20',
        };
      case 'mothers_day':
        return {
          icon: Flower2,
          color:
            'bg-gradient-to-r from-pink-500 to-rose-400 text-white border-b border-l border-white/20',
        };
      case 'carnival':
        return {
          icon: PartyPopper,
          color:
            'bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white border-b border-l border-white/20',
        };
      case 'offer':
        return {
          icon: Rocket,
          color:
            'bg-gradient-to-r from-red-600 to-orange-500 text-white border-b border-l border-white/20 animate-pulse',
        };
      case 'premium':
        return {
          icon: Crown,
          color:
            'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black border-b border-l border-white/20',
        };
      default:
        return { icon: Megaphone, color: 'bg-neon-yellow text-black' }; // Default changed to Megaphone for general noise
    }
  };

  // Helper to determine badge (mock logic for visual impact)
  const getBadge = (index: number, price: number, promo?: any) => {
    // Priority 1: Backend Active Promo
    if (promo && promo.text) {
      // Return null here because we handle promo separately for the marquee effect
      return null;
    }
    if (index === 0)
      return { label: 'MAIS PEDIDO', icon: Crown, color: 'bg-neon-yellow text-black' };
    if (index === 1) return { label: 'PREMIUM', icon: Star, color: 'bg-purple-500 text-white' };
    if (price < 20)
      return { label: 'FLASH PROMO', icon: Zap, color: 'bg-red-500 text-white animate-pulse' };
    return null;
  };

  return (
    <section id="services" className="py-16 md:py-24 bg-[#09090b] relative overflow-hidden">
      {/* ... (background and header remain same) ... */}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ... (header code) ... */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6">
          <div>
            <span className="text-neon-yellow font-black text-xs uppercase tracking-widest mb-2 block">
              Tabela Oficial 2024
            </span>
            <h2 className="text-4xl md:text-5xl font-graffiti text-white leading-none">
              MENU DE{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-yellow to-neon-orange">
                ESTILO
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs font-mono uppercase tracking-widest mt-4 md:mt-0">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Barbearia Aberta Agora
          </div>
        </div>

        {/* Grid de Cards Compactos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const badge = getBadge(index, service.priceValue, service.activePromo);
            const promo = service.activePromo;

            return (
              <div
                key={service.id}
                className="group relative bg-[#121212] rounded-xl overflow-hidden border border-white/10 hover:border-neon-yellow transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(234,179,8,0.3)] flex flex-col"
              >
                {/* Badge de Marketing (Static) */}
                {badge && (
                  <div
                    className={`absolute top-0 right-0 z-30 px-3 py-1 rounded-bl-xl font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-lg ${badge.color}`}
                  >
                    <badge.icon size={10} fill="currentColor" />
                    {badge.label}
                  </div>
                )}

                {/* PROMO MARQUEE BADGE (Dynamic) */}
                {promo && promo.text && (
                  <div
                    className={`absolute top-0 right-0 z-30 pl-4 pr-2 py-1.5 rounded-bl-2xl shadow-lg flex items-center gap-2 max-w-[85%] overflow-hidden ${
                      getThemeConfig(promo.theme || 'standard').color
                    }`}
                  >
                    <span className="text-sm font-bold shrink-0 z-10 drop-shadow-md">
                      {(() => {
                        const Icon = getThemeConfig(promo.theme || 'standard').icon;
                        return <Icon size={14} fill="currentColor" />;
                      })()}
                    </span>
                    <div className="overflow-hidden relative w-full flex">
                      <div className="animate-ticker flex whitespace-nowrap">
                        <span className="text-[10px] font-black uppercase tracking-widest mr-4">
                          {promo.text}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest mr-4">
                          {promo.text}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest mr-4">
                          {promo.text}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Imagem Compacta (Aspect Ratio menor) */}
                <div className="relative h-40 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent z-10"></div>
                  <img
                    src={`/services/${service.name
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')}.jpg`}
                    onError={e => {
                      const target = e.currentTarget;
                      if (target.src.includes('.jpg')) {
                        target.src = target.src.replace('.jpg', '.png');
                      } else {
                        // Fallback to MOCK_IMAGES or the service.image if exists, or global default
                        target.src =
                          MOCK_IMAGES[service.name.split(' ')[0]] ||
                          service.image ||
                          MOCK_IMAGES.default;
                        target.onerror = null;
                      }
                    }}
                    alt={service.name}
                    className="w-full h-full object-contain bg-black transform group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Preço em Destaque na Imagem */}
                  <div className="absolute bottom-2 left-3 z-20">
                    <div className="flex items-baseline gap-2 text-white drop-shadow-md">
                      <span className="text-xs font-bold text-gray-400">R$</span>

                      {/* Price Logic: Show discounted price if exists */}
                      {promo && promo.discountValue ? (
                        <div className="flex flex-col leading-none">
                          <span className="text-[10px] line-through text-gray-500 font-bold opacity-80 decoration-red-500 decoration-2">
                            {(service.priceValue || 0).toFixed(2)}
                          </span>
                          <span className="text-2xl font-black tracking-tighter text-neon-yellow animate-pulse">
                            {promo.discountValue.replace('R$', '').trim()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-black tracking-tighter text-neon-yellow">
                          {(service.priceValue || 0).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black text-white uppercase leading-none group-hover:text-neon-yellow transition-colors">
                      {service.name}
                    </h3>
                  </div>

                  <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2 font-medium">
                    {service.description}
                  </p>

                  <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-mono uppercase">
                      <Clock size={12} className="text-neon-orange" />
                      <span>30-50 min</span>
                    </div>

                    <button
                      onClick={onOpenBooking}
                      className="bg-white text-black hover:bg-neon-yellow font-black text-[10px] uppercase tracking-widest py-2 px-4 rounded transition-colors flex items-center gap-2 group/btn"
                    >
                      Reservar
                      <ArrowRight
                        size={12}
                        className="group-hover/btn:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
