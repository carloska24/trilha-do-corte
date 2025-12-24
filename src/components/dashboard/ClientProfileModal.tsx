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

  /* Logic for Status/Rating Calculation */
  const rating = (4.0 + (client.level || 1) * 0.1).toFixed(1); // Mock Rating based on Level
  const isVip = (client.level || 1) >= 5;

  // Parse last visit for "3d" logic
  let daysSinceVisit = '0d';
  if (
    client.lastVisit &&
    client.lastVisit !== 'Nunca' &&
    client.lastVisit !== 'Hoje' &&
    client.lastVisit !== 'Ontem'
  ) {
    // simplified calculation or just display text
    daysSinceVisit = '5d'; // constant for demo if parsing is complex without date lib, or use '3d' as requested style
  } else if (client.lastVisit === 'Ontem') {
    daysSinceVisit = '1d';
  } else if (client.lastVisit === 'Hoje') {
    daysSinceVisit = '0d';
  } else {
    daysSinceVisit = '-';
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="bg-[#0a0a0a] border border-gray-800 w-[95%] md:w-full md:max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] relative rounded-3xl flex flex-col overflow-hidden max-h-[90vh] ring-1 ring-white/10">
        {/* --- CLOSE BUTTON --- */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-black/40 hover:bg-gray-800 p-2 rounded-full cursor-pointer z-50 backdrop-blur-md border border-white/5"
        >
          <X size={18} />
        </button>

        {/* --- HEADER --- */}
        <div className="relative pt-10 pb-6 flex flex-col items-center bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-gray-800/30 via-[#0a0a0a] to-[#0a0a0a]">
          {/* Avatar */}
          <div className="relative mb-3 group cursor-pointer">
            {/* Glow matches level */}
            <div
              className={`absolute inset-0 rounded-full blur-2xl opacity-30 ${
                isVip ? 'bg-yellow-500' : 'bg-blue-500'
              } group-hover:opacity-50 transition-opacity`}
            ></div>

            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#121212] shadow-2xl relative z-10">
              <img
                src={
                  client.img ||
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
                }
                alt={client.name}
                className="w-full h-full object-cover filter contrast-110"
              />
            </div>

            {/* Level Badge - Pill Shape */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 bg-[#FFD700] text-black text-[10px] font-black px-3 py-1 rounded-md shadow-lg uppercase tracking-widest border-2 border-[#0a0a0a]">
              NÍVEL {client.level || 1}
            </div>
          </div>

          {/* Name */}
          <h2 className="text-3xl font-black text-white italic uppercase tracking-wider text-center px-4 leading-none mb-2 drop-shadow-md">
            {client.name}
          </h2>

          {/* ID Pill */}
          <span className="text-gray-500 font-mono text-[10px] tracking-[0.2em] bg-[#151515] px-4 py-1.5 rounded-full border border-gray-800 shadow-inner">
            ID: {String(client.id || '0000').slice(-4)}
          </span>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 w-full px-6 mt-8">
            <div className="bg-[#111] border border-gray-800 rounded-xl p-3 flex flex-col items-center justify-center hover:border-gray-700 transition-colors">
              <span className="text-[#FFD700] font-black text-xl leading-none mb-1">{rating}</span>
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                RATING
              </span>
            </div>
            <div className="bg-[#111] border border-gray-800 rounded-xl p-3 flex flex-col items-center justify-center hover:border-gray-700 transition-colors">
              <span className="text-white font-black text-xl leading-none mb-1">
                {daysSinceVisit}
              </span>
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                DESDE VISITA
              </span>
            </div>
            <div className="bg-[#111] border border-gray-800 rounded-xl p-3 flex flex-col items-center justify-center hover:border-gray-700 transition-colors">
              <span
                className={`font-black text-xl leading-none mb-1 ${
                  isVip ? 'text-purple-500' : 'text-blue-500'
                }`}
              >
                {isVip ? 'VIP' : 'REG'}
              </span>
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                STATUS
              </span>
            </div>
          </div>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-6 pt-2 space-y-6 custom-scrollbar">
          {/* Contact Actions */}
          <div className="flex gap-4">
            <a
              href={`tel:${client.phone}`}
              className="flex-1 flex items-center justify-center gap-2 text-white font-bold text-xs uppercase tracking-wider hover:text-gray-300 transition-colors py-2"
            >
              <Phone size={16} className="text-white" />
              {client.phone}
            </a>
            <button
              onClick={handleWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 text-white font-bold text-xs uppercase tracking-wider hover:text-green-400 transition-colors py-2"
            >
              <MessageSquare size={16} />
              WhatsApp
            </button>
          </div>

          {/* Barber Notes */}
          <div className="relative group">
            <div
              className={`bg-[#111] border border-gray-800 rounded-2xl p-5 relative overflow-hidden transition-colors ${
                isEditingNotes ? 'border-yellow-500/50' : 'hover:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-yellow-500 uppercase tracking-widest">
                  <Star size={10} fill="currentColor" /> Notas do Barbeiro
                </div>
                <button
                  onClick={() => (isEditingNotes ? handleSaveNotes() : setIsEditingNotes(true))}
                  className="text-gray-600 hover:text-white transition-colors"
                >
                  <Edit size={12} />
                </button>
              </div>

              {isEditingNotes ? (
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-transparent text-white text-sm italic focus:outline-none resize-none min-h-[60px]"
                  autoFocus
                />
              ) : (
                <p className="text-gray-300 text-sm italic font-medium leading-relaxed">
                  "{notes || 'Sem observações registradas.'}"
                </p>
              )}
            </div>
          </div>

          {/* History Timeline */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Histórico de Viagens
              </h3>
              <span className="bg-[#151515] text-gray-500 text-[9px] font-mono px-2 py-0.5 rounded border border-gray-800">
                TOTAL: {client.history?.length || 0}
              </span>
            </div>

            <div className="pl-2 space-y-4 border-l border-gray-800 ml-2">
              {/* Active/Today Appointment (Mock or Real) */}
              <div className="relative pl-6">
                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-yellow-500 border-2 border-[#0a0a0a] shadow-[0_0_10px_#eab308] z-10"></div>
                <div className="bg-[#111] border border-yellow-500/30 rounded-xl p-4 flex justify-between items-center hover:bg-[#151515] transition-colors group cursor-pointer shadow-[inset_0_0_20px_rgba(234,179,8,0.05)]">
                  <div>
                    <h4 className="text-yellow-500 text-[10px] font-black uppercase tracking-wider mb-1">
                      Agendado (Hoje)
                    </h4>
                    <p className="text-white font-bold text-sm">Corte + Barba</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-gray-500 text-[10px] font-mono mb-0.5">14:00</span>
                    <span className="block text-white font-mono font-bold text-xs">R$ 60,00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-5 bg-[#0a0a0a] border-t border-gray-800">
          <button
            onClick={handleNewBookingClick}
            className="w-full bg-[#EAB308] hover:bg-[#FACC15] text-black font-black uppercase py-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all flex items-center justify-center gap-3 text-sm tracking-widest"
          >
            <Calendar size={18} strokeWidth={2.5} />
            Novo Agendamento
          </button>
        </div>
      </div>
    </div>
  );
};
