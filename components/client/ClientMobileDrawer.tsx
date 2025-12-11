import React, { useState } from 'react';
import { X, User, Settings, LogOut, Bell, Moon, Sun, Monitor, HelpCircle } from 'lucide-react';
import { ClientProfile } from '../../types';

interface ClientMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientProfile;
  onLogout: () => void;
  onUpdateProfile: (data: Partial<ClientProfile>) => void;
  onOpenNotifications: () => void;
}

import { ClientProfileSettings } from './ClientProfileSettings';

export const ClientMobileDrawer: React.FC<ClientMobileDrawerProps> = ({
  isOpen,
  onClose,
  client,
  onLogout,
  onUpdateProfile,
  onOpenNotifications,
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <ClientProfileSettings
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        client={client}
        onSave={onUpdateProfile}
      />

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-[80%] max-w-[300px] bg-[#111] border-l border-white/10 z-[70] animate-[slideLeft_0.3s_ease-out] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-white font-graffiti text-xl">
            Menu <span className="text-neon-yellow">Trilha</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Profile Snippet */}
        <div className="p-6 bg-white/5 mx-4 mt-4 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-neon-yellow/10 flex items-center justify-center text-neon-yellow border border-neon-yellow/20 overflow-hidden">
            {client.photoUrl ? (
              <img src={client.photoUrl} className="w-full h-full object-cover" />
            ) : (
              <User size={24} />
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-white font-bold truncate">{client.name}</p>
            <p className="text-xs text-gray-500 font-mono">ID: {client.id.substring(0, 8)}</p>
          </div>
        </div>

        {/* Options */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 mt-2">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
          >
            <User size={20} />
            <span className="font-bold text-sm uppercase tracking-wide">Meu Perfil</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenNotifications();
            }}
            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
          >
            <Bell size={20} />
            <span className="font-bold text-sm uppercase tracking-wide">Notificações</span>
            <span className="ml-auto bg-neon-orange text-black text-[10px] font-black px-1.5 py-0.5 rounded">
              New
            </span>
          </button>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
          >
            <Settings size={20} />
            <span className="font-bold text-sm uppercase tracking-wide">Configurações</span>
          </button>

          <button
            onClick={() => window.open('https://wa.me/5519991611609', '_blank')}
            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
          >
            <HelpCircle size={20} />
            <span className="font-bold text-sm uppercase tracking-wide">Suporte WhatsApp</span>
          </button>

          {/* Removed Broken Theme Selector */}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-bold uppercase text-sm"
          >
            <LogOut size={18} /> Sair do App
          </button>
          <p className="text-center text-[9px] text-gray-600 mt-4 font-mono">
            v4.1.0 (Trilha Experience)
          </p>
        </div>
      </div>
    </>
  );
};
