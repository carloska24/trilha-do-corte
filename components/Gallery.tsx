import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Camera, Instagram } from 'lucide-react';

const GALLERY_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1599351431202-6e0005079746?q=80&w=500&auto=format&fit=crop',
    title: 'Fade Clássico',
    desc: 'Acabamento navalhado',
  },
  {
    url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=500&auto=format&fit=crop',
    title: 'Barba Lenhador',
    desc: 'Alinhamento e hidratação',
  },
  {
    url: 'https://images.unsplash.com/photo-1593702295094-aea8c59b2e69?q=80&w=500&auto=format&fit=crop',
    title: 'Freestyle',
    desc: 'Arte no cabelo',
  },
  {
    url: 'https://images.unsplash.com/photo-1503951914875-befbb7470d03?q=80&w=500&auto=format&fit=crop',
    title: 'Corte Moderno',
    desc: 'Textura e movimento',
  },
  {
    url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=500&auto=format&fit=crop',
    title: 'Ambiente',
    desc: 'Nossa estação',
  },
  {
    url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=500&auto=format&fit=crop',
    title: 'Detalhes',
    desc: 'Precisão milimétrica',
  },
  {
    url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=500&auto=format&fit=crop',
    title: 'Atendimento',
    desc: 'Experiência única',
  },
  {
    url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=500&auto=format&fit=crop',
    title: 'Lavatório',
    desc: 'Relaxamento total',
  },
];

export const Gallery: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#050505] to-transparent z-10"></div>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-[#050505] to-transparent z-10"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-neon-orange mb-2">
              <Camera size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Instagram Feed</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-graffiti text-white leading-none">
              A VIBE DA{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-orange to-red-500">
                ESTAÇÃO
              </span>
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-3 rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-3 rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all active:scale-95"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {GALLERY_IMAGES.map((img, index) => (
            <div
              key={index}
              className="min-w-[280px] md:min-w-[320px] h-[400px] relative group rounded-xl overflow-hidden snap-center cursor-pointer border border-white/5"
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white font-graffiti mb-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {img.title}
                </h3>
                <p className="text-sm text-gray-300 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  {img.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#1a1a1a] hover:bg-[#252525] text-white rounded-full font-bold uppercase tracking-wider text-xs transition-all border border-white/5 hover:border-white/20 group"
          >
            <Instagram size={16} className="group-hover:text-neon-orange transition-colors" />
            Ver Galeria Completa
          </a>
        </div>
      </div>
    </section>
  );
};
