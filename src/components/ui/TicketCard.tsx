import React from 'react';
import { BookingData, ServiceItem } from '../../types';
import { Star } from 'lucide-react';

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
    return `${day}/${month}/${year}`;
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
          <div className="relative bg-gradient-to-b from-[#b88a44] via-[#F4D079] to-[#74541e] p-[2px] rounded-[24px] shadow-[0_15px_40px_-5px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="bg-[#141009] relative rounded-[22px] overflow-hidden flex flex-col min-h-[160px] backface-hidden antialiased">
              {/* Metallic Texture */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ae8b47] via-[#cfab59] to-[#8a6e34] opacity-100"></div>
                {/* Micro-noise for texture without blur */}
                <div
                  className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/40 mix-blend-overlay"></div>
              </div>

              {/* TOP STRIP */}
              <div className="relative z-10 h-16 w-full bg-[#0a0a0a] border-b border-[#F4D079]/50 shadow-md flex items-center justify-between px-6">
                <span className="font-graffiti text-xl text-[#F4D079] tracking-wider drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
                  TRILHA<span className="text-[#fff]">CARD</span>
                </span>
                <span className="font-mono font-bold text-[#F4D079] text-sm tracking-widest drop-shadow-[0_1px_0_rgba(0,0,0,1)]">
                  {ticketId}
                </span>
              </div>

              {/* BODY - FRONT */}
              <div className="relative z-10 p-6 flex-grow flex flex-col justify-between">
                <div className="flex justify-between items-end mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#2a1e0b] uppercase tracking-[0.2em] mb-1 drop-shadow-sm">
                      Passageiro
                    </span>
                    <h3 className="text-3xl font-black text-[#fff] uppercase tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] shadow-black text-shadow-gold leading-none pb-1">
                      {data.name || 'Carlos'}
                    </h3>
                    {/* Stars */}
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} className="relative">
                          <Star
                            size={14}
                            fill={s <= rating ? '#Ffffff' : 'none'}
                            className={`${s <= rating ? 'text-[#Ffffff]' : 'text-[#5c4013]/40'}`}
                            strokeWidth={s <= rating ? 0 : 2}
                          />
                          {/* Glow Layer */}
                          {s <= rating && (
                            <div className="absolute inset-0 blur-[2px]">
                              <Star
                                size={14}
                                fill="#F4D079"
                                className="text-[#F4D079]"
                                strokeWidth={0}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-[#2a1e0b] uppercase tracking-[0.2em] mb-1 drop-shadow-sm">
                      Serviço
                    </span>
                    <h3 className="text-lg font-black text-[#fff] uppercase tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] text-shadow-gold text-right">
                      {service?.name || 'Corte'}
                    </h3>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-[#5c4013]/60 my-2 shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-[#2a1e0b] uppercase tracking-widest mb-0.5">
                      Data
                    </span>
                    <span className="font-mono text-base font-bold text-[#fff] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate">
                      {formatDate(data.date)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-[#2a1e0b] uppercase tracking-widest mb-0.5">
                      Horário
                    </span>
                    <span className="font-mono text-base font-bold text-[#fff] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      {data.time || '10:00'}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-[#2a1e0b] uppercase tracking-widest mb-0.5 flex items-center gap-1">
                      Valor
                      <span className="text-[11px] opacity-70">💵</span>
                    </span>
                    <span className="font-mono text-lg font-bold text-[#fff] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
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
          <div className="relative bg-gradient-to-b from-[#8E6E34] via-[#F4D079] to-[#584015] p-[3px] rounded-[24px] shadow-2xl overflow-hidden h-full">
            <div className="bg-[#1a150c] relative rounded-[21px] overflow-hidden h-full flex flex-col backface-hidden antialiased">
              {/* Metallic Texture (Same as front) */}
              <div className="absolute inset-0 z-0 transform scale-x-[-1] pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-bl from-[#ae8b47] via-[#cfab59] to-[#8a6e34] opacity-100"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum-dark.png')] opacity-40 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30 mix-blend-overlay"></div>
              </div>

              {/* TOP STRIP - BACK */}
              <div className="relative z-10 h-14 w-full bg-[#0a0a0a] border-b border-[#F4D079]/50 flex items-center justify-center shrink-0">
                <span className="font-graffiti text-base text-[#F4D079] tracking-wider drop-shadow-sm">
                  REGRAS & <span className="text-[#fff]">POLÍTICA</span>
                </span>
              </div>

              {/* BODY - BACK */}
              <div className="relative z-10 p-6 flex-1 flex flex-col justify-center items-center">
                <div className="space-y-6 text-center w-full">
                  {/* Warning Icon/Text */}
                  <div className="bg-[#2a1e0b]/90 border border-[#b88a44] rounded-xl p-4 shadow-lg w-full">
                    <p className="text-[11px] text-[#F4D079] font-black uppercase tracking-[0.2em] mb-2 border-b border-[#F4D079]/20 pb-1">
                      Cancelamento
                    </p>
                    <p className="text-xs leading-relaxed text-[#f0f0f0] font-bold">
                      O cancelamento deve ser feito com no mínimo <br />
                      <span className="text-[#F4D079] text-base decoration-clone drop-shadow-md">
                        30 minutos
                      </span>
                      <br /> de antecedência.
                    </p>
                  </div>

                  {/* Penalty Notice */}
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center justify-center gap-2 opacity-80">
                      <div className="h-[2px] bg-[#5c4013] w-12"></div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#3d2b0f]">
                        Penalidades
                      </span>
                      <div className="h-[2px] bg-[#5c4013] w-12"></div>
                    </div>
                    <p className="text-[10px] leading-tight text-[#3d2b0f] font-bold px-4">
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
