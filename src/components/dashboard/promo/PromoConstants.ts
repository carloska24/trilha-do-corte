import { BadgeConfig } from '../../../types';
import {
  Rocket,
  Crown,
  Fire,
  Lightning,
  Star,
  Tag,
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

export const BADGE_VARIANTS: { id: BadgeConfig['variant']; label: string }[] = [
  { id: 'ribbon', label: 'Faixa (Ribbon)' },
  { id: 'seal', label: 'Selo (Seal)' },
  { id: 'pill', label: 'Pílula (Pill)' },
];

export const POSITIONS: { id: BadgeConfig['position']; label: string }[] = [
  { id: 'top-left', label: '↖ Top Left' },
  { id: 'top-center', label: '⬆ Top Center' },
  { id: 'top-right', label: '↗ Top Right' },
  { id: 'bottom-left', label: '↙ Bottom Left' },
  { id: 'bottom-right', label: '↘ Bottom Right' },
];

export const COLORS: { id: BadgeConfig['color']; label: string; class: string }[] = [
  {
    id: 'red',
    label: 'Classic Red',
    class: 'bg-gradient-to-br from-red-500 via-red-600 to-rose-700',
  },
  {
    id: 'green',
    label: 'Emerald',
    class: 'bg-gradient-to-br from-emerald-400 via-green-500 to-green-700',
  },
  {
    id: 'gold',
    label: 'Gold Luxury',
    class: 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600',
  },
  {
    id: 'purple',
    label: 'Galaxy',
    class: 'bg-gradient-to-br from-purple-500 via-fuchsia-600 to-indigo-600',
  },
  {
    id: 'neon',
    label: 'Cyber Lime',
    class: 'bg-gradient-to-br from-lime-300 via-yellow-300 to-lime-500',
  },
  {
    id: 'black',
    label: 'Midnight',
    class: 'bg-gradient-to-br from-gray-800 via-black to-gray-900 border border-white/10',
  },
  { id: 'yellow', label: 'Sunburst', class: 'bg-gradient-to-br from-yellow-400 to-orange-500' },
  {
    id: 'pink',
    label: 'Hot Pink',
    class: 'bg-gradient-to-br from-pink-500 via-rose-500 to-pink-700',
  },
  { id: 'teal', label: 'Ocean', class: 'bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600' },
  {
    id: 'orange',
    label: 'Sunset',
    class: 'bg-gradient-to-br from-orange-400 via-amber-500 to-red-500',
  },
  { id: 'lime', label: 'Acid', class: 'bg-gradient-to-br from-lime-400 to-green-500' },
  { id: 'magenta', label: 'Berry', class: 'bg-gradient-to-br from-fuchsia-500 to-purple-600' },
  {
    id: 'blue',
    label: 'Royal',
    class: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-700',
  },

  {
    id: 'transparent',
    label: 'Transparente (Sem Fundo)',
    class: 'bg-white/5 backdrop-blur-sm',
  },
];

export const FONTS: { id: BadgeConfig['fontFamily']; label: string; class: string }[] = [
  { id: 'sans', label: 'SANS', class: 'font-sans' },
  { id: 'serif', label: 'SERIF', class: 'font-serif' },
  { id: 'mono', label: 'MONO', class: 'font-mono' },
  { id: 'graffiti', label: 'GRAFFITI', class: 'font-graffiti' },
  { id: 'handwritten', label: 'HANDWRITTEN', class: 'font-cursive italic' },
  { id: 'display', label: 'DISPLAY', class: 'font-black tracking-tighter' },
  { id: 'script', label: 'SCRIPT', class: 'italic font-serif' },
  { id: 'slab', label: 'SLAB', class: 'font-serif font-bold' },
  { id: 'gothic', label: 'GOTHIC', class: 'font-sans uppercase tracking-widest' },
  { id: 'modern', label: 'MODERN', class: 'font-sans font-thin' },
  { id: 'classic', label: 'CLASSIC', class: 'font-serif uppercase' },
  { id: 'pixel', label: 'PIXEL', class: 'font-mono tracking-widest' },
];

export const TEXT_COLORS = [
  { id: '#ffffff', class: 'bg-white' },
  { id: '#000000', class: 'bg-black' },
  { id: '#94a3b8', class: 'bg-slate-400' },
  { id: '#ef4444', class: 'bg-red-500' },
  { id: '#22c55e', class: 'bg-green-500' },
  { id: '#3b82f6', class: 'bg-blue-500' },
  { id: '#a855f7', class: 'bg-purple-500' },
  { id: '#eab308', class: 'bg-yellow-500' },
  { id: '#f97316', class: 'bg-orange-500' },
  {
    id: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500',
    class: 'bg-gradient-to-r from-pink-500 to-violet-500',
  },
  {
    id: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500',
    class: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  },
  {
    id: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500',
    class: 'bg-gradient-to-r from-yellow-400 to-orange-500',
  },
  {
    id: 'text-transparent bg-clip-text bg-gradient-to-br from-rose-400 to-orange-300',
    class: 'bg-gradient-to-br from-rose-400 to-orange-300',
  },
];

export const ICONS: { id: BadgeConfig['icon']; label: string; IconComponent?: any }[] = [
  { id: 'rocket', label: 'Launch', IconComponent: Rocket },
  { id: 'crown', label: 'VIP', IconComponent: Crown },
  { id: 'fire', label: 'Hot', IconComponent: Fire },
  { id: 'zap', label: 'Fast', IconComponent: Lightning },
  { id: 'star', label: 'Top', IconComponent: Star },
  { id: 'tag', label: 'Sale', IconComponent: Tag },
  { id: 'percent', label: 'Off', IconComponent: Percent },
  { id: 'seal', label: 'Seal', IconComponent: Seal },
  { id: 'seal-check', label: 'Seal Check', IconComponent: SealCheck },
  { id: 'seal-percent', label: 'Seal %', IconComponent: SealPercent },
  { id: 'seal-warning', label: 'Warning', IconComponent: SealWarning },
  { id: 'ticket', label: 'Ticket', IconComponent: Ticket },
  { id: 'medal', label: 'Medal', IconComponent: Medal },
  { id: 'sticker', label: 'Sticker', IconComponent: Sticker },
  { id: 'megaphone', label: 'Promo', IconComponent: Megaphone },
  { id: 'trophy', label: 'Win', IconComponent: Trophy },
  { id: 'gift', label: 'Gift', IconComponent: Gift },
  { id: 'heart', label: 'Love', IconComponent: Heart },
  { id: 'scissors', label: 'Cut', IconComponent: Scissors },
  { id: 'user', label: 'Client', IconComponent: User },
  { id: 'map-pin', label: 'Local', IconComponent: MapPin },
  { id: 'calendar', label: 'Date', IconComponent: Calendar },
  { id: 'clock', label: 'Time', IconComponent: Clock },
];
