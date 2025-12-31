import React from 'react';
import { AlertCircle, X, Check, Bot } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-200 relative">
        {/* Decorative Top Line */}
        <div
          className={`h-1 w-full ${
            isDanger
              ? 'bg-gradient-to-r from-red-600 via-orange-500 to-red-600'
              : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600'
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
                <Bot size={32} className="text-cyan-400" />
              </div>
            )}
          </div>

          <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">{title}</h3>

          <div className="text-gray-400 text-sm font-bold leading-relaxed mb-6">{message}</div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="py-3 rounded-xl bg-[#1A1A1A] text-gray-400 font-bold uppercase text-xs tracking-widest hover:bg-[#252525] hover:text-white transition-colors border border-transparent hover:border-gray-700"
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
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
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
