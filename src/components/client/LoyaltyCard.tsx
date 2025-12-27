import React from 'react';
import { Scissors, Star, QrCode, RefreshCw } from 'lucide-react';
import { ClientProfile } from '../../types';

interface LoyaltyCardProps {
  client: ClientProfile;
  onClick: () => void;
}

export const LoyaltyCard: React.FC<LoyaltyCardProps> = ({ client, onClick }) => {
  // SIMULATION: Hardcoded to 7 points (70%) as requested
  const points = 7;
  const TOTAL = 10;
  const percent = Math.min((points / TOTAL) * 100, 100);
  const remaining = Math.max(TOTAL - points, 0);

  return (
    <div className="relative w-full max-w-2xl mx-auto cursor-pointer" onClick={onClick}>
      {/* GOLD FRAME GLOW */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-yellow-600 via-yellow-400 to-yellow-700 opacity-60 blur-md transition-opacity duration-300 group-hover:opacity-80"></div>

      <div className="relative rounded-2xl overflow-hidden bg-[#0a0a0a] border-2 border-yellow-600/80 shadow-2xl">
        {/* REFINED TEXTURE BACKGROUND (Woven/Dark Fabric Look) */}
        <div className="absolute inset-0 z-0 bg-[#0c0c0c]">
          {/* Dark Woven Pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #333 1px, transparent 0)`,
              backgroundSize: '4px 4px',
            }}
          ></div>
          {/* Overlay Gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-transparent to-black/80"></div>
        </div>

        {/* HEADER */}
        <div className="relative z-10 px-6 py-3 border-b border-yellow-600/30 bg-gradient-to-b from-yellow-900/10 to-transparent">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-[#FCD34D] to-[#B45309] drop-shadow-sm font-sans">
              BARBER VIP CARD
            </h1>
            <QrCode className="text-yellow-500 w-5 h-5 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
          </div>

          {/* PROGRESS */}
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-yellow-500/80 font-bold mb-1 tracking-wider uppercase">
              <span>Nível Atual</span>
              <span>{Math.round(percent)}%</span>
            </div>
            <div className="h-2 rounded-full bg-black/50 border border-yellow-800/50 overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-red-900 via-red-600 to-yellow-600 shadow-[0_0_10px_rgba(220,38,38,0.8)] relative"
                style={{ width: `${percent}%` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:10px_10px]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* SLOTS */}
        <div className="relative z-10 px-5 py-3 grid grid-cols-5 gap-2">
          {Array.from({ length: TOTAL }).map((_, i) => {
            const active = i < points;
            const reward = i === TOTAL - 1;

            return (
              <div
                key={i}
                className="relative w-full aspect-[4/5] flex items-center justify-center group/slot"
              >
                {/* SHIELD SVG SHAPE */}
                <svg
                  viewBox="0 0 24 24"
                  className={`absolute inset-0 w-full h-full drop-shadow-lg transition-all duration-500
                    ${
                      active
                        ? 'text-yellow-600 fill-gradient-to-b from-[#7f1d1d] to-[#450a0a]'
                        : 'text-yellow-900/20 fill-black/60'
                    }
                  `}
                  style={{
                    filter: active ? 'drop-shadow(0 0 6px rgba(234,179,8,0.3))' : 'none',
                  }}
                >
                  <path
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    className={`
                      stroke-[1.5] 
                      ${
                        active
                          ? 'stroke-yellow-400 fill-[url(#shieldGradient)]'
                          : 'stroke-yellow-800/30 fill-black/60'
                      }
                    `}
                    strokeLinejoin="round"
                  />
                  <defs>
                    <linearGradient id="shieldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#991b1b" />
                      <stop offset="100%" stopColor="#450a0a" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* ICON (ALL STARS NOW) */}
                <div className="relative z-10 transform group-hover/slot:scale-110 transition-transform">
                  {reward ? (
                    active ? (
                      <Star className="text-yellow-300 w-5 h-5 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)] animate-pulse" />
                    ) : (
                      <Star className="text-yellow-900/30 w-4 h-4" />
                    )
                  ) : (
                    <Star
                      className={`${
                        active
                          ? 'text-yellow-200 drop-shadow-[0_0_5px_rgba(253,224,71,0.6)]'
                          : 'text-yellow-900/20'
                      }`}
                      size={14}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="relative z-10 px-5 py-2 border-t border-yellow-600/20 flex justify-between items-center text-[10px] bg-black/20">
          <span className="text-yellow-700/60 font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
            <RefreshCw size={10} className="animate-spin-slow" /> Atualizado
          </span>
          <span className="text-yellow-500 font-bold drop-shadow-sm">
            Faltam <span className="text-yellow-300 text-xs">{remaining}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
