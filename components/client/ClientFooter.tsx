import React from 'react';
import { MapPin, Phone, Instagram, MessageCircle, Navigation } from 'lucide-react';

export const ClientFooter = () => {
  const handleOpenMaps = () => {
    window.open('https://maps.google.com/?q=Barbearia+Urbana', '_blank');
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/5511999999999', '_blank');
  };

  return (
    <footer className="mt-12 md:mt-20 border-t border-white/10 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neon-yellow/50 to-transparent"></div>
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]"></div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
        {/* BRAND IDENTITY */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
          <div className="w-16 h-16 bg-neon-yellow rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)] transform rotate-3">
            {/* Simple Logo Placeholder */}
            <span className="font-graffiti text-2xl text-black">TRILHA</span>
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
            Na Trilha do Corte
          </h3>
          <p className="text-gray-500 text-sm max-w-xs">
            Onde o estilo urbano encontra a tradição. Corte, barba e resenha de qualidade.
          </p>
          <div className="text-[10px] text-gray-700 font-mono uppercase mt-4">
            © {new Date().getFullYear()} Todos os direitos reservados.
          </div>
        </div>

        {/* DIRECT CONNECT */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
            Linha Direta
          </h4>

          <button
            onClick={handleWhatsApp}
            className="w-full max-w-xs bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 px-6 rounded-sm flex items-center justify-center gap-3 transition-colors shadow-lg group"
          >
            <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
            <span>Chamar no Zap</span>
          </button>

          <button className="w-full max-w-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-sm flex items-center justify-center gap-3 transition-colors shadow-lg group">
            <Instagram size={20} className="group-hover:scale-110 transition-transform" />
            <span>@trilhadocorte</span>
          </button>
        </div>

        {/* LOCATION BASE */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
            Base Operacional
          </h4>
          <div
            className="bg-[#151515] p-4 rounded-lg border border-white/5 w-full max-w-xs group cursor-pointer hover:border-gray-700 transition-colors"
            onClick={handleOpenMaps}
          >
            <div className="flex items-center justify-between mb-2">
              <MapPin className="text-neon-orange" size={24} />
              <Navigation
                size={16}
                className="text-gray-600 group-hover:text-neon-yellow transition-colors"
              />
            </div>
            <p className="text-white font-bold text-sm">Rua das Navais, 777</p>
            <p className="text-gray-500 text-xs mt-1">Centro, São Paulo - SP</p>
            <div className="mt-3 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-neon-orange w-2/3"></div>
            </div>
            <p className="text-[10px] text-neon-orange mt-1 text-right">Aberto até as 20h</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
