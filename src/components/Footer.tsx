import React from 'react';
import { MapPin, Phone, Instagram, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-black text-white pt-20 pb-10 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand */}
        <div>
          <h3 className="font-graffiti text-3xl mb-6 text-neon-yellow">
            NA TRILHA <span className="text-white">DO CORTE</span>
          </h3>
          <p className="text-gray-500 mb-6 max-w-xs">
            A barbearia que segue o ritmo da cidade. Estilo, precisão e cultura urbana em cada
            detalhe.
          </p>
          <div className="flex space-x-4">
            <a
              href="https://instagram.com/trilhadocorte"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-neon-yellow hover:text-black transition-all"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://facebook.com/trilhadocorte"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-neon-yellow hover:text-black transition-all"
            >
              <Facebook size={20} />
            </a>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xl font-bold uppercase mb-6 tracking-wider">Contato</h4>
          <ul className="space-y-4 text-gray-400">
            <li>
              <a
                href="https://www.google.com/maps?q=Rua+Monsenhor+Landell+de+Moura,+129+Campinas+SP"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 hover:text-neon-orange transition-colors group"
              >
                <MapPin className="text-neon-orange flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span>
                  Rua Monsenhor Landell de Moura, 129
                  <br />
                  Jardim São Marcos, Campinas - SP
                </span>
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/5519991611609"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-neon-orange transition-colors group"
              >
                <Phone className="text-neon-orange flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span>(19) 99161-1609</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Hours */}
        <div>
          <h4 className="text-xl font-bold uppercase mb-6 tracking-wider">Horários</h4>
          <ul className="space-y-2 text-gray-400">
            <li className="flex justify-between border-b border-gray-800 pb-2">
              <span>Seg - Sex</span>
              <span className="text-white">08:00 - 19:00</span>
            </li>
            <li className="flex justify-between border-b border-gray-800 pb-2">
              <span>Sábado</span>
              <span className="text-white">08:00 - 18:00</span>
            </li>
            <li className="flex justify-between border-b border-gray-800 pb-2">
              <span>Domingo</span>
              <span className="text-neon-orange">Fechado</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-gray-900 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Na Trilha do Corte. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};
