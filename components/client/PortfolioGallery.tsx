import React from 'react';
import { Instagram, ExternalLink } from 'lucide-react';

const MOCK_PORTFOLIO = [
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1593702295094-aea8c5c13d85?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
];

export const PortfolioGallery = () => {
  return (
    <div className="py-8 bg-gray-50 dark:bg-black/20 -mx-4 px-4 md:px-0 md:bg-transparent md:mx-0 transition-colors">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2 transition-colors">
            Hall da <span className="text-neon-orange">Fama</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md transition-colors">
            Confira os cortes que estão fazendo a cabeça da galera. Inspire-se para o seu próximo
            estilo.
          </p>
        </div>

        <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 px-4 py-2 rounded-full hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
          <Instagram size={14} /> Ver no Instagram
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 md:gap-4">
        {MOCK_PORTFOLIO.map((img, idx) => (
          <div
            key={idx}
            className={`relative group overflow-hidden rounded-sm cursor-pointer aspect-square bg-gray-200 dark:bg-gray-900 shadow-md dark:shadow-xl border border-white/20 dark:border-white/5
              ${idx === 0 || idx === 1 ? 'col-span-1 lg:col-span-2 lg:row-span-2' : 'col-span-1'}
            `}
          >
            <img
              src={img}
              alt="Corte"
              className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 scale-100 group-hover:scale-110 transition-all duration-700"
            />

            {/* Overlay Info */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
              <span className="text-white font-graffiti text-lg md:text-2xl mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                #Estilo{idx + 1}
              </span>
              <button className="text-[10px] text-neon-yellow uppercase font-bold tracking-widest border-b border-neon-yellow pb-0.5 transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-200">
                Ver Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <div className="h-12 w-px bg-gradient-to-b from-gray-300 dark:from-gray-800 to-transparent"></div>
      </div>
    </div>
  );
};
