import React from 'react';
import { BookingData, ServiceItem } from '../../types';
import { Star, Calendar, Clock, Banknote } from 'lucide-react';

interface TicketCardProps {
  data: BookingData;
  service?: ServiceItem;
  ticketId: string;
  rating?: number;
  serviceCount?: number;
  className?: string;
}

type Tier = 'SILVER' | 'GOLD' | 'PLATINUM';

const getTier = (count: number): Tier => {
  if (count <= 5) return 'SILVER';
  if (count <= 10) return 'GOLD';
  return 'PLATINUM';
};

// Premium Metallic Colors + Custom Texture Images
// Typography: Montserrat/Inter recommended
// Colors optimized for metallic backgrounds per ChatGPT analysis

// Helper function to get background image with fallback formats
const getTextureUrl = (basePath: string) => {
  // Try png first, then jpg - browser will use whichever exists
  return `url(${basePath}.png), url(${basePath}.jpg)`;
};

const TIER_STYLES = {
  SILVER: {
    // Images for custom textures (place in /public/textures/) - supports .png or .jpg
    headerImage: '/textures/silver-header',
    bodyImage: '/textures/silver-body',
    // Premium color palette for silver
    gradient: 'bg-gradient-to-br from-[#C0C0C0] via-[#E8E8E8] to-[#A8A9AD]',
    border: 'border-[#A8A9AD]',
    // Text colors - MUCH DARKER for readability on silver
    textMain: 'text-[#0A0A0A]', // Títulos - preto forte
    textSoft: 'text-[#2A2A2A]', // Labels - cinza muito escuro
    textMuted: 'text-[#4A4A4A]', // Texto secundário
    accent: 'text-[#000000]', // Valores - preto puro
    icon: 'text-[#1A1A1A]', // Ícones - quase preto
    shadow: 'shadow-xl',
    // Header - preto grafite elegante
    headerBg: 'bg-gradient-to-r from-[#2E2E2E] to-[#1A1A1A]',
    headerBorder: 'border-[#3A3A3A]',
    headerText: 'text-white',
    cutoutBg: '#0a0a0a',
    infoBox: 'bg-black/5 border-[#5A5A5A]/20',
    divider: 'border-[#5A5A5A]/40',
    // Badge - grafite escuro premium
    tierBadge: 'bg-gradient-to-r from-[#2E2E2E] to-[#1A1A1A]',
    tierBadgeText: 'text-[#E5E5E5]',
    starColor: '#CFCFCF',
    shine: 'from-transparent via-white/20 to-transparent',
  },
  GOLD: {
    headerImage: '/textures/gold-header',
    bodyImage: '/textures/gold-body',
    gradient: 'bg-gradient-to-br from-[#BF953F] via-[#FCF6BA] to-[#B38728]',
    border: 'border-[#D4AF37]',
    textMain: 'text-[#3D2914]',
    textSoft: 'text-[#5C4033]',
    textMuted: 'text-[#7A5A3D]',
    accent: 'text-[#2A1A0A]',
    icon: 'text-[#5C4033]',
    shadow: 'shadow-xl',
    headerBg: 'bg-gradient-to-r from-[#2C1810] to-[#1A0F0A]',
    headerBorder: 'border-[#4A3020]',
    headerText: 'text-[#D4AF37]',
    cutoutBg: '#0a0a0a',
    infoBox: 'bg-black/5 border-[#AA771C]/20',
    divider: 'border-[#AA771C]/40',
    tierBadge: 'bg-gradient-to-r from-[#8B6914] to-[#6B4F0A]',
    tierBadgeText: 'text-[#FFE5A0]',
    starColor: '#FFD700',
    shine: 'from-transparent via-white/15 to-transparent',
  },
  PLATINUM: {
    headerImage: '/textures/platinum-header',
    bodyImage: '/textures/platinum-body',
    gradient: 'bg-gradient-to-br from-[#E5E4E2] via-[#FFFFFF] to-[#BCC6CC]',
    border: 'border-[#BCC6CC]',
    textMain: 'text-[#1A1A2E]',
    textSoft: 'text-[#4A5568]',
    textMuted: 'text-[#718096]',
    accent: 'text-[#0F0F1A]',
    icon: 'text-[#4A5568]',
    shadow: 'shadow-xl',
    headerBg: 'bg-gradient-to-r from-[#1A1A2E] to-[#0F0F1A]',
    headerBorder: 'border-[#2D3748]',
    headerText: 'text-white',
    cutoutBg: '#0a0a0a',
    infoBox: 'bg-black/5 border-[#4A5568]/20',
    divider: 'border-[#4A5568]/40',
    tierBadge: 'bg-gradient-to-r from-[#2D3748] to-[#1A202C]',
    tierBadgeText: 'text-[#E2E8F0]',
    starColor: '#E2E8F0',
    shine: 'from-transparent via-white/25 to-transparent',
  },
};

