import React from 'react';
import { X, MessageCircle, Link, Copy, Check, Gift, Star, Sparkles, Crown } from 'lucide-react';
import { Client } from '../../types';
import { generateWhatsAppLink } from '../../utils/whatsappUtils';
import { WhatsAppLogo } from '../icons/WhatsAppLogo';

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

  // Generate Magic Link with pre-filled data
  const magicLink = `${window.location.origin}/login?action=register&name=${encodeURIComponent(
    client.name
  )}&phone=${encodeURIComponent(client.phone || '')}`;

  // 🎯 MENSAGEM PREMIUM PADRONIZADA - Texto vendedor e chamativo
  const message = `🔥 *Fala, ${client.name}!* ✂️

Aqui é da *Trilha do Corte* — seu próximo corte já está na agenda! 💈

Mas olha só... você ainda não finalizou seu cadastro VIP e pode estar *perdendo vantagens exclusivas*:

✨ *Sistema de Pontos* — A cada 10 cortes, 1 na faixa!
🎁 *Promoções Exclusivas* — Só pra quem é cadastrado
👑 *Trilha Card* — Seu cartão de fidelidade digital
📱 *Agendamento Fácil* — Reserve horários pelo app

👉 *Finalize agora em 30 segundos:*
${magicLink}

Bora fechar esse cadastro e garantir suas vantagens? 🚀

— *Trilha do Corte* 💈`;

  const handleSendWhatsApp = () => {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] w-full max-w-md rounded-2xl border border-green-500/30 p-6 shadow-[0_0_50px_rgba(34,197,94,0.15)] relative overflow-hidden">
        {/* Decorative Glows */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all z-10"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="relative flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,197,94,0.4)] rotate-3">
            <WhatsAppLogo size={40} className="text-white -rotate-3" />
          </div>
          <h2 className="text-2xl font-graffiti text-white uppercase leading-none">
            Formalizar <span className="text-green-400">Cliente</span>
          </h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">
            Convide {client.name.split(' ')[0]} para o VIP
          </p>
        </div>

        {/* Benefits Preview */}
        <div className="bg-white/5 rounded-xl p-4 mb-5 border border-white/10">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-3 text-center">
            O cliente terá acesso a:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-xs">
              <Star size={14} className="text-yellow-400" />
              <span className="text-gray-300">Sistema de Pontos</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Gift size={14} className="text-pink-400" />
              <span className="text-gray-300">Promoções VIP</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Crown size={14} className="text-purple-400" />
              <span className="text-gray-300">Trilha Card</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Sparkles size={14} className="text-cyan-400" />
              <span className="text-gray-300">App Exclusivo</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleSendWhatsApp}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 transition-all shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:shadow-[0_0_35px_rgba(34,197,94,0.5)] active:scale-[0.98]"
          >
            <WhatsAppLogo size={24} className="text-white" />
            Enviar Convite VIP
          </button>

          {/* Magic Link Section */}
          <div className="relative">
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-[10px] uppercase font-bold text-gray-500 mb-1 flex items-center gap-1">
                    <Link size={10} />
                    Link de Cadastro
                  </p>
                  <p className="text-[11px] text-gray-400 truncate font-mono select-all">
                    {magicLink}
                  </p>
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`p-2.5 rounded-lg transition-all ${
                    copied
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-5 pt-4 border-t border-white/10 text-center">
          <p className="text-[10px] text-gray-500 leading-relaxed max-w-[280px] mx-auto">
            O cliente receberá uma mensagem convidando-o a finalizar o cadastro. Após confirmar, ele
            terá acesso completo ao sistema de fidelidade.
          </p>
        </div>
      </div>
    </div>
  );
};
