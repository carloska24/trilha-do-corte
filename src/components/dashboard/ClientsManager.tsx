import React, { useState, useMemo } from 'react';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import {
  Search,
  User,
  ChevronRight,
  Plus,
  X,
  Save,
  Trash2,
  Flame,
  Crown,
  Zap,
  Star,
  Clock,
} from 'lucide-react';
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

// =============================================================================
// 🔥 PREMIUM CLIENT CARD - The Best UI Architecture
// =============================================================================

interface ClientCardProps {
  client: Client;
  onSelect: (c: Client) => void;
  onDelete: (id: string) => void;
  onInvite: (c: Client) => void;
  appointmentsThisMonth?: number; // NEW: For "HOT" client detection
}

const ClientCard: React.FC<ClientCardProps> = ({
  client,
  onSelect,
  onDelete,
  onInvite,
  appointmentsThisMonth = 0,
}) => {
  const controls = useAnimation();

  // ========== TIER LOGIC ==========
  const level = client.level || 1;

  // Determine tier based on level
  type Tier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  const getTier = (): Tier => {
    if (level >= 8) return 'PLATINUM';
    if (level >= 5) return 'GOLD';
    if (level >= 3) return 'SILVER';
    return 'BRONZE';
  };
  const tier = getTier();

  // 🔥 HOT CLIENT: 3+ appointments this month
  const isHotClient = appointmentsThisMonth >= 3;

  // Tier Styles
  const TIER_STYLES = {
    BRONZE: {
      ring: 'border-green-500',
      glow: 'shadow-[0_0_15px_rgba(34,197,94,0.4)]',
      badge: 'from-green-600 to-green-800 text-green-100',
      icon: 'text-green-400',
      name: 'BRONZE',
    },
    SILVER: {
      ring: 'border-cyan-400',
      glow: 'shadow-[0_0_20px_rgba(34,211,238,0.5)]',
      badge: 'from-cyan-500 to-blue-600 text-cyan-100',
      icon: 'text-cyan-400',
      name: 'SILVER',
    },
    GOLD: {
      ring: 'border-yellow-400',
      glow: 'shadow-[0_0_25px_rgba(250,204,21,0.5)]',
      badge: 'from-yellow-500 to-orange-500 text-yellow-100',
      icon: 'text-yellow-400',
      name: 'GOLD',
    },
    PLATINUM: {
      ring: 'border-purple-400',
      glow: 'shadow-[0_0_30px_rgba(168,85,247,0.5)]',
      badge: 'from-purple-500 to-pink-500 text-purple-100',
      icon: 'text-purple-400',
      name: 'PLATINUM',
    },
  };
  const style = TIER_STYLES[tier];

  // ========== STATUS LOGIC ==========
  const getRecurrenceStatus = () => {
    if (!client.lastVisit || client.lastVisit === 'Nunca') {
      return { color: 'bg-blue-500', label: 'Novo', glow: 'shadow-[0_0_10px_#3b82f6]' };
    }

    try {
      const parts = client.lastVisit.split('/');
      if (parts.length === 3) {
        const visitDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const diffDays = Math.ceil(
          Math.abs(new Date().getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays > 60)
          return { color: 'bg-red-500', label: 'Risco', glow: 'shadow-[0_0_10px_#ef4444]' };
        if (diffDays > 30)
          return { color: 'bg-yellow-500', label: 'Atenção', glow: 'shadow-[0_0_10px_#eab308]' };
        return { color: 'bg-green-500', label: 'Ativo', glow: 'shadow-[0_0_10px_#22c55e]' };
      }
    } catch (e) {}
    return { color: 'bg-green-500', label: 'Ativo', glow: 'shadow-[0_0_10px_#22c55e]' };
  };
  const recurrence = getRecurrenceStatus();

  // ========== PROVISÓRIO (TEMP) CLIENT DETECTION ==========
  // Cliente é provisório se:
  // 1. Status 'new' ou 'guest'
  // 2. Não tem telefone válido (placeholder ou vazio)
  // 3. Não tem email (não completou cadastro com login/senha)
  // 4. Criado via IA de voz ou landing page sem finalização
  const isTemp =
    client.status === 'new' ||
    client.status === 'guest' ||
    client.isGuest === true ||
    !client.phone ||
    client.phone === '00000000000' ||
    client.phone.replace(/\D/g, '').length < 8 ||
    (client.notes && client.notes.toLowerCase().includes('criado via ia'));

  // ========== HANDLERS ==========
  const handleDragEnd = async (_: any, info: PanInfo) => {
    if (info.offset.x < -100) {
      onDelete(client.id);
      controls.start({ x: 0 });
    } else {
      controls.start({ x: 0 });
    }
  };

  // Format last visit
  const formatLastVisit = () => {
    if (!client.lastVisit || client.lastVisit === 'Nunca') return 'Primeira visita';
    return client.lastVisit;
  };

  return (
    <div className="relative mb-3 group touch-pan-y">
      {/* Background Layer (Delete) */}
      <div className="absolute inset-x-[2px] inset-y-[2px] bg-red-500/10 rounded-2xl flex items-center justify-end pr-6 z-0">
        <Trash2 className="text-red-500" size={24} strokeWidth={2.5} />
      </div>

      {/* 🔥 HOT CLIENT FLAMES EFFECT */}
      {isHotClient && (
        <div className="absolute -inset-1 rounded-2xl overflow-hidden pointer-events-none z-0">
          {/* Animated flame gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-orange-600/40 via-red-500/20 to-transparent animate-pulse" />
          {/* Flame particles */}
          <div className="absolute bottom-0 left-1/4 w-2 h-8 bg-gradient-to-t from-orange-500 to-transparent rounded-full blur-sm animate-[flicker_0.5s_ease-in-out_infinite]" />
          <div className="absolute bottom-0 left-1/2 w-3 h-10 bg-gradient-to-t from-red-500 to-yellow-500/50 rounded-full blur-sm animate-[flicker_0.3s_ease-in-out_infinite_0.1s]" />
          <div className="absolute bottom-0 left-3/4 w-2 h-6 bg-gradient-to-t from-orange-400 to-transparent rounded-full blur-sm animate-[flicker_0.4s_ease-in-out_infinite_0.2s]" />
          {/* Side glows */}
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-orange-500/60 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-orange-500/60 to-transparent" />
        </div>
      )}

      {/* Foreground Layer (Card) */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        className={`relative z-10 rounded-2xl overflow-hidden cursor-pointer active:cursor-grabbing transition-all duration-300 
          ${
            isHotClient
              ? 'bg-gradient-to-br from-[#1a0f0f] via-[#1a1a2e] to-[#0f0a0a] border-2 border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.3)]'
              : 'bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-white/10'
          }
          hover:border-white/20 hover:shadow-xl group-hover:scale-[1.01]
        `}
        onClick={() => onSelect(client)}
        style={{ touchAction: 'pan-y' }}
      >
        {/* Card Inner Content */}
        <div className="p-4 flex items-center gap-4">
          {/* ========== AVATAR SECTION ========== */}
          <div className="relative flex-shrink-0">
            {/* Avatar Ring with Tier Color */}
            <div
              className={`w-16 h-16 rounded-full p-[3px] border-2 ${style.ring} ${style.glow} transition-all duration-300`}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-black/50 border border-white/5 relative">
                {client.img ? (
                  <img
                    src={getOptimizedImageUrl(client.img, 100, 100)}
                    alt={client.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
                    <User size={28} className="text-gray-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Status Indicator */}
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-[#1a1a2e] ${
                recurrence.color
              } ${recurrence.glow} z-20 transition-all
                ${isTemp ? 'animate-pulse bg-neon-yellow' : ''}
              `}
            />

            {/* 🔥 HOT Badge on Avatar */}
            {isHotClient && (
              <div className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.6)] animate-bounce z-30">
                <Flame size={14} className="text-white" />
              </div>
            )}
          </div>

          {/* ========== DATA SECTION ========== */}
          <div className="flex flex-col flex-1 min-w-0 gap-1.5">
            {/* Name Row */}
            <div className="flex items-center gap-2">
              <h3
                className={`text-lg font-black leading-none uppercase tracking-wide truncate transition-colors
                ${isHotClient ? 'text-orange-100' : 'text-white group-hover:text-neon-yellow'}
              `}
              >
                {client.name}
              </h3>

              {/* VIP Crown for high levels */}
              {level >= 8 && <Crown size={16} className="text-purple-400 flex-shrink-0" />}
            </div>

            {/* Badges Row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Level Badge */}
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r ${style.badge} shadow-lg`}
              >
                <Star size={10} className="fill-current" />
                <span className="text-[9px] font-black tracking-wider">LVL {level}</span>
              </div>

              {/* Tier Badge */}
              <div className={`px-2 py-0.5 rounded-full bg-white/5 border border-white/10`}>
                <span className={`text-[9px] font-bold tracking-wider ${style.icon}`}>
                  {style.name}
                </span>
              </div>

              {/* Temp/Provisório Badge */}
              {isTemp && (
                <div className="px-2 py-0.5 rounded-full bg-neon-yellow/20 border border-neon-yellow/30">
                  <span className="text-[9px] font-bold text-neon-yellow tracking-wider">
                    PROVISÓRIO
                  </span>
                </div>
              )}

              {/* 🔥 HOT Badge */}
              {isHotClient && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_10px_rgba(249,115,22,0.4)] animate-pulse">
                  <Flame size={10} className="text-white" />
                  <span className="text-[9px] font-black text-white tracking-wider">HOT</span>
                </div>
              )}
            </div>

            {/* Info Row */}
            <div className="flex items-center gap-3 text-[10px] text-gray-500">
              <div className="flex items-center gap-1">
                <Clock size={10} />
                <span>{formatLastVisit()}</span>
              </div>

              {appointmentsThisMonth > 0 && (
                <div className="flex items-center gap-1">
                  <Zap size={10} className={isHotClient ? 'text-orange-400' : 'text-gray-500'} />
                  <span className={isHotClient ? 'text-orange-400 font-bold' : ''}>
                    {appointmentsThisMonth}x este mês
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ========== ACTIONS SECTION ========== */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* WhatsApp for temp clients */}
            {isTemp && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onInvite(client);
                }}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50 transition-all active:scale-95"
              >
                <WhatsAppLogo size={22} className="text-green-400" />
              </button>
            )}

            {/* Chevron */}
            <ChevronRight
              size={20}
              className={`transition-all ${
                isHotClient
                  ? 'text-orange-400'
                  : 'text-gray-600 group-hover:text-white group-hover:translate-x-1'
              }`}
            />
          </div>
        </div>

        {/* Bottom Accent Line */}
        <div
          className={`h-0.5 w-full transition-all duration-300
          ${
            isHotClient
              ? 'bg-gradient-to-r from-transparent via-orange-500 to-transparent'
              : tier === 'GOLD'
              ? 'bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent opacity-0 group-hover:opacity-100'
              : tier === 'PLATINUM'
              ? 'bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100'
              : 'bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100'
          }
        `}
        />
      </motion.div>
    </div>
  );
};

