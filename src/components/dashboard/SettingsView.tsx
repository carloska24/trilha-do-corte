import React, { useState, useEffect } from 'react';
import { DatePicker } from '../ui/DatePicker';
import { ConfirmModal } from '../ui/ConfirmModal';
import {
  Store,
  Gift,
  User,
  LogOut,
  ChevronRight,
  CheckCircle,
  Phone,
  QrCode,
  Minus,
  Plus,
  Star,
  Download,
  Edit3,
  Calendar,
  Save,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarberProfile } from '../../types';

import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../services/api';

interface DashboardOutletContext {
  openProfileModal: () => void;
}

// Storage keys for shop data
const SHOP_DATA_KEY = 'trilha_shop_data';
const LOYALTY_CONFIG_KEY = 'trilha_loyalty_config';

interface ShopData {
  name: string;
  phone: string;
  pixKey: string;
}

interface LoyaltyConfig {
  enabled: boolean;
  cutsRequired: number;
}

export const SettingsView: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { shopSettings } = useData();
  const { openProfileModal } = useOutletContext<DashboardOutletContext>();

  const barberProfile = currentUser as BarberProfile;

  // ============== SHOP DATA STATE ==============
  const [shopData, setShopData] = useState<ShopData>(() => {
    const saved = localStorage.getItem(SHOP_DATA_KEY);
    return saved ? JSON.parse(saved) : { name: 'Trilha do Corte', phone: '', pixKey: '' };
  });
  const [editingShop, setEditingShop] = useState(false);
  const [tempShopData, setTempShopData] = useState(shopData);

  // ============== LOYALTY CONFIG STATE ==============
  const [loyaltyConfig, setLoyaltyConfig] = useState<LoyaltyConfig>(() => {
    const saved = localStorage.getItem(LOYALTY_CONFIG_KEY);
    return saved ? JSON.parse(saved) : { enabled: true, cutsRequired: 10 };
  });

  // ============== UI STATE ==============
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [cleanupDate, setCleanupDate] = useState('');
  const [cleanupModalOpen, setCleanupModalOpen] = useState(false);

  // ============== PERSISTENCE ==============
  useEffect(() => {
    localStorage.setItem(SHOP_DATA_KEY, JSON.stringify(shopData));
  }, [shopData]);

  useEffect(() => {
    localStorage.setItem(LOYALTY_CONFIG_KEY, JSON.stringify(loyaltyConfig));
  }, [loyaltyConfig]);

  // ============== HELPERS ==============
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveShopData = () => {
    setShopData(tempShopData);
    setEditingShop(false);
    showToast('DADOS ATUALIZADOS!');
  };

  const handleBackup = () => {
    try {
      const data = {
        appointments: JSON.parse(localStorage.getItem('appointments') || '[]'),
        clients: JSON.parse(localStorage.getItem('clients') || '[]'),
        services: JSON.parse(localStorage.getItem('services') || '[]'),
        shopSettings: JSON.parse(localStorage.getItem('shopSettings') || '{}'),
        shopData,
        loyaltyConfig,
        timestamp: new Date().toISOString(),
        version: '2.0.0',
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trilha_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('BACKUP GERADO COM SUCESSO');
    } catch (error) {
      showToast('ERRO AO CRIAR BACKUP');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto pb-32 px-5 pt-8 animate-fade-in-up">
      {/* ============== TOAST ============== */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[999] bg-black/80 backdrop-blur-xl border border-yellow-500/30 text-yellow-400 px-6 py-4 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.2)] flex items-center gap-3 w-max max-w-[90vw]"
          >
            <CheckCircle size={20} className="text-yellow-500" strokeWidth={2.5} />
            <span className="font-bold text-sm tracking-wide uppercase">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============== HEADER ============== */}
      <div className="text-center mb-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 bg-yellow-500/10 blur-[60px] rounded-full pointer-events-none" />
        <h1 className="relative text-4xl font-graffiti text-yellow-500 text-glow-neon tracking-wider uppercase mb-2 -rotate-2">
          Ajustes
        </h1>
        <div className="relative inline-block px-3 py-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm">
          <p className="text-zinc-400 text-[10px] tracking-[0.2em] uppercase font-bold">
            CONFIGURATION // v2.0
          </p>
        </div>
      </div>

      {/* ============== SECTIONS ============== */}
      <div className="space-y-5">
        {/* ========== DADOS DA BARBEARIA ========== */}
        <SectionCard
          icon={Store}
          color="text-yellow-400"
          title="Minha Barbearia"
          subtitle="Identidade & Pagamentos"
          sectionId="shop"
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
        >
          {editingShop ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 pt-2"
            >
              <CyberInput
                label="Nome da Barbearia"
                value={tempShopData.name}
                onChange={v => setTempShopData({ ...tempShopData, name: v })}
                placeholder="Ex: Cyber Trilha"
              />
              <CyberInput
                label="Telefone / WhatsApp"
                value={tempShopData.phone}
                onChange={v => setTempShopData({ ...tempShopData, phone: v })}
                placeholder="(00) 00000-0000"
              />
              <CyberInput
                label="Chave PIX"
                value={tempShopData.pixKey}
                onChange={v => setTempShopData({ ...tempShopData, pixKey: v })}
                placeholder="Chave PIX"
              />

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => setEditingShop(false)}
                  className="flex-1 py-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-400 font-bold uppercase text-xs hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveShopData}
                  className="flex-1 py-3.5 rounded-xl bg-yellow-500 text-black font-black uppercase text-xs hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.4)] flex items-center justify-center gap-2"
                >
                  <Save size={16} strokeWidth={2.5} /> Salvar
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4 pt-2">
              <InfoRow icon={Store} label="Nome" value={shopData.name} color="text-yellow-500" />
              <InfoRow icon={Phone} label="Tel" value={shopData.phone} color="text-cyan-500" />
              <InfoRow icon={QrCode} label="PIX" value={shopData.pixKey} color="text-purple-500" />

              <button
                onClick={() => {
                  setTempShopData(shopData);
                  setEditingShop(true);
                }}
                className="w-full mt-2 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-yellow-400 font-bold uppercase text-xs transition-all flex items-center justify-center gap-2 group"
              >
                <Edit3 size={16} className="group-hover:scale-110 transition-transform" />
                Editar Dados
              </button>
            </div>
          )}
        </SectionCard>

        {/* ========== PROGRAMA FIDELIDADE ========== */}
        <SectionCard
          icon={Gift}
          color="text-purple-400"
          title="Fidelidade"
          subtitle={
            loyaltyConfig.enabled
              ? `${loyaltyConfig.cutsRequired} Cuts = 1 Free`
              : 'Sistema Offline'
          }
          sectionId="loyalty"
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
        >
          <div className="space-y-6 pt-2">
            {/* Toggle */}
            <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${loyaltyConfig.enabled ? 'bg-purple-500/20' : 'bg-zinc-800/50'}`}
                >
                  <Star
                    size={18}
                    className={loyaltyConfig.enabled ? 'text-purple-400' : 'text-zinc-600'}
                  />
                </div>
                <div>
                  <span className="text-white font-bold text-sm block">Status do Sistema</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                    {loyaltyConfig.enabled ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              <CyberToggle
                checked={loyaltyConfig.enabled}
                onChange={() => {
                  setLoyaltyConfig({ ...loyaltyConfig, enabled: !loyaltyConfig.enabled });
                  showToast(loyaltyConfig.enabled ? 'FIDELIDADE: OFF' : 'FIDELIDADE: ON');
                }}
              />
            </div>

            {/* Cuts Required */}
            {loyaltyConfig.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between px-1">
                  <span className="text-zinc-400 text-xs font-bold uppercase tracking-wide">
                    Meta de Cortes
                  </span>
                  <span className="text-purple-400 text-xs font-bold">
                    {loyaltyConfig.cutsRequired} cortes
                  </span>
                </div>

                <div className="flex items-center justify-center bg-black/40 p-4 rounded-xl border border-white/5">
                  <Stepper
                    value={loyaltyConfig.cutsRequired}
                    onChange={v => {
                      setLoyaltyConfig({ ...loyaltyConfig, cutsRequired: v });
                    }}
                    min={5}
                    max={20}
                  />
                </div>
              </motion.div>
            )}

            {/* Preview */}
            {loyaltyConfig.enabled && (
              <div className="relative overflow-hidden p-0.5 rounded-xl bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-purple-500/50 animate-borderGlow">
                <div className="bg-black/90 p-4 rounded-[10px] relative">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/20 blur-xl rounded-full" />
                  <p className="relative text-center text-zinc-300 text-xs font-medium leading-relaxed">
                    O cliente ganha
                    <strong className="text-purple-400 mx-1">1 corte grátis</strong>
                    após completar
                    <strong className="text-white text-lg mx-1">
                      {loyaltyConfig.cutsRequired}
                    </strong>
                    cortes.
                  </p>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ========== MINHA CONTA ========== */}
        <SectionCard
          icon={User}
          color="text-cyan-400"
          title="Minha Conta"
          subtitle="Perfil & Backup"
          sectionId="account"
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
        >
          <div className="space-y-4 pt-2">
            {/* Profile Card */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-white/5 to-transparent rounded-2xl border border-white/5">
              <div className="relative">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 md:w-14 md:h-14">
                  <img
                    src={
                      barberProfile?.photoUrl ||
                      'https://images.unsplash.com/photo-1618077553780-75539862f629?q=80&w=400'
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-black" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold text-lg truncate leading-tight">
                  {barberProfile?.name || 'Barber'}
                </h4>
                <p className="text-zinc-500 text-xs truncate font-mono">{barberProfile?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase">
                    Admin
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={openProfileModal}
              className="w-full py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-cyan-500/30 text-zinc-400 hover:text-cyan-400 font-bold uppercase text-xs transition-all flex items-center justify-center gap-2"
            >
              <Edit3 size={14} /> Editar Perfil
            </button>

            <div className="h-px bg-white/5 w-full my-2" />

            {/* Backup */}
            <button
              onClick={handleBackup}
              className="w-full flex items-center justify-between p-4 bg-zinc-900/50 hover:bg-zinc-800/80 rounded-xl border border-white/5 hover:border-cyan-500/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-950/30 group-hover:bg-cyan-500/20 transition-colors">
                  <Download
                    size={18}
                    className="text-cyan-700 group-hover:text-cyan-400 transition-colors"
                  />
                </div>
                <div className="text-left">
                  <span className="block text-zinc-300 group-hover:text-white font-bold text-sm transition-colors">
                    Download Backup
                  </span>
                  <span className="block text-zinc-600 text-[10px]">JSON Format</span>
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-zinc-700 group-hover:text-cyan-400 transition-colors"
              />
            </button>
          </div>
        </SectionCard>

        {/* ========== MANUTENÇÃO DO SISTEMA ========== */}
        <SectionCard
          icon={ShieldAlert}
          color="text-red-400"
          title="Sistema"
          subtitle="Manutenção & Limpeza"
          sectionId="maintenance"
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
        >
          <div className="space-y-6 pt-2">
            {/* Warning */}
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <ShieldAlert size={16} className="text-red-500 mt-0.5" />
              <p className="text-[10px] text-red-300/80 leading-relaxed">
                Área sensível. Ações aqui podem resultar em perda de dados se não executadas com
                cautela.
              </p>
            </div>

            {/* Backup & Restore Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={async () => {
                  // Reuse logic
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('http://localhost:3000/api/maintenance/backup', {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!response.ok) throw new Error('Falha');
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `trilha_full_backup_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    showToast('BACKUP COMPLETO BAIXADO');
                  } catch (e) {
                    showToast('ERRO NO DOWNLOAD');
                  }
                }}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-800 transition-all group"
              >
                <Download
                  size={24}
                  className="text-zinc-500 group-hover:text-cyan-400 transition-colors"
                />
                <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white uppercase tracking-wider">
                  Baixar DB
                </span>
              </button>

              <div className="relative h-full">
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  id="restore-upload"
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (
                      !confirm('DANGER ZONE: Isso irá substituir TODOS os dados. Deseja continuar?')
                    ) {
                      e.target.value = '';
                      return;
                    }
                    const formData = new FormData();
                    formData.append('backupFile', file);
                    try {
                      await api.post('/maintenance/restore', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      });
                      showToast('DADOS RESTAURADOS!');
                      setTimeout(() => window.location.reload(), 1500);
                    } catch (err) {
                      showToast('ERRO CRÍTICO NA RESTAURAÇÃO');
                    }
                  }}
                />
                <label
                  htmlFor="restore-upload"
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-800 transition-all cursor-pointer group h-full"
                >
                  <Save
                    size={24}
                    className="text-zinc-500 group-hover:text-purple-400 transition-colors"
                  />
                  <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white uppercase tracking-wider">
                    Upload DB
                  </span>
                </label>
              </div>
            </div>

            <div className="h-px bg-white/5 w-full" />

            {/* Limpeza */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-500/80">
                <Trash2 size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">Zona de Expurgo</span>
              </div>

              <div className="p-4 bg-red-950/10 rounded-xl border border-red-500/10 hover:border-red-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1.5 block">
                      Limpar antes de:
                    </label>
                    <DatePicker
                      value={cleanupDate}
                      onChange={setCleanupDate}
                      placeholder="Selecionar data limite"
                      accentColor="red"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setCleanupModalOpen(true)}
                  className="w-full py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-bold uppercase text-xs hover:bg-red-500/20 hover:text-red-300 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} /> Executar Limpeza
                </button>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ============== LOGOUT ============== */}
      <div className="mt-12 px-2">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="w-full py-4 rounded-xl relative group overflow-hidden bg-black border border-red-900/50 hover:border-red-500 transition-colors"
        >
          <div className="absolute inset-0 bg-red-900/10 group-hover:bg-red-900/20 transition-colors" />
          <div className="relative flex items-center justify-center gap-3 text-red-500 font-black uppercase tracking-widest text-sm">
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Encerrar Sessão</span>
            <LogOut
              size={18}
              className="rotate-180 group-hover:translate-x-1 transition-transform"
            />
          </div>
        </motion.button>
        <p className="text-center text-zinc-800 text-[10px] uppercase font-black tracking-[0.3em] mt-6 opacity-30">
          Trilha Barber System
        </p>
      </div>
      {/* ============== CONFIRM MODAL ============== */}
      <ConfirmModal
        isOpen={cleanupModalOpen}
        onClose={() => setCleanupModalOpen(false)}
        title="Confirmar Limpeza"
        message={
          cleanupDate
            ? `Deseja realmente apagar todos os agendamentos anteriores a ${cleanupDate.split('-').reverse().join('/')}?`
            : 'Deseja realmente apagar todos os agendamentos anteriores a HOJE? Dados de hoje serão mantidos.'
        }
        confirmLabel="Sim, Limpar"
        isDanger
        onConfirm={() => {
          api
            .post('/maintenance/clean-schedule', { mode: 'past', date: cleanupDate || undefined })
            .then(res => showToast(res.data.details || `REMOVIDOS: ${res.data.count} ITENS`))
            .catch(() => showToast('ERRO AO LIMPAR'));
        }}
      />
    </div>
  );
};

