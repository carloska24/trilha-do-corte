import React, { useState } from 'react';
import { Search, User, ChevronRight, Plus, X, Save, MessageCircle } from 'lucide-react';
import { Client } from '../../types';
import { generateId } from '../../utils';
import { useData } from '../../contexts/DataContext';
import { useOutletContext } from 'react-router-dom';

import { api } from '../../services/api';

interface DashboardOutletContext {
  setSelectedClient: (client: Client) => void;
}

export const ClientsManager: React.FC = () => {
  const { clients, updateClients } = useData();
  const { setSelectedClient } = useOutletContext<DashboardOutletContext>();

  const onSelectClient = setSelectedClient;
  const onAddClient = (client: Client) => updateClients([...clients, client]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    phone: '',
    notes: '',
  });

  const handleSaveNewClient = async () => {
    if (!newClientData.name || !newClientData.phone) {
      alert('Nome e Telefone são obrigatórios!');
      return;
    }

    const tempId = generateId();
    const newClientPayload = {
      name: newClientData.name,
      phone: newClientData.phone,
      level: 1,
      lastVisit: 'Nunca',
      img: null,
      status: 'new' as const,
      notes: newClientData.notes,
    };

    // Optimistic UI Update
    const optimisticClient = { ...newClientPayload, id: tempId };
    onAddClient(optimisticClient);
    setIsAddModalOpen(false);
    setNewClientData({ name: '', phone: '', notes: '' });

    // Backend Call
    try {
      const created = await api.createClient(newClientPayload);
      if (created) {
        // Replace temp ID with real ID in context (if needed)
        // For simple arrays, we might just reload or update the item
        // But for now, ensuring it creates on backend is the priority
        // Ideally we update the specific item in state with the real ID
        const updated = clients.map(c => (c.id === tempId ? created : c));
        if (clients.find(c => c.id === tempId)) {
          updateClients([...clients.filter(c => c.id !== tempId), created]);
        }
      }
    } catch (error) {
      console.error('Failed to create client:', error);
      alert('Erro ao salvar cliente no servidor. Verifique sua conexão.');
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());

    // STRICT FILTER: Exclude Guest/Temporary clients only
    // Real clients (like CARLOS A) might have 'UNDEFINED' lastVisit but valid phones
    const isGuest =
      (client as any).isGuest ||
      String(client.id).startsWith('temp') ||
      !client.phone ||
      client.phone.toLowerCase().trim() === 'sem cadastro' ||
      client.phone.trim() === '' ||
      client.phone.toLowerCase().trim() === 'undefined' ||
      client.phone.replace(/\D/g, '').length < 8 || // Filter out short/placeholder phones
      /^0+$/.test(client.phone.replace(/\D/g, '')) || // Filter out '000000', '00000000000'
      (client.notes && client.notes.includes('Agendamento rápido'));

    // Debug log to help diagnose persistent ghost clients if needed
    // console.log('Client:', client.name, 'Phone:', client.phone, 'Guest:', isGuest);

    return matchesSearch && !isGuest;
  });

  // --- UX HELPERS ---
  const getLevelStyle = (level: number) => {
    if (level >= 5) return 'border-neon-yellow shadow-[0_0_10px_rgba(234,179,8,0.3)]'; // VIP Gold
    if (level >= 3) return 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]'; // Regular Blue
    return 'border-green-500/50'; // Newbie Green
  };

  const getRecurrenceStatus = (lastVisit: string | null | undefined) => {
    if (!lastVisit || lastVisit === 'Nunca') return { color: 'bg-green-500', label: 'Novo' };

    // Parse date (assuming DD/MM/YYYY)
    const [day, month, year] = lastVisit.split('/').map(Number);
    const visitDate = new Date(year, month - 1, day);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - visitDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 15) return { color: 'bg-green-500', label: 'Ativo' };
    if (diffDays <= 30) return { color: 'bg-yellow-500', label: 'Atenção' };
    return { color: 'bg-red-500', label: 'Risco' };
  };

  return (
    <div className="flex flex-col h-full w-full p-4 pb-32 animate-fade-in relative z-10">
      {/* Header Section */}
      <div className="mb-8 mt-2 flex-shrink-0">
        <h1 className="text-4xl font-graffiti text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-200 dark:to-gray-500 leading-none drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] mb-2 transition-all">
          CLIENTES
        </h1>
        <div className="w-24 h-1 bg-neon-yellow rounded-full shadow-[0_0_10px_rgba(227,253,0,0.5)]"></div>
        <p className="text-text-secondary text-[10px] font-bold uppercase tracking-[0.4em] mt-3">
          Base de Passageiros
        </p>
      </div>

      {/* Search Bar (HUD Scanner Style) */}
      <div className="relative mb-8 group flex-shrink-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 w-1 bg-neon-yellow/50 rounded-l-md group-focus-within:bg-neon-yellow group-focus-within:shadow-[0_0_15px_#EAB308] transition-all duration-300"></div>
          <input
            type="text"
            placeholder="SCANNEAR PASSAGEIRO..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 backdrop-blur-md border border-gray-800 text-white placeholder-gray-500/50 py-5 pl-12 pr-4 text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-neon-yellow/50 focus:bg-black/60 transition-all shadow-inner"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 98% 100%, 0 100%)' }}
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-neon-yellow transition-colors"
            size={18}
          />
          {/* Tech Decorations */}
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-neon-yellow/30"></div>
          <div className="absolute bottom-0 right-8 w-8 h-[2px] bg-gray-800"></div>
        </div>
      </div>

      {/* Client List (Holographic Cards) */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
        <div className="flex flex-col gap-4 pb-20">
          {filteredClients.map(client => {
            // 1. LOGIC: LEVEL RINGS (Loyalty)
            // Lvl 1-2: Green (Iniciante)
            // Lvl 3-4: Cyan (Regular)
            // Lvl 5+: Gold (VIP)
            let ringColor = 'border-green-500';
            let ringShadow = 'shadow-[0_0_10px_rgba(34,197,94,0.3)]';
            let badgeColor = 'text-green-400 border-green-500/30 bg-green-950/30';

            if (client.level >= 5) {
              ringColor = 'border-yellow-400';
              ringShadow = 'shadow-[0_0_15px_rgba(250,204,21,0.4)]';
              badgeColor = 'text-yellow-400 border-yellow-500/30 bg-yellow-950/30';
            } else if (client.level >= 3) {
              ringColor = 'border-cyan-400';
              ringShadow = 'shadow-[0_0_12px_rgba(34,211,238,0.4)]';
              badgeColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-950/30';
            }

            // 2. LOGIC: STATUS DOTS (Retention / Risk)
            // New/Today/<30 days: Green (Safe)
            // 30-60 days: Yellow (Warning)
            // >60 days: Red (Churned/Risk)
            let statusColor = 'bg-green-500 shadow-[0_0_8px_#22c55e]';
            let statusLabel = 'ATIVO';

            if (client.lastVisit === 'Nunca') {
              statusColor = 'bg-green-500 shadow-[0_0_8px_#22c55e]'; // New is Good
              statusLabel = 'NOVO';
            } else if (client.lastVisit === 'Hoje' || client.lastVisit === 'Ontem') {
              statusColor = 'bg-green-500 shadow-[0_0_8px_#22c55e]';
              statusLabel = 'ATIVO';
            } else {
              // Parse DD/MM/YYYY
              try {
                const parts = client.lastVisit.split('/');
                if (parts.length === 3) {
                  const visitDate = new Date(
                    parseInt(parts[2]),
                    parseInt(parts[1]) - 1,
                    parseInt(parts[0])
                  );
                  const now = new Date();
                  const diffTime = Math.abs(now.getTime() - visitDate.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  if (diffDays > 60) {
                    statusColor = 'bg-red-500 shadow-[0_0_8px_#ef4444]';
                    statusLabel = 'RISCO';
                  } else if (diffDays > 30) {
                    statusColor = 'bg-yellow-500 shadow-[0_0_8px_#eab308]';
                    statusLabel = 'ATENÇÃO';
                  }
                }
              } catch (e) {
                // Fallback
              }
            }

            return (
              <div
                key={client.id}
                className="group relative bg-[#0a0a0a]/90 backdrop-blur-md border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-all duration-300 flex-shrink-0 shadow-lg"
              >
                <div
                  className="relative flex items-center gap-4 z-10 w-full cursor-pointer"
                  onClick={() => onSelectClient(client)}
                >
                  {/* AVATAR + RING + DOT */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-16 h-16 rounded-full p-[3px] border-2 ${ringColor} ${ringShadow} transition-all`}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 border border-black relative">
                        {client.img ? (
                          <img
                            src={client.img}
                            alt={client.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <User size={24} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Dot (Bottom Right) */}
                    <div
                      className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#0a0a0a] ${statusColor} z-20`}
                    ></div>
                  </div>

                  {/* TEXT INFO */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-xl font-black text-white leading-none mb-1.5 uppercase tracking-wide truncate group-hover:text-neon-yellow transition-colors">
                      {client.name}
                    </h3>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* LEVEL BADGE */}
                      <div
                        className={`flex items-center px-1.5 py-[2px] rounded border ${badgeColor}`}
                      >
                        <span className="text-[10px] font-black font-mono tracking-widest leading-none">
                          LVL {client.level || 1}
                        </span>
                      </div>

                      {/* SEPARATOR */}
                      <div className="w-[1px] h-3 bg-zinc-700"></div>

                      {/* VISIT TEXT */}
                      <div className="flex flex-col leading-none">
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">
                          {!client.lastVisit ||
                          client.lastVisit === 'Nunca' ||
                          String(client.lastVisit).toLowerCase() === 'undefined'
                            ? 'NOVO CLIENTE'
                            : `VISITOU: ${client.lastVisit}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS GROUP */}
                  <div className="flex items-center gap-2">
                    {/* Invite Button (Only if phone exists and is likely mobile) */}
                    {client.phone && client.phone.length > 8 && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          // Generate Invite Link
                          const baseUrl = window.location.origin;
                          const inviteLink = `${baseUrl}/login?type=client&name=${encodeURIComponent(
                            client.name
                          )}&phone=${encodeURIComponent(client.phone)}`;
                          const EMOJI = {
                            BARBER: '\uD83D\uDC88',
                            USER: '\uD83D\uDC64',
                          };
                          const msg =
                            `${EMOJI.BARBER} TRILHA DO CORTE\n\n` +
                            `${EMOJI.USER} Passageiro: ${client.name}\n\n` +
                            `Finalize seu cadastro no App para agendar seus horarios online:\n` +
                            `${inviteLink}`;

                          const params = new URLSearchParams();
                          params.append('text', msg);

                          // Open WhatsApp
                          const cleanPhone = client.phone.replace(/\D/g, '');
                          const waUrl = `https://wa.me/55${cleanPhone}?${params.toString()}`;
                          window.open(waUrl, '_blank');
                        }}
                        className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-black transition-all"
                        title="Enviar Convite"
                      >
                        <MessageCircle size={16} />
                      </button>
                    )}

                    {/* ARROW ICON */}
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-500 group-hover:bg-neon-yellow group-hover:text-black transition-all">
                      <ChevronRight size={18} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {filteredClients.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-20 opacity-50">
              <User size={64} className="text-zinc-800 mb-4" />
              <p className="text-zinc-600 font-graffiti text-xl text-center">
                BANCO DE DADOS VAZIO
                <br />
                <span className="text-sm font-sans font-normal opacity-50">
                  Nenhum passageiro encontrado no sistema.
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Button (Neon Pulse) */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 left-6 w-16 h-16 bg-neon-yellow rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(227,253,0,0.4)] hover:shadow-[0_0_50px_rgba(227,253,0,0.6)] hover:scale-110 transition-all z-40 text-black animate-pulse-slow group"
      >
        <Plus
          size={32}
          strokeWidth={3}
          className="group-hover:rotate-90 transition-transform duration-300"
        />
      </button>

      {/* MODAL ADICIONAR CLIENTE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-zinc-950 w-full max-w-md p-8 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative border border-white/10 transition-colors">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-graffiti text-white mb-1">NOVO PASSAGEIRO</h2>
            <div className="w-16 h-1 bg-neon-yellow rounded-full mb-8 shadow-[0_0_10px_rgba(227,253,0,0.5)]"></div>

            <div className="space-y-6">
              <div className="group">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2 group-focus-within:text-neon-yellow transition-colors">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  value={newClientData.name}
                  onChange={e => setNewClientData({ ...newClientData, name: e.target.value })}
                  className="w-full bg-black border-b-2 border-zinc-800 text-white py-3 text-lg font-bold focus:outline-none focus:border-neon-yellow transition-colors placeholder-zinc-700"
                  placeholder="DIGITE O NOME..."
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2 group-focus-within:text-neon-yellow transition-colors">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={newClientData.phone}
                  onChange={e => setNewClientData({ ...newClientData, phone: e.target.value })}
                  className="w-full bg-black border-b-2 border-zinc-800 text-white py-3 text-lg font-bold focus:outline-none focus:border-neon-yellow transition-colors placeholder-zinc-700"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2 group-focus-within:text-neon-yellow transition-colors">
                  Notas Iniciais
                </label>
                <textarea
                  value={newClientData.notes}
                  onChange={e => setNewClientData({ ...newClientData, notes: e.target.value })}
                  className="w-full bg-black border-2 border-zinc-800 rounded-lg p-4 text-white focus:outline-none focus:border-neon-yellow transition-colors h-24 resize-none text-sm font-medium placeholder-zinc-700"
                  placeholder="Preferências de corte, estilo, etc..."
                />
              </div>

              <button
                onClick={handleSaveNewClient}
                className="w-full bg-neon-yellow hover:brightness-110 text-black font-black text-lg py-4 rounded-lg transition-all flex justify-center items-center gap-3 mt-4 shadow-[0_0_20px_rgba(227,253,0,0.2)] hover:shadow-[0_0_30px_rgba(227,253,0,0.4)] uppercase tracking-widest"
              >
                <Save size={20} /> Cadastrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
