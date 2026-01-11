import React from 'react';
import { Bot } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDanger = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto">
      <div className="w-full max-w-sm bg-(--bg-card) border border-(--border-color) rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
        {/* Decorative Top Line */}
        <div
          className={`h-1 w-full ${
            isDanger
              ? 'bg-linear-to-r from-red-600 via-orange-500 to-red-600'
              : 'bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600'
          }`}
        ></div>

        <div className="p-6 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {isDanger ? (
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                <Bot size={32} className="text-red-500 animate-pulse" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <Bot size={32} className="text-cyan-600 dark:text-cyan-400" />
              </div>
            )}
          </div>

          <h3 className="text-xl font-black text-(--text-primary) uppercase tracking-wider mb-2">
            {title}
          </h3>

          <div className="text-(--text-secondary) text-sm font-bold leading-relaxed mb-6">
            {message}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="py-3 rounded-xl bg-(--bg-secondary) text-(--text-secondary) font-bold uppercase text-xs tracking-widest hover:bg-(--bg-primary) hover:text-(--text-primary) transition-colors border border-transparent hover:border-(--border-color)"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`py-3 rounded-xl font-bold uppercase text-xs tracking-widest text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2
                ${
                  isDanger
                    ? 'bg-linear-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                    : 'bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
