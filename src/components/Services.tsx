import React, { useState } from 'react';
import { ServiceItem } from '../types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ServiceCard } from './ui/ServiceCard';

interface ServicesProps {
  onOpenBooking: () => void;
  services: ServiceItem[];
}

export const Services: React.FC<ServicesProps> = ({ onOpenBooking, services }) => {
  const [showAll, setShowAll] = useState(false);

  // Status Logic
  const isOpen = () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday
    // Mon-Sat: 09:00 - 19:00
    if (day === 0) return false;
    return hour >= 9 && hour < 19;
  };

  const shopOpen = isOpen();

  // Filter logic: Show first 5 if not showAll
  const displayedServices = showAll ? services : services.slice(0, 5);

  return (
    <section
      id="services"
      className="py-4 md:py-12 bg-[var(--bg-primary)] relative overflow-hidden scroll-mt-20"
    >
      {/* Background Elements - Absolute Dark Mode */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-[var(--bg-secondary)]/20 via-[var(--bg-primary)] to-[var(--bg-primary)] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header - No Container, Clean Layout */}
        <div className="relative mb-8 pt-0">
          {/* 1. Tabela 2026 - Absolute Left */}
          <div className="absolute top-0 left-0 hidden md:block">
            <span className="text-[var(--text-secondary)] font-bold text-xs uppercase tracking-[0.2em] border-l-2 border-neon-yellow pl-3 drop-shadow-md">
              Tabela Atualizada 2026
            </span>
          </div>

          {/* 2. Main Title - Centered - Clickable */}
          <div
            className="flex flex-col items-center justify-center text-center cursor-pointer group"
            onClick={() =>
              document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <div className="md:hidden self-start mb-1">
              <span className="text-[var(--text-secondary)] font-bold text-[10px] uppercase tracking-[0.2em] border-l-2 border-neon-yellow pl-3 drop-shadow-md">
                Tabela 2026
              </span>
            </div>

            {/* Top Connector Line (Visual) */}
            <div className="w-px h-4 bg-gradient-to-b from-transparent to-neon-yellow/30 mb-2"></div>

            <h2 className="text-5xl md:text-7xl font-graffiti text-[var(--text-primary)] leading-none drop-shadow-2xl group-hover:scale-105 transition-transform duration-300">
              ESTILO{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-br from-neon-yellow via-yellow-400 to-orange-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                TRILHA
              </span>
            </h2>

            {/* 3. Status - Centered Below Title */}
            <div
              className={`mt-6 inline-flex items-center gap-3 px-4 py-1.5 rounded-full border ${
                shopOpen ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
              } backdrop-blur-sm`}
            >
              <div className="relative">
                <div
                  className={`w-2 h-2 rounded-full ${
                    shopOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}
                ></div>
                {shopOpen && (
                  <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
                )}
              </div>
              <span
                className={`text-[10px] font-mono uppercase tracking-widest font-bold ${
                  shopOpen ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {shopOpen ? 'Barbearia Aberta Agora' : 'Fechado no Momento'}
              </span>
            </div>
          </div>
        </div>

        {/* Services Grid using ServiceCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedServices.map(service => (
            <div key={service.id} className="w-full">
              <ServiceCard service={service} onClick={onOpenBooking} variant="default" />
            </div>
          ))}
        </div>

        {/* View More / View Less Button */}
        {services.length > 5 && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="group relative px-8 py-3 bg-transparent border border-[var(--text-primary)]/20 text-[var(--text-primary)] font-black uppercase tracking-widest text-xs hover:border-neon-yellow hover:text-neon-yellow transition-all duration-300 flex items-center gap-2"
            >
              <span className="absolute inset-0 bg-neon-yellow/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
              <span className="relative z-10 flex items-center gap-2">
                {showAll ? (
                  <>
                    Ver Menos <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    Ver Todos os Serviços <ChevronDown size={14} />
                  </>
                )}
              </span>
            </button>
          </div>
        )}
        {/* Mobile Navigation Arrow */}
        <div className="md:hidden flex justify-center mt-12 pb-4">
          <button
            onClick={() =>
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="animate-bounce text-[var(--text-secondary)] hover:text-neon-yellow transition-colors cursor-pointer bg-transparent border-none p-2 outline-none"
            aria-label="Ir para Rodapé"
          >
            <ChevronDown size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};
