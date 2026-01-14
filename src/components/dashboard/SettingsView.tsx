import React, { useState, useEffect } from 'react';
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

  // ============== SECTION CARD COMPONENT ==============
  const SectionCard = ({
    icon: Icon,
    iconColor,
    title,
    subtitle,
    children,
    sectionId,
    defaultOpen = false,
  }: {
    icon: React.ElementType;
    iconColor: string;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    sectionId: string;
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
            className={`text-zinc-600 transition-transform duration-300 ${
              isOpen ? 'rotate-90' : ''
            }`}
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

  // ============== STEPPER COMPONENT ==============
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

  // ============== TOGGLE COMPONENT ==============
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

        {/* ========== HORÁRIO DE FUNCIONAMENTO ========== */}
        <SectionCard
          icon={Clock}
          iconColor="bg-linear-to-br from-green-400 to-green-600"
          title="Horário de Funcionamento"
          subtitle={`${String(shopSettings.startHour).padStart(2, '0')}:00 às ${String(
            shopSettings.endHour
          ).padStart(2, '0')}:00`}
          sectionId="hours"
        >
          <div className="space-y-4">
            {/* Abertura */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                <span className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
                  Abertura
                </span>
              </div>
              <Stepper
                value={shopSettings.startHour}
                onChange={v => {
                  const newSettings = { ...shopSettings, startHour: v };
                  api.updateSettings(newSettings);
                  updateShopSettings(newSettings);
                  showToast('Horário salvo!');
                }}
                max={shopSettings.endHour - 1}
                suffix=":00"
              />
            </div>

            {/* Fechamento */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                <span className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
                  Fechamento
                </span>
              </div>
              <Stepper
                value={shopSettings.endHour}
                onChange={v => {
                  const newSettings = { ...shopSettings, endHour: v };
                  api.updateSettings(newSettings);
                  updateShopSettings(newSettings);
                  showToast('Horário salvo!');
                }}
                min={shopSettings.startHour + 1}
                max={23}
                suffix=":00"
              />
            </div>

            {/* Intervalo */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-zinc-500" />
                <span className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
                  Intervalo
                </span>
              </div>
              <Stepper
                value={shopSettings.slotInterval}
                onChange={v => {
                  const newSettings = { ...shopSettings, slotInterval: v };
                  api.updateSettings(newSettings);
                  updateShopSettings(newSettings);
                  showToast('Intervalo salvo!');
                }}
                min={15}
                max={120}
                suffix="min"
              />
            </div>

            {/* ========== FECHAMENTO RÁPIDO ========== */}
            <div className="pt-4 border-t border-zinc-800/50 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                <span className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
                  Fechamento Rápido
                </span>
              </div>

              {/* Botões rápidos */}
              <div className="grid grid-cols-2 gap-2">
                {/* FECHADO HOJE */}
                {(() => {
                  const today = new Date().toISOString().slice(0, 10);
                  const isClosed = shopSettings.exceptions?.[today]?.closed;
                  return (
                    <button
                      onClick={() => {
                        if (isClosed) {
                          const newExceptions = { ...shopSettings.exceptions };
                          delete newExceptions[today];
                          updateShopSettings({ ...shopSettings, exceptions: newExceptions });
                          showToast('✅ Loja reaberta para hoje!');
                        } else {
                          updateShopSettings({
                            ...shopSettings,
                            exceptions: { ...shopSettings.exceptions, [today]: { closed: true } },
                          });
                          showToast('🔒 Loja fechada para hoje!');
                        }
                      }}
                      className={`py-3 px-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all active:scale-95 flex flex-col items-center gap-1 ${
                        isClosed
                          ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                          : 'bg-zinc-800/50 border border-zinc-700 text-zinc-400 hover:border-red-500/50 hover:text-red-400'
                      }`}
                    >
                      <span className="text-2xl">{isClosed ? '✅' : '🔴'}</span>
                      <span>{isClosed ? 'ABRIR HOJE' : 'FECHAR HOJE'}</span>
                    </button>
                  );
                })()}

                {/* FECHADO AMANHÃ */}
                {(() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
                  const isClosed = shopSettings.exceptions?.[tomorrowStr]?.closed;
                  return (
                    <button
                      onClick={() => {
                        if (isClosed) {
                          const newExceptions = { ...shopSettings.exceptions };
                          delete newExceptions[tomorrowStr];
                          updateShopSettings({ ...shopSettings, exceptions: newExceptions });
                          showToast('✅ Loja reaberta para amanhã!');
                        } else {
                          updateShopSettings({
                            ...shopSettings,
                            exceptions: {
                              ...shopSettings.exceptions,
                              [tomorrowStr]: { closed: true },
                            },
                          });
                          showToast('🔒 Loja fechada para amanhã!');
                        }
                      }}
                      className={`py-3 px-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all active:scale-95 flex flex-col items-center gap-1 ${
                        isClosed
                          ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                          : 'bg-zinc-800/50 border border-zinc-700 text-zinc-400 hover:border-orange-500/50 hover:text-orange-400'
                      }`}
                    >
                      <span className="text-2xl">{isClosed ? '✅' : '🟠'}</span>
                      <span>{isClosed ? 'ABRIR AMANHÃ' : 'FECHAR AMANHÃ'}</span>
                    </button>
                  );
                })()}
              </div>

              {/* Data Customizada */}
              <div className="p-3 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
                <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
                  📅 Fechar outra data
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:border-yellow-500 focus:outline-none"
                    onChange={e => {
                      if (e.target.value) {
                        const dateStr = e.target.value;
                        updateShopSettings({
                          ...shopSettings,
                          exceptions: { ...shopSettings.exceptions, [dateStr]: { closed: true } },
                        });
                        showToast(
                          `🔒 Fechado: ${dateStr.split('-').reverse().slice(0, 2).join('/')}`
                        );
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              {/* Lista de dias fechados (somente futuros) */}
              {(() => {
                const today = new Date().toISOString().slice(0, 10);
                const closedDays = Object.keys(shopSettings.exceptions || {})
                  .filter(date => shopSettings.exceptions?.[date]?.closed && date >= today)
                  .sort();

                if (closedDays.length === 0) return null;

                return (
                  <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl">
                    <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
                      🚫 Dias Fechados ({closedDays.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {closedDays.map(date => (
                        <div
                          key={date}
                          className="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-lg group"
                        >
                          <span className="text-red-300 text-xs font-mono">
                            {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              weekday: 'short',
                            })}
                          </span>
                          <button
                            onClick={() => {
                              const newExceptions = { ...shopSettings.exceptions };
                              delete newExceptions[date];
                              updateShopSettings({ ...shopSettings, exceptions: newExceptions });
                              showToast('✅ Data reaberta!');
                            }}
                            className="w-4 h-4 rounded-full bg-red-500/30 hover:bg-red-500 flex items-center justify-center text-red-300 hover:text-white transition-colors"
                          >
                            <X size={10} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Pausa para Almoço */}
              <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🍔</span>
                  <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                    Pausa para Almoço (Hoje)
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 text-xs shrink-0">Das</span>
                    <input
                      type="time"
                      defaultValue="12:00"
                      className="flex-1 min-w-0 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-sm focus:border-yellow-500 focus:outline-none"
                      id="lunch-start"
                    />
                    <span className="text-zinc-500 text-xs shrink-0">às</span>
                    <input
                      type="time"
                      defaultValue="13:00"
                      className="flex-1 min-w-0 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-sm focus:border-yellow-500 focus:outline-none"
                      id="lunch-end"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const startInput = document.getElementById('lunch-start') as HTMLInputElement;
                      const endInput = document.getElementById('lunch-end') as HTMLInputElement;
                      const startTime = startInput?.value || '12:00';
                      const endTime = endInput?.value || '13:00';

                      const [startH] = startTime.split(':').map(Number);
                      const [endH] = endTime.split(':').map(Number);

                      const today = new Date().toISOString().slice(0, 10);
                      const currentException = shopSettings.exceptions?.[today] || {};

                      const newSettings = {
                        ...shopSettings,
                        exceptions: {
                          ...shopSettings.exceptions,
                          [today]: {
                            ...currentException,
                            lunchStart: startH,
                            lunchEnd: endH,
                          },
                        },
                      };

                      // Persist to backend AND local state
                      api.updateSettings(newSettings);
                      updateShopSettings(newSettings);
                      showToast(`🍔 Almoço: ${startTime} - ${endTime}`);
                    }}
                    className="w-full py-2 bg-amber-500/20 border border-amber-500/50 text-amber-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-amber-500/30 transition-all active:scale-95"
                  >
                    ✓ Aplicar Pausa
                  </button>
                </div>
                <p className="text-zinc-600 text-[10px] mt-2 italic">
                  * Bloqueará agendamentos neste horário apenas para hoje
                </p>
              </div>
            </div>
          </div>
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
