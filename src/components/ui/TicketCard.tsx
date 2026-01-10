import React from 'react';
import { BookingData, ServiceItem } from '../../types';
import { Star, Calendar, Clock, Banknote } from 'lucide-react';

interface TicketCardProps {
  data: BookingData;
  service?: ServiceItem;
  ticketId: string;
  rating?: number; // Kept for backward compatibility, serves as serviceCount proxy if needed
  serviceCount?: number; // New prop for explicit tier logic
  className?: string;
}

type Tier = 'SILVER' | 'GOLD' | 'PLATINUM';

const getTier = (count: number): Tier => {
  if (count <= 5) return 'SILVER';
  if (count <= 10) return 'GOLD';
  return 'PLATINUM';
};

const TIER_STYLES = {
  SILVER: {
    gradient: 'bg-linear-to-br from-[#E2E4E9] via-[#F3F4F6] to-[#9CA3AF]', // Brighter silver body
    border: 'border-white/60', // Sharper border
    // CHANGED: Jet Black for maximum contrast
    textMain: 'text-black',
    textSoft: 'text-[#374151]',
    textMuted: 'text-[#4B5563]',
    accent: 'text-[#111827]',
    icon: 'text-[#1F2937]',
    shadow: 'shadow-[0_4px_10px_rgba(0,0,0,0.15)]', // Tighter shadow
    // CHANGED: Clean Dark Header
    headerBg: 'bg-[#111]',
    headerBorder: 'border-white/10',
    headerText: 'text-white font-bold tracking-[0.2em]',
    headerTexture: 'opacity-0', // REMOVED texture for clean look
    headerTextureColor: '#FFFFFF',
    textureOverlay: 'bg-transparent', // REMOVED overlay
    cutoutBorder: 'border-gray-400/50',
    infoBox: 'bg-black/5 border-black/10',
    divider: 'bg-black/10',
  },
  GOLD: {
    gradient: 'bg-linear-to-br from-[#E0B65C] via-[#FDE68A] to-[#8C6A1E]',
    border: 'border-[#FFD777]/80',
    // CHANGED: Dark Brown/Bronze for contrast on Gold
    textMain: 'text-[#422006]', // Deep bronze
    textSoft: 'text-[#713F12]',
    textMuted: 'text-[#854D0E]',
    accent: 'text-[#A16207]',
    icon: 'text-[#854D0E]',
    shadow: 'shadow-[0_10px_28px_rgba(0,0,0,0.45)]',
    // Black Gold Header (Keep dark, text is already bright gold)
    headerBg: 'bg-linear-to-b from-[#141414] to-[#1F1F1F]',
    headerBorder: 'border-[rgba(255,215,119,0.35)]',
    headerText: 'text-[#FDE68A] drop-shadow-[0_2px_0_rgba(0,0,0,1)]',
    headerTexture: 'opacity-[0.04]', // 4% Grid
    headerTextureColor: '#FDE68A',
    textureOverlay: 'bg-[#FFD700]/10',
    cutoutBorder: 'border-[#FFD777]/60',
    infoBox: 'bg-[#2a1e0b]/90 border-[#b88a44]',
    divider: 'bg-[#713F12]/40',
  },
  PLATINUM: {
    gradient: 'bg-linear-to-br from-[#E5E7EB] via-[#F9FAFB] to-[#6B7280]',
    border: 'border-white/45',
    // CHANGED: Dark Slate for contrast on Platinum/White
    textMain: 'text-[#0F172A]', // Dark Slate
    textSoft: 'text-[#334155]',
    textMuted: 'text-[#475569]',
    accent: 'text-[#3B82F6]', // Blue accent
    icon: 'text-[#334155]',
    shadow: 'shadow-[0_12px_30px_rgba(0,0,0,0.55)]',
    // Dark Titanium Header (Keep dark)
    headerBg: 'bg-linear-to-b from-[#0F172A] to-[#111827]',
    headerBorder: 'border-[rgba(147,197,253,0.35)]',
    headerText:
      'text-transparent bg-clip-text bg-linear-to-b from-white via-[#93C5FD] to-[#3B82F6] drop-shadow-[0_2px_4px_rgba(59,130,246,0.5)]',
    headerTexture: 'opacity-[0.05]',
    headerTextureColor: '#93C5FD',
    textureOverlay: 'bg-[#93C5FD]/5',
    cutoutBorder: 'border-[#93C5FD]/40',
    infoBox: 'bg-[#0f172a]/90 border-[#1e293b]',
    divider: 'bg-[#334155]/20',
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

  // Determine Tier: Use serviceCount if available, otherwise fallback to rating logic or default
  // User logic: 1-5 Silver, 6-10 Gold, 11+ Platinum
  // If serviceCount is not passed, we default to 1 (Silver)
  const count = serviceCount !== undefined ? serviceCount : rating || 1;
  const tier = getTier(count);
  const styles = TIER_STYLES[tier];

  const handleFlip = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsFlipped(!isFlipped);
    setTimeout(() => setIsAnimating(false), 750); // Keep debounce to prevent spam
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year.slice(-2)}`;
  };
  // Helper to shorten names to avoid layout overflow
  const resolveServiceName = (name: string) => {
    let clean = name.replace(/ \+ /g, '+'); // "Corte + Barba" -> "Corte+Barba"
    // If still too long, aggressively shorten words
    if (clean.length > 18) {
      clean = clean
        .split('+')
        .map(part => (part.length > 5 ? part.slice(0, 4) : part))
        .join('+');
    }
    return clean;
  };
  // PERSISTENT 3D WRAPPER
  const wrapperStyle: React.CSSProperties = {
    transformStyle: 'preserve-3d',
    perspective: '1000px',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
    transition: 'transform 0.7s cubic-bezier(0.4, 0.0, 0.2, 1)', // Smooth easing
  };

  // SIMPLIFIED FACES (Rely on backface-visibility: hidden)
  const frontFaceStyle: React.CSSProperties = {
    transform: 'rotateY(0deg)',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
    zIndex: 2,
    position: 'relative', // Relative to push height
    inset: 0,
  };

  const backFaceStyle: React.CSSProperties = {
    transform: 'rotateY(180deg)',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
    zIndex: 1,
    position: 'absolute',
    inset: 0,
  };

  return (
    <div
      className={`relative w-full mx-auto group font-sans cursor-pointer select-none ${
        className || 'max-w-[340px]'
      }`}
      onClick={handleFlip}
    >
      {/* Outer Glow - Tier Specific */}
      <div
        className={`absolute inset-0 rounded-[24px] transform scale-[0.98] pointer-events-none transition-opacity duration-500 z-0 ${
          isAnimating ? 'opacity-0' : 'opacity-100'
        } ${
          tier === 'GOLD'
            ? 'bg-[#F4D079]/10 shadow-[0_0_20px_rgba(244,208,121,0.2)]'
            : tier === 'PLATINUM'
            ? 'bg-[#93C5FD]/10 shadow-[0_0_20px_rgba(147,197,253,0.2)]'
            : 'shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)]' // Clean shadow for silver
        }`}
      ></div>

      {/* FLIP INNER CONTAINER */}
      <div className="relative w-full z-10" style={wrapperStyle}>
        {/* ================= FRONT FACE ================= */}
        <div
          className={`block ring-1 rounded-[24px] ${styles.border} w-full`}
          style={frontFaceStyle}
        >
          {/* Main Card Frame */}
          <div
            className={`relative p-[2px] rounded-[24px] overflow-hidden ${styles.gradient} ${styles.shadow}`}
          >
            <div className="bg-[#141009] relative rounded-[22px] overflow-hidden flex flex-col h-auto backface-hidden antialiased transition-all duration-300">
              {/* Texture Layer */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <div className={`absolute inset-0 opacity-100 ${styles.gradient}`}></div>

                {/* Micro-noise REDUCED */}
                <div
                  className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/40 mix-blend-overlay"></div>
                {/* Specific Tier Overlay */}
                <div
                  className={`absolute inset-0 mix-blend-overlay ${styles.textureOverlay}`}
                ></div>
              </div>

              {/* HEADER TEXTURE & TITLE */}
              <div
                className={`relative z-10 h-14 w-full border-b shadow-md flex items-center justify-between px-5 ${styles.headerBg} ${styles.headerBorder}`}
              >
                {/* Subtle Grid Pattern */}
                <div
                  className={`absolute inset-0 ${styles.headerTexture}`}
                  style={{
                    backgroundImage: `radial-gradient(circle, ${styles.headerTextureColor} 1px, transparent 1px)`,
                    backgroundSize: '8px 8px',
                  }}
                ></div>

                <span className={`font-graffiti text-xl tracking-wider z-10 ${styles.headerText}`}>
                  TRILHA
                  <span className={`${tier === 'GOLD' ? 'text-[#fff]' : 'text-white'}`}>CARD</span>
                </span>
                <span
                  className={`font-mono font-bold text-xs tracking-widest z-10 ${styles.textMuted}`}
                >
                  {ticketId}
                </span>
              </div>

              {/* BODY - FRONT */}
              <div className="relative z-10 p-5 flex flex-col">
                <div className="flex flex-col gap-3">
                  {/* Block 1: Passenger */}
                  <div className="flex flex-col items-start relative">
                    <span
                      className={`text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 ml-1 opacity-80 ${styles.textSoft}`}
                    >
                      Passageiro
                    </span>
                    <h3
                      className={`text-3xl font-black uppercase tracking-wide leading-none ${styles.textMain}`}
                    >
                      {data.name?.split(' ')[0] || 'CARLOS'}
                      <span className={`ml-2 opacity-80 ${styles.textSoft}`}>
                        {data.name?.split(' ')?.[1]?.[0] || 'A'}.
                      </span>
                    </h3>
                  </div>

                  {/* Block 2: Service + Stars */}
                  <div className="flex flex-col items-start relative">
                    <span
                      className={`text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 ml-1 opacity-80 ${styles.textSoft}`}
                    >
                      Serviço
                    </span>

                    {(() => {
                      const finalName = resolveServiceName(service?.name || 'Corte');
                      const fontSize =
                        finalName.length > 16
                          ? 'text-sm'
                          : finalName.length > 10
                          ? 'text-base'
                          : 'text-xl';
                      return (
                        <h3
                          className={`${fontSize} font-black uppercase tracking-wide leading-none truncate whitespace-nowrap ${styles.textMain}`}
                          title={service?.name}
                        >
                          {finalName}
                        </h3>
                      );
                    })()}

                    {/* Stars / Tier Indicator */}
                    <div className="flex gap-1 mt-1.5 ml-0.5 items-center">
                      {/* Display stars if needed, or just Tier Name */}
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          size={12}
                          fill={
                            tier === 'GOLD'
                              ? '#854D0E' // Dark Bronze fill for Gold Card
                              : tier === 'SILVER'
                              ? '#374151' // Dark Gray fill for Silver Card
                              : '#334155' // Dark Slate fill for Platinum Card
                          }
                          className={
                            tier === 'GOLD'
                              ? 'text-[#854D0E]'
                              : tier === 'SILVER'
                              ? 'text-[#374151]'
                              : 'text-[#334155]'
                          }
                          strokeWidth={0}
                        />
                      ))}
                      <span
                        className={`ml-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${styles.border} ${styles.textSoft}`}
                      >
                        {tier}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div
                  className={`w-full h-[1px] my-2 shadow-[0_1px_0_rgba(255,255,255,0.2)] ${styles.divider}`}
                ></div>

                {/* Footer Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Date */}
                  <div className="flex flex-col">
                    <span
                      className={`text-[8px] font-black uppercase tracking-widest mb-0.5 flex items-center gap-1 opacity-90 ${styles.textSoft}`}
                    >
                      <Calendar size={10} strokeWidth={3} className={styles.icon} />
                      Data
                    </span>
                    <span
                      className={`font-mono text-sm font-bold drop-shadow-sm truncate pl-0.5 ${styles.textMain}`}
                    >
                      {formatDate(data.date)}
                    </span>
                  </div>

                  {/* Time */}
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-[8px] font-black uppercase tracking-widest mb-0.5 flex items-center gap-1 opacity-90 ${styles.textSoft}`}
                    >
                      <Clock size={10} strokeWidth={3} className={styles.icon} />
                      Horário
                    </span>
                    <span
                      className={`font-mono text-sm font-bold drop-shadow-sm pl-0.5 ${styles.textMain}`}
                    >
                      {data.time || '10:00'}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex flex-col items-end">
                    <span
                      className={`text-[8px] font-black uppercase tracking-widest mb-0.5 flex items-center gap-1 opacity-90 ${styles.textSoft}`}
                    >
                      Valor
                      <Banknote size={10} strokeWidth={3} className={`ml-1 ${styles.accent}`} />
                    </span>
                    <span
                      className={`font-mono text-base font-bold drop-shadow-sm pl-0.5 ${styles.textMain}`}
                    >
                      {formatPrice(service?.priceValue || 35)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cutouts */}
              <div
                className={`absolute -left-[10px] top-[calc(64px+80px)] w-5 h-5 bg-[#141009] rounded-full shadow-[inset_-1px_0_2px_rgba(0,0,0,0.5)] z-20 border-r ${styles.cutoutBorder}`}
              ></div>
              <div
                className={`absolute -right-[10px] top-[calc(64px+80px)] w-5 h-5 bg-[#141009] rounded-full shadow-[inset_1px_0_2px_rgba(0,0,0,0.5)] z-20 border-l ${styles.cutoutBorder}`}
              ></div>
            </div>
          </div>
        </div>

        {/* ================= BACK FACE ================= */}
        <div
          className={`block ring-1 rounded-[24px] ${styles.border} w-full h-full`}
          style={backFaceStyle}
        >
          <div
            className={`relative p-[3px] rounded-[24px] shadow-2xl overflow-hidden h-full ${styles.gradient}`}
          >
            <div className="bg-[#1a150c] relative rounded-[21px] overflow-hidden h-full flex flex-col backface-hidden antialiased">
              {/* Metallic Texture (Same as front) */}
              <div className="absolute inset-0 z-0 transform scale-x-[-1] pointer-events-none">
                <div className={`absolute inset-0 opacity-100 ${styles.gradient}`}></div>
                <div
                  className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/40 mix-blend-overlay"></div>
                {/* Specific Tier Overlay Back */}
                <div
                  className={`absolute inset-0 mix-blend-overlay ${styles.textureOverlay}`}
                ></div>
              </div>

              {/* HEADER TEXTURE & TITLE - BACK */}
              <div
                className={`relative z-10 h-14 w-full border-b shadow-md flex items-center justify-center shrink-0 ${styles.headerBg} ${styles.headerBorder}`}
              >
                {/* Subtle Grid Pattern */}
                {/* Subtle Grid Pattern */}
                <div
                  className={`absolute inset-0 ${styles.headerTexture}`}
                  style={{
                    backgroundImage: `radial-gradient(circle, ${styles.headerTextureColor} 1px, transparent 1px)`,
                    backgroundSize: '8px 8px',
                  }}
                ></div>

                <span className={`font-graffiti text-xl tracking-wider z-10 ${styles.headerText}`}>
                  REGRAS & <span className="text-white">POLÍTICA</span>
                </span>
              </div>

              {/* BODY - BACK */}
              <div className="relative z-10 p-5 flex-1 flex flex-col justify-center items-center">
                <div className="space-y-4 text-center w-full">
                  {/* Warning Icon/Text */}
                  <div className={`border rounded-xl p-4 shadow-lg w-full ${styles.infoBox}`}>
                    <p
                      className={`text-[11px] font-black uppercase tracking-[0.2em] mb-2 border-b pb-1 ${styles.textSoft} border-white/20`}
                    >
                      Cancelamento
                    </p>
                    <p className={`text-xs leading-relaxed font-bold ${styles.textMain}`}>
                      O cancelamento deve ser feito com no mínimo <br />
                      <span className={`text-sm decoration-clone drop-shadow-sm ${styles.accent}`}>
                        30 minutos
                      </span>
                      <br /> de antecedência.
                    </p>
                  </div>

                  {/* Penalty Notice */}
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center justify-center gap-2 opacity-80">
                      <div className={`h-[2px] w-12 ${styles.divider}`}></div>
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest ${styles.textSoft}`}
                      >
                        Penalidades
                      </span>
                      <div className={`h-[2px] w-12 ${styles.divider}`}></div>
                    </div>
                    <p className={`text-[10px] leading-tight font-bold px-4 ${styles.textMuted}`}>
                      O não cumprimento acarretará na perda de pontos de fidelidade e rebaixamento
                      de nível.
                    </p>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="mt-auto pt-4 text-center">
                  <span
                    className={`text-[9px] font-black uppercase tracking-[0.3em] opacity-70 ${styles.textSoft}`}
                  >
                    Trilha do Corte ®
                  </span>
                </div>
              </div>

              {/* Cutouts - Back */}
              <div
                className={`absolute -right-[10px] top-[calc(56px+70px)] w-5 h-5 rounded-full shadow-[inset_2px_0_3px_rgba(0,0,0,0.4)] z-20 border-l ${styles.cutoutBorder}`}
              ></div>
              <div
                className={`absolute -left-[10px] top-[calc(56px+70px)] w-5 h-5 rounded-full shadow-[inset_-2px_0_3px_rgba(0,0,0,0.4)] z-20 border-r ${styles.cutoutBorder}`}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .text-shadow-gold {
          text-shadow: 0 0 10px rgba(244, 208, 121, 0.5), 0 0 20px rgba(244, 208, 121, 0.3);
        }
      `}</style>
    </div>
  );
};