// ============== SUB-COMPONENTS ==============

const SectionCard = ({
  icon: Icon,
  color,
  title,
  subtitle,
  children,
  sectionId,
  expandedSection,
  setExpandedSection,
}: {
  icon: React.ElementType;
  color: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  sectionId: string;
  expandedSection: string | null;
  setExpandedSection: (id: string | null) => void;
}) => {
  const isOpen = expandedSection === sectionId;

  return (
    <motion.div
      layout
      className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-yellow-500/30 ring-1 ring-yellow-500/10 bg-zinc-900/90' : 'hover:border-white/20'}`}
    >
      <button
        onClick={() => setExpandedSection(isOpen ? null : sectionId)}
        className="w-full p-5 flex items-center gap-5 relative group"
      >
        {/* Glow behind icon */}
        <div
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full ${color.replace('text-', 'bg-')}`}
        />

        <Icon
          size={32}
          className={`${color} relative z-10 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110`}
          strokeWidth={1.5}
        />

        <div className="flex-1 text-left z-10">
          <h3 className="text-white font-black text-sm uppercase tracking-wider">{title}</h3>
          {subtitle && (
            <p className="text-zinc-500 text-[10px] font-medium mt-0.5 tracking-wide">{subtitle}</p>
          )}
        </div>

        <ChevronRight
          size={18}
          className={`text-zinc-600 transition-transform duration-300 z-10 ${isOpen ? 'rotate-90 text-white' : 'group-hover:text-zinc-400'}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'circOut' }}
            className="border-t border-white/5"
          >
            <div className="p-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) => (
  <div className="flex items-center justify-between p-3.5 bg-black/40 rounded-xl border border-white/5">
    <div className="flex items-center gap-3">
      <Icon size={16} className={`${color} opacity-80`} />
      <span className="text-zinc-500 text-xs font-bold uppercase">{label}</span>
    </div>
    <span className="text-zinc-200 font-medium text-xs truncate max-w-[150px]">{value || '—'}</span>
  </div>
);

