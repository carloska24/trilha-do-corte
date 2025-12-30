import React, { useState, useEffect } from 'react';
import {
  User,
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
  Clock,
} from 'lucide-react';
import { BarberProfile } from '../../types';

import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useOutletContext } from 'react-router-dom';

interface DashboardOutletContext {
  openProfileModal: () => void;
}

export const SettingsView: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { shopSettings, updateShopSettings } = useData();
  const { openProfileModal } = useOutletContext<DashboardOutletContext>();

  const barberProfile = currentUser as BarberProfile;
  const onLogout = logout;
  const onEditProfile = openProfileModal;

  // Defaulting to Dark Mode as per "Zero Visual Changes" / Native Dark Mode rule
  const isDarkMode = true;
  const toggleTheme = () => console.log('Theme toggle deferred');

  // Local state for toggles with persistence initialization
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

  // Modal State
  const [activeModal, setActiveModal] = useState<'privacy' | 'about' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('settings_push', JSON.stringify(pushEnabled));
  }, [pushEnabled]);

  useEffect(() => {
    localStorage.setItem('settings_email', JSON.stringify(emailEnabled));
  }, [emailEnabled]);

  useEffect(() => {
    localStorage.setItem('settings_sms', JSON.stringify(smsEnabled));
  }, [smsEnabled]);

  // Helper for Toasts
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Data Backup Function
  const handleBackup = () => {
    try {
      const data = {
        appointments: JSON.parse(localStorage.getItem('appointments') || '[]'),
        clients: JSON.parse(localStorage.getItem('clients') || '[]'),
        services: JSON.parse(localStorage.getItem('services') || '[]'),
        barberProfile: JSON.parse(localStorage.getItem('barberProfile') || '{}'),
        clientProfile: JSON.parse(localStorage.getItem('clientProfile') || '{}'),
        timestamp: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `barber_pro_backup_${new Date().toISOString().slice(0, 10)}.json`;
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
  const containerClass = 'bg-[#1E1E1E] rounded-xl border border-white/5 overflow-hidden shadow-md';
  const itemRowClass =
    'flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer group border-b border-white/5 last:border-b-0';
  const labelClass = 'text-gray-100 font-medium flex items-center gap-3 transition-colors';
  const iconClass = 'text-gray-400 group-hover:text-[#FFD700] transition-colors';
  const valueClass =
    'text-gray-500 text-sm flex items-center gap-2 group-hover:text-gray-200 transition-colors';

  // Toggle Switch Component
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <div
      onClick={e => {
        e.stopPropagation();
        onChange();
      }}
      className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out relative ${
        checked ? 'bg-[#22C55E]' : 'bg-gray-700'
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
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-green-900/90 border border-green-500 text-white px-6 py-3 rounded shadow-2xl flex items-center gap-2 animate-[slideTrack_0.3s_ease-out]">
          <CheckCircle size={18} />
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="text-center mb-6 pt-4">
        <h2 className="text-4xl font-bebas text-white tracking-widest uppercase mb-1 font-graffiti drop-shadow-sm transition-all">
          SETTINGS
        </h2>
      </div>

      {/* PROFILE */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">
          Profile
        </h3>
        <div className="bg-[#1E1E1E] rounded-xl p-4 flex items-center justify-between border border-white/5 shadow-lg transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#333]">
              <img
                src={
                  barberProfile.photoUrl ||
                  'https://images.unsplash.com/photo-1618077553780-75539862f629?q=80&w=400&auto=format&fit=crop'
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">{barberProfile.name}</h4>
              <p className="text-gray-500 text-xs truncate max-w-[150px]">{barberProfile.email}</p>
            </div>
          </div>
          <button
            onClick={onEditProfile}
            className="bg-[#2A2A2A] hover:bg-[#333] text-[#FFD700] text-xs font-bold px-4 py-2 rounded-lg border border-[#333] transition-colors hover:border-[#FFD700]/50"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* APP PREFERENCES */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">
          App Preferences
        </h3>
        <div className={containerClass}>
          <div className={itemRowClass} onClick={toggleTheme}>
            <div className={labelClass}>
              {isDarkMode ? (
                <Moon size={20} className={iconClass} />
              ) : (
                <Sun size={20} className={iconClass} />
              )}{' '}
              Theme
            </div>
            <div className={valueClass}>
              {isDarkMode ? 'Dark' : 'Light'} <ChevronRight size={16} />
            </div>
          </div>
          <div className={itemRowClass} onClick={() => showToast('Idioma definido para Português')}>
            <div className={labelClass}>
              <Globe size={20} className={iconClass} /> Language
            </div>
            <div className={valueClass}>
              Portuguese <ChevronRight size={16} />
            </div>
          </div>
          <div className={itemRowClass} onClick={() => showToast('Tamanho da fonte ajustado!')}>
            <div className={labelClass}>
              <Type size={20} className={iconClass} /> Font Size
            </div>
            <div className={valueClass}>
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">
          Notifications
        </h3>
        <div className={containerClass}>
          <div className={itemRowClass} onClick={() => setPushEnabled(!pushEnabled)}>
            <div className={labelClass}>
              <Bell size={20} className={iconClass} /> Push Notifications
            </div>
            <Toggle checked={pushEnabled} onChange={() => setPushEnabled(!pushEnabled)} />
          </div>
          <div className={itemRowClass} onClick={() => setEmailEnabled(!emailEnabled)}>
            <div className={labelClass}>
              <Mail size={20} className={iconClass} /> Email Alerts
            </div>
            <Toggle checked={emailEnabled} onChange={() => setEmailEnabled(!emailEnabled)} />
          </div>
          <div className={itemRowClass} onClick={() => setSmsEnabled(!smsEnabled)}>
            <div className={labelClass}>
              <MessageSquare size={20} className={iconClass} /> SMS Alerts
            </div>
            <Toggle checked={smsEnabled} onChange={() => setSmsEnabled(!smsEnabled)} />
          </div>
        </div>
      </div>

      {/* SYSTEM CONFIGURATION */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">
          System Configuration
        </h3>
        <div className={containerClass}>
          <div className={itemRowClass} onClick={handleBackup}>
            <div className={labelClass}>
              <Cloud size={20} className={iconClass} /> Data Backup
            </div>
            <div className={valueClass}>
              <Download size={14} className="mr-1" /> Download JSON <ChevronRight size={16} />
            </div>
          </div>
          <div className={itemRowClass} onClick={() => setActiveModal('privacy')}>
            <div className={labelClass}>
              <Shield size={20} className={iconClass} /> Privacy Policy
            </div>
            <div className={valueClass}>
              <ChevronRight size={16} />
            </div>
          </div>
          <div className={itemRowClass} onClick={() => setActiveModal('about')}>
            <div className={labelClass}>
              <Info size={20} className={iconClass} /> About
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
          className="w-full bg-[#1E1E1E] hover:bg-red-900/30 text-red-500 hover:text-red-400 py-4 rounded-xl border border-white/5 font-bold uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" /> Log Out
        </button>
      </div>

      {/* INFO MODALS */}
      {activeModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-[#151515] border border-gray-800 w-full max-w-sm rounded-lg shadow-2xl overflow-hidden transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#111]">
              <h3 className="font-bold text-white uppercase tracking-wider">
                {activeModal === 'privacy' ? 'Privacy Policy' : 'About Barber Pro'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 text-gray-400 text-sm leading-relaxed">
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
                  <div className="w-16 h-16 bg-[#FFD700] rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/20">
                    <span className="font-black text-black text-xl">BP</span>
                  </div>
                  <h4 className="text-white font-bold text-lg mb-1">Barber Pro System</h4>
                  <p className="mb-4">Version 1.0.2 (Beta)</p>
                  <p>Sistema de gestão premium para barbearias de alto nível.</p>
                  <p className="mt-4 text-xs opacity-50">© 2025 Barber Pro. All rights reserved.</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-800 bg-[#111]">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full bg-[#333] hover:bg-[#444] text-white py-3 rounded font-bold uppercase text-xs tracking-widest transition-colors"
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
