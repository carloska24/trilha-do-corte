import React from 'react';
import {
  User,
  X,
  Edit,
  Calendar,
  Phone,
  Star,
  MessageSquare,
  Clock,
  History,
  CheckCircle2,
} from 'lucide-react';
import { Client, Appointment, Service } from '../types';

interface ClientProfileModalProps {
  client: Client;
  onClose: () => void;
  onNewBooking?: (client: Client) => void;
  appointments: Appointment[];
  services: Service[];
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({
  client,
  onClose,
  onNewBooking,
  appointments = [],
  services = [],
}) => {
  if (!client) return null;

  /* New State for Notes Editing */
  const [isEditingNotes, setIsEditingNotes] = React.useState(false);
  const [notes, setNotes] = React.useState(client.notes || '');

  const handleWhatsApp = () => {
    const phone = client.phone.replace(/\D/g, '');
    const msg = `Ola, ${client.name}! \uD83D\uDC88\n\nTudo bem?`; // 💈 = \uD83D\uDC88
    const params = new URLSearchParams();
    params.append('text', msg);
    window.open(`https://wa.me/55${phone}?${params.toString()}`, '_blank');
  };

  const handleNewBookingClick = () => {
    if (onNewBooking) {
      onNewBooking(client);
    } else {
      onClose();
    }
  };

  const handleSaveNotes = () => {
    setIsEditingNotes(false);
    // In a real app, we would call an API here.
  };

  // --- REAL DATA LOGIC ---

  // 1. Filter Appointments for this Client
  const clientApps = appointments.filter(
    app => app.clientName.toLowerCase() === client.name.toLowerCase()
  );

  // 2. Find Next Appointment (Future)
  const now = new Date();
  const futureApps = clientApps
    .filter(app => {
      const appDate = new Date(`${app.date}T${app.time}:00`);
      return appDate >= now && app.status !== 'cancelled' && app.status !== 'completed';
    })
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}:00`).getTime() - new Date(`${b.date}T${b.time}:00`).getTime()
    );

  const nextApp = futureApps[0];

  // 3. Calculate Stats
  const totalVisits = clientApps.filter(a => a.status === 'completed').length;
  // Mock rating based on visits if generic
  const dynamicRating = Math.min(5, 4.0 + totalVisits * 0.1).toFixed(1);

  // Helper to get Service Name
  const getServiceName = (id: string) => {
    const s = services.find(serv => serv.id === id);
    return s ? s.name : 'Serviço Personalizado';
  };

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

            {/* Updated ID Badge (Replaces Level for cleanliness) */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 bg-[#151515] text-gray-400 text-[9px] font-mono font-bold px-3 py-1 rounded-full shadow-lg border border-gray-800 whitespace-nowrap">
              ID: {String(client.id || '0000').slice(-4)}
            </div>
          </div>

          {/* Name */}
          <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-wider text-center px-4 leading-none mb-4 drop-shadow-md mt-2">
            {client.name}
          </h2>

          {/* Stats Grid - CLEANER UX */}
          <div className="grid grid-cols-2 gap-3 w-full px-12 mt-4">
            <div className="bg-[#111] border border-gray-800 rounded-xl p-2 flex flex-col items-center justify-center hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-1 mb-1">
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <span className="text-white font-black text-lg leading-none">{dynamicRating}</span>
              </div>
              <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                RATING
              </span>
            </div>
            <div className="bg-[#111] border border-gray-800 rounded-xl p-2 flex flex-col items-center justify-center hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-1 mb-1">
                <History size={12} className="text-blue-500" />
                <span className="text-white font-black text-lg leading-none">{totalVisits}</span>
              </div>
              <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                VISITAS
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
              className="flex-1 flex items-center justify-center gap-2 text-white font-bold text-xs uppercase tracking-wider hover:text-gray-300 transition-colors py-3 bg-[#111] rounded-xl border border-gray-800 hover:border-gray-600"
            >
              <Phone size={14} className="text-gray-400" />
              Ligar
            </a>
            <button
              onClick={handleWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 text-white font-bold text-xs uppercase tracking-wider hover:text-green-400 transition-colors py-3 bg-[#111] rounded-xl border border-gray-800 hover:border-green-900/50"
            >
              <MessageSquare size={14} className="text-green-500" />
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
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Notas do Cliente
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
                  "{notes || 'Sem observações.'}"
                </p>
              )}
            </div>
          </div>

          {/* Next Appointment / History Wrapper */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Próximas Viagens
              </h3>
            </div>

            <div className="space-y-3">
              {nextApp ? (
                /* Dynamic Next Appointment */
                <div className="relative">
                  <div className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-neon-yellow shadow-[0_0_10px_#eab308]"></div>
                  <div className="bg-[#111] border border-yellow-500/20 rounded-xl p-4 flex justify-between items-center hover:bg-[#151515] transition-colors group cursor-pointer ml-1">
                    <div>
                      <h4 className="text-neon-yellow text-[10px] font-black uppercase tracking-wider mb-1 flex items-center gap-2">
                        <Calendar size={10} />
                        {new Date(nextApp.date)
                          .toLocaleDateString('pt-BR', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                          })
                          .toUpperCase()}
                      </h4>
                      <p className="text-white font-bold text-sm">
                        {getServiceName(nextApp.serviceId)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="block text-gray-500 text-[10px] font-mono mb-0.5">
                        {nextApp.time}
                      </span>
                      <span className="block text-white font-mono font-bold text-xs">
                        R$ {nextApp.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-6 border border-dashed border-gray-800 rounded-xl">
                  <p className="text-gray-600 text-xs font-medium uppercase tracking-wider">
                    Nenhum agendamento futuro
                  </p>
                </div>
              )}
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
