import React from 'react';
import {
  Crown,
  Fire,
  Rocket,
  Star,
  Tag,
  Lightning,
  Percent,
  Megaphone,
  Trophy,
  Gift,
  Heart,
  User,
  MapPin,
  Calendar,
  Clock,
  Scissors,
  Seal,
  SealCheck,
  SealPercent,
  SealWarning,
  Ticket,
  Medal,
  Sticker,
} from '@phosphor-icons/react';
import { BadgeConfig } from '../../types';

interface PromoBadgeProps {
  config: BadgeConfig;
  className?: string; // For manual overrides
}

export const PromoBadge: React.FC<PromoBadgeProps> = ({ config, className }) => {
  const { variant, position, icon, text, subText, color, textColor, iconColor, fontFamily } =
    config;

  // 1. Position Logic - Expanded to 9 Grid Points
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
    'top-right': 'top-0 right-0',
    'mid-left': 'top-1/2 left-0 -translate-y-1/2',
    'mid-center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'mid-right': 'top-1/2 right-0 -translate-y-1/2',
    'bottom-left': 'bottom-0 left-0',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-0 right-0',
  };

  // 2. Color Logic (Tailwind maps)
  const colorStyles: Record<
    string,
    { bg: string; gradient: string; text: string; shadow: string }
  > = {
    red: {
      bg: 'bg-red-600',
      gradient: 'bg-gradient-to-br from-red-500 via-red-600 to-rose-700',
      text: 'text-white',
      shadow: 'shadow-red-500/50',
    },
    green: {
      bg: 'bg-emerald-600',
      gradient: 'bg-gradient-to-br from-emerald-400 via-green-500 to-green-700',
      text: 'text-white',
      shadow: 'shadow-emerald-500/50',
    },
    gold: {
      bg: 'bg-yellow-500',
      gradient: 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600',
      text: 'text-black',
      shadow: 'shadow-yellow-500/50',
    },
    purple: {
      bg: 'bg-purple-600',
      gradient: 'bg-gradient-to-br from-purple-500 via-fuchsia-600 to-indigo-600',
      text: 'text-white',
      shadow: 'shadow-purple-500/50',
    },
    neon: {
      bg: 'bg-lime-400',
      gradient: 'bg-gradient-to-br from-lime-300 via-yellow-300 to-lime-500',
      text: 'text-black',
      shadow: 'shadow-lime-400/50',
    },
    black: {
      bg: 'bg-black',
      gradient: 'bg-gradient-to-br from-gray-800 via-black to-gray-900 border border-white/10',
      text: 'text-white',
      shadow: 'shadow-black/50',
    },
    // New Colors
    yellow: {
      bg: 'bg-yellow-400',
      gradient: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      text: 'text-black',
      shadow: 'shadow-yellow-400/50',
    },
    pink: {
      bg: 'bg-pink-500',
      gradient: 'bg-gradient-to-br from-pink-500 via-rose-500 to-pink-700',
      text: 'text-white',
      shadow: 'shadow-pink-500/50',
    },
    teal: {
      bg: 'bg-teal-500',
      gradient: 'bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600',
      text: 'text-white',
      shadow: 'shadow-teal-500/50',
    },
    orange: {
      bg: 'bg-orange-500',
      gradient: 'bg-gradient-to-br from-orange-400 via-amber-500 to-red-500',
      text: 'text-white',
      shadow: 'shadow-orange-500/50',
    },
    lime: {
      bg: 'bg-lime-500',
      gradient: 'bg-gradient-to-br from-lime-400 to-green-500',
      text: 'text-black',
      shadow: 'shadow-lime-500/50',
    },
    magenta: {
      bg: 'bg-fuchsia-600',
      gradient: 'bg-gradient-to-br from-fuchsia-500 to-purple-600',
      text: 'text-white',
      shadow: 'shadow-fuchsia-500/50',
    },
    blue: {
      bg: 'bg-blue-600',
      gradient: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-700',
      text: 'text-white',
      shadow: 'shadow-blue-500/50',
    },
    transparent: {
      bg: 'bg-transparent',
      gradient: 'bg-transparent',
      text: 'text-white',
      shadow: 'shadow-none',
    },
  };

  const selectedColor = colorStyles[color] || colorStyles.red;

  // Custom Text Color Override Logic
  // 1. If it's a Hex code (starts with #), use inline style for 'color'.
  // 2. If it's a Tailwind class (e.g. 'bg-red-500', 'text-blue-500', 'bg-gradient...'), add to className.
  const isHexColor = textColor?.startsWith('#');
  const textColorStyle = isHexColor ? { color: textColor } : {};
  const customTextClass = textColor && !isHexColor ? textColor : '';
  const finalTextColorClass = isHexColor ? '' : !customTextClass ? selectedColor.text : '';

  // Font Map
  const fontClass = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
    graffiti: 'font-graffiti',
    handwritten: 'font-handwritten',
    display: 'font-black tracking-tighter', // fallback/tailwind
    script: 'font-script',
    slab: 'font-slab',
    gothic: 'font-gothic',
    modern: 'font-modern',
    classic: 'font-serif uppercase tracking-widest', // styles composition
    pixel: 'font-pixel',
  }[fontFamily || 'sans'];

  // 3. Icon Mapping
  const IconComponent = () => {
    const size = variant === 'seal' ? 28 : 14; // Larger for Seal variant
    // iconColor takes precedence, then 'text-current' (inherits text color)
    const style = iconColor ? { color: iconColor } : {};
    const className = 'transition-colors';

    switch (icon) {
      case 'crown':
        return <Crown size={size} weight="duotone" className={className} style={style} />;
      case 'rocket':
        return <Rocket size={size} weight="duotone" className={className} style={style} />;
      case 'fire':
        return <Fire size={size} weight="fill" className={className} style={style} />;
      case 'star':
        return <Star size={size} weight="duotone" className={className} style={style} />;
      case 'zap':
        return <Lightning size={size} weight="fill" className={className} style={style} />;
      case 'tag':
        return <Tag size={size} weight="duotone" className={className} style={style} />;
      case 'percent':
        return <Percent size={size} weight="bold" className={className} style={style} />;
      case 'megaphone':
        return <Megaphone size={size} weight="duotone" className={className} style={style} />;
      case 'trophy':
        return <Trophy size={size} weight="duotone" className={className} style={style} />;
      case 'gift':
        return <Gift size={size} weight="duotone" className={className} style={style} />;
      case 'heart':
        return <Heart size={size} weight="fill" className={className} style={style} />;
      case 'user':
        return <User size={size} weight="duotone" className={className} style={style} />;
      case 'map-pin':
        return <MapPin size={size} weight="fill" className={className} style={style} />;
      case 'calendar':
        return <Calendar size={size} weight="duotone" className={className} style={style} />;
      case 'clock':
        return <Clock size={size} weight="bold" className={className} style={style} />;
      case 'scissors':
        return <Scissors size={size} weight="duotone" className={className} style={style} />;
      case 'seal':
        return <Seal size={size} weight="duotone" className={className} style={style} />;
      case 'seal-check':
        return <SealCheck size={size} weight="duotone" className={className} style={style} />;
      case 'seal-percent':
        return <SealPercent size={size} weight="duotone" className={className} style={style} />;
      case 'seal-warning':
        return <SealWarning size={size} weight="duotone" className={className} style={style} />;
      case 'ticket':
        return <Ticket size={size} weight="duotone" className={className} style={style} />;
      case 'medal':
        return <Medal size={size} weight="duotone" className={className} style={style} />;
      case 'sticker':
        return <Sticker size={size} weight="duotone" className={className} style={style} />;
      default:
        return null;
    }
  };

  // 4. Variant Rendering
  if (variant === 'ribbon') {
    // RIBBON STYLE (The "Faixa" - Horizontal Tab Style)

    // Check if it IS a full-width position (Center ones)
    const isFullWidth = position.includes('center') || position.includes('mid-center');

    // Dynamic Border Radius based on Position (The "Tab" look)
    const borderRadiusClasses =
      {
        'top-left': 'rounded-br-2xl', // Round bottom-right corner only
        'top-right': 'rounded-bl-2xl', // Round bottom-left corner only (Matches user image)
        'bottom-left': 'rounded-tr-2xl', // Round top-right corner only
        'bottom-right': 'rounded-tl-2xl', // Round top-left corner only
        'top-center': '', // Full width
        'bottom-center': '', // Full width
        'mid-left': 'rounded-r-2xl', // Round right side
        'mid-right': 'rounded-l-2xl', // Round left side
        'mid-center': '', // Full width
      }[position] || '';

    return (
      <div
        className={`absolute z-30 ${isFullWidth ? 'w-full' : 'max-w-[80%]'} ${
          positionClasses[position]
        } ${className}`}
      >
        <div
          className={`flex items-center justify-between px-4 py-1.5 shadow-lg backdrop-blur-sm overflow-hidden
            ${selectedColor.gradient} ${fontClass}
            ${isFullWidth ? 'w-full' : borderRadiusClasses}
          `}
        >
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-white/10 skew-x-12 pointer-events-none" />

          {/* Content - with Marquee Effect */}
          <div className="relative flex items-center gap-2 w-full justify-center overflow-hidden h-full">
            {icon && (
              <div style={textColorStyle} className={`${customTextClass} ${finalTextColorClass}`}>
                <IconComponent />
              </div>
            )}

            {/* MARQUEE WRAPPER */}
            <div
              className={`flex-1 overflow-hidden relative h-4 flex items-center ${
                isFullWidth ? 'w-full' : ''
              }`}
            >
              <div
                className={`whitespace-nowrap animate-ticker pl-1 ${customTextClass} ${finalTextColorClass}`}
                style={textColorStyle}
              >
                <span className="font-black italic uppercase text-xs tracking-wider mr-4">
                  {text}
                </span>
                <span className="font-black italic uppercase text-xs tracking-wider mr-4">
                  {text}
                </span>
                <span className="font-black italic uppercase text-xs tracking-wider mr-4">
                  {text}
                </span>
              </div>
            </div>

            {subText && (
              <>
                <span className={`opacity-50 mx-1 z-10 ${!customTextClass ? 'text-white' : ''}`}>
                  |
                </span>
                <span
                  className={`font-bold text-[10px] uppercase tracking-wide opacity-90 z-10 whitespace-nowrap ${customTextClass} ${finalTextColorClass}`}
                  style={textColorStyle}
                >
                  {subText}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'seal') {
    // SEAL STYLE
    // If transparent, we remove the container styling (shadow, border, bg) to show only icon
    const isTransparent = color === 'transparent';
    const containerClasses = isTransparent
      ? 'w-12 h-12 flex items-center justify-center' // Minimal layout
      : `relative flex items-center justify-center w-12 h-12 rounded-full shadow-xl border-2 border-white/20 ${selectedColor.gradient} ${selectedColor.shadow} animate-[pulseSlow_3s_infinite]`;

    return (
      <div className={`absolute z-30 p-2 ${positionClasses[position]} ${className}`}>
        {/* Seal Circle (Background) - NO TEXT CLASSES HERE */}
        <div className={`${containerClasses} ${fontClass}`}>
          {!isTransparent && (
            <div className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-20"></div>
          )}
          {/* Icon Wrapper for Gradient Colors */}
          <div style={textColorStyle} className={`${customTextClass} ${finalTextColorClass}`}>
            <IconComponent />
          </div>
        </div>
        {/* Seal Text Label */}
        <div
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${
            isTransparent ? '' : 'bg-black border border-white/10'
          } px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider whitespace-nowrap ${fontClass} ${
            /* Apply text colors here, overriding default neon-yellow if custom exists */
            customTextClass || finalTextColorClass
              ? customTextClass + ' ' + finalTextColorClass
              : 'text-neon-yellow'
          }`}
          style={isTransparent && textColor ? { color: textColor } : textColorStyle}
        >
          {text}
        </div>
      </div>
    );
  }

  // DEFAULT PILL STYLE
  return (
    <div className={`absolute z-30 m-2 ${positionClasses[position]} ${className}`}>
      <div
        className={`
             flex items-center gap-1.5 px-2.5 py-1 rounded-sm shadow-lg transform
             ${selectedColor.bg} ${fontClass}
             ${position.includes('right') ? 'rotate-1' : '-rotate-1'}
             hover:scale-105 transition-transform duration-200
        `}
      >
        {/* Content Wrapper for Text Colors */}
        <div
          className={`flex items-center gap-1.5 ${customTextClass} ${finalTextColorClass} ${
            !textColor ? selectedColor.text : ''
          }`}
          style={textColorStyle}
        >
          {icon && <IconComponent />}
          <span className="text-[9px] font-black uppercase tracking-wider leading-none mt-[1px] whitespace-nowrap">
            {text}
          </span>
        </div>
      </div>
    </div>
  );
};
