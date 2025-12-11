import React from 'react';
import {
  User,
  X,
  Edit,
  Calendar,
  Scissors,
  Phone,
  Clock,
  Star,
  MapPin,
  MessageSquare,
} from 'lucide-react';
import { Client } from '../types';

interface ClientProfileModalProps {
  client: Client;
  onClose: () => void;
  onNewBooking?: (client: Client) => void;
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({
  client,
  onClose,
  onNewBooking,
}) => {
  if (!client) return null;

  /* New State for Notes Editing */
  const [isEditingNotes, setIsEditingNotes] = React.useState(false);
  const [notes, setNotes] = React.useState(client.notes || '');

  const handleWhatsApp = () => {
    const phone = client.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=Olá ${client.name}, tudo bem?`, '_blank');
  };

  const handleNewBookingClick = () => {
    if (onNewBooking) {
      onNewBooking(client);
    } else {
      onClose();
      // Ideally trigger booking modal here if prop provided
    }
  };

  const handleSaveNotes = () => {
    setIsEditingNotes(false);
    // In a real app, we would call an API here.
    // onUpdateClient({ ...client, notes });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="bg-[#111] border border-gray-800 w-[95%] md:w-full md:max-w-md shadow-2xl relative rounded-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* --- HERO HEADER --- */}
        <div className="relative bg-gradient-to-br from-gray-900 via-[#151515] to-black p-6 pb-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-black/20 hover:bg-black/50 p-2 rounded-full cursor-pointer z-50"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center text-center relative z-10">
            {/* Avatar Glow */}
            <div className="relative mb-4 group">
              <div className="absolute inset-0 bg-neon-yellow blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#1a1a1a] shadow-2xl relative z-10">
                {client.img ? (
                  <img src={client.img} alt={client.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-gray-600">
                    <User size={40} />
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-2 z-20 bg-neon-yellow text-black text-[10px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-wider">
                Nível {client.level}
              </div>
            </div>

            {/* Name & ID */}
            <h2 className="text-3xl font-black text-white uppercase italic tracking-wider mb-1">
              {client.name}
            </h2>
            <span className="text-gray-500 font-mono text-xs tracking-[0.2em] bg-[#1a1a1a] px-3 py-1 rounded-full border border-gray-800">
              ID: {String(client.id).padStart(4, '0')}
            </span>
          </div>

          {/* Stats Row */}
          <div className="flex justify-center gap-4 mt-6">
            <div className="bg-[#1a1a1a]/80 backdrop-blur border border-gray-800 px-4 py-2 rounded-lg text-center">
              <span className="block text-neon-yellow font-black text-lg">4.8</span>
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">
                Rating
              </span>
            </div>
            <div className="bg-[#1a1a1a]/80 backdrop-blur border border-gray-800 px-4 py-2 rounded-lg text-center">
              <span className="block text-white font-black text-lg">
                {client.lastVisit === 'Ontem' ? '1d' : '3d'}
              </span>
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">
                Desde Visita
              </span>
            </div>
            <div className="bg-[#1a1a1a]/80 backdrop-blur border border-gray-800 px-4 py-2 rounded-lg text-center">
              <span className="block text-purple-400 font-black text-lg">VIP</span>
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">
                Status
              </span>
            </div>
          </div>
        </div>

        {/* --- BODY --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0f0f11]">
          {/* Contact & Notes */}
          <div className="p-6 space-y-4">
            <div className="flex gap-3">
              <a
                href={`tel:${client.phone}`}
                className="flex-1 bg-transparent hover:bg-gray-800/20 text-gray-300 hover:text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all group cursor-pointer" // Removed border/bg
              >
                {/* PHONE SVG */}
                <svg
                  height="24"
                  viewBox="0 0 512 512"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="fill-current text-white group-hover:text-neon-yellow transition-colors"
                >
                  <g>
                    <g>
                      <path d="m256 30a226.06 226.06 0 0 1 88 434.25 226.06 226.06 0 0 1 -176-416.5 224.5 224.5 0 0 1 88-17.75m0-30c-141.38 0-256 114.62-256 256s114.62 256 256 256 256-114.62 256-256-114.62-256-256-256z"></path>
                      <path d="m330.69 393.87c-14.87-1-35.83-6.13-56.29-13.45-72.14-25.82-142.53-94.61-157.49-190.83-2.66-17.13.14-32.78 13.12-45.52 4.35-4.26 8.22-9 12.47-13.36 16-16.47 39.38-16.89 55.95-1.07 5.25 5 10.59 9.93 15.71 15.09a38.07 38.07 0 0 1 1.37 52.79c-4 4.44-8.2 8.66-12.42 12.87-4.61 4.6-10.34 7.24-16.49 9.16-7.59 2.38-9 5.56-5.55 12.81q32.7 68.49 102.37 98.63c6.21 2.68 9.08 1.47 11.58-4.69 5.48-13.51 15.53-23.36 27.08-31.32 13.07-9 31.79-7 44.17 3.64a263.23 263.23 0 0 1 19.43 18.5 38.22 38.22 0 0 1 -.05 52.25c-1.93 2.1-3.92 4.15-5.77 6.31-11.14 12.95-25.27 19.01-49.19 18.19z"></path>
                    </g>
                  </g>
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider">{client.phone}</span>
              </a>
              <button
                onClick={handleWhatsApp}
                className="flex-1 bg-transparent hover:bg-gray-800/20 text-gray-300 hover:text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all group cursor-pointer" // Removed border/bg
              >
                {/* WHATSAPP SVG */}
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 52 52"
                  className="fill-current text-white group-hover:text-green-500 transition-colors"
                  width="20"
                  height="20"
                >
                  <g>
                    <g>
                      <path d="M26,0C11.663,0,0,11.663,0,26c0,4.891,1.359,9.639,3.937,13.762C2.91,43.36,1.055,50.166,1.035,50.237 c-0.096,0.352,0.007,0.728,0.27,0.981c0.263,0.253,0.643,0.343,0.989,0.237L12.6,48.285C16.637,50.717,21.26,52,26,52 c14.337,0,26-11.663,26-26S40.337,0,26,0z M26,50c-4.519,0-8.921-1.263-12.731-3.651c-0.161-0.101-0.346-0.152-0.531-0.152 c-0.099,0-0.198,0.015-0.294,0.044l-8.999,2.77c0.661-2.413,1.849-6.729,2.538-9.13c0.08-0.278,0.035-0.578-0.122-0.821 C3.335,35.173,2,30.657,2,26C2,12.767,12.767,2,26,2s24,10.767,24,24S39.233,50,26,50z"></path>
                      <path d="M42.985,32.126c-1.846-1.025-3.418-2.053-4.565-2.803c-0.876-0.572-1.509-0.985-1.973-1.218 c-1.297-0.647-2.28-0.19-2.654,0.188c-0.047,0.047-0.089,0.098-0.125,0.152c-1.347,2.021-3.106,3.954-3.621,4.058 c-0.595-0.093-3.38-1.676-6.148-3.981c-2.826-2.355-4.604-4.61-4.865-6.146C20.847,20.51,21.5,19.336,21.5,18 c0-1.377-3.212-7.126-3.793-7.707c-0.583-0.582-1.896-0.673-3.903-0.273c-0.193,0.039-0.371,0.134-0.511,0.273 c-0.243,0.243-5.929,6.04-3.227,13.066c2.966,7.711,10.579,16.674,20.285,18.13c1.103,0.165,2.137,0.247,3.105,0.247 c5.71,0,9.08-2.873,10.029-8.572C43.556,32.747,43.355,32.331,42.985,32.126z M30.648,39.511 c-10.264-1.539-16.729-11.708-18.715-16.87c-1.97-5.12,1.663-9.685,2.575-10.717c0.742-0.126,1.523-0.179,1.849-0.128 c0.681,0.947,3.039,5.402,3.143,6.204c0,0.525-0.171,1.256-2.207,3.293C17.105,21.48,17,21.734,17,22c0,5.236,11.044,12.5,13,12.5 c1.701,0,3.919-2.859,5.182-4.722c0.073,0.003,0.196,0.028,0.371,0.116c0.36,0.181,0.984,0.588,1.773,1.104 c1.042,0.681,2.426,1.585,4.06,2.522C40.644,37.09,38.57,40.701,30.648,39.511z"></path>
                    </g>
                  </g>
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider">WhatsApp</span>
              </button>
            </div>

            <div className="bg-[#151515] border border-gray-800 rounded-xl p-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={() => {
                    if (isEditingNotes) handleSaveNotes();
                    else setIsEditingNotes(true);
                  }}
                  className="flex items-center justify-center bg-black/50 hover:bg-neon-yellow/20 p-2 rounded-full transition-colors"
                >
                  {isEditingNotes ? (
                    <div className="text-green-500 font-bold text-[10px] uppercase">Salvar</div>
                  ) : (
                    <Edit size={14} className="text-gray-500 hover:text-white" />
                  )}
                </button>
              </div>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Star size={10} className="text-neon-yellow" /> Notas do Barbeiro
              </h3>

              {isEditingNotes ? (
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg p-2 text-white text-sm font-medium italic focus:outline-none focus:border-neon-yellow transition-colors min-h-[80px]"
                  autoFocus
                />
              ) : (
                <p className="text-gray-300 text-sm font-medium italic leading-relaxed">
                  "{notes || 'Cliente novo. Preferência por cortes baixos e acabamento natural.'}"
                </p>
              )}
            </div>
          </div>

          {/* History Timeline */}
          <div className="p-6 pt-0">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center justify-between">
              <span>Histórico de Viagens</span>
              <span className="bg-gray-800 text-gray-400 px-1.5 rounded">
                Total: {client.history?.length || 0}
              </span>
            </h3>

            <div className="space-y-3 relative before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-800">
              {/* Mock Current/Future */}
              <div className="relative pl-10">
                <div className="absolute left-3 top-1.5 w-4 h-4 rounded-full bg-neon-yellow border-4 border-[#0f0f11] shadow-[0_0_10px_rgba(234,179,8,0.5)] z-10"></div>
                <div className="bg-[#1a1a1a] border border-neon-yellow/30 p-3 rounded-xl flex justify-between items-center group cursor-pointer hover:bg-[#202020] transition-colors">
                  <div>
                    <div className="text-neon-yellow font-bold text-xs uppercase mb-0.5">
                      Agendado (Hoje)
                    </div>
                    <div className="text-white font-bold text-sm">Corte + Barba</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-[10px] font-mono mb-0.5">14:00</div>
                    <div className="text-white font-mono font-bold text-xs">R$ 60,00</div>
                  </div>
                </div>
              </div>

              {/* Past Items (Mocked or Real) */}
              {[1, 2, 3].map((_, i) => (
                <div
                  key={i}
                  className="relative pl-10 grayscale hover:grayscale-0 transition-all duration-300"
                >
                  <div className="absolute left-4 top-4 w-2 h-2 rounded-full bg-gray-600 border border-[#0f0f11] z-10"></div>
                  <div className="bg-[#151515] border border-gray-800 p-3 rounded-xl flex justify-between items-center group cursor-pointer hover:border-gray-600">
                    <div>
                      <div className="text-white font-bold text-sm">Corte Degrade</div>
                      <div className="text-gray-600 text-[10px] font-bold uppercase mt-1">
                        Finalizado
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 text-[10px] font-mono mb-0.5">2{i}/09</div>
                      <div className="text-gray-400 font-mono font-bold text-xs">R$ 35,00</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- FOOTER ACTION --- */}
        <div className="p-4 bg-[#111] border-t border-gray-800">
          <button
            onClick={handleNewBookingClick}
            className="w-full py-4 bg-neon-yellow text-black font-black uppercase text-sm tracking-widest rounded-xl hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar size={18} strokeWidth={2.5} />
            Novo Agendamento
          </button>
        </div>
      </div>
    </div>
  );
};
