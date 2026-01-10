import React from 'react';
import { X, MessageCircle, Link, Copy, Check } from 'lucide-react';
import { Client } from '../../types';
import { generateWhatsAppLink } from '../../utils/whatsappUtils';

interface InviteClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
}

export const InviteClientModal: React.FC<InviteClientModalProps> = ({
  isOpen,
  onClose,
  client,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  // Generate Magic Link (Mock for now, pointing to register with params)
  // In production: https://app.trilhadocorte.com/login?action=register&name=...
  const magicLink = `${window.location.origin}/login?action=register&name=${encodeURIComponent(
    client.name
  )}&phone=${encodeURIComponent(client.phone)}`;

  const message = `Olá ${client.name}! ✂️\n\nAqui é da Trilha do Corte. Seu pré-cadastro foi feito com sucesso.\n\nClique no link abaixo para finalizar seu cadastro e ter acesso exclusivo aos horários:\n\n${magicLink}`;

  const handleSendWhatsApp = () => {
    // If phone is invalid/placeholder, send empty string to let user choose contact
    const cleanPhone = client.phone?.replace(/\D/g, '') || '';
    const isValidPhone = cleanPhone.length >= 10 && !cleanPhone.match(/^0+$/);

    const link = generateWhatsAppLink(isValidPhone ? client.phone : '', message);
    window.open(link, '_blank');
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(magicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[var(--bg-card)] w-full max-w-sm rounded-2xl border border-neon-yellow/30 p-6 shadow-[0_0_50px_rgba(227,253,0,0.15)] relative transition-colors duration-300">
        {/* Header */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-neon-yellow/10 rounded-full flex items-center justify-center mb-4 border border-neon-yellow/20 shadow-[0_0_20px_rgba(227,253,0,0.2)]">
            <Link size={32} className="text-neon-yellow" />
          </div>
          <h2 className="text-2xl font-graffiti text-[var(--text-primary)] uppercase leading-none">
            Formalizar <span className="text-neon-yellow">Cliente</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest mt-2">
            Envie o convite para {client.name}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleSendWhatsApp}
            className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-black font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-lg active:scale-95"
          >
            <MessageCircle size={22} fill="currentColor" />
            Enviar no WhatsApp
          </button>

          <div className="relative group">
            <div className="absolute inset-0 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]"></div>
            <div className="relative flex items-center justify-between p-4">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">
                  Link Mágico
                </p>
                <p className="text-xs text-[var(--text-primary)] truncate font-mono select-all">
                  {magicLink}
                </p>
              </div>
              <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--border-color)] text-center">
          <p className="text-[10px] text-[var(--text-secondary)] max-w-[200px] mx-auto leading-relaxed">
            Ao clicar no link, o cliente poderá definir senha e confirmar seus dados.
          </p>
        </div>
      </div>
    </div>
  );
};