const CyberInput = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) => (
  <div>
    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1.5 block ml-1">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-medium focus:border-yellow-500/50 focus:outline-none focus:bg-zinc-900/80 transition-all placeholder:text-zinc-700"
      placeholder={placeholder}
    />
  </div>
);

const Stepper = ({
  value,
  onChange,
  min = 0,
  max = 23,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) => (
  <div className="flex items-center gap-4">
    <button
      onClick={() => onChange(Math.max(min, value - 1))}
      className="w-12 h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-95"
    >
      <Minus size={20} strokeWidth={3} />
    </button>
    <div className="w-16 flex flex-col items-center">
      <span className="text-3xl font-black text-white leading-none">
        {String(value).padStart(2, '0')}
      </span>
    </div>
    <button
      onClick={() => onChange(Math.min(max, value + 1))}
      className="w-12 h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-95"
    >
      <Plus size={20} strokeWidth={3} />
    </button>
  </div>
);

const CyberToggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`w-12 h-7 rounded-full transition-all duration-300 relative border ${
      checked ? 'bg-purple-900/50 border-purple-500' : 'bg-zinc-800 border-zinc-700'
    }`}
  >
    <div
      className={`absolute top-1/2 -translate-y-1/2 left-1 w-5 h-5 rounded-full shadow-md transition-all duration-300 ${
        checked
          ? 'bg-purple-400 translate-x-5 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
          : 'bg-zinc-500 translate-x-0'
      }`}
    />
  </button>
);
