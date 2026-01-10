import React, { useState, useEffect } from 'react';
import {
  Moon,
  Sun,
  Globe,
  Type,
  Bell,
  Mail,
  MessageSquare,
  Cloud,
  Shield,
  Info,
  ChevronRight,
  LogOut,
  X,
  CheckCircle,
  Download,
} from 'lucide-react';
import { BarberProfile } from '../../types';

import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useUI } from '../../contexts/UIContext';
import { useOutletContext } from 'react-router-dom';

interface DashboardOutletContext {
  openProfileModal: () => void;
}

export const SettingsView: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { shopSettings } = useData();
  const { theme, toggleTheme } = useUI();
  const { openProfileModal } = useOutletContext<DashboardOutletContext>();

  const barberProfile = currentUser as BarberProfile;
  const onLogout = logout;
  const onEditProfile = openProfileModal;

  const isDarkMode = theme === 'dark';

  // Local state based persistent preferences
  const [pushEnabled, setPushEnabled] = useState(() => {
    const saved = localStorage.getItem('settings_push');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [emailEnabled, setEmailEnabled] = useState(() => {
    const saved = localStorage.getItem('settings_email');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [smsEnabled, setSmsEnabled] = useState(() => {
    const saved = localStorage.getItem('settings_sms');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [language, setLanguage] = useState(
    () => localStorage.getItem('settings_language') || 'pt-BR'
  );
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem('settings_fontsize') || 'medium'
  );

  // Modal State
  const [activeModal, setActiveModal] = useState<'privacy' | 'about' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('settings_push', JSON.stringify(pushEnabled));
    if (pushEnabled) {
      if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    }
  }, [pushEnabled]);

  useEffect(() => {
    localStorage.setItem('settings_email', JSON.stringify(emailEnabled));
  }, [emailEnabled]);

  useEffect(() => {
    localStorage.setItem('settings_sms', JSON.stringify(smsEnabled));
  }, [smsEnabled]);

  // Removed Theme useEffect (handled by Context)

  // Helper for Toasts
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Data Backup Function
  const handleBackup = () => {
    try {
      // Fix: Backup from actual localStorage keys used by context
      // Note: 'barberProfile' might be stored as 'currentUser' in AuthContext
      const data = {
        appointments: JSON.parse(localStorage.getItem('appointments') || '[]'),
        clients: JSON.parse(localStorage.getItem('clients') || '[]'),
        services: JSON.parse(localStorage.getItem('services') || '[]'),
        barberProfile: JSON.parse(localStorage.getItem('currentUser') || '{}'), // Fixed key
        shopSettings: JSON.parse(localStorage.getItem('shopSettings') || '{}'),
        timestamp: new Date().toISOString(),
        version: '1.0.2',
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

      showToast('Backup realizado com sucesso!');
    } catch (error) {
      console.error('Backup failed:', error);
      showToast('Erro ao criar backup via navegador.');
    }
  };

  // Common item styles - Updated for Semantic Colors
  const containerClass =
    'bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden shadow-md transition-colors duration-300';
  const itemRowClass =
    'flex items-center justify-between p-4 hover:bg-[var(--stripe-color)] transition-colors cursor-pointer group border-b border-[var(--border-color)] last:border-b-0';
  const labelClass =
    'text-[var(--text-primary)] font-medium flex items-center gap-3 transition-colors';
  const iconClass =
    'text-[var(--text-secondary)] group-hover:text-[var(--color-neon-yellow)] transition-colors';
  const valueClass =
    'text-[var(--text-secondary)] text-sm flex items-center gap-2 group-hover:text-[var(--text-primary)] transition-colors';

  // Toggle Switch Component
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <div
      onClick={e => {
        e.stopPropagation();
        onChange();
      }}
      className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out relative ${
        checked ? 'bg-[var(--color-neon-yellow)]' : 'bg-gray-700'
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
          checked ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto pb-24 animate-fade-in-up relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-100 bg-green-900/90 border border-green-500 text-white px-6 py-3 rounded shadow-2xl flex items-center gap-2 animate-[slideTrack_0.3s_ease-out]">
          <CheckCircle size={18} />
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="text-center mb-6 pt-4">
        <h2 className="text-4xl font-bebas text-[var(--text-primary)] tracking-widest uppercase mb-1 font-graffiti drop-shadow-sm transition-all">
          AJUSTES
        </h2>
      </div>

      {/* PROFILE */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3 pl-1">
          Perfil
        </h3>
        <div className="bg-[var(--bg-card)] rounded-xl p-4 flex items-center justify-between border border-[var(--border-color)] shadow-lg transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[var(--border-color)]">
              <img
                src={
                  barberProfile?.photoUrl ||
                  'https://images.unsplash.com/photo-1618077553780-75539862f629?q=80&w=400&auto=format&fit=crop'
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-[var(--text-primary)] font-bold text-lg">
                {barberProfile?.name || 'Barbeiro'}
              </h4>
              <p className="text-[var(--text-secondary)] text-xs truncate max-w-[150px]">
                {barberProfile?.email || 'email@exemplo.com'}
              </p>
            </div>
          </div>
          <button
            onClick={onEditProfile}
            className="bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] text-[var(--color-neon-yellow)] text-xs font-bold px-4 py-2 rounded-lg border border-[var(--border-color)] transition-colors hover:border-[var(--color-neon-yellow)]/50"
          >
            Editar
          </button>
        </div>
      </div>

      {/* APP PREFERENCES */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3 pl-1">
          Preferências
        </h3>
        <div className={containerClass}>
          <div className={itemRowClass} onClick={toggleTheme}>
            <div className={labelClass}>
              {isDarkMode ? (
                <Moon size={20} className={iconClass} />
              ) : (
                <Sun size={20} className={iconClass} />
              )}{' '}
              Tema
            </div>
            <div className={valueClass}>
              {isDarkMode ? 'Dark' : 'Light Lab'} <ChevronRight size={16} />
            </div>
          </div>
          <div className={itemRowClass} onClick={() => showToast('Idioma definido para Português')}>
            <div className={labelClass}>
              <Globe size={20} className={iconClass} /> Idioma
            </div>
            <div className={valueClass}>
              Português <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3 pl-1">
          Notificações
        </h3>
        <div className={containerClass}>
          <div className={itemRowClass} onClick={() => setPushEnabled(!pushEnabled)}>
            <div className={labelClass}>
              <Bell size={20} className={iconClass} /> Push Notificações
            </div>
            <Toggle checked={pushEnabled} onChange={() => setPushEnabled(!pushEnabled)} />
          </div>
          <div className={itemRowClass} onClick={() => setEmailEnabled(!emailEnabled)}>
            <div className={labelClass}>
              <Mail size={20} className={iconClass} /> Alertas por Email
            </div>
            <Toggle checked={emailEnabled} onChange={() => setEmailEnabled(!emailEnabled)} />
          </div>
          <div className={itemRowClass} onClick={() => setSmsEnabled(!smsEnabled)}>
            <div className={labelClass}>
              <MessageSquare size={20} className={iconClass} /> Alertas por SMS
            </div>
            <Toggle checked={smsEnabled} onChange={() => setSmsEnabled(!smsEnabled)} />
          </div>
        </div>
      </div>

      {/* SYSTEM CONFIGURATION */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3 pl-1">
          Sistema
        </h3>
        <div className={containerClass}>
          <div className={itemRowClass} onClick={handleBackup}>
            <div className={labelClass}>
              <Cloud size={20} className={iconClass} /> Backup de Dados
            </div>
            <div className={valueClass}>
              <Download size={14} className="mr-1" /> Baixar JSON <ChevronRight size={16} />
            </div>
          </div>
          <div className={itemRowClass} onClick={() => setActiveModal('privacy')}>
            <div className={labelClass}>
              <Shield size={20} className={iconClass} /> Privacidade
            </div>
            <div className={valueClass}>
              <ChevronRight size={16} />
            </div>
          </div>
          <div className={itemRowClass} onClick={() => setActiveModal('about')}>
            <div className={labelClass}>
              <Info size={20} className={iconClass} /> Sobre
            </div>
            <div className={valueClass}>
              v1.0.2 <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* LOGOUT */}
      <div className="mt-8">
        <button
          onClick={onLogout}
          className="w-full bg-[var(--bg-card)] hover:bg-red-900/10 text-red-500 hover:text-red-400 py-4 rounded-xl border border-[var(--border-color)] font-bold uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" /> Sair
        </button>
      </div>

      {/* INFO MODALS */}
      {activeModal && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-sm rounded-lg shadow-2xl overflow-hidden transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-secondary)]">
              <h3 className="font-bold text-[var(--text-primary)] uppercase tracking-wider">
                {activeModal === 'privacy' ? 'Privacidade' : 'Sobre'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 text-[var(--text-secondary)] text-sm leading-relaxed">
              {activeModal === 'privacy' ? (
                <div className="space-y-4">
                  <p>
                    1. <strong>Dados Locais:</strong> Todos os seus dados (clientes, agendamentos)
                    são armazenados localmente no seu dispositivo para máxima privacidade.
                  </p>
                  <p>
                    2. <strong>Segurança:</strong> Não compartilhamos suas informações financeiras
                    com terceiros.
                  </p>
                  <p>
                    3. <strong>Backup:</strong> Utilize a função de backup regularmente para
                    garantir a segurança dos seus dados.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-[var(--color-neon-yellow)] rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/20">
                    <span className="font-black text-black text-xl">TC</span>
                  </div>
                  <h4 className="text-[var(--text-primary)] font-bold text-lg mb-1">
                    Trilha do Corte
                  </h4>
                  <p className="mb-4">Version 1.0.2 (Beta)</p>
                  <p>Sistema de gestão premium para barbearias de alto nível.</p>
                  <p className="mt-4 text-xs opacity-50">
                    © 2026 Trilha do Corte. All rights reserved.
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] py-3 rounded font-bold uppercase text-xs tracking-widest transition-colors border border-[var(--border-color)]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