// =============================================================================
// MAIN CLIENTS MANAGER COMPONENT
// =============================================================================

export const ClientsManager: React.FC = () => {
  const { clients, updateClients, appointments } = useData();
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

  // Calculate appointments this month per client
  const appointmentsThisMonth = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const counts: Record<string, number> = {};

    appointments?.forEach(apt => {
      if (apt.status === 'completed' || apt.status === 'confirmed' || apt.status === 'pending') {
        try {
          const [year, month] = apt.date.split('-').map(Number);
          if (year === currentYear && month - 1 === currentMonth) {
            const clientId = apt.clientId || '';
            counts[clientId] = (counts[clientId] || 0) + 1;
          }
        } catch (e) {}
      }
    });

    return counts;
  }, [appointments]);

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
      status: 'active' as const,
      notes: newClientData.notes,
    };

    const optimisticClient = { ...newClientPayload, id: tempId };
    onAddClient(optimisticClient);
    setIsAddModalOpen(false);
    setNewClientData({ name: '', phone: '', notes: '' });

    try {
      const created = await api.createClient(newClientPayload);
      if (created) {
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
    const isInvalid =
      !client.name || client.name.trim() === '' || client.name.toLowerCase().includes('undefined');
    return matchesSearch && !isInvalid;
  });

  // Sort: HOT clients first, then by level
  const sortedClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => {
      const aHot = (appointmentsThisMonth[a.id] || 0) >= 3;
      const bHot = (appointmentsThisMonth[b.id] || 0) >= 3;

      if (aHot && !bHot) return -1;
      if (!aHot && bHot) return 1;

      return (b.level || 1) - (a.level || 1);
    });
  }, [filteredClients, appointmentsThisMonth]);

  // --- DELETE MODAL STATE ---
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [clientToInvite, setClientToInvite] = useState<Client | null>(null);

  const handleDeleteClient = (id: string) => setClientToDelete(id);
  const handleInviteClient = (client: Client) => setClientToInvite(client);

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    const id = clientToDelete;
    const updatedClients = clients.filter(c => c.id !== id);
    updateClients(updatedClients);
    setClientToDelete(null);

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
          <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border border-red-500/30 w-full max-w-sm rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)] relative text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <Trash2 size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-graffiti text-white mb-2 uppercase">Excluir Cliente?</h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
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
                className="w-full py-3.5 bg-transparent border border-white/10 text-gray-400 font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-all active:scale-95 hover:text-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8 mt-2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <User size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-graffiti text-white leading-none drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              CLIENTES
            </h1>
            <p className="text-cyan-500/80 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
              Base de Clientes
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6 group flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="BUSCAR CLIENTE..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 text-white placeholder-gray-600 py-4 pl-12 pr-4 rounded-xl text-sm font-medium focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all"
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cyan-400 transition-colors"
            size={18}
          />
        </div>
      </div>

      {/* Client List */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
        <div className="flex flex-col gap-2 pb-20">
          {sortedClients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onSelect={onSelectClient}
              onDelete={handleDeleteClient}
              onInvite={handleInviteClient}
              appointmentsThisMonth={appointmentsThisMonth[client.id] || 0}
            />
          ))}

          {/* Empty State */}
          {sortedClients.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-20 opacity-50">
              <User size={64} className="text-gray-600 mb-4" />
              <p className="text-gray-500 font-graffiti text-xl text-center">
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

      {/* Floating Add Button */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 left-6 w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:scale-110 transition-all z-40 text-white group"
      >
        <Plus
          size={32}
          strokeWidth={3}
          className="group-hover:rotate-90 transition-transform duration-300"
        />
      </button>

      {/* MODAL ADICIONAR CLIENTE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] w-full max-w-md p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative border border-white/10">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-graffiti text-white">NOVO CLIENTE</h2>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider">
                  Adicionar ao sistema
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  value={newClientData.name}
                  onChange={e => setNewClientData({ ...newClientData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-cyan-500/50 transition-all placeholder-gray-600"
                  placeholder="Digite o nome..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={newClientData.phone}
                  onChange={e => setNewClientData({ ...newClientData, phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-cyan-500/50 transition-all placeholder-gray-600"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Notas Iniciais
                </label>
                <textarea
                  value={newClientData.notes}
                  onChange={e => setNewClientData({ ...newClientData, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all h-20 resize-none text-sm placeholder-gray-600"
                  placeholder="Preferências de corte, estilo, etc..."
                />
              </div>

              <button
                onClick={handleSaveNewClient}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-lg py-4 rounded-xl transition-all flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] uppercase tracking-widest"
              >
                <Save size={20} /> Cadastrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Keyframes for flame animation */}
      <style>{`
        @keyframes flicker {
          0%, 100% { opacity: 0.8; transform: scaleY(1) translateY(0); }
          50% { opacity: 1; transform: scaleY(1.2) translateY(-2px); }
        }
      `}</style>
    </div>
  );
};
