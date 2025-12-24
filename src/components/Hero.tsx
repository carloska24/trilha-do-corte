import React from 'react';
import { ChevronDown } from 'lucide-react';

interface HeroProps {
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking }) => {
  return (
    <section
      id="home"
      className="relative min-h-screen w-full overflow-hidden bg-street-dark flex flex-col pt-20 scroll-mt-20"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-street-dark via-street-dark/80 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Animated Train Track Element - Central Vertical Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 md:w-2 -translate-x-1/2 z-0 opacity-50">
        <div className="h-full w-full border-l-2 border-dashed border-neon-yellow/30 relative">
          {/* Moving light effect */}
          <div className="absolute top-0 left-[-2px] w-[2px] h-20 bg-neon-yellow blur-md animate-[slideTrack_2s_linear_infinite]" />
        </div>
      </div>

      {/* Full Width Banner Hero Image */}
      <div className="relative z-10 w-full animate-[fadeIn_0.5s_ease-out] mb-4">
        <img
          src="/hero_banner.jpg"
          alt="Na Trilha do Corte"
          className="w-full h-auto max-h-[60vh] object-cover object-top shadow-[0_10px_50px_rgba(0,0,0,0.5)]"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col items-center text-center mt-6">
        {/* Restored Text Content */}
        <h1 className="text-5xl md:text-8xl font-graffiti text-white mb-6 leading-none graffiti-text tracking-wider mt-4">
          O TREM <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-yellow to-neon-orange">
            DO ESTILO
          </span>
        </h1>

        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 font-light font-sans mb-8">
          Não é só um corte, é o embarque para sua melhor versão. Barbearia clássica com a alma das
          ruas.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onOpenBooking}
            className="px-8 py-4 bg-neon-yellow text-black font-black text-lg uppercase tracking-wider hover:bg-white hover:scale-105 transform transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] skew-x-[-10deg] cursor-pointer"
          >
            <span className="skew-x-[10deg] block">Embarcar Agora</span>
          </button>
          <a
            href="#services"
            onClick={e => {
              e.preventDefault();
              document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 border-2 border-white/20 text-white font-bold text-lg uppercase tracking-wider hover:border-neon-orange hover:text-neon-orange transition-all skew-x-[-10deg] cursor-pointer inline-block"
          >
            <span className="skew-x-[10deg] block">Ver Bilheteria</span>
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50 hover:text-neon-yellow transition-colors cursor-pointer bg-transparent border-none p-2 outline-none"
        aria-label="Rolar para baixo"
      >
        <ChevronDown size={32} />
      </button>
    </section>
  );
};
