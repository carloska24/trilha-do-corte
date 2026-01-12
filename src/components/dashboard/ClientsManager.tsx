import React, { useState } from 'react';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import { Search, User, ChevronRight, Plus, X, Save, MessageCircle, Trash2 } from 'lucide-react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Client } from '../../types';
import { generateId } from '../../utils';
import { useData } from '../../contexts/DataContext';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../services/api';
import { InviteClientModal } from './InviteClientModal';
import { WhatsAppLogo } from '../icons/WhatsAppLogo';

interface DashboardOutletContext {
  setSelectedClient: (client: Client) => void;
}

const ClientCard: React.FC<{
  client: Client;
  onSelect: (c: Client) => void;
  onDelete: (id: string) => void;
  onInvite: (c: Client) => void;
}> = ({ client, onSelect, onDelete, onInvite }) => {
  const controls = useAnimation();

  // Logic from original map
  let ringColor = 'border-green-500';
  let ringShadow = 'shadow-[0_0_10px_rgba(34,197,94,0.3)]';
  let badgeColor = 'text-green-400 border-green-500/30 bg-green-950/30';

  if ((client.level || 1) >= 5) {
    ringColor = 'border-yellow-400';
    ringShadow = 'shadow-[0_0_15px_rgba(250,204,21,0.4)]';
    badgeColor = 'text-yellow-400 border-yellow-500/30 bg-yellow-950/30';
  } else if ((client.level || 1) >= 3) {
    ringColor = 'border-cyan-400';
    ringShadow = 'shadow-[0_0_12px_rgba(34,211,238,0.4)]';
    badgeColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-950/30';
  }
  let statusColor = 'bg-green-500 shadow-[0_0_8px_#22c55e]';

  if (client.lastVisit === 'Nunca' || !client.lastVisit) {
    statusColor = 'bg-green-500 shadow-[0_0_8px_#22c55e]';
  } else if (client.lastVisit === 'Hoje' || client.lastVisit === 'Ontem') {
    statusColor = 'bg-green-500 shadow-[0_0_8px_#22c55e]';
  } else {
    try {
      const parts = client.lastVisit.split('/');
      if (parts.length === 3) {
        const visitDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const diffDays = Math.ceil(
          Math.abs(new Date().getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays > 60) statusColor = 'bg-red-500 shadow-[0_0_8px_#ef4444]';
        else if (diffDays > 30) statusColor = 'bg-yellow-500 shadow-[0_0_8px_#eab308]';
      }
    } catch (e) {}
  }
  const handleDragEnd = async (_: any, info: PanInfo) => {
    if (info.offset.x < -100) {
      onDelete(client.id);
      controls.start({ x: 0 });
    } else {
      controls.start({ x: 0 });
    }
  };

  // Check if needs formalization (Guest, AI-created, or missing phone/email)
  const isTemp =
    client.status === 'new' ||
    client.status === 'guest' ||
    !client.email || // Active clients without email are incomplete (booked via landing/voice)
    !client.phone ||
    client.phone === '00000000000' ||
    client.phone.replace(/\D/g, '').length < 8;

  return (
    <div className="relative mb-2 group touch-pan-y">
      {/* Background Layer (Delete) */}
      <div className="absolute inset-x-[2px] inset-y-[2px] bg-red-500/10 rounded-2xl flex items-center justify-end pr-6 z-0">
        <Trash2 className="text-red-500" size={24} strokeWidth={2.5} />
      </div>

      {/* Foreground Layer (Card) */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-color)] p-3 rounded-2xl z-10 shadow-lg flex items-center gap-3 cursor-pointer active:cursor-grabbing transition-colors duration-300"
        onClick={() => onSelect(client)}
        style={{ touchAction: 'pan-y' }}
      >
        {/* AVATAR */}
        <div className="relative flex-shrink-0">
          <div className={`w-16 h-16 rounded-full p-[3px] border-2 ${ringColor} ${ringShadow}`}>
            <div className="w-full h-full rounded-full overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)] relative">
              {client.img ? (
                <img
                  src={getOptimizedImageUrl(client.img, 100, 100)}
                  alt={client.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">
                  <User size={24} />
                </div>
              )}
            </div>
          </div>
          <div
            className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[var(--bg-card)] ${
              isTemp ? 'bg-neon-yellow animate-pulse' : statusColor
            } z-20`}
          ></div>
        </div>

        {/* DATA */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-xl font-black text-[var(--text-primary)] leading-none uppercase tracking-wide truncate group-hover:text-neon-yellow transition-colors">
              {client.name}
            </h3>
            {isTemp && (
              <span className="px-1.5 py-0.5 rounded bg-neon-yellow/20 text-neon-yellow text-[8px] font-bold uppercase tracking-wider border border-neon-yellow/30">
                PROVISÓRIO
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className={`flex items-center px-1.5 py-[2px] rounded border ${badgeColor}`}>
              <span className="text-[10px] font-black font-mono tracking-widest leading-none">
                LVL {client.level || 1}
              </span>
            </div>
            <div className="w-[1px] h-3 bg-[var(--border-color)]"></div>
          </div>
        </div>

        {/* ACTIONS (Formalize) */}
        <div className="flex items-center gap-2">
          {isTemp && (
            <button
              onClick={e => {
                e.stopPropagation();
                onInvite(client);
              }}
              className="w-10 h-10 flex items-center justify-center transition-all active:scale-95 group/btn"
            >
              <WhatsAppLogo size={24} className="group-hover/btn:scale-110 transition-transform" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

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
      status: 'active' as const, // Manual creation = Active/Official
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
    // STRICT FILTER RELAXED: User wants to see temporary clients to send invites
    // We only filter out truly broken/empty records now.

    // const isGuest = ... (OLD LOGIC REMOVED)

    const isInvalid =
      !client.name || client.name.trim() === '' || client.name.toLowerCase().includes('undefined');

    // Show everyone else, even if phone is missing (so we can see them and add phone/invite)

    return matchesSearch && !isInvalid;

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

  // --- DELETE MODAL STATE ---
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Invite Modal State
  const [clientToInvite, setClientToInvite] = useState<Client | null>(null);

  const handleDeleteClient = (id: string) => {
    setClientToDelete(id);
  };

  const handleInviteClient = (client: Client) => {
    setClientToInvite(client);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    const id = clientToDelete;

    // Optimistic Update
    const updatedClients = clients.filter(c => c.id !== id);
    updateClients(updatedClients);
    setClientToDelete(null);

    // API Call
    try {
      const success = await api.deleteClient(id);
      if (!success) console.error('Failed to delete on server');
    } catch (e) {
      console.error('Delete error', e);
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-4 pb-32 animate-fade-in relative z-10">
      {/* INVITE MODAL */}
      {clientToInvite && (
        <InviteClientModal
          isOpen={true}
          onClose={() => setClientToInvite(null)}
          client={clientToInvite}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {clientToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-red-500/30 w-full max-w-sm rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)] relative text-center transition-colors duration-300">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <Trash2 size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-graffiti text-[var(--text-primary)] mb-2 uppercase">
              Excluir Cliente?
            </h2>
            <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed">
              Essa ação removerá permanentemente o cadastro.
              <br />
              <span className="text-red-400 font-bold">Isso não pode ser desfeito.</span>
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-red-500/20 active:scale-95"
              >
                Confirmar Exclusão
              </button>
              <button
                onClick={() => setClientToDelete(null)}
                className="w-full py-3.5 bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] font-bold uppercase tracking-widest rounded-xl hover:bg-[var(--bg-secondary)] transition-all active:scale-95 hover:text-[var(--text-primary)]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header Section */}
      <div className="mb-8 mt-2 flex-shrink-0">
        <h1 className="text-4xl font-graffiti text-[var(--text-primary)] leading-none drop-shadow-sm mb-2 transition-colors">
          CLIENTES
        </h1>
        <div className="w-24 h-1 bg-neon-yellow rounded-full shadow-[0_0_10px_rgba(227,253,0,0.5)]"></div>
        <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-[0.4em] mt-3">
          Base de Clientes
        </p>
      </div>

      {/* Search Bar (HUD Scanner Style) */}
      <div className="relative mb-8 group flex-shrink-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 w-1 bg-neon-yellow/50 rounded-l-md group-focus-within:bg-neon-yellow group-focus-within:shadow-[0_0_15px_#EAB308] transition-all duration-300"></div>
          <input
            type="text"
            placeholder="SCANNEAR CLIENTE..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 py-5 pl-12 pr-4 text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-neon-yellow/50 focus:bg-[var(--bg-secondary)] transition-all shadow-inner"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 98% 100%, 0 100%)' }}
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-neon-yellow transition-colors"
            size={18}
          />
          {/* Tech Decorations */}
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-neon-yellow/30"></div>
          <div className="absolute bottom-0 right-8 w-8 h-[2px] bg-[var(--border-color)]"></div>
        </div>
      </div>

      {/* Client List (Holographic Cards) */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
        <div className="flex flex-col gap-4 pb-20">
          {filteredClients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onSelect={onSelectClient}
              onDelete={handleDeleteClient}
              onInvite={handleInviteClient}
            />
          ))}

          {/* Empty State */}
          {filteredClients.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-20 opacity-50">
              <User size={64} className="text-[var(--text-secondary)] mb-4" />
              <p className="text-[var(--text-secondary)] font-graffiti text-xl text-center">
                BANCO DE DADOS VAZIO
                <br />
                <span className="text-sm font-sans font-normal opacity-50">
                  Nenhum cliente encontrado no sistema.
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
          <div className="bg-[var(--bg-card)] w-full max-w-md p-8 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative border border-[var(--border-color)] transition-colors duration-300">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-graffiti text-[var(--text-primary)] mb-1">NOVO CLIENTE</h2>
            <div className="w-16 h-1 bg-neon-yellow rounded-full mb-8 shadow-[0_0_10px_rgba(227,253,0,0.5)]"></div>

            <div className="space-y-6">
              <div className="group">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] block mb-2 group-focus-within:text-neon-yellow transition-colors">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  value={newClientData.name}
                  onChange={e => setNewClientData({ ...newClientData, name: e.target.value })}
                  className="w-full bg-[var(--bg-secondary)] border-b-2 border-[var(--border-color)] text-[var(--text-primary)] py-3 text-lg font-bold focus:outline-none focus:border-neon-yellow transition-colors placeholder-[var(--text-secondary)]/50"
                  placeholder="DIGITE O NOME..."
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] block mb-2 group-focus-within:text-neon-yellow transition-colors">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={newClientData.phone}
                  onChange={e => setNewClientData({ ...newClientData, phone: e.target.value })}
                  className="w-full bg-[var(--bg-secondary)] border-b-2 border-[var(--border-color)] text-[var(--text-primary)] py-3 text-lg font-bold focus:outline-none focus:border-neon-yellow transition-colors placeholder-[var(--text-secondary)]/50"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] block mb-2 group-focus-within:text-neon-yellow transition-colors">
                  Notas Iniciais
                </label>
                <textarea
                  value={newClientData.notes}
                  onChange={e => setNewClientData({ ...newClientData, notes: e.target.value })}
                  className="w-full bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] rounded-lg p-4 text-[var(--text-primary)] focus:outline-none focus:border-neon-yellow transition-colors h-24 resize-none text-sm font-medium placeholder-[var(--text-secondary)]/50"
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
