import React from 'react';
import {
  User,
  Settings,
  LogOut,
  HelpCircle,
  ChevronRight,
  Calculator,
  Sparkles,
} from 'lucide-react';
import { ClientProfile } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

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
  onOpenProfile,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-20 right-4 z-70 w-80"
          >
            {/* Main Card with Glassmorphism */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f]/90 backdrop-blur-xl shadow-2xl shadow-black/50 ring-1 ring-white/5">
              {/* Decorative Glows */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-purple/20 rounded-full blur-[50px] pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-neon-yellow/10 rounded-full blur-[50px] pointer-events-none" />

              {/* Profile Header Section */}
              <div className="relative p-6 pb-6 text-center border-b border-white/5 bg-linear-to-b from-white/5 to-transparent">
                {/* Avatar with Animated Ring */}
                <div
                  className="relative mx-auto w-20 h-20 mb-3 group cursor-pointer"
                  onClick={onOpenProfile}
                >
                  <div className="absolute inset-0 rounded-full bg-linear-to-tr from-neon-yellow via-white to-neon-purple opacity-75 blur-md group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow" />
                  <div className="relative w-full h-full rounded-full border-2 border-white/20 p-1 bg-black overflow-hidden">
                    {client.photoUrl ? (
                      <img
                        src={client.photoUrl}
                        className="w-full h-full object-cover rounded-full"
                        alt={client.name}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900 rounded-full">
                        <User className="w-8 h-8 text-white/50" />
                      </div>
                    )}
                  </div>
                  {/* Edit Badge */}
                  <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-neon-yellow text-black shadow-lg shadow-neon-yellow/50">
                    <Settings defaultValue={12} size={12} strokeWidth={3} />
                  </div>
                </div>

                {/* Name & Stats */}
                <h3 className="text-lg font-bold text-white tracking-wide mb-1 font-sans">
                  {client.name}
                </h3>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-neon-purple tracking-widest flex items-center gap-1">
                    <Sparkles size={10} />
                    ID:{' '}
                    {client.publicId
                      ? `#${String(client.publicId).padStart(4, '0')}`
                      : client.id?.substring(0, 6) || '---'}
                  </span>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="p-2 space-y-1">
                <MenuItem
                  icon={User}
                  label="Configurar Perfil"
                  subLabel="Dados pessoais e preferências"
                  onClick={() => {
                    onClose();
                    onOpenProfile();
                  }}
                />

                <MenuItem
                  icon={HelpCircle}
                  label="Suporte WhatsApp"
                  subLabel="Fale com nosso time"
                  onClick={() => window.open('https://wa.me/5519991611609', '_blank')}
                  variant="muted"
                />
              </div>

              {/* Footer / Logout */}
              <div className="p-2 mt-2 border-t border-white/5 bg-black/20">
                <button
                  onClick={onLogout}
                  className="w-full group flex items-center justify-between p-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform">
                      <LogOut size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-red-400 uppercase tracking-wider group-hover:text-red-300 transition-colors">
                        Desconectar
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Helper Component for Menu Items
interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  subLabel?: string;
  onClick: () => void;
  variant?: 'default' | 'muted';
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon: Icon,
  label,
  subLabel,
  onClick,
  variant = 'default',
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <div
          className={`
          p-2 rounded-lg transition-colors duration-300
          ${
            variant === 'default'
              ? 'bg-neon-yellow/10 text-neon-yellow group-hover:bg-neon-yellow group-hover:text-black'
              : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'
          }
        `}
        >
          <Icon size={18} />
        </div>
        <div className="text-left">
          <p
            className={`
            text-sm font-bold tracking-wide transition-colors
            ${variant === 'default' ? 'text-white' : 'text-gray-400 group-hover:text-white'}
          `}
          >
            {label}
          </p>
          {subLabel && (
            <p className="text-[10px] text-gray-500 font-medium group-hover:text-gray-400">
              {subLabel}
            </p>
          )}
        </div>
      </div>
      <ChevronRight
        size={14}
        className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all"
      />
    </button>
  );
};
