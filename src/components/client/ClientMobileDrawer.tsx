import React, { useState } from 'react';
import { X, User, Settings, LogOut, Bell, HelpCircle } from 'lucide-react';
import { ClientProfile } from '../../types';

interface ClientMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientProfile;
  onLogout: () => void;
  onUpdateProfile: (data: Partial<ClientProfile>) => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

export const ClientMobileDrawer: React.FC<ClientMobileDrawerProps> = ({
  isOpen,
  onClose,
  client,
  onLogout,
  onUpdateProfile,
  onOpenNotifications,
  onOpenProfile,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop (Invisible but clickable to close) */}
      <div className="fixed inset-0 z-[60]" onClick={onClose}></div>

      {/* Floating Command Panel */}
      <div
        className="fixed top-20 right-4 w-72 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[70] origin-top-right animate-[scaleIn_0.2s_ease-out] flex flex-col overflow-hidden"
        style={{ animationName: 'scaleIn' }}
      >
        <style>{`
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9) translateY(-10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Glow Effect */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-yellow via-neon-orange to-neon-yellow opacity-50"></div>

        {/* Compact User Info */}
        <div className="p-4 bg-white/5 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black border border-white/10 overflow-hidden flex-shrink-0">
            {client.photoUrl ? (
              <img src={client.photoUrl} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <User size={18} />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold truncate text-sm leading-tight">{client.name}</p>
            <p className="text-[10px] text-gray-500 font-mono tracking-wider">
              ID: {client.id.substring(0, 6)}
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2 space-y-1">
          {/* Edit Profile / Settings */}
          <button
            onClick={() => {
              onClose();
              onOpenProfile();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors group"
          >
            <Settings
              size={18}
              className="text-gray-500 group-hover:text-neon-yellow transition-colors"
            />
            <span className="font-bold text-xs uppercase tracking-wide">Configurar Conta</span>
          </button>

          {/* Support */}
          <button
            onClick={() => window.open('https://wa.me/5519991611609', '_blank')}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors group"
          >
            <HelpCircle
              size={18}
              className="text-gray-500 group-hover:text-neon-yellow transition-colors"
            />
            <span className="font-bold text-xs uppercase tracking-wide">Suporte WhatsApp</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="p-2 border-t border-white/5 bg-black/20">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold uppercase text-[10px] tracking-widest border border-red-500/10 hover:border-red-500"
          >
            <LogOut size={14} /> Desconectar
          </button>
        </div>
      </div>
    </>
  );
};