export const TicketCard: React.FC<TicketCardProps> = ({
  data,
  service,
  ticketId,
  rating = 1,
  serviceCount,
  className,
}) => {
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const count = serviceCount !== undefined ? serviceCount : rating || 1;
  const tier = getTier(count);
  const styles = TIER_STYLES[tier];

  const handleFlip = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsFlipped(!isFlipped);
    setTimeout(() => setIsAnimating(false), 700);
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };

  const getShortName = (name: string) => {
    const parts = name?.split(' ') || ['Cliente'];
    return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
  };

  const resolveServiceName = (name: string) => {
    let clean = name.replace(/ \+ /g, '+');
    if (clean.length > 18) {
      clean = clean
        .split('+')
        .map(part => (part.length > 5 ? part.slice(0, 4) : part))
        .join('+');
    }
    return clean;
  };

  return (
    <div
      className={`relative w-full mx-auto cursor-pointer select-none ${
        className || 'max-w-[340px]'
      }`}
      onClick={handleFlip}
      style={{ perspective: '1000px' }}
    >
      {/* 3D Flip Container */}
      <div
        className="relative w-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ========== FRONT FACE ========== */}
        <div
          className={`relative rounded-[20px] ${styles.shadow} ring-1 ${styles.border}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Metallic Body */}
          <div className={`${styles.gradient} rounded-[20px] p-[2px]`}>
            <div className="bg-[#0f0f0f] rounded-[18px] overflow-hidden">
              {/* Header with Texture Image */}
              <div
                className={`${styles.headerBg} px-4 py-3 flex items-center justify-between border-b ${styles.headerBorder} relative overflow-hidden`}
                style={{
                  backgroundImage: getTextureUrl(styles.headerImage),
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="flex items-center gap-2 relative z-10">
                  <span className="font-graffiti text-lg tracking-wider text-yellow-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    TRILHA<span className="text-white/80">CARD</span>
                  </span>
                </div>
                <span className="font-mono text-[10px] text-white/50 tracking-widest relative z-10">
                  {ticketId}
                </span>
              </div>

              {/* Body with Texture Image */}
              <div
                className={`${styles.gradient} p-4 space-y-3`}
                style={{
                  backgroundImage: getTextureUrl(styles.bodyImage),
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Client + Tier Badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-black/70">
                      Cliente
                    </span>
                    <h2
                      className="text-2xl font-bold uppercase tracking-wide text-black"
                      style={{ fontFamily: "'Inter', 'Montserrat', sans-serif" }}
                    >
                      {getShortName(data.name)}
                    </h2>
                  </div>
                  {/* Premium Badge */}
                  <div
                    className={`${styles.tierBadge} px-2 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold`}
                  >
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={10} fill={styles.starColor} stroke="none" />
                    ))}
                    <span className={`ml-1 uppercase tracking-wider ${styles.tierBadgeText}`}>
                      {tier}
                    </span>
                  </div>
                </div>

                {/* Service */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-black/70">
                    Serviço
                  </span>
                  <p
                    className="text-lg font-bold uppercase text-black"
                    style={{ fontFamily: "'Inter', 'Montserrat', sans-serif" }}
                  >
                    {resolveServiceName(service?.name || 'Corte')}
                  </p>
                </div>

                {/* Perforation Line */}
                <div className="relative flex items-center py-1">
                  <div
                    className="absolute -left-6 w-4 h-4 rounded-full"
                    style={{ backgroundColor: styles.cutoutBg }}
                  />
                  <div className={`flex-1 border-t-2 border-dashed ${styles.divider}`} />
                  <div
                    className="absolute -right-6 w-4 h-4 rounded-full"
                    style={{ backgroundColor: styles.cutoutBg }}
                  />
                </div>

                {/* Bottom Info Grid - LARGER text and icons */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase block text-black/70">
                      <Calendar size={14} className="inline mr-1" />
                      Data
                    </span>
                    <span className="font-mono text-base font-bold text-black">
                      {formatDate(data.date)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase block text-black/70">
                      <Clock size={14} className="inline mr-1" />
                      Horário
                    </span>
                    <span className="font-mono text-base font-bold text-black">
                      {data.time || '10:00'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase block text-black/70">
                      <Banknote size={14} className="inline mr-1" />
                      Valor
                    </span>
                    <span className="font-mono text-base font-bold text-black">
                      {formatPrice(service?.priceValue || 35)
                        .replace('R$', '')
                        .trim()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== BACK FACE ========== */}
        <div
          className={`absolute inset-0 rounded-[20px] ${styles.shadow} ring-1 ${styles.border}`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className={`${styles.gradient} rounded-[20px] p-[2px] h-full`}>
            <div className="bg-[#0f0f0f] rounded-[18px] overflow-hidden h-full flex flex-col">
              {/* Header with Texture Image - SAME SIZE AS FRONT (py-3) */}
              <div
                className={`${styles.headerBg} px-4 py-3 flex items-center justify-center border-b ${styles.headerBorder}`}
                style={{
                  backgroundImage: getTextureUrl(styles.headerImage),
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <span className="font-graffiti text-lg tracking-widest text-yellow-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  REGRAS & POLÍTICA
                </span>
              </div>

              {/* Body with Texture */}
              <div
                className={`${styles.gradient} p-4 space-y-3 h-full flex flex-col`}
                style={{
                  backgroundImage: getTextureUrl(styles.bodyImage),
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Cancelamento - ABOVE perforation - Matches Front Top Height */}
                <div className="bg-black/90 border border-white/20 rounded-lg p-2 text-center h-[125px] flex flex-col justify-center items-center">
                  <p className="text-[9px] font-bold uppercase tracking-widest mb-1 text-white">
                    Cancelamento
                  </p>
                  <p
                    className="text-[12px] font-medium text-white"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Deve ser feito com no mínimo
                    <br />
                    <span className="text-[15px] font-black text-white tracking-wide block py-1">
                      30 minutos
                    </span>
                    de antecedência
                  </p>
                </div>

                {/* Perforation Line - ALIGNED WITH FRONT */}
                <div className="relative flex items-center py-1 shrink-0">
                  <div
                    className="absolute -left-6 w-4 h-4 rounded-full"
                    style={{ backgroundColor: styles.cutoutBg }}
                  />
                  <div className={`flex-1 border-t-2 border-dashed ${styles.divider}`} />
                  <div
                    className="absolute -right-6 w-4 h-4 rounded-full"
                    style={{ backgroundColor: styles.cutoutBg }}
                  />
                </div>

                {/* Penalidades - BELOW perforation - Matches Front Bottom Height */}
                <div className="flex-1 flex flex-col justify-start pt-1">
                  <div className="bg-black/90 border border-white/15 rounded px-2 py-2 text-center">
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-white mb-1">
                        Penalidades
                      </p>
                      <p
                        className="text-[11px] font-medium text-white leading-tight"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        O não cumprimento acarretará na perda de pontos.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center pt-1 shrink-0">
                  <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/60">
                    Trilha do Corte ®
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
