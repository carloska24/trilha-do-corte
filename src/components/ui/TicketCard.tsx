import React from 'react';
import { BookingData, ServiceItem } from '../../types';
import { Star, Calendar, Clock, Banknote } from 'lucide-react';

interface TicketCardProps {
  data: BookingData;
  service?: ServiceItem;
  ticketId: string;
  rating?: number;
  className?: string;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  data,
  service,
  ticketId,
  rating = 4,
  className,
}) => {
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const handleFlip = () => {
    if (isAnimating) return; // Prevent double-clicks
    setIsAnimating(true);
    setIsFlipped(!isFlipped);
    setTimeout(() => setIsAnimating(false), 750); // Buffer for transition to ensure smooth snap
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year.slice(-2)}`;
  };

  // --- DYNAMIC STYLES FOR CRISPNESS ---
  // The goal: When not animating, we want pure 2D layers with NO 3D transforms to avoid blur.

  const wrapperStyle: React.CSSProperties = isAnimating
    ? {
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition: 'transform 0.7s', // Only animate when we say so
      }
    : {
        // IDLE STATE: Pure 2D
        transform: 'none',
        transformStyle: 'flat',
        perspective: 'none',
        transition: 'none', // CRITICAL: Stop the wrapper from animating back to 0
      };

  const frontFaceStyle: React.CSSProperties =
    !isAnimating && isFlipped
      ? { opacity: 0, pointerEvents: 'none' } // Hidden when showing back (idle)
      : { transform: 'translateZ(1px)' }; // Normal state

  const backFaceStyle: React.CSSProperties =
    !isAnimating && isFlipped
      ? { transform: 'none', zIndex: 50, opacity: 1 } // Shown on top when back (idle)
      : { transform: 'rotateY(180deg)' }; // Normal 3D state

  return (
    <div
      className={`relative w-full mx-auto group font-sans cursor-pointer select-none ${
        className || 'max-w-[340px]'
      }`}
      onClick={handleFlip}
    >
      {/* Outer Glow - Slightly reduced */}
      <div
        className={`absolute inset-0 bg-[#F4D079]/20 blur-2xl rounded-[24px] transform scale-[0.9] pointer-events-none transition-opacity duration-500 z-0 ${
          isAnimating ? 'opacity-0' : 'opacity-40 group-hover:opacity-60'
        }`}
      ></div>

      {/* FLIP INNER CONTAINER */}
      <div
        className="relative w-full z-10" // Removed 'duration-700 transition-transform' classes to control via inline style
        style={wrapperStyle}
      >
        {/* ================= FRONT FACE ================= */}
        <div
          className="relative backface-hidden z-10 block ring-1 ring-white/10 rounded-[24px]"
          style={frontFaceStyle}
        >
          {/* Main Card Frame */}
          <div
            className={`relative p-[2px] rounded-[24px] shadow-[0_15px_40px_-5px_rgba(0,0,0,0.6)] overflow-hidden ${
              rating <= 1
                ? 'bg-gradient-to-br from-[#ffffff] via-[#d4d4d8] to-[#9ca3af]' // Ultra Bright Silver
                : 'bg-gradient-to-b from-[#b88a44] via-[#F4D079] to-[#74541e]' // Gold Gradient
            }`}
          >
            <div className="bg-[#141009] relative rounded-[22px] overflow-hidden flex flex-col h-auto backface-hidden antialiased transition-all duration-300">
              {/* Texture Layer */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <div
                  className={`absolute inset-0 opacity-100 ${
                    rating <= 1
                      ? 'bg-gradient-to-br from-[#888] via-[#aaa] to-[#555]' // Chrome Base
                      : 'bg-gradient-to-br from-[#ae8b47] via-[#cfab59] to-[#8a6e34]' // Gold Base
                  }`}
                ></div>
                {/* Micro-noise for texture without blur */}
                <div
                  className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/40 mix-blend-overlay"></div>
              </div>

              {/* HEADER TEXTURE & TITLE */}
              <div
                className={`relative z-10 h-14 w-full border-b shadow-md flex items-center justify-between px-5 ${
                  rating <= 1 ? 'bg-[#1a1a1a] border-white/10' : 'bg-[#141009] border-[#F4D079]/30'
                }`}
              >
                {/* Subtle Grid Pattern for Header */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                    backgroundSize: '8px 8px',
                  }}
                ></div>

                <span
                  className={`font-graffiti text-xl tracking-wider z-10 ${
                    rating <= 1
                      ? 'text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]'
                      : 'text-[#F4D079] drop-shadow-[0_2px_0_rgba(0,0,0,1)]'
                  }`}
                >
                  TRILHA
                  <span className={`${rating <= 1 ? 'text-white' : 'text-[#fff]'}`}>CARD</span>
                </span>
                <span
                  className={`font-mono font-bold text-xs tracking-widest z-10 ${
                    rating <= 1 ? 'text-gray-400' : 'text-[#F4D079]/80'
                  }`}
                >
                  {ticketId}
                </span>
              </div>

              {/* BODY - FRONT */}
              <div className="relative z-10 p-5 flex flex-col">
                {/* Stacked Fields Container - No extra gap */}
                <div className="flex flex-col gap-3">
                  {/* Block 1: Passenger */}
                  <div className="flex flex-col items-start relative">
                    <span
                      className={`text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 ml-1 opacity-80 ${
                        rating <= 1 ? 'text-gray-900' : 'text-[#2a1e0b]'
                      }`}
                    >
                      Passageiro
                    </span>
                    <h3
                      className={`text-3xl font-black uppercase tracking-wide leading-none ${
                        rating <= 1
                          ? 'text-white drop-shadow-md'
                          : 'text-[#fff] text-shadow-gold drop-shadow-md'
                      }`}
                    >
                      {data.name?.split(' ')[0] || 'CARLOS'}
                      <span className="ml-2 opacity-80">
                        {/* Initial */ data.name?.split(' ')?.[1]?.[0] || 'A'}.
                      </span>
                    </h3>
                  </div>

                  {/* Block 2: Service + Stars */}
                  <div className="flex flex-col items-start relative">
                    <span
                      className={`text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 ml-1 opacity-80 ${
                        rating <= 1 ? 'text-gray-900' : 'text-[#2a1e0b]'
                      }`}
                    >
                      Serviço
                    </span>

                    {(() => {
                      const name = service?.name || 'Corte';
                      return (
                        <h3
                          className={`text-xl font-black uppercase tracking-wide leading-none ${
                            rating <= 1
                              ? 'text-white drop-shadow-md'
                              : 'text-[#fff] text-shadow-gold drop-shadow-md'
                          }`}
                        >
                          {name}
                        </h3>
                      );
                    })()}

                    {/* Stars - Immediately below service */}
                    <div className="flex gap-1 mt-1.5 ml-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} className="relative">
                          <Star
                            size={12}
                            fill={s <= rating ? (rating <= 1 ? '#eab308' : '#FFFFFF') : 'none'}
                            className={`${
                              s <= rating
                                ? rating <= 1
                                  ? 'text-yellow-500'
                                  : 'text-[#FFFFFF]'
                                : 'text-black/20'
                            }`}
                            strokeWidth={s <= rating ? 0 : 2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Divider - Moved up, tight to content */}
                <div
                  className={`w-full h-[1px] my-2 shadow-[0_1px_0_rgba(255,255,255,0.2)] ${
                    rating <= 1 ? 'bg-gray-400/50' : 'bg-[#5c4013]/60'
                  }`}
                ></div>

                {/* Footer Grid - With Icons */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Date */}
                  <div className="flex flex-col">
                    <span
                      className={`text-[8px] font-black uppercase tracking-widest mb-0.5 flex items-center gap-1 opacity-90 ${
                        rating <= 1 ? 'text-gray-900' : 'text-[#2a1e0b]'
                      }`}
                    >
                      <Calendar size={10} strokeWidth={3} />
                      Data
                    </span>
                    <span className="font-mono text-sm font-bold text-[#fff] drop-shadow-sm truncate pl-0.5">
                      {formatDate(data.date)}
                    </span>
                  </div>

                  {/* Time */}
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-[8px] font-black uppercase tracking-widest mb-0.5 flex items-center gap-1 opacity-90 ${
                        rating <= 1 ? 'text-gray-900' : 'text-[#2a1e0b]'
                      }`}
                    >
                      <Clock size={10} strokeWidth={3} />
                      Horário
                    </span>
                    <span className="font-mono text-sm font-bold text-[#fff] drop-shadow-sm pl-0.5">
                      {data.time || '10:00'}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex flex-col items-end">
                    <span
                      className={`text-[8px] font-black uppercase tracking-widest mb-0.5 flex items-center gap-1 opacity-90 ${
                        rating <= 1 ? 'text-gray-900' : 'text-[#2a1e0b]'
                      }`}
                    >
                      Valor
                      {/* Using a generic bill icon or just text if icon not available, but user asked for icon */}
                      <span className="font-bold text-[10px]">$</span>
                    </span>
                    <span className="font-mono text-base font-bold text-[#fff] drop-shadow-sm pl-0.5">
                      {formatPrice(service?.priceValue || 35)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cutouts */}
              <div className="absolute -left-[10px] top-[calc(64px+80px)] w-5 h-5 bg-[#141009] rounded-full shadow-[inset_-1px_0_2px_rgba(0,0,0,0.5)] z-20 border-r border-[#b88a44]"></div>
              <div className="absolute -right-[10px] top-[calc(64px+80px)] w-5 h-5 bg-[#141009] rounded-full shadow-[inset_1px_0_2px_rgba(0,0,0,0.5)] z-20 border-l border-[#b88a44]"></div>
            </div>
          </div>
        </div>

        {/* ================= BACK FACE ================= */}
        <div
          className="absolute inset-0 backface-hidden rotate-y-180 z-20 h-full w-full ring-1 ring-white/10 rounded-[24px]"
          style={backFaceStyle}
        >
          <div
            className={`relative p-[3px] rounded-[24px] shadow-2xl overflow-hidden h-full ${
              rating <= 1
                ? 'bg-gradient-to-b from-[#4a4a4a] via-[#8a8a8a] to-[#2a2a2a]' // Iron
                : 'bg-gradient-to-b from-[#8E6E34] via-[#F4D079] to-[#584015]' // Gold
            }`}
          >
            <div className="bg-[#1a150c] relative rounded-[21px] overflow-hidden h-full flex flex-col backface-hidden antialiased">
              {/* Metallic Texture (Same as front) */}
              <div className="absolute inset-0 z-0 transform scale-x-[-1] pointer-events-none">
                <div
                  className={`absolute inset-0 opacity-100 ${
                    rating <= 1
                      ? 'bg-gradient-to-bl from-[#333] via-[#555] to-[#222]' // Iron Base
                      : 'bg-gradient-to-bl from-[#ae8b47] via-[#cfab59] to-[#8a6e34]' // Gold Base
                  }`}
                ></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum-dark.png')] opacity-40 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30 mix-blend-overlay"></div>
              </div>

              {/* TOP STRIP - BACK */}
              <div
                className={`relative z-10 h-14 w-full bg-[#0a0a0a] border-b flex items-center justify-center shrink-0 ${
                  rating <= 1 ? 'border-gray-600/50' : 'border-[#F4D079]/50'
                }`}
              >
                <span
                  className={`font-graffiti text-base tracking-wider drop-shadow-sm ${
                    rating <= 1 ? 'text-gray-300' : 'text-[#F4D079]'
                  }`}
                >
                  REGRAS & <span className="text-[#fff]">POLÍTICA</span>
                </span>
              </div>

              {/* BODY - BACK */}
              <div className="relative z-10 p-4 flex-1 flex flex-col justify-center items-center">
                <div className="space-y-3 text-center w-full">
                  {/* Warning Icon/Text */}
                  <div
                    className={`bg-[#2a1e0b]/90 border rounded-xl p-4 shadow-lg w-full ${
                      rating <= 1 ? 'border-gray-600' : 'border-[#b88a44]'
                    }`}
                  >
                    <p
                      className={`text-[11px] font-black uppercase tracking-[0.2em] mb-2 border-b pb-1 ${
                        rating <= 1
                          ? 'text-gray-400 border-gray-600/50'
                          : 'text-[#F4D079] border-[#F4D079]/20'
                      }`}
                    >
                      Cancelamento
                    </p>
                    <p className="text-xs leading-relaxed text-[#f0f0f0] font-bold">
                      O cancelamento deve ser feito com no mínimo <br />
                      <span
                        className={`text-base decoration-clone drop-shadow-md ${
                          rating <= 1 ? 'text-gray-300' : 'text-[#F4D079]'
                        }`}
                      >
                        30 minutos
                      </span>
                      <br /> de antecedência.
                    </p>
                  </div>

                  {/* Penalty Notice */}
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center justify-center gap-2 opacity-80">
                      <div className="h-[2px] bg-[#5c4013] w-12"></div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/80">
                        Penalidades
                      </span>
                      <div className="h-[2px] bg-[#5c4013] w-12"></div>
                    </div>
                    <p className="text-[10px] leading-tight text-white/90 font-bold px-4">
                      O não cumprimento acarretará na perda de pontos de fidelidade e rebaixamento
                      de nível.
                    </p>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="mt-auto pt-4 text-center">
                  <span className="text-[9px] font-black text-[#3d2b0f] uppercase tracking-[0.3em] opacity-70">
                    Trilha do Corte ®
                  </span>
                </div>
              </div>

              {/* Cutouts - Back */}
              <div className="absolute -right-[10px] top-[calc(56px+70px)] w-5 h-5 bg-[#141009] rounded-full shadow-[inset_2px_0_3px_rgba(0,0,0,0.4)] z-20 border-l border-[#8E6E34]/60"></div>
              <div className="absolute -left-[10px] top-[calc(56px+70px)] w-5 h-5 bg-[#141009] rounded-full shadow-[inset_-2px_0_3px_rgba(0,0,0,0.4)] z-20 border-r border-[#8E6E34]/60"></div>
            </div>
          </div>
        </div>

        {/* Wrapper Close was missing? No, BackFace Close, Inner Close, Content Close. */}
        {/* We need:
          1. Close Content (Done inside BackFace logic usually)
          2. Close Inner (Done)
          3. Close BackFace (Done)
          4. Close Wrapper (Need this one)
      */}
      </div>

      <style>{`
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .text-shadow-gold {
          text-shadow: 0 0 10px rgba(244, 208, 121, 0.5), 0 0 20px rgba(244, 208, 121, 0.3);
        }
        /* Force hardware acceleartion on these specific text elements */
        .transform-gpu {
          transform: translateZ(0);
        }
      `}</style>
    </div>
  );
};
