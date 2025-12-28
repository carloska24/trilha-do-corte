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
    window.open(
      'https://www.google.com/maps/search/?api=1&query=Rua+Monsenhor+Landell+de+Moura,+129+-+Jardim+São+Marcos,+Campinas+-+SP',
      '_blank'
    );
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/5519991611609', '_blank');
  };

  return (
    <footer className="mt-0 border-t border-white/5 bg-gradient-to-b from-black via-[#111] to-[#151515] relative overflow-hidden pb-24 md:pb-12">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neon-yellow/50 to-transparent"></div>
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]"></div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10 scale-105 origin-top">
        {/* BRAND IDENTITY */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
          <div className="w-16 h-16 bg-neon-yellow rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.4)] transform hover:rotate-6 transition-transform duration-500 border border-white/20">
            <span className="font-graffiti text-2xl text-black drop-shadow-sm">TRILHA</span>
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
            className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10 w-full max-w-xs group cursor-pointer hover:border-neon-orange/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] transition-all duration-300 overflow-hidden"
            onClick={handleOpenMaps}
          >
            {/* Tech Decoration */}
            <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className="w-2 h-2 border-t-2 border-r-2 border-neon-orange drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]"></div>
            </div>
            <div className="absolute bottom-0 left-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className="w-2 h-2 border-b-2 border-l-2 border-neon-orange drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]"></div>
            </div>

            <div className="flex items-start justify-between mb-3">
              <div className="bg-neon-orange/10 p-2 rounded-xl group-hover:bg-neon-orange/20 transition-colors">
                <MapPin
                  className="text-neon-orange drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                  size={20}
                />
              </div>
              <Navigation
                size={16}
                className="text-gray-600 group-hover:text-neon-yellow transition-colors transform group-hover:rotate-45"
              />
            </div>

            <div className="text-left space-y-1">
              <p className="text-white font-black text-sm leading-tight group-hover:text-neon-orange transition-colors">
                Rua Monsenhor Landell de Moura, 129
              </p>
              <p className="text-gray-400 text-xs font-medium">Jardim São Marcos, Campinas - SP</p>
              <p className="text-gray-500 text-[10px] font-mono tracking-wider">CEP 13082-225</p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <span
                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                  isOpen
                    ? 'text-green-400 border-green-900/50 bg-green-900/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                    : 'text-red-400 border-red-900/50 bg-red-900/20'
                }`}
              >
                <div className="relative flex h-2 w-2">
                  {isOpen && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isOpen ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  ></span>
                </div>
                {isOpen ? 'Aberto Agora' : 'Fechado'}
              </span>
              <span className="text-[10px] text-gray-400 font-bold bg-black/40 px-2 py-1 rounded">
                08h - 19h
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
