import React, { useState, useEffect } from 'react';
import { MapPin, MessageCircle, Instagram, Navigation } from 'lucide-react';
import { isStoreOpen } from '../../utils/dateHelpers';

export const ClientFooter = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(isStoreOpen());
    const interval = setInterval(() => setIsOpen(isStoreOpen()), 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleOpenMaps = () => {
    // ... existing code
    window.open(
      'https://www.google.com/maps/search/?api=1&query=Rua+Monsenhor+Landell+de+Moura,+129+-+Jardim+São+Marcos,+Campinas+-+SP',
      '_blank'
    );
  };

  const handleWhatsApp = () => {
    // ... existing code
    window.open('https://wa.me/5519991611609', '_blank');
  };

  // ... return statement starts ...
  // ... inside the address card ...
  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
    <span
      className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
        isOpen ? 'text-green-500' : 'text-red-500'
      }`}
    >
      <span className="relative flex h-2 w-2">
        {isOpen && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isOpen ? 'bg-green-500' : 'bg-red-500'
          }`}
        ></span>
      </span>
      {isOpen ? 'Aberto' : 'Fechado'}
    </span>
    <span className="text-[10px] text-gray-400 font-medium">Das 08h às 19h</span>
  </div>;
  // ... rest of component ...

  return (
    <footer className="mt-8 md:mt-16 border-t border-white/10 bg-black relative overflow-hidden pb-24 md:pb-12">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neon-yellow/50 to-transparent"></div>
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]"></div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {/* BRAND IDENTITY */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
          <div className="w-14 h-14 bg-neon-yellow rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)] transform hover:rotate-6 transition-transform duration-500">
            <span className="font-graffiti text-xl text-black">TRILHA</span>
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">
              Na Trilha do Corte
            </h3>
            <p className="text-gray-500 text-xs max-w-xs mt-1 leading-relaxed">
              Onde o estilo urbano encontra a tradição.
            </p>
          </div>
          <div className="text-[10px] text-gray-700 font-mono uppercase">
            © {new Date().getFullYear()} Todos os direitos reservados.
          </div>
        </div>

        {/* DIRECT CONNECT */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-1">
            Linha Direta
          </h4>

          <button
            onClick={handleWhatsApp}
            className="w-full max-w-xs bg-[#25D366] hover:bg-[#1fbd59] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-[0_4px_20px_rgba(37,211,102,0.2)] hover:shadow-[0_4px_25px_rgba(37,211,102,0.4)] group active:scale-95"
          >
            <div className="bg-white/20 p-1 rounded-full">
              <MessageCircle size={16} className="text-white" />
            </div>
            <span className="tracking-wide text-sm">(19) 99161-1609</span>
          </button>

          <a
            href="https://instagram.com/trilhadocorte"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-[0_4px_20px_rgba(168,85,247,0.3)] hover:shadow-[0_4px_25px_rgba(168,85,247,0.5)] group active:scale-95"
          >
            <div className="bg-white/20 p-1 rounded-full">
              <Instagram size={16} className="text-white" />
            </div>
            <span className="tracking-wide text-sm">@trilhadocorte</span>
          </a>
        </div>

        {/* LOCATION BASE */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-3">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-1">
            Base Operacional
          </h4>
          <div
            className="relative bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 w-full max-w-xs group cursor-pointer hover:border-white/20 hover:bg-white/10 transition-all duration-300 overflow-hidden"
            onClick={handleOpenMaps}
          >
            {/* Tech Decoration */}
            <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className="w-2 h-2 border-t-2 border-r-2 border-neon-orange"></div>
            </div>
            <div className="absolute bottom-0 left-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className="w-2 h-2 border-b-2 border-l-2 border-neon-orange"></div>
            </div>

            <div className="flex items-start justify-between mb-2">
              <div className="bg-neon-orange/10 p-1.5 rounded-lg">
                <MapPin className="text-neon-orange" size={18} />
              </div>
              <Navigation
                size={14}
                className="text-gray-600 group-hover:text-neon-yellow transition-colors"
              />
            </div>

            <div className="text-left">
              <p className="text-white font-bold text-xs leading-tight">
                Rua Monsenhor Landell de Moura, 129
              </p>
              <p className="text-gray-400 text-[10px] mt-1">Jardim São Marcos, Campinas - SP</p>
              <p className="text-gray-500 text-[10px] mt-0.5 tracking-wider">CEP 13082-225</p>
            </div>

            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
              <span
                className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
                  isOpen ? 'text-green-500' : 'text-red-500'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  {isOpen && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isOpen ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  ></span>
                </span>
                {isOpen ? 'Aberto' : 'Fechado'}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">Das 08h às 19h</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
