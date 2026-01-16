import React, { useState, useEffect } from 'react';
import { DatePicker } from '../ui/DatePicker';
import {
  Store,
  Clock,
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
  X,
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
  const { shopSettings, updateShopSettings } = useData();
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
    showToast('Dados salvos com sucesso!');
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

      showToast('Backup realizado!');
    } catch (error) {
      showToast('Erro ao criar backup');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto pb-28 px-4 pt-4 animate-fade-in-up">
      {/* ============== TOAST ============== */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-999 bg-emerald-900/95 backdrop-blur-md border border-emerald-500/50 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2"
          >
            <CheckCircle size={18} className="text-emerald-400" />
            <span className="font-bold text-sm">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============== HEADER ============== */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black text-white uppercase tracking-widest">Ajustes</h1>
        <p className="text-zinc-500 text-xs mt-1">Configure sua barbearia</p>
      </div>

      {/* ============== SECTIONS ============== */}
      <div className="space-y-4">
        {/* ========== DADOS DA BARBEARIA ========== */}
        <SectionCard
          icon={Store}
          iconColor="bg-linear-to-br from-yellow-400 to-yellow-600"
          title="Minha Barbearia"
          subtitle="Nome, telefone e PIX"
          sectionId="shop"
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
        >
          {editingShop ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">
                  Nome da Barbearia
                </label>
                <input
                  type="text"
                  value={tempShopData.name}
                  onChange={e => setTempShopData({ ...tempShopData, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white font-medium focus:border-yellow-500 focus:outline-none transition-colors"
                  placeholder="Ex: Trilha do Corte"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">
                  Telefone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={tempShopData.phone}
                  onChange={e => setTempShopData({ ...tempShopData, phone: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white font-medium focus:border-yellow-500 focus:outline-none transition-colors"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">
                  Chave PIX
                </label>
                <input
                  type="text"
                  value={tempShopData.pixKey}
                  onChange={e => setTempShopData({ ...tempShopData, pixKey: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white font-medium focus:border-yellow-500 focus:outline-none transition-colors"
                  placeholder="CPF, CNPJ, Email ou Aleatória"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingShop(false)}
                  className="flex-1 py-3 rounded-lg bg-zinc-800 text-zinc-400 font-bold uppercase text-xs hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveShopData}
                  className="flex-1 py-3 rounded-lg bg-yellow-500 text-black font-bold uppercase text-xs hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={14} /> Salvar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Store size={16} className="text-yellow-500" />
                  <span className="text-zinc-400 text-sm">Nome</span>
                </div>
                <span className="text-white font-medium text-sm">{shopData.name || '—'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-green-500" />
                  <span className="text-zinc-400 text-sm">Telefone</span>
                </div>
                <span className="text-white font-medium text-sm">{shopData.phone || '—'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <QrCode size={16} className="text-purple-500" />
                  <span className="text-zinc-400 text-sm">PIX</span>
                </div>
                <span className="text-white font-medium text-sm truncate max-w-[120px]">
                  {shopData.pixKey || '—'}
                </span>
              </div>
              <button
                onClick={() => {
                  setTempShopData(shopData);
                  setEditingShop(true);
                }}
                className="w-full py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-yellow-500 font-bold uppercase text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 size={14} /> Editar Dados
              </button>
            </div>
          )}
        </SectionCard>

        {/* ========== PROGRAMA FIDELIDADE ========== */}
        <SectionCard
          icon={Gift}
          iconColor="bg-gradient-to-br from-purple-400 to-purple-600"
          title="Programa Fidelidade"
          subtitle={
            loyaltyConfig.enabled ? `${loyaltyConfig.cutsRequired} cortes = 1 grátis` : 'Desativado'
          }
          sectionId="loyalty"
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
        >
          <div className="space-y-4">
            {/* Toggle */}
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Star size={16} className="text-yellow-500" />
                <span className="text-white font-medium text-sm">Ativar Programa</span>
              </div>
              <Toggle
                checked={loyaltyConfig.enabled}
                onChange={() => {
                  setLoyaltyConfig({ ...loyaltyConfig, enabled: !loyaltyConfig.enabled });
                  showToast(
                    loyaltyConfig.enabled ? 'Fidelidade desativada' : 'Fidelidade ativada!'
                  );
                }}
              />
            </div>

            {/* Cuts Required */}
            {loyaltyConfig.enabled && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
              >
                <span className="text-zinc-400 text-sm font-medium">A cada quantos cortes?</span>
                <Stepper
                  value={loyaltyConfig.cutsRequired}
                  onChange={v => {
                    setLoyaltyConfig({ ...loyaltyConfig, cutsRequired: v });
                    showToast(`${v} cortes = 1 grátis`);
                  }}
                  min={5}
                  max={20}
                />
              </motion.div>
            )}

            {/* Preview */}
            {loyaltyConfig.enabled && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-900/20 to-purple-900/20 border border-yellow-500/20">
                <p className="text-center text-yellow-400 text-sm font-bold">
                  Cliente ganha 1 corte grátis a cada{' '}
                  <span className="text-xl">{loyaltyConfig.cutsRequired}</span> cortes
                </p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ========== MINHA CONTA ========== */}
        <SectionCard
          icon={User}
          iconColor="bg-gradient-to-br from-blue-400 to-blue-600"
          title="Minha Conta"
          subtitle={barberProfile?.name || 'Barbeiro'}
          sectionId="account"
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
        >
          <div className="space-y-3">
            {/* Profile Card */}
            <div className="flex items-center gap-4 p-3 bg-zinc-800/50 rounded-lg">
              <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-zinc-700">
                <img
                  src={
                    barberProfile?.photoUrl ||
                    'https://images.unsplash.com/photo-1618077553780-75539862f629?q=80&w=400'
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold">{barberProfile?.name || 'Barbeiro'}</h4>
                <p className="text-zinc-500 text-xs truncate">{barberProfile?.email}</p>
              </div>
              <button
                onClick={openProfileModal}
                className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-colors"
              >
                Editar
              </button>
            </div>

            {/* Backup */}
            <button
              onClick={handleBackup}
              className="w-full flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Download
                  size={16}
                  className="text-zinc-500 group-hover:text-white transition-colors"
                />
                <span className="text-zinc-400 group-hover:text-white text-sm transition-colors">
                  Backup de Dados
                </span>
              </div>
              <ChevronRight size={16} className="text-zinc-600" />
            </button>
          </div>
        </SectionCard>

        {/* ========== MANUTENÇÃO DO SISTEMA ========== */}
        <SectionCard
          icon={Download}
          iconColor="bg-gradient-to-br from-cyan-400 to-cyan-600"
          title="Manutenção do Sistema"
          subtitle="Backup e Limpeza"
          sectionId="maintenance"
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
        >
          <div className="space-y-4">
            {/* Backup & Restore */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('http://localhost:3000/api/maintenance/backup', {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    });

                    if (!response.ok) throw new Error('Falha no backup');

                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `trilha_backup_${new Date().toISOString().slice(0, 10)}.json`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    showToast('Backup baixado!');
                  } catch (e) {
                    showToast('Erro no backup');
                  }
                }}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-cyan-500/50 transition-all group"
              >
                <Download
                  size={24}
                  className="text-cyan-400 group-hover:scale-110 transition-transform"
                />
                <span className="text-xs font-bold text-zinc-300 uppercase">Backup</span>
              </button>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  id="restore-upload"
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    if (
                      !confirm(
                        'ATENÇÃO: Isso irá substituir/atualizar os dados atuais. Deseja continuar?'
                      )
                    ) {
                      e.target.value = '';
                      return;
                    }

                    const formData = new FormData();
                    formData.append('backupFile', file);

                    try {
                      await api.post('/maintenance/restore', formData, {
                        headers: {
                          'Content-Type': 'multipart/form-data',
                        },
                      });
                      showToast('Backup restaurado!');
                      setTimeout(() => window.location.reload(), 1500);
                    } catch (err) {
                      showToast('Erro na restauração');
                    }
                  }}
                />
                <label
                  htmlFor="restore-upload"
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-purple-500/50 transition-all cursor-pointer group h-full"
                >
                  <Save
                    size={24}
                    className="text-purple-400 group-hover:scale-110 transition-transform"
                  />
                  <span className="text-xs font-bold text-zinc-300 uppercase">Restaurar</span>
                </label>
              </div>
            </div>

            <div className="h-px bg-zinc-800 w-full" />

            {/* Limpeza */}
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold ml-1">
                Zona de Limpeza
              </p>

              {/* Advanced Clean History */}
              <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-red-400">
                    <Calendar size={18} />
                    <span className="text-sm font-bold">Limpar Histórico</span>
                  </div>
                  <button
                    onClick={() => {
                      const message = cleanupDate
                        ? `Isso apagará agendamentos ANTERIORES a ${cleanupDate
                            .split('-')
                            .reverse()
                            .join('/')}. Confirmar?`
                        : 'Isso apagará agendamentos anteriores a HOJE. Confirmar?';

                      if (!confirm(message)) return;

                      api
                        .post('/maintenance/clean-schedule', {
                          mode: 'past',
                          date: cleanupDate || undefined,
                        })
                        .then(res => showToast(`Limpo: ${res.data.count} itens`))
                        .catch(() => showToast('Erro ao limpar'));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-bold hover:bg-red-500/30 transition-colors uppercase"
                  >
                    Executar
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <DatePicker
                      value={cleanupDate}
                      onChange={setCleanupDate}
                      placeholder="Selecionar data"
                      accentColor="red"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-600">(Vazio = hoje)</span>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ============== LOGOUT ============== */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={logout}
        className="w-full mt-6 py-4 rounded-2xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/20 hover:border-red-500/40 text-red-400 font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 group"
      >
        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
        Sair da Conta
      </motion.button>

      {/* ============== VERSION ============== */}
      <p className="text-center text-zinc-700 text-xs mt-6">Trilha do Corte v2.0.0</p>
    </div>
  );
};

// ============== COMPONENTS ==============

const SectionCard = ({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  children,
  sectionId,
  expandedSection,
  setExpandedSection,
  defaultOpen = false,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  sectionId: string;
  expandedSection: string | null;
  setExpandedSection: (id: string | null) => void;
  defaultOpen?: boolean;
}) => {
  const isOpen = expandedSection === sectionId || defaultOpen;

  return (
    <motion.div
      layout
      className="rounded-2xl bg-linear-to-br from-zinc-900/80 to-zinc-950 border border-zinc-800/60 overflow-hidden shadow-xl"
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setExpandedSection(isOpen ? null : sectionId)}
        className="w-full p-4 flex items-center gap-4 hover:bg-zinc-800/30 transition-colors"
      >
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColor} shadow-lg`}
        >
          <Icon size={24} className="text-black" strokeWidth={2.5} />
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-white font-bold text-sm uppercase tracking-wide">{title}</h3>
          {subtitle && <p className="text-zinc-500 text-xs mt-0.5">{subtitle}</p>}
        </div>
        <ChevronRight
          size={20}
          className={`text-zinc-600 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Content - Expandable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-zinc-800/50"
          >
            <div className="p-4 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Stepper = ({
  value,
  onChange,
  min = 0,
  max = 23,
  suffix = '',
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) => (
  <div className="flex items-center gap-2">
    <button
      onClick={() => onChange(Math.max(min, value - 1))}
      className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-95"
    >
      <Minus size={18} strokeWidth={3} />
    </button>
    <span className="w-20 text-center text-xl font-black text-white">
      {String(value).padStart(2, '0')}
      {suffix}
    </span>
    <button
      onClick={() => onChange(Math.min(max, value + 1))}
      className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-95"
    >
      <Plus size={18} strokeWidth={3} />
    </button>
  </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${
      checked ? 'bg-yellow-500' : 'bg-zinc-700'
    }`}
  >
    <motion.div
      layout
      className={`w-6 h-6 rounded-full bg-white shadow-lg ${checked ? 'ml-6' : 'ml-0'}`}
    />
  </button>
);
