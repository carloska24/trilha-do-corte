import React from 'react';
import { Instagram, ExternalLink, Camera } from 'lucide-react';

const MOCK_PORTFOLIO = [
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=400&auto=format&fit=crop', // Replaced broken link
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=400&auto=format&fit=crop', // Fixed Image 5
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
];

export const PortfolioGallery = () => {
  return (
    <div className="py-6 bg-transparent transition-colors">
      <div className="flex items-center justify-between mb-6 px-4 md:px-0">
        <div
          onClick={() => {
            const el = document.getElementById('gallery-section');
            if (el) {
              const headerOffset = 90;
              const elementPosition = el.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
              window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-2 cursor-pointer select-none active:scale-95 transition-transform"
        >
          <Camera className="text-neon-orange" size={24} />
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter transition-colors">
            Hall da <span className="text-neon-orange">Fama</span>
          </h2>
        </div>

        <a
          href="https://instagram.com/trilhadocorte"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-white uppercase tracking-widest bg-gradient-to-tr from-[#f09433] via-[#bc1888] to-[#2f55a4] px-4 py-2 rounded-full hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2"
        >
          <Instagram size={14} /> <span>Siga!</span>
        </a>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-0.5 md:gap-4">
        {MOCK_PORTFOLIO.map((img, idx) => (
          <div
            key={idx}
            className={`relative group overflow-hidden cursor-pointer aspect-square bg-gray-200 dark:bg-gray-900
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
