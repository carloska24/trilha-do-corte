import React, { useState } from 'react';
import { X, Calendar, Clock, Check, Star, ChevronRight, Sparkles } from 'lucide-react';
import { Combo, Barber } from '../types';
import { BARBERS } from '../constants'; // We'll need barbers availability later

interface ComboBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  combo: Combo;
}

export const ComboBookingModal: React.FC<ComboBookingModalProps> = ({ isOpen, onClose, combo }) => {
  if (!isOpen) return null;

  const [step, setStep] = useState(1); // 1: Details/Hero, 2: Schedule, 3: Confirm

  // Theme colors based on combo.theme
  const getThemeColors = () => {
    switch (combo.theme) {
      case 'gold':
        return 'from-yellow-600 via-yellow-400 to-yellow-200 text-yellow-500';
      case 'neon':
        return 'from-purple-600 via-pink-500 to-cyan-400 text-cyan-400';
      case 'tuxedo':
        return 'from-gray-900 via-gray-700 to-white text-white';
      default:
        return 'from-blue-900 via-blue-600 to-blue-400 text-blue-400';
    }
  };

  const themeGradient = getThemeColors();
  const mainColor = themeGradient.split(' ').pop(); // quick hack for text color

  // Fallback image logic (same as throughout app)
  const getImageUrl = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace('&', 'e');
    return `/services/${slug}.jpg`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-[#0f0f0f] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="overflow-y-auto custom-scrollbar flex-1 pb-32">
          {/* HERO SECTION */}
          <div className="relative h-64 sm:h-80 shrink-0">
            <img
              src={getImageUrl(combo.title)}
              onError={e => {
                const target = e.currentTarget;
                if (target.src.includes('.jpg')) {
                  target.src = target.src.replace('.jpg', '.png');
                } else {
                  target.src =
                    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80';
                }
              }}
              alt={combo.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-black/40 to-transparent" />

            {/* Badge if exists */}
            {combo.badge && (
              <div className="absolute top-6 left-6">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-white text-black shadow-lg`}
                >
                  {combo.badge}
                </span>
              </div>
            )}

            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-4xl sm:text-5xl font-black uppercase text-white font-graffiti leading-none mb-2 drop-shadow-lg">
                {combo.title}
              </h2>
              <p className="text-gray-300 font-medium text-sm sm:text-base max-w-[90%]">
                {combo.subtitle}
              </p>
            </div>
          </div>

          {/* CONTENT SECTION */}
          <div className="p-6 space-y-8">
            {/* Description */}
            <div className="p-2">
              <p className="text-gray-300 text-sm leading-relaxed font-medium">
                {combo.description}
              </p>
            </div>

            {/* THE JOURNEY (Timeline) */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Sparkles size={14} className={mainColor} /> A Experiência
              </h3>

              <div className="space-y-0 relative pl-4 border-l-2 border-white/10 ml-2">
                {combo.items.map((item, idx) => (
                  <div key={idx} className="relative pl-8 pb-8 last:pb-0 group">
                    {/* Dot */}
                    <div
                      className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-[#0f0f0f] bg-gray-600 group-hover:bg-white transition-colors shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                    />

                    <h4 className="text-white font-bold uppercase text-lg leading-none mb-1">
                      {item.customLabel || `Serviço ${idx + 1}`}
                    </h4>
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                      Passo {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* DURATION & PRICE */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900 to-black rounded-xl border border-white/10">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                  Investimento Total
                </span>
                <span className="text-2xl font-black text-white">
                  R$ {combo.priceValue.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="h-8 w-[1px] bg-white/10 mx-4" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                  Duração Estimada
                </span>
                <span className="text-sm font-bold text-white flex items-center gap-1">
                  <Clock size={14} className="text-gray-400" />
                  {combo.duration ? (
                    <>
                      {Math.floor(combo.duration / 60) > 0 &&
                        `${Math.floor(combo.duration / 60)}h `}
                      {combo.duration % 60 > 0 && `${combo.duration % 60}min`}
                    </>
                  ) : (
                    '~1h 30min'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTION */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent z-40">
          <button
            onClick={() => setStep(2)}
            className={`w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2`}
          >
            Agendar Experiência <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
