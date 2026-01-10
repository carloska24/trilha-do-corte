import React, { useState } from 'react';
import {
  X,
  Edit,
  Calendar,
  Phone,
  Star,
  MessageSquare,
  History,
  ChevronDown,
  ChevronUp,
  Clock,
  Scissors,
  MapPin,
  Link,
} from 'lucide-react';
import { Client, Appointment, Service } from '../types';
import { generateWhatsAppLink } from '../../utils/whatsappUtils';

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
  appointments = [],
  services = [],
}) => {
  if (!client) return null;

  /* State for Notes & History */
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(client.notes || '');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Check if needs formalization
  const isTemp =
    client.status === 'new' ||
    client.status === 'guest' ||
    !client.email ||
    !client.phone ||
    client.phone === '00000000000' ||
    client.phone.replace(/\D/g, '').length < 8;

  /* --- ACTIONS --- */
  const handleWhatsApp = () => {
    const phone = client.phone?.replace(/\D/g, '') || '';

    if (isTemp) {
      // Formalization Flow
      const magicLink = `${window.location.origin}/login?action=register&name=${encodeURIComponent(
        client.name
      )}&phone=${encodeURIComponent(client.phone)}`;

      const message = `Olá ${client.name}! ✂️\n\nAqui é da Trilha do Corte. Seu pré-cadastro foi feito via IA.\n\nClique no link abaixo para finalizar seu cadastro e ter acesso exclusivo aos horários:\n\n${magicLink}`;

      const link = generateWhatsAppLink(phone.length >= 10 ? client.phone : '', message);
      window.open(link, '_blank');
    } else {
      // Standard Greeting
      const msg = `Ola, ${client.name}! \uD83D\uDC88\n\nTudo bem?`;
      const whatsappUrl = `https://api.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent(
        msg
      )}`;
      window.open(whatsappUrl, '_blank');
    }
  };
  const handleSaveNotes = () => {
    setIsEditingNotes(false);
    // API call placeholder
  };

  /* --- HELPERS --- */
  const getServiceName = (id: string | undefined) => {
    if (!id) return 'Serviço Personalizado';
    const s = services.find(serv => serv.id === id);
    return s ? s.name : 'ServiÃ§o Personalizado';
  };

  // FIX: Parse date safely as local time (YYYY-MM-DD -> Year, Month, Day)
  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // Month is 0-indexed
  };

  const formatAppDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    return date
      .toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      })
      .toUpperCase();
  };

  /* --- DATA LOGIC --- */
  // 1. Filter Client Appointments
  const clientApps = appointments.filter(
    app => app.clientName.toLowerCase() === client.name.toLowerCase()
  );

  // 2. Identify Status
  const now = new Date();
  // Helper to compare dates strictly
  const isFuture = (app: Appointment) => {
    const appDate = parseLocalDate(app.date);
    // If today, check time? For simplicity, we compare dates only strictly or use logic
    // But simplistic check:
    const appDateTime = new Date(`${app.date}T${app.time}:00`);
    return appDateTime >= now;
  };

  const completedApps = clientApps.filter(a => a.status === 'completed');
  const cancelledApps = clientApps.filter(a => a.status === 'cancelled');
  const futureApps = clientApps
    .filter(a => a.status !== 'cancelled' && a.status !== 'completed' && isFuture(a))
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
    );

  const nextApp = futureApps[0]; // The immediate next one

  // 3. Stats & Tier Logic
  const totalVisits = clientApps.filter(a => a.status === 'completed').length;
  // Rating Logic: Starts at 0, +1.0 per visit, max 5.0
  const rating = Math.min(5, totalVisits).toFixed(1);

  // Helper for Tier
  const getTier = (visits: number) => {
    if (visits >= 10)
      return {
        name: 'PLATINUM',
        color: 'text-cyan-400',
        border: 'border-cyan-400/30',
        bg: 'bg-cyan-400/10',
      };
    if (visits >= 5)
      return {
        name: 'GOLD',
        color: 'text-yellow-500',
        border: 'border-yellow-500/30',
        bg: 'bg-yellow-500/10',
      };
    return {
      name: 'SILVER',
      color: 'text-zinc-400',
      border: 'border-zinc-500/30',
      bg: 'bg-white/5',
    }; // Darker Silver
  };

  const tier = getTier(totalVisits);

  // Helper for Ticket Date Layout
  const getDateParts = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date
      .toLocaleDateString('pt-BR', { month: 'short' })
      .toUpperCase()
      .replace('.', '');
    const weekday = date
      .toLocaleDateString('pt-BR', { weekday: 'short' })
      .toUpperCase()
      .replace('.', '');
    return { day, month, weekday };
  };

  const nextAppParts = nextApp ? getDateParts(nextApp.date) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
      {/* MAIN CARD CONTAINER */}
      <div className="w-full max-w-sm bg-[#09090b] rounded-[32px] border border-white/5 shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[85vh]">
        {/* --- HEADER --- */}
        <div className="relative pt-6 pb-4 px-6 bg-linear-to-b from-[#18181b] to-[#09090b] text-center border-b border-white/5 shrink-0">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full backdrop-blur-md z-50"
          >
            <X size={16} />
          </button>

          {/* Avatar Area (Compacted) */}
          <div className="relative inline-block mb-2">
            <div
              className={`absolute inset-0 blur-2xl rounded-full opacity-40 ${tier.bg.replace(
                '/10',
                '/30'
              )}`}
            ></div>
            <div className="relative w-20 h-20 rounded-full p-[2px] bg-linear-to-b from-white/10 to-white/5 border border-black/50 shadow-xl">
              <img
                src={
                  client.img ||
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
                }
                alt={client.name}
                className="w-full h-full rounded-full object-cover border-2 border-[#09090b]"
              />
            </div>
          </div>

          {/* Name & Tier Row */}
          <div className="flex flex-col items-center justify-center mb-3">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-wider leading-none mb-2">
              {client.name}
            </h2>

            <div className="flex items-center gap-2">
              {/* Tier Badge */}
              <div
                className={`px-2 py-0.5 rounded border ${tier.border} ${tier.bg} flex items-center gap-1.5`}
              >
                <Star size={10} className={tier.color} fill="currentColor" />
                <span className={`text-[9px] font-black uppercase tracking-widest ${tier.color}`}>
                  {tier.name}
                </span>
              </div>

              {/* ID Badge / Status Badge */}
              {client.status === 'new' ? (
                <span className="text-[10px] font-bold text-black tracking-widest bg-neon-yellow px-2 py-0.5 rounded shadow-[0_0_10px_rgba(234,179,8,0.4)] animate-pulse">
                  NOVO
                </span>
              ) : client.isGuest ? (
                <span className="text-[10px] font-bold text-white tracking-widest bg-purple-600 px-2 py-0.5 rounded bg-opacity-80">
                  VISITANTE
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold text-zinc-600 tracking-widest px-2 py-0.5 rounded">
                  #{String(client.id || '0000').slice(-4)}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons Grid (Compact) */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${client.phone}`}
              className="group flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
            >
              <Phone size={16} className="text-zinc-400 group-hover:text-white transition-colors" />
              <span className="text-xs font-bold text-zinc-300 group-hover:text-white uppercase tracking-wider">
                Ligar
              </span>
            </a>
            {/* WHATSAPP / FORMALIZE BUTTON */}
            <button
              onClick={handleWhatsApp}
              className="group flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-green-500/10 border border-white/5 hover:border-green-500/30 transition-all"
            >
              <svg
                viewBox="0 0 512 512"
                className="w-4 h-4 text-zinc-400 group-hover:text-green-500 transition-colors fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="m317.12 285.93c-9.69 3.96-15.88 19.13-22.16 26.88-3.22 3.97-7.06 4.59-12.01 2.6-36.37-14.49-64.25-38.76-84.32-72.23-3.4-5.19-2.79-9.29 1.31-14.11 6.06-7.14 13.68-15.25 15.32-24.87 3.64-21.28-24.18-87.29-60.92-57.38-105.72 86.15 176.36 314.64 227.27 191.06 14.4-35.03-48.43-58.53-64.49-51.95zm-61.12 181.35c-37.39 0-74.18-9.94-106.39-28.76-5.17-3.03-11.42-3.83-17.2-2.26l-69.99 19.21 24.38-53.71c3.32-7.31 2.47-15.82-2.22-22.32-26.08-36.15-39.87-78.83-39.87-123.44 0-116.51 94.78-211.29 211.29-211.29s211.28 94.78 211.28 211.29c0 116.5-94.78 211.28-211.28 211.28zm0-467.28c-141.16 0-256 114.84-256 256 0 49.66 14.1 97.35 40.89 138.74l-38.89 85.65c-3.59 7.91-2.28 17.17 3.34 23.76 4.32 5.05 10.57 7.85 17.02 7.85 14.42 0 93.05-24.71 113.06-30.2 36.99 19.79 78.48 30.2 120.58 30.2 141.15 0 256-114.85 256-256 0-141.16-114.85-256-256-256z" />
              </svg>
              <span className="text-xs font-bold text-zinc-300 group-hover:text-green-500 uppercase tracking-wider">
                WhatsApp
              </span>
            </button>
          </div>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar bg-[#09090b]">
          {/* METRICS ROW */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`bg-[#121214] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group ${tier.border} border-opacity-20`}
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Star size={32} className={`${tier.color}`} />
              </div>
              <span className={`text-2xl font-black mb-1 ${tier.color}`}>{rating}</span>
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                Rating
              </span>
            </div>
            <div className="bg-[#121214] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <History size={32} />
              </div>
              <span className="text-2xl font-black text-white mb-1">{totalVisits}</span>
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                Visitas
              </span>
            </div>
          </div>

          {/* NEXT APPOINTMENT (PREMIUM TICKET STYLE - CAROUSEL) */}
          <div>
            <div className="flex items-center gap-2 mb-3 opacity-60">
              <Clock size={12} className="text-white" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                {futureApps.length > 1 ? 'Próximas Viagens' : 'Próxima Viagem'}
              </span>
            </div>

            {futureApps.length > 0 ? (
              <div className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory no-scrollbar">
                {futureApps.map((app, idx) => {
                  const parts = getDateParts(app.date);
                  return (
                    <div
                      key={app.id || idx}
                      className="min-w-full snap-center bg-[#121214] border border-white/5 rounded-2xl overflow-hidden flex group hover:border-white/10 transition-colors shadow-lg"
                    >
                      {/* Left: Date Box */}
                      <div className="w-24 bg-[#18181b] flex flex-col items-center justify-center border-r border-white/5 p-2 gap-0.5">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          {parts.weekday}
                        </span>
                        <span className="text-4xl font-black text-white tracking-tighter leading-none my-1">
                          {parts.day}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                          {parts.month}
                        </span>
                      </div>

                      {/* Right: Details */}
                      <div className="flex-1 p-5 flex flex-col justify-center relative">
                        {/* Top: Service */}
                        <div className="flex-1 flex items-center">
                          <span className="text-sm font-black text-white uppercase tracking-wide leading-tight line-clamp-2">
                            {getServiceName(app.serviceId)}
                          </span>
                        </div>

                        {/* Bottom: Meta */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 text-zinc-500 bg-white/5 px-3 py-1.5 rounded-lg">
                            <Clock size={14} className="text-zinc-400" />
                            <span className="text-sm font-bold font-mono text-zinc-300">
                              {app.time}
                            </span>
                          </div>

                          <span className="text-lg font-black text-white">R$ {app.price}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-dashed border-zinc-800 rounded-2xl p-6 text-center">
                <p className="text-xs text-zinc-600 font-medium uppercase tracking-wider">
                  Nenhum agendamento futuro
                </p>
              </div>
            )}
          </div>

          {/* HISTORY (COLLAPSIBLE) */}
          <div className="border-t border-white/5 pt-2">
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="w-full flex justify-between items-center py-4 group hover:bg-white/5 px-2 -mx-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2 text-zinc-400 group-hover:text-white transition-colors">
                <History size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Histórico de Cortes
                </span>
              </div>
              {isHistoryOpen ? (
                <ChevronUp size={14} className="text-zinc-600" />
              ) : (
                <ChevronDown size={14} className="text-zinc-600" />
              )}
            </button>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isHistoryOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="pl-4 border-l border-white/10 ml-2 space-y-4 py-2">
                {completedApps.length === 0 ? (
                  <p className="text-[10px] text-zinc-600 italic">Nenhum corte finalizado.</p>
                ) : (
                  completedApps
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((app, idx) => (
                      <div key={idx} className="relative flex justify-between items-baseline group">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#09090b] border border-zinc-700 group-hover:border-yellow-500 group-hover:bg-yellow-500/20 transition-colors"></div>

                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
                            {formatAppDate(app.date)}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {getServiceName(app.serviceId)}
                          </span>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-mono text-zinc-500">
                            R$ {app.price}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* NOTES AREA */}
          <div className="pb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Notas
              </span>
              <button
                onClick={() => (isEditingNotes ? handleSaveNotes() : setIsEditingNotes(true))}
                className="text-zinc-600 hover:text-white transition-colors"
              >
                <Edit size={12} />
              </button>
            </div>
            <div
              className={`bg-[#121214] border ${
                isEditingNotes ? 'border-yellow-500/50' : 'border-zinc-900'
              } rounded-xl p-3 min-h-[80px] transition-all`}
            >
              {isEditingNotes ? (
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full h-full bg-transparent text-xs text-zinc-300 focus:outline-none resize-none"
                  placeholder="Adicione uma observaÃ§Ã£o..."
                  autoFocus
                />
              ) : (
                <p className="text-xs text-zinc-400 italic leading-relaxed">
                  "{notes || 'Sem observaÃ§Ãµes.'}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
