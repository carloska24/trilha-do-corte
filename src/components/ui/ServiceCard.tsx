import React from 'react';

import { ServiceItem } from '../../types';
import { PromoBadge } from './PromoBadge';

interface ServiceCardProps {
  service: ServiceItem;
  isSelected?: boolean;
  onClick?: () => void;
  /** Optional actions to overlay (e.g. Admin Edit/Delete buttons) */
  actions?: React.ReactNode;
  /** Small variant for tight spaces? For now, we stick to "Pattern Exact" */
  variant?: 'default';
}

const MOCK_IMAGES: Record<string, string> = {
  default:
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=400&auto=format&fit=crop',
  Corte:
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400&auto=format&fit=crop',
  Barba:
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=400&auto=format&fit=crop',
};

const MarqueeName: React.FC<{ text: string; isSelected: boolean }> = ({ text, isSelected }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);

  React.useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden relative h-6 flex items-center">
      <div
        className={`${
          isOverflowing ? 'animate-ticker pl-1' : 'w-full truncate'
        } whitespace-nowrap flex gap-8`}
      >
        <span
          ref={textRef}
          className={`font-graffiti text-lg tracking-wide uppercase leading-none ${
            isSelected
              ? 'text-neon-yellow drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]'
              : 'text-white/90 group-hover:text-white transition-colors'
          }`}
        >
          {text}
        </span>
        {/* Duplicate for Marquee Loop */}
        {isOverflowing && (
          <span
            className={`font-graffiti text-lg tracking-wide uppercase leading-none ${
              isSelected
                ? 'text-neon-yellow drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]'
                : 'text-white/90 group-hover:text-white transition-colors'
            }`}
          >
            {text}
          </span>
        )}
      </div>
      {/* Gradient Masks for Overflow */}
      {isOverflowing && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-zinc-800 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-zinc-800 to-transparent z-10" />
        </>
      )}
    </div>
  );
};

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isSelected = false,
  onClick,
  actions,
}) => {
  const formatPrice = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 transform w-full flex flex-col bg-zinc-900 shadow-lg
        ${
          isSelected
            ? 'border-neon-yellow scale-[1.02] shadow-[0_0_20px_rgba(234,179,8,0.3)]'
            : 'border-white/10 hover:border-white/40 hover:shadow-2xl'
        }`}
    >
      {/* 1. IMAGE AREA (Top) */}
      <div className="relative h-48 overflow-hidden bg-black/50">
        <img
          src={
            service.image ||
            `/services/${service.name
              .toLowerCase()
              .replace(/\s+/g, '-')
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')}.jpg`
          }
          onError={e => {
            const target = e.currentTarget;
            if (!target.src.includes('data:image') && target.src.includes('.jpg')) {
              target.src = target.src.replace('.jpg', '.png');
            } else {
              target.src = MOCK_IMAGES[service.name.split(' ')[0]] || MOCK_IMAGES.default;
              target.onerror = null;
            }
          }}
          alt={service.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Badges Overlay on Image */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          {service.badges && service.badges.length > 0
            ? service.badges.map((b, i) => <PromoBadge key={i} config={b} />)
            : service.badgeConfig && <PromoBadge config={service.badgeConfig} />}
        </div>

        {/* Duration Overlay (Moved here) */}
        {service.duration && (
          <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded px-2 py-1">
            <span className="text-xs font-mono text-white/90 flex items-center gap-1 font-bold">
              🕑 {service.duration} min
            </span>
          </div>
        )}

        {/* Actions Overlay */}
        {actions && <div className="absolute top-2 right-2 z-20">{actions}</div>}
      </div>

      {/* 2. INFO AREA (Bottom - Compacted) */}
      <div className="flex h-14 border-t border-white/5 bg-gradient-to-br from-zinc-800 to-black">
        {/* NAME SERVICE AREA (Left) */}
        <div className="flex-1 px-3 flex items-center min-w-0 relative overflow-hidden">
          <MarqueeName text={service.name} isSelected={isSelected} />
        </div>

        {/* PRICE AREA (Right - Clean) */}
        <div className="relative min-w-[80px] w-auto bg-neon-yellow flex items-center justify-center px-1 clip-path-slant-left overflow-hidden">
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-multiply"></div>

          <span className="relative z-10 font-mono font-black text-xl text-black -tracking-widest leading-none transform -skew-x-6">
            {formatPrice(service.priceValue || 0)
              .replace('R$', '')
              .trim()}
          </span>
        </div>
      </div>
    </div>
  );
};
