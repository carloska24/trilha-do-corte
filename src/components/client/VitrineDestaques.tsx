import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, Star, Sparkles, Scissors, Clock, Ticket } from 'lucide-react';
import { ServiceItem, Combo } from '../../types';
import { MOCK_COMBOS } from '../../constants';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

interface VitrineDestaquesProps {
  services: ServiceItem[];
  onBook: (serviceId?: string) => void;
}

export const VitrineDestaques: React.FC<VitrineDestaquesProps> = ({ services, onBook }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const MOCK_IMAGES: Record<string, string> = {
    default:
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=400&auto=format&fit=crop',
    Corte:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400&auto=format&fit=crop',
    Barba:
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=400&auto=format&fit=crop',
  };

  // LOAD COMBOS FROM STORAGE
  // Initializes with MOCK_COMBOS if nothing is stored, OR if you prefer to start clean, use []
  // User requested "Only created in marketing", so we prioritize storage.
  // If storage is empty, we fall back to Mocks? Or show nothing?
  // Current behavior in PromotionsManager: "return stored ? JSON.parse(stored) : MOCK_COMBOS;"
  // So we mirror that.
  const [combos, setCombos] = useState<Combo[]>(() => {
    const stored = localStorage.getItem('barberpro_combos');
    return stored ? JSON.parse(stored) : MOCK_COMBOS;
  });

  // Listen for storage changes (optional, but good if creating in one tab and viewing in other)
  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem('barberpro_combos');
      if (stored) setCombos(JSON.parse(stored));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const promotions = combos.map(combo => ({
    ...combo,
    type: 'combo',
    // Map theme to gradient colors for the card background effect
    color:
      combo.theme === 'neon'
        ? 'from-neon-orange to-red-600'
        : combo.theme === 'tuxedo'
        ? 'from-purple-600 to-blue-600'
        : combo.theme === 'gold'
        ? 'from-yellow-600 via-yellow-700 to-yellow-900'
        : 'from-blue-600 to-purple-600',
  }));

  // ONLY SHOW MARKETING COMBOS (Removes Top Services)
  // MERGE: Featured Services (from Oficina) + Marketing Combos
  const featuredServices = services
    .filter(s => s.featured)
    .map(s => ({
      id: s.id,
      title: s.name,
      subtitle: s.category, // or description short
      description: s.description,
      image: s.image,
      priceValue: s.priceValue,
      type: 'service',
      badge: 'DESTAQUE', // or s.tag if exists
      active: true,
      theme: 'neon', // Default theme for services? Or map category
    }));

  const items = [...promotions, ...featuredServices];

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
          className="flex items-center gap-2 cursor-pointer select-none active:scale-95 transition-transform group"
        >
          <Sparkles className="text-neon-yellow group-hover:animate-spin-slow" size={20} />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2 group-hover:text-gray-200 transition-colors">
            Destaques{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-yellow to-neon-orange group-hover:brightness-110">
              Da Trilha
            </span>
          </h2>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-[10vw] pb-8 hide-scrollbar"
      >
        {items.map((item: any, idx) => (
          <div
            key={item.id || idx}
            onClick={() => onBook(item.id)}
            className="flex-shrink-0 w-[85vw] md:w-[320px] snap-center relative group cursor-pointer"
          >
            <div
              className={`
                    relative h-[250px] rounded-2xl overflow-hidden shadow-lg border border-white/10 transition-transform duration-300 group-hover:scale-[1.02]
                    ${item.type === 'combo' ? 'shadow-[0_0_20px_rgba(0,0,0,0.5)]' : ''}
                `}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={getOptimizedImageUrl(
                    item.image ||
                      `/services/${(item.title || item.name)
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace('&', 'e')}.jpg`,
                    400,
                    300
                  )}
                  onError={e => {
                    const target = e.currentTarget;
                    // Prevent infinite loop by checking if we already fell back
                    if (target.src !== MOCK_IMAGES.default) {
                      target.src = MOCK_IMAGES.default;
                    }
                  }}
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
                <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
                  {/* Priority: New Badges System */}
                  {item.badges && item.badges.length > 0 ? (
                    item.badges.map((b: any, i: number) => <PromoBadge key={i} config={b} />)
                  ) : item.badge ? (
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
