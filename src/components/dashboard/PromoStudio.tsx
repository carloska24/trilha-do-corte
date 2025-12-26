import React, { useState, useEffect, useRef } from 'react';
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
import { Service, BadgeConfig } from '../../types';
import { PromoBadge } from '../ui/PromoBadge';
import RadialMenu from './RadialMenu';
import {
  X,
  Sparkles,
  Save,
  Palette,
  LayoutTemplate,
  Type,
  Move,
  Check,
  ChevronRight,
  MonitorPlay,
  CheckCircle,
  Settings,
} from 'lucide-react';

interface PromoStudioProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  onSavePromo: (
    serviceId: string,
    options: { badgeConfig?: BadgeConfig; badges?: BadgeConfig[] }
  ) => void;
  initialServiceId?: string | null;
}

const BADGE_VARIANTS: { id: BadgeConfig['variant']; label: string }[] = [
  { id: 'ribbon', label: 'Faixa (Ribbon)' },
  { id: 'seal', label: 'Selo (Seal)' },
  { id: 'pill', label: 'Pílula (Pill)' },
];

// 3x3 Grid + Corners is handled by the 5 hardcoded positions + logic or just simplified list
// The user asked for specific selection.
const POSITIONS: { id: BadgeConfig['position']; label: string }[] = [
  { id: 'top-left', label: '↖ Top Left' },
  { id: 'top-center', label: '⬆ Top Center' },
  { id: 'top-right', label: '↗ Top Right' },
  { id: 'bottom-left', label: '↙ Bottom Left' },
  { id: 'bottom-right', label: '↘ Bottom Right' },
];

const COLORS: { id: BadgeConfig['color']; label: string; class: string }[] = [
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

const FONTS: { id: BadgeConfig['fontFamily']; label: string; class: string }[] = [
  { id: 'sans', label: 'SANS', class: 'font-sans' },
  { id: 'serif', label: 'SERIF', class: 'font-serif' },
  { id: 'mono', label: 'MONO', class: 'font-mono' },
  { id: 'graffiti', label: 'GRAFFITI', class: 'font-graffiti' },
  // Mapped to fallbacks for now
  { id: 'handwritten', label: 'HANDWRITTEN', class: 'font-cursive italic' },
  { id: 'display', label: 'DISPLAY', class: 'font-black tracking-tighter' },
  { id: 'script', label: 'SCRIPT', class: 'italic font-serif' },
  { id: 'slab', label: 'SLAB', class: 'font-serif font-bold' },
  { id: 'gothic', label: 'GOTHIC', class: 'font-sans uppercase tracking-widest' },
  { id: 'modern', label: 'MODERN', class: 'font-sans font-thin' },
  { id: 'classic', label: 'CLASSIC', class: 'font-serif uppercase' },
  { id: 'pixel', label: 'PIXEL', class: 'font-mono tracking-widest' },
];

const TEXT_COLORS = [
  { id: '#ffffff', class: 'bg-white' },
  { id: '#000000', class: 'bg-black' },
  { id: '#94a3b8', class: 'bg-slate-400' }, // Slate
  { id: '#ef4444', class: 'bg-red-500' }, // Red
  { id: '#22c55e', class: 'bg-green-500' }, // Green
  { id: '#3b82f6', class: 'bg-blue-500' }, // Blue
  { id: '#a855f7', class: 'bg-purple-500' }, // Purple
  { id: '#eab308', class: 'bg-yellow-500' }, // Yellow
  { id: '#f97316', class: 'bg-orange-500' }, // Orange
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

const ICONS: { id: BadgeConfig['icon']; label: string }[] = [
  { id: 'rocket', label: 'Launch' },
  { id: 'crown', label: 'VIP' },
  { id: 'fire', label: 'Hot' },
  { id: 'zap', label: 'Fast' },
  { id: 'star', label: 'Top' },
  { id: 'tag', label: 'Sale' },
  { id: 'percent', label: 'Off' },
  { id: 'seal', label: 'Seal' },
  { id: 'seal-check', label: 'Seal Check' },
  { id: 'seal-percent', label: 'Seal %' },
  { id: 'seal-warning', label: 'Warning' },
  { id: 'ticket', label: 'Ticket' },
  { id: 'medal', label: 'Medal' },
  { id: 'sticker', label: 'Sticker' },
  { id: 'megaphone', label: 'Promo' },
  { id: 'trophy', label: 'Win' },
  { id: 'gift', label: 'Gift' },
  { id: 'heart', label: 'Love' },
  { id: 'scissors', label: 'Cut' },
  { id: 'user', label: 'Client' },
  { id: 'map-pin', label: 'Local' },
  { id: 'calendar', label: 'Date' },
  { id: 'clock', label: 'Time' },
];

export const PromoStudio: React.FC<PromoStudioProps> = ({
  isOpen,
  onClose,
  services,
  onSavePromo,
  initialServiceId,
}) => {
  // If we have an initial ID, skip step 1.
  const [step, setStep] = useState<1 | 2>(initialServiceId ? 2 : 1);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    initialServiceId || null
  );

  // MULTI-BADGE STATE
  const [badges, setBadges] = useState<BadgeConfig[]>([]);
  const [activeBadgeIndex, setActiveBadgeIndex] = useState<number | null>(0); // Default to first badge

  const selectedService = services.find(s => s.id === selectedServiceId);

  // Setup Defaults
  const createDefaultBadge = (name: string): BadgeConfig => ({
    variant: 'ribbon',
    position: 'top-right',
    text: 'OFERTA',
    subText: 'HOJE',
    color: 'red',
    icon: 'rocket',
    fontFamily: 'sans',
    textColor: '#ffffff',
  });

  // Helper: Active Configuration
  const activeBadge =
    activeBadgeIndex !== null && badges[activeBadgeIndex] ? badges[activeBadgeIndex] : null;

  const updateActiveBadge = (updates: Partial<BadgeConfig>) => {
    if (activeBadgeIndex === null || !activeBadge) return;
    const newBadges = [...badges];
    newBadges[activeBadgeIndex] = { ...activeBadge, ...updates };
    setBadges(newBadges);
  };

  // COMPATIBILITY ALIASES - To avoid rewriting the entire file immediately
  const config = activeBadge || createDefaultBadge('Loading...');
  const setConfig = (newConfig: BadgeConfig) => {
    // Logic to find what changed? Or just replace.
    // The existing code does setConfig({ ...config, prop: val })
    // So newConfig IS the full object.
    updateActiveBadge(newConfig);
  };

  // Track last loaded service to prevent overwriting local state on save
  const lastLoadedIdRef = useRef<string | null>(null);

  // Load existing config if available when service is selected
  useEffect(() => {
    if (selectedService && selectedService.id !== lastLoadedIdRef.current) {
      lastLoadedIdRef.current = selectedService.id;

      if (selectedService.badges && selectedService.badges.length > 0) {
        setBadges(selectedService.badges);
        setActiveBadgeIndex(0); // Select first by default
      } else if (selectedService.badgeConfig) {
        // Migrate legacy single config
        setBadges([selectedService.badgeConfig]);
        setActiveBadgeIndex(0);
      } else {
        // Start with one default badge
        const firstName = selectedService.name.split(' ')[0].toUpperCase();
        setBadges([
          {
            ...createDefaultBadge(selectedService.name),
            text: `${firstName} EM OFERTA`,
          },
        ]);
        setActiveBadgeIndex(0);
      }
    }
  }, [selectedService]);

  const handleAddNewLayer = () => {
    const newBadge = createDefaultBadge(selectedService?.name || 'Service');
    // Offset position slightly if multiple? No, just default.
    const newBadges = [...badges, newBadge];
    setBadges(newBadges);
    setActiveBadgeIndex(newBadges.length - 1); // Select the new one
  };

  const handleDeleteLayer = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newBadges = badges.filter((_, i) => i !== index);
    setBadges(newBadges);
    if (activeBadgeIndex === index) {
      setActiveBadgeIndex(newBadges.length > 0 ? 0 : null);
    } else if (activeBadgeIndex !== null && activeBadgeIndex > index) {
      setActiveBadgeIndex(activeBadgeIndex - 1);
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    if (selectedServiceId) {
      // @ts-ignore - Updating to use badges
      onSavePromo(selectedServiceId, { badges });
      onClose();
    }
  };

  const handleApply = () => {
    if (selectedServiceId) {
      // Create new badge
      const newBadge = createDefaultBadge(selectedService?.name || 'Service');
      const newBadgesList = [...badges, newBadge];

      // Update Local State
      setBadges(newBadgesList);
      setActiveBadgeIndex(newBadgesList.length - 1); // Select the new one

      // Save Global State (With the new badge included)
      // @ts-ignore
      onSavePromo(selectedServiceId, { badges: newBadgesList });
    }
  };

  const handleReset = () => {
    // Reset active badge to default values
    const defaultBadge = createDefaultBadge(selectedService?.name || 'Service');
    updateActiveBadge(defaultBadge);
  };

  const [viewMode, setViewMode] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[#111] border border-gray-800 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        {/* Header - Full Width Banner */}
        {/* Header - Full Width Banner */}
        <div className="relative w-full h-32 bg-[#151515] border-b border-gray-800 p-0 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')]"></div>

          {/* Left Logo Container - 30% */}
          <div className="absolute left-0 top-0 h-full w-[30%] flex items-center justify-center z-10 pointer-events-none">
            <svg
              className="w-20 h-20 text-[#E6CCAA] drop-shadow-[0_0_10px_rgba(230,204,170,0.3)] animate-[pulse_4s_ease-in-out_infinite]"
              id="fi_17914118"
              enableBackground="new 0 0 491.5 491.5"
              viewBox="0 0 491.5 491.5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipRule="evenodd" fillRule="evenodd" fill="currentColor">
                <path d="m280.2 255.4-.4-2.7-1.7-10.8c0-.2-.1-.3-.1-.5l-3.6-23.2-30.9-15.9c-1.6-.8-2.6-2.5-2.6-4.3v-133.8l-12.7 82.8v.3l-16.3 105.5-.4 2.7c7.8 4.3 14.7 12.4 20.9 24.5 2.8-2.8 6.6-5.4 11.4-7.8 1.4-.7 2.9-.7 4.3 0 4.8 2.4 8.5 5 11.4 7.8 5.9-12.2 12.8-20.2 20.7-24.6zm-23-14.9c-1.8 3-4.6 5.2-8 6.1-1.1.3-2.3.4-3.4.4-5.8 0-11.2-3.9-12.7-9.8-.9-3.4-.5-7 1.3-10s4.6-5.2 8-6.1 6.9-.4 10 1.3c3.1 1.8 5.2 4.6 6.1 8 .9 3.5.4 7.1-1.3 10.1z"></path>
                <path d="m217.9 361.7c-.2-.1-.3-.3-.5-.4-1.2-1.1-2.5-2-3.9-2.8l13-68.1c-5.2-11.7-10.8-19.9-16.8-24.5l-16.3 89.3c-.1 0-.3.1-.4.1s-.2.1-.3.1c-12.3 3.2-22.7 14.7-25.5 29.9-3.6 19.8 7.1 38.5 23.9 41.6 8 1.5 16.3-.8 23.2-6.4 7.2-5.7 12.1-14.3 13.9-24s.2-19.4-4.4-27.4c-1.7-2.8-3.6-5.3-5.9-7.4zm-1.5 32.6c-1.2 6.5-4.4 12.6-9.6 16.8-3.9 3.1-8.6 4.8-13.5 3.9-12-2.2-16.2-17-14.2-27.6 1.6-8.6 7.5-18.2 16.5-20.4.4-.1.2 0 .6-.2 1.1-.3 2.3-.4 3.4-.4.9 0 1.8.1 2.7.2 2.5.5 5 1.5 6.9 3.3.6.6.3.3 1 .9 1.3 1.1 2.4 2.8 3.3 4.3 3.3 5.8 4.1 12.7 2.9 19.2z"></path>
                <path d="m272.6 206.6-2.6-16.9c0-.1 0-.3-.1-.4l-6.5-42c0-.1 0-.2-.1-.4l-6.4-41.4c0-.2-.1-.3-.1-.5l-6.3-40.8v131z"></path>
                <path d="m405.8 84.1c-4-4.9-8-7.3-12-7.2-10.7.2-22.7 16.2-32.3 29-3.5 4.7-6.8 9.1-10 12.6-8.8 9.9-18.6 20.3-29.2 31.1-.1.1-.1.2-.2.2-13 13.2-27.3 26.9-42.3 40.7l6.3 40.7c23.8-22.3 46.2-44.5 66.2-64.3 7.4-7.4 14.5-14.3 20.8-20.5 1.1-1.1 2.2-2.2 3.3-3.3.1-.1.2-.2.3-.3 40.3-40.8 29.6-58 29.1-58.7zm-37.4 54.5c-7.3 0-13.2-5.9-13.2-13.2s5.9-13.2 13.2-13.2 13.2 5.9 13.2 13.2-5.9 13.2-13.2 13.2z"></path>
                <path d="m316.8 141.6c10-10.2 19.2-20.1 27.6-29.4.8-.9 1.6-1.8 2.4-2.8h-79.5l5 32.3z"></path>
                <path d="m441.5 109.3h-28.5c-4.2 9.9-11.5 20.7-21.9 32.3h50.4c8 0 14.5-6.5 14.5-14.5v-3.3c0-8-6.5-14.5-14.5-14.5z"></path>
                <path d="m198.4 143.5c-6.8-11-23-12-43.1-12h-119.8v22.1h131.2z"></path>
                <path d="m155.3 121.9c18.8 0 44.1 0 53 19.8h11l5-32.3h-187.1c-.9 0-1.6.8-1.6 1.6v10.9z"></path>
                <path d="m149.7 309.1c-2.6 0-4.8 2.1-4.8 4.8 0 2.6 2.1 4.8 4.8 4.8 2.6 0 4.8-2.1 4.8-4.8 0-2.6-2.1-4.8-4.8-4.8z"></path>
                <path d="m193.1 310.1 8.3-53.1c-19.5 15.1-37.6 28-52.6 37.4-1.4.9-2.9 1.8-4.4 2.7-8 4.8-17.9 10.7-19.7 18.1-.8 3.3 0 7 2.5 11.1 7.7 12.8 25.1 8.3 34.1 3.7 9.3-4.8 20-11.5 31.8-19.9zm-43.4 16.9c-7.3 0-13.2-5.9-13.2-13.2s5.9-13.2 13.2-13.2 13.2 5.9 13.2 13.2-5.9 13.2-13.2 13.2z"></path>
                <path d="m248.1 229.8c-.7-.4-1.5-.6-2.4-.6-.4 0-.8.1-1.2.2-1.2.3-2.3 1.1-2.9 2.2s-.8 2.4-.5 3.6c.7 2.5 3.3 4 5.8 3.4 2.5-.7 4-3.3 3.3-5.8-.2-1.3-1-2.3-2.1-3z"></path>
                <path d="m368.4 120.7c-2.6 0-4.8 2.1-4.8 4.8 0 2.6 2.1 4.8 4.8 4.8 2.6 0 4.8-2.1 4.8-4.8 0-2.6-2.2-4.8-4.8-4.8z"></path>
                <path d="m298.8 355.3c-.1 0-.2 0-.3-.1-.1 0-.3-.1-.4-.1l-16.3-89.3c-6 4.6-11.7 12.8-16.8 24.5l13 68.1c-1.3.8-2.6 1.8-3.9 2.8-.2.2-.3.3-.5.4-2.2 2.1-4.2 4.5-5.9 7.4-4.6 7.9-6.2 17.6-4.4 27.4 1.8 9.7 6.7 18.3 13.9 24 7 5.6 15.2 7.8 23.2 6.4 16.8-3.1 27.5-21.8 23.9-41.6-2.8-15.2-13.2-26.7-25.5-29.9zm-.6 59.7c-4.9.9-9.7-.8-13.5-3.9-5.2-4.2-8.4-10.3-9.6-16.8s-.4-13.4 3-19.1c.9-1.5 2-3.2 3.3-4.3.7-.6.4-.3 1-.9 1.9-1.8 4.4-2.8 6.9-3.3.9-.2 1.8-.2 2.7-.2 1.1 0 2.3.1 3.4.4.4.1.2.1.6.2 9 2.2 14.9 11.8 16.5 20.4 1.9 10.5-2.2 25.3-14.3 27.5z"></path>
              </g>
            </svg>
          </div>

          <div className="flex flex-col items-center justify-center z-10 w-full pl-[15%]">
            <div className="relative">
              <h2 className="text-5xl md:text-6xl font-rye text-[#E6CCAA] leading-none drop-shadow-[2px_2px_0px_#000] text-center">
                BARBER STUDIO
              </h2>
            </div>
            <div className="relative mt-[-2px]">
              <p className="text-amber-700/80 font-bold tracking-[0.2em] text-xs md:text-sm uppercase font-rye text-center drop-shadow-md">
                Design de Badges & Logos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-white border border-white/5 hover:border-white/20 transition-all z-20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* STEP 1: SERVICE SELECTOR (Only if no initial ID or explicitly went back) */}
          {step === 1 && (
            <div className="w-full h-full relative overflow-hidden flex flex-col">
              {/* Background Image Container */}
              <div className="absolute inset-0 z-0">
                <img
                  src="/studio-bg.png"
                  alt="Background"
                  className="w-full h-full object-cover opacity-30"
                  onError={e => {
                    // Fallback if no image found - subtle gradient
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#111] via-transparent to-[#111] z-10"></div>
              </div>

              <div className="relative z-20 w-full p-8 overflow-y-auto custom-scrollbar flex-1">
                <h3 className="text-3xl md:text-4xl font-graffiti font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-200 mb-10 text-center uppercase tracking-wider drop-shadow-sm animate-pulse-slow">
                  Selecione para Customizar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {services.map(service => (
                    <div
                      key={service.id}
                      onClick={() => {
                        setSelectedServiceId(service.id);
                        setStep(2);
                      }}
                      className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 transform
                          ${
                            selectedServiceId === service.id
                              ? 'border-neon-yellow scale-[1.02]'
                              : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                          }`}
                    >
                      <div className="flex flex-col h-auto">
                        {/* Image Banner Segment */}
                        <div className="w-full h-48 relative shrink-0 z-20">
                          <img
                            src={
                              service.image ||
                              'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80'
                            }
                            alt={service.name}
                            className="w-full h-full object-cover bg-black transition-transform duration-700"
                          />

                          {/* --- DYNAMIC BADGE SYSTEM --- */}
                          {service.badges && service.badges.length > 0
                            ? service.badges.map((b, i) => (
                                <div
                                  key={i}
                                  className="absolute inset-0 z-30 pointer-events-none origin-top-left scale-75"
                                >
                                  <PromoBadge config={b} />
                                </div>
                              ))
                            : service.badgeConfig && (
                                <div className="absolute inset-0 z-30 pointer-events-none origin-top-left scale-75">
                                  <PromoBadge config={service.badgeConfig} className="z-30" />
                                </div>
                              )}

                          {/* Selection Check (Mobile Overlay) - GLASS EFFECT */}
                          {selectedServiceId === service.id && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center">
                              {/* The Glass Layer */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent backdrop-blur-[0.5px] backdrop-brightness-110 border border-white/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.15)]"></div>

                              {/* Reflection Shine */}
                              <div className="absolute -inset-full top-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-30 animate-shine" />

                              <div className="relative z-30 bg-neon-yellow/90 backdrop-blur-md rounded-full p-2 shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-in zoom-in duration-300">
                                <CheckCircle className="text-black" size={24} strokeWidth={3} />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Content Segment */}
                        <div
                          className={`flex-1 p-3 flex flex-col justify-between relative overflow-hidden transition-all duration-500
                              ${
                                selectedServiceId === service.id
                                  ? 'bg-barber-pole-card border-none'
                                  : 'bg-gradient-to-r from-[#1a1a1a] to-[#111] group-hover:bg-barber-pole-card'
                              }`}
                        >
                          {/* Top Partition: Title & Status */}
                          <div className="flex justify-between items-start z-10">
                            <div className="flex flex-col">
                              {/* Service Name */}
                              <h4
                                className={`font-graffiti text-2xl tracking-wide uppercase leading-none transition-colors drop-shadow-lg
                                    ${
                                      selectedServiceId === service.id
                                        ? 'text-white text-glow-neon'
                                        : 'text-white group-hover:text-neon-yellow'
                                    }`}
                              >
                                {service.name}
                              </h4>

                              {/* Selection Status Text */}
                              <div className="mt-1">
                                {selectedServiceId === service.id && (
                                  <span className="text-[10px] uppercase font-black tracking-[0.2em] text-neon-yellow animate-pulse flex items-center gap-1">
                                    ● Confirmado
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Bottom Partition: Price Only (Replaces footer) */}
                          <div className="flex justify-end items-end mt-auto z-10">
                            <span
                              className={`font-mono font-black text-lg px-3 py-1 rounded transform -skew-x-12 shadow-md transition-all border
                                      ${
                                        selectedServiceId === service.id
                                          ? 'bg-neon-yellow text-black border-white shadow-yellow-900/50'
                                          : 'bg-black/50 text-white border-white/20 group-hover:bg-neon-yellow group-hover:text-black group-hover:border-white group-hover:shadow-yellow-900/50'
                                      }
                                  `}
                            >
                              R$ {service.priceValue.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PLAYGROUND */}
          {step === 2 && selectedService && (
            <div className="w-full flex flex-col lg:flex-row h-full">
              {/* LEFT: CONTROLS */}
              <div className="w-full lg:w-[450px] bg-[#151515] bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] border-r border-gray-800 flex flex-col h-full z-20 shadow-2xl relative">
                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none z-0"></div>
                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 relative z-10 pb-20">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setStep(1);
                        setSelectedServiceId(null);
                      }}
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest group"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/20 flex items-center justify-center transition-all">
                        <ChevronRight className="rotate-180" size={14} />
                      </div>
                      Voltar
                    </button>
                    <h3 className="text-white font-rye text-xl tracking-widest text-[#E6CCAA]">
                      Badge Creator
                    </h3>
                  </div>
                  {/* 1. VARIANT - UNIFIED CONTAINER (UPDATED DESIGN) */}
                  <div className="bg-[#0f0f0f] rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative group/container">
                    {/* Header */}
                    {/* Header - 3 Columns Layout */}
                    <div className="flex items-center justify-between px-6 py-4 bg-[#141414] border-b border-white/5 relative z-10 w-full gap-4">
                      {/* Left SVG Slot */}
                      <div className="shrink-0">
                        {/* Placeholder for Left SVG (Tag) */}
                        <div className="w-10 h-10 flex items-center justify-center text-purple-500 opacity-80">
                          <LayoutTemplate size={24} />
                        </div>
                      </div>

                      {/* Center Text */}
                      <div className="flex-1 flex flex-col items-start justify-center overflow-hidden">
                        <h3 className="text-white font-black text-sm uppercase tracking-widest whitespace-nowrap drop-shadow-md">
                          CRIAÇÃO DE PROMOÇÕES
                        </h3>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
                          Selecione o estilo do destaque
                        </p>
                      </div>

                      {/* Right SVG Slot */}
                      <div className="shrink-0">
                        {/* Placeholder for Right SVG (Settings) */}
                        <div className="w-10 h-10 flex items-center justify-center text-purple-500 opacity-80">
                          <Settings size={24} />
                        </div>
                      </div>
                    </div>

                    {/* Selection Tabs */}
                    <div className="flex divide-x divide-white/5 h-40">
                      {BADGE_VARIANTS.map(v => (
                        <button
                          key={v.id}
                          onClick={() => setConfig({ ...config, variant: v.id })}
                          className={`flex-1 relative flex flex-col items-center justify-center gap-4 transition-all duration-300
                            ${
                              config.variant === v.id
                                ? 'bg-[#1a1025] text-white'
                                : 'bg-[#0f0f0f] text-gray-600 hover:bg-[#151515] hover:text-gray-400'
                            }
                          `}
                        >
                          {/* Active Top Glow/Border */}
                          {config.variant === v.id && (
                            <>
                              <div className="absolute top-0 inset-x-0 h-[2px] bg-purple-500 shadow-[0_0_15px_#a855f7]"></div>
                              <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none"></div>
                            </>
                          )}

                          {/* SVG Placeholder Container */}
                          <div
                            className={`w-16 h-16 flex items-center justify-center transition-transform duration-500
                              ${
                                config.variant === v.id
                                  ? 'scale-110 text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                                  : 'scale-100 opacity-50 grayscale'
                              }
                            `}
                          >
                            {/* PLACEHOLDER ICONS - Ready for SVGs */}
                            {v.id === 'ribbon' && (
                              <svg
                                viewBox="0 0 512 512"
                                className="w-12 h-12 fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  clipRule="evenodd"
                                  fillRule="evenodd"
                                  d="m416.4 431.8c-109.3-119.2-178.9-204.3-218.6-267.7-24.8-39.5-38.3-70.9-41.2-96.7-19.1 34.4-29.6 72.7-30.7 112.6-.4 14.8 11.4 49 70.1 127.8 40.9 54.9 91.9 114.7 129.1 158.4 15.8 18.6 29.1 34.1 38.6 45.8zm-171.5-34.1c-20.5 24.7-40.3 48-57.8 68.5-15.8 18.6-29.1 34.1-38.6 45.8l-52.8-80.2c36.4-39.9 52.7-59.8 81.4-94.7 3.2-3.9 6.6-8 10.1-12.3 17.4 23.2 37 47.7 57.7 72.9zm11.1-305.2c-23.8 0-47.3 7.2-67.1 20.3-15.5-32.9-19.4-57.6-12-76.3 19.8-23.2 48.5-36.5 79.1-36.5s59.3 13.3 79.1 36.5c4.4 11.8 2.8 33.5-16.9 73.2-18.8-11.3-40.2-17.2-62.2-17.2zm7.6 134.9c35.3-48.1 60.6-88.7 75.1-120.7 7.5-16.5 12.3-30.9 14.4-43.5 20.6 35.4 32 75.3 33.1 116.9.4 14.2-10.5 46.5-64 119.5-22.2-26.3-41.7-50.3-58.6-72.2z"
                                />
                              </svg>
                            )}
                            {v.id === 'seal' && (
                              <svg
                                viewBox="0 0 128 128"
                                className="w-12 h-12 fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g>
                                  <path d="m64 32.552a31.448 31.448 0 1 0 31.448 31.448 31.483 31.483 0 0 0 -31.448-31.448zm0 59.4a27.948 27.948 0 1 1 27.948-27.952 27.979 27.979 0 0 1 -27.948 27.948z"></path>
                                  <path d="m109.391 71.305c2.043-2.048 4.359-4.369 4.359-7.305s-2.316-5.257-4.359-7.3c-1.374-1.377-2.794-2.8-3.121-4.023-.352-1.316.178-3.32.69-5.259.76-2.875 1.545-5.849.13-8.294-1.437-2.483-4.432-3.291-7.329-4.072-1.913-.516-3.892-1.05-4.825-1.983s-1.466-2.911-1.982-4.825c-.781-2.9-1.589-5.891-4.071-7.328-2.447-1.415-5.421-.63-8.3.129-1.939.512-3.945 1.04-5.259.69-1.224-.327-2.646-1.747-4.023-3.121-2.044-2.048-4.365-4.364-7.301-4.364s-5.256 2.316-7.3 4.359c-1.377 1.374-2.8 2.794-4.023 3.121-1.316.35-3.321-.178-5.26-.69-2.877-.76-5.849-1.546-8.295-.13-2.483 1.437-3.29 4.432-4.072 7.329-.515 1.913-1.049 3.893-1.982 4.825s-2.911 1.466-4.825 1.982c-2.9.781-5.892 1.589-7.328 4.072-1.415 2.445-.63 5.419.129 8.294.512 1.939 1.042 3.944.69 5.26-.334 1.228-1.751 2.646-3.124 4.028-2.044 2.048-4.36 4.369-4.36 7.305s2.316 5.257 4.36 7.305c1.373 1.377 2.793 2.8 3.12 4.023.352 1.316-.178 3.32-.69 5.26-.759 2.875-1.545 5.848-.129 8.293 1.436 2.483 4.431 3.291 7.328 4.072 1.913.516 3.892 1.05 4.824 1.983s1.467 2.912 1.983 4.825c.781 2.9 1.589 5.891 4.072 7.328 2.445 1.416 5.42.63 8.295-.129 1.938-.512 3.941-1.043 5.259-.69 1.224.327 2.647 1.747 4.024 3.121 2.048 2.043 4.368 4.359 7.3 4.359s5.257-2.316 7.305-4.359c1.377-1.374 2.8-2.794 4.023-3.121 1.315-.352 3.322.178 5.259.69 2.876.761 5.848 1.546 8.294.13 2.483-1.437 3.291-4.432 4.072-7.329.516-1.913 1.05-3.892 1.983-4.825s2.911-1.466 4.825-1.982c2.9-.781 5.891-1.589 7.328-4.071 1.416-2.446.631-5.42-.129-8.3-.513-1.939-1.042-3.943-.69-5.259.334-1.229 1.751-2.647 3.125-4.024zm-5.815 10.175c.578 2.19 1.176 4.454.484 5.649-.713 1.232-3 1.85-5.21 2.445-2.358.636-4.795 1.293-6.389 2.887s-2.252 4.031-2.887 6.389c-.6 2.211-1.213 4.5-2.445 5.211-1.2.692-3.459.092-5.648-.485-2.38-.629-4.842-1.277-7.057-.687-2.128.568-3.889 2.325-5.591 4.024-1.645 1.641-3.345 3.337-4.833 3.337s-3.188-1.7-4.832-3.337c-1.7-1.7-3.463-3.456-5.592-4.024a7.3 7.3 0 0 0 -1.892-.233 20.876 20.876 0 0 0 -5.165.92c-2.189.577-4.454 1.174-5.648.484-1.233-.713-1.85-3-2.446-5.21-.635-2.358-1.292-4.795-2.886-6.389s-4.032-2.252-6.389-2.887c-2.211-.6-4.5-1.213-5.21-2.445-.692-1.2-.094-3.459.484-5.648.629-2.38 1.28-4.842.687-7.057-.569-2.128-2.325-3.889-4.024-5.591-1.64-1.645-3.337-3.345-3.337-4.833s1.7-3.188 3.337-4.833c1.7-1.7 3.455-3.463 4.024-5.591.593-2.215-.058-4.677-.687-7.058-.578-2.189-1.175-4.452-.484-5.647.713-1.232 3-1.85 5.21-2.445 2.358-.636 4.8-1.293 6.389-2.887s2.252-4.031 2.887-6.389c.6-2.211 1.213-4.5 2.445-5.211 1.193-.692 3.458-.093 5.648.485 2.381.63 4.844 1.279 7.057.687 2.129-.568 3.889-2.325 5.592-4.024 1.644-1.641 3.344-3.337 4.832-3.337s3.188 1.7 4.833 3.337c1.7 1.7 3.463 3.456 5.591 4.024 2.215.592 4.677-.057 7.056-.687 2.19-.577 4.453-1.176 5.649-.484 1.232.713 1.85 3 2.445 5.21.636 2.358 1.293 4.8 2.887 6.389s4.031 2.252 6.389 2.887c2.211.6 4.5 1.213 5.211 2.445.691 1.2.093 3.459-.485 5.648-.629 2.38-1.279 4.842-.687 7.057.568 2.128 2.325 3.889 4.024 5.591 1.641 1.645 3.337 3.345 3.337 4.833s-1.7 3.188-3.337 4.833c-1.7 1.7-3.456 3.463-4.024 5.591-.589 2.214.058 4.676.687 7.056z"></path>
                                  <path d="m77.671 49.87a5.708 5.708 0 0 0 -4.065 1.685l-12.695 12.693-6.517-6.517a5.75 5.75 0 1 0 -8.132 8.131l10.583 10.583a5.748 5.748 0 0 0 8.132 0l16.76-16.758a5.751 5.751 0 0 0 -4.066-9.817zm1.592 7.341-16.763 16.76a2.306 2.306 0 0 1 -3.182 0l-10.581-10.583a2.25 2.25 0 0 1 3.182-3.182l7.755 7.754a1.748 1.748 0 0 0 2.474 0l13.934-13.932a2.3 2.3 0 0 1 3.181 0 2.249 2.249 0 0 1 0 3.181z"></path>
                                </g>
                              </svg>
                            )}
                            {v.id === 'pill' && (
                              <svg
                                viewBox="0 0 48 48"
                                className="w-12 h-12 fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g>
                                  <path d="m43.93 4.07a14 14 0 0 0 -19.66 0l-20.2 20.2a13.9 13.9 0 0 0 19.66 19.66l20.2-20.2a13.92 13.92 0 0 0 0-19.66zm-23 37a9.9 9.9 0 0 1 -14-14l8.68-8.69 14 14zm20.17-20.17-8.68 8.69-14-14 8.68-8.69a9.9 9.9 0 0 1 14 14z"></path>
                                </g>
                              </svg>
                            )}
                          </div>

                          {/* Label */}
                          <div className="text-center z-10">
                            <span
                              className={`block text-xs font-black uppercase tracking-[0.2em] mb-1
                              ${config.variant === v.id ? 'text-white' : 'text-current'}
                            `}
                            >
                              {v.label.split(' ')[0]}
                            </span>
                            <span
                              className={`block text-[11px] font-mono
                              ${
                                config.variant === v.id
                                  ? 'text-purple-400'
                                  : 'text-current opacity-60'
                              }
                            `}
                            >
                              ({v.label.split(' ')[1]?.replace(/[()]/g, '') || 'STD'})
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* 2. TEXT CONTENT */}
                  <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 shadow-inner overflow-hidden">
                    <div className="bg-[#111] px-5 py-3 border-b border-white/5 flex items-center gap-2">
                      <Type size={14} className="text-blue-500" />
                      <span className="text-white font-bold uppercase text-xs tracking-[0.2em] opacity-80">
                        Conteúdo
                      </span>
                    </div>

                    <div className="p-5 space-y-5">
                      <div className="relative group">
                        <label className="absolute -top-2 left-3 bg-[#1a1a1a] px-2 text-[9px] font-bold text-gray-500 uppercase transition-colors group-focus-within:text-purple-500">
                          Texto Principal
                        </label>
                        <input
                          value={config.text}
                          onChange={e => setConfig({ ...config, text: e.target.value })}
                          className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:bg-black outline-none font-bold text-sm transition-all"
                          placeholder="Ex: OFERTA"
                        />
                        <div className="absolute right-3 bottom-3 opacity-30 text-[9px] font-mono">
                          {config.text.length}/12
                        </div>
                      </div>

                      {config.variant === 'ribbon' && (
                        <div className="relative group animate-[fadeIn_0.3s_ease-out]">
                          <label className="absolute -top-2 left-3 bg-[#1a1a1a] px-2 text-[9px] font-bold text-gray-500 uppercase transition-colors group-focus-within:text-purple-500">
                            Sub-texto
                          </label>
                          <input
                            value={config.subText || ''}
                            onChange={e => setConfig({ ...config, subText: e.target.value })}
                            className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:bg-black outline-none font-mono text-xs transition-all"
                            placeholder="Ex: HOJE"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* 3. APPEARANCE - CARD LAYOUT (PREMIUM & ORGANIZED) */}
                  <div className="space-y-6">
                    {/* CARD 1: COLOR PALETTE */}
                    <div className="bg-[#111] rounded-2xl border border-white/5 shadow-inner overflow-hidden">
                      <div className="px-5 py-3 border-b border-white/5 bg-[#151515] flex items-center justify-between">
                        <span className="text-white font-black uppercase text-xs tracking-[0.2em] flex items-center gap-2">
                          <Palette size={14} className="text-purple-500" />
                          Paleta de Cores
                        </span>
                      </div>
                      <div className="p-5">
                        {/* Compact Grid for colors */}
                        <div className="flex flex-wrap gap-2">
                          {COLORS.map(c => (
                            <button
                              key={c.id}
                              onClick={() => setConfig({ ...config, color: c.id })}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 relative group shadow-lg
                                       ${
                                         config.color === c.id
                                           ? 'scale-110 ring-2 ring-white z-10'
                                           : 'opacity-90 hover:opacity-100 hover:scale-105 hover:z-10 ring-1 ring-white/10'
                                       } ${c.class}
                                       ${
                                         c.id === 'transparent'
                                           ? '!bg-transparent border-2 border-dashed border-white/20 hover:border-white/50'
                                           : ''
                                       }
                                   `}
                              title={c.label}
                            >
                              {config.color === c.id ? (
                                <Check
                                  size={14}
                                  strokeWidth={4}
                                  className="text-white drop-shadow-md"
                                />
                              ) : c.id === 'transparent' ? (
                                <div className="w-full h-[1px] bg-red-500/30 rotate-45 transform scale-125" />
                              ) : null}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* CARD 2: TYPOGRAPHY (Split Fonts & Text Colors) */}
                    <div className="bg-[#111] rounded-2xl border border-white/5 shadow-inner overflow-hidden">
                      <div className="px-5 py-3 border-b border-white/5 bg-[#151515] flex items-center justify-between">
                        <span className="text-white font-black uppercase text-xs tracking-[0.2em] flex items-center gap-2">
                          <Type size={14} className="text-blue-500" />
                          Tipografia
                        </span>
                      </div>

                      <div className="p-5 grid grid-cols-1 gap-6">
                        {/* Fonts */}
                        <div>
                          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">
                            Estilo da Fonte
                          </label>
                          <div className="grid grid-cols-2 gap-2 h-48 overflow-y-auto pr-2 custom-scrollbar content-start">
                            {FONTS.map(f => (
                              <button
                                key={f.id}
                                onClick={() => setConfig({ ...config, fontFamily: f.id as any })}
                                className={`py-3 px-2 rounded-lg border text-[10px] uppercase font-bold transition-all truncate flex items-center justify-center
                                         ${
                                           config.fontFamily === f.id
                                             ? 'bg-purple-600 text-white border-purple-500 shadow-lg'
                                             : 'bg-[#151515] text-gray-400 border-white/5 hover:border-white/20 hover:text-white'
                                         } ${f.class}
                                      `}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Text Colors */}
                        <div>
                          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">
                            Cor do Texto
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {TEXT_COLORS.map(tc => (
                              <button
                                key={tc.id}
                                onClick={() => setConfig({ ...config, textColor: tc.id })}
                                className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center relative
                                         ${
                                           config.textColor === tc.id
                                             ? 'border-white scale-110 shadow-lg z-10'
                                             : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105 ring-1 ring-white/10'
                                         }
                                         ${tc.class}
                                      `}
                              >
                                {config.textColor === tc.id && (
                                  <Check
                                    size={12}
                                    className="text-white drop-shadow-md"
                                    strokeWidth={4}
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CARD 3: ICONS */}
                    <div className="bg-[#111] rounded-2xl border border-white/5 shadow-inner overflow-hidden">
                      <div className="px-5 py-3 border-b border-white/5 bg-[#151515] flex items-center justify-between">
                        <span className="text-white font-black uppercase text-xs tracking-[0.2em] flex items-center gap-2">
                          <Crown size={14} className="text-yellow-500" weight="duotone" />
                          Ícone
                        </span>
                      </div>
                      <div className="p-5">
                        <div className="grid grid-cols-4 gap-3">
                          {ICONS.map(i => {
                            const Icon =
                              i.id === 'rocket'
                                ? Rocket
                                : i.id === 'crown'
                                ? Crown
                                : i.id === 'fire'
                                ? Fire
                                : i.id === 'zap'
                                ? Lightning
                                : i.id === 'star'
                                ? Star
                                : i.id === 'tag'
                                ? Tag
                                : i.id === 'percent'
                                ? Percent
                                : i.id === 'megaphone'
                                ? Megaphone
                                : i.id === 'trophy'
                                ? Trophy
                                : i.id === 'gift'
                                ? Gift
                                : i.id === 'heart'
                                ? Heart
                                : i.id === 'scissors'
                                ? Scissors
                                : i.id === 'user'
                                ? User
                                : i.id === 'map-pin'
                                ? MapPin
                                : i.id === 'calendar'
                                ? Calendar
                                : i.id === 'clock'
                                ? Clock
                                : i.id === 'seal'
                                ? Seal
                                : i.id === 'seal-check'
                                ? SealCheck
                                : i.id === 'seal-percent'
                                ? SealPercent
                                : i.id === 'seal-warning'
                                ? SealWarning
                                : i.id === 'ticket'
                                ? Ticket
                                : i.id === 'medal'
                                ? Medal
                                : i.id === 'sticker'
                                ? Sticker
                                : Star; // Fallback

                            const isActive = config.icon === i.id;

                            return (
                              <button
                                key={i.id}
                                onClick={() => setConfig({ ...config, icon: i.id })}
                                className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all group relative overflow-hidden
                                            ${
                                              isActive
                                                ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                                                : 'bg-[#151515] border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300'
                                            }
                                        `}
                              >
                                <Icon
                                  size={24}
                                  weight={isActive ? 'fill' : 'duotone'}
                                  className={`transition-transform duration-300 group-hover:scale-110 drop-shadow-lg ${
                                    isActive ? 'text-purple-400' : 'text-gray-500'
                                  }`}
                                />
                                <span
                                  className={`text-[8px] font-bold uppercase tracking-wider z-10 ${
                                    isActive ? 'text-white' : 'text-gray-600'
                                  }`}
                                >
                                  {i.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* ICON COLOR SELECTOR - ADDED */}
                        <div className="pt-4 border-t border-white/5 mt-4">
                          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-3 px-1">
                            Cor do Ícone
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {/* Add 'inherit' option */}
                            <button
                              onClick={() => setConfig({ ...config, iconColor: undefined })}
                              className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all bg-[#151515]
                                   ${
                                     !config.iconColor
                                       ? 'ring-2 ring-white scale-110'
                                       : 'opacity-60 hover:opacity-100'
                                   }
                                `}
                              title="Original / Automático"
                            >
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-[10px] text-gray-500">Auto</span>
                              </div>
                            </button>

                            {[
                              '#FFFFFF',
                              '#000000',
                              '#FCA5A5',
                              '#FDBA74',
                              '#FDE047',
                              '#BEF264',
                              '#67E8F9',
                              '#C4B5FD',
                              '#F472B6',
                              '#EF4444',
                              '#3B82F6',
                              '#10B981',
                            ].map(color => (
                              <button
                                key={color}
                                onClick={() => setConfig({ ...config, iconColor: color })}
                                className={`w-8 h-8 rounded-full border border-white/5 flex items-center justify-center transition-all shadow-sm
                                     ${
                                       config.iconColor === color
                                         ? 'ring-2 ring-white scale-110 z-10'
                                         : 'opacity-80 hover:scale-105 hover:opacity-100'
                                     }
                                  `}
                                style={{ backgroundColor: color }}
                              >
                                {config.iconColor === color && (
                                  <Check
                                    size={12}
                                    className={
                                      [
                                        '#FFFFFF',
                                        '#FDE047',
                                        '#BEF264',
                                        '#FCA5A5',
                                        '#FDBA74',
                                        '#67E8F9',
                                        '#C4B5FD',
                                        '#F472B6',
                                      ].includes(color)
                                        ? 'text-black'
                                        : 'text-white'
                                    }
                                    strokeWidth={4}
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* 4. POSITION - REAL CARD INTERACTION */}
                  <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 shadow-inner overflow-hidden">
                    <div className="bg-[#111] px-5 py-3 border-b border-white/5 flex items-center gap-2">
                      <Move size={14} className="text-orange-500" />
                      <span className="text-white font-bold uppercase text-xs tracking-[0.2em] opacity-80">
                        Posição
                      </span>
                    </div>
                    <div className="p-4 flex flex-col items-center">
                      {/* WRAPPER FOR CARD + OVERLAY */}
                      <div className="relative w-full max-w-[320px]">
                        {/* REAL SERVICE CARD (Scaled Down slightly to fit) */}
                        <div className="relative rounded-xl overflow-hidden border-2 border-white/10 bg-[#1a1a1a] pointer-events-none">
                          <div className="flex flex-col h-auto">
                            {/* Image Banner Segment */}
                            <div className="w-full h-32 relative shrink-0 z-20">
                              <img
                                src={
                                  selectedService.image ||
                                  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80'
                                }
                                alt={selectedService.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 z-30 pointer-events-none">
                                <div className="w-full h-full relative">
                                  {badges.map((b, i) => (
                                    <div
                                      key={i}
                                      className={i !== activeBadgeIndex ? 'opacity-50' : ''}
                                    >
                                      <PromoBadge config={b} />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Content Segment */}
                            <div className="flex-1 p-3 flex flex-col justify-between bg-gradient-to-r from-[#1a1a1a] to-[#111]">
                              <div className="flex justify-between items-start z-10 mb-2">
                                <div className="flex flex-col">
                                  <h4 className="font-graffiti text-lg tracking-wide uppercase leading-none text-white transition-colors drop-shadow-lg">
                                    {selectedService.name}
                                  </h4>
                                  <div className="mt-1">
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-purple-400 flex items-center gap-1">
                                      <Sparkles size={8} /> Barber Studio
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="font-mono font-black text-sm px-2 py-0.5 rounded transform -skew-x-12 shadow-lg border bg-transparent text-white border-white/40">
                                    R$ {selectedService.priceValue.toFixed(2)}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-auto z-10 w-full">
                                {/* TICKER DESCRIPTION RESTORED */}
                                <div className="w-[70%] bg-black/60 rounded-lg border border-white/5 overflow-hidden h-6 flex items-center px-2 relative">
                                  <div className="w-full overflow-hidden">
                                    <div className="whitespace-nowrap antialiased animate-ticker text-gray-300">
                                      <span className="text-[8px] font-bold uppercase tracking-wide mr-8">
                                        {selectedService.description ||
                                          'Experiência Premium Barber Pro.'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="w-[30%] flex justify-end">
                                  <div className="w-full flex items-center justify-center gap-1 py-1 rounded-full border bg-[#222] text-gray-300 border-white/10">
                                    <Clock size={10} strokeWidth={3} />
                                    <span className="text-[8px] font-black uppercase">
                                      {selectedService.duration} min
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* OVERLAY GRID FOR SELECTION - 3x3 FULL INTERACTIVE */}
                        <div className="absolute inset-0 z-40 grid grid-cols-3 grid-rows-3 p-1 gap-1 h-full min-h-[190px]">
                          {/* Top Row */}
                          <button
                            onClick={() => setConfig({ ...config, position: 'top-left' })}
                            className={`rounded transition-all ${
                              config.position === 'top-left'
                                ? 'border-2 border-dashed border-purple-500'
                                : 'hover:bg-white/5'
                            }`}
                            title="Superior Esquerdo"
                          ></button>
                          <button
                            onClick={() => setConfig({ ...config, position: 'top-center' })}
                            className={`rounded transition-all ${
                              config.position === 'top-center'
                                ? 'border-2 border-dashed border-purple-500'
                                : 'hover:bg-white/5'
                            }`}
                            title="Superior Centro"
                          ></button>
                          <button
                            onClick={() => setConfig({ ...config, position: 'top-right' })}
                            className={`rounded transition-all ${
                              config.position === 'top-right'
                                ? 'border-2 border-dashed border-purple-500'
                                : 'hover:bg-white/5'
                            }`}
                            title="Superior Direito"
                          ></button>

                          {/* Middle Row */}
                          <button
                            onClick={() => setConfig({ ...config, position: 'mid-left' })}
                            className={`rounded transition-all ${
                              config.position === 'mid-left'
                                ? 'border-2 border-dashed border-purple-500'
                                : 'hover:bg-white/5'
                            }`}
                            title="Meio Esquerdo"
                          ></button>
                          <button
                            onClick={() => setConfig({ ...config, position: 'mid-center' })}
                            className={`rounded transition-all ${
                              config.position === 'mid-center'
                                ? 'border-2 border-dashed border-purple-500'
                                : 'hover:bg-white/5'
                            }`}
                            title="Meio Centro"
                          ></button>
                          <button
                            onClick={() => setConfig({ ...config, position: 'mid-right' })}
                            className={`rounded transition-all ${
                              config.position === 'mid-right'
                                ? 'border-2 border-dashed border-purple-500'
                                : 'hover:bg-white/5'
                            }`}
                            title="Meio Direito"
                          ></button>

                          {/* Bottom Row */}
                          <button
                            onClick={() => setConfig({ ...config, position: 'bottom-left' })}
                            className={`rounded transition-all ${
                              config.position === 'bottom-left'
                                ? 'border-2 border-dashed border-purple-500'
                                : 'hover:bg-white/5'
                            }`}
                            title="Inferior Esquerdo"
                          ></button>
                          <button
                            onClick={() => setConfig({ ...config, position: 'bottom-center' })}
                            className={`rounded transition-all ${
                              config.position === 'bottom-center'
                                ? 'border-2 border-dashed border-purple-500'
                                : 'hover:bg-white/5'
                            }`}
                            title="Inferior Centro"
                          ></button>
                          <button
                            onClick={() => setConfig({ ...config, position: 'bottom-right' })}
                            className={`rounded transition-all ${
                              config.position === 'bottom-right'
                                ? 'border-2 border-dashed border-purple-500'
                                : 'hover:bg-white/5'
                            }`}
                            title="Inferior Direito"
                          ></button>
                        </div>
                      </div>

                      <p className="text-center text-[10px] text-gray-500 mt-3 font-mono">
                        Toque na área do card para posicionar
                      </p>
                    </div>{' '}
                    {/* End Position Card */}
                  </div>{' '}
                  {/* End Appearance/Space-y-6 */}
                  {/* RADIAL MENU (Floating inside Scrollable) */}
                  <div className="w-full flex items-center justify-center py-10 pointer-events-auto">
                    <RadialMenu
                      onSave={handleSave}
                      onApplyNew={handleApply}
                      onView={() => setViewMode(!viewMode)}
                      onUndo={() => console.log('Undo')}
                      onRedo={() => console.log('Redo')}
                      onReset={handleReset}
                    />
                  </div>
                </div>{' '}
                {/* End Scrollable */}
              </div>{' '}
              {/* End Left Panel */}
              {/* RIGHT: PREVIEW */}
              <div className="flex-1 bg-black relative flex flex-col items-center justify-center p-10 overflow-hidden">
                {/* Bg Effects */}
                <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none animate-pulse-slow"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-2xl animate-[fadeIn_0.5s_ease-out]">
                  <div className="flex items-center gap-3 text-gray-500 font-graffiti text-2xl uppercase tracking-widest opacity-50 select-none">
                    <MonitorPlay size={24} /> Preview em Tempo Real
                  </div>

                  {/* CARD PREVIEW SCALE WRAPPER */}
                  <div className="transform scale-110 md:scale-125 lg:scale-135 transition-transform duration-500 hover:scale-[1.3] md:hover:scale-[1.45]">
                    <div className="w-[340px] bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 group relative select-none">
                      {/* IMAGE & BADGE */}
                      <div className="relative h-48 w-full bg-gray-900 overflow-hidden">
                        <img
                          src={selectedService.image}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-60"></div>

                        {/* THE BADGE COMPONENT - RENDER ALL LAYERS */}
                        <div className="absolute inset-0 z-30 pointer-events-none">
                          {badges.map((b, i) => (
                            <PromoBadge key={i} config={b} />
                          ))}
                        </div>
                      </div>

                      {/* CONTENT MOCK */}
                      <div className="p-5 relative bg-[#1a1a1a]">
                        <div className="absolute top-0 right-0 p-3 transform -translate-y-1/2">
                          <div className="bg-neon-yellow text-black font-black font-mono text-xl px-4 py-1 rounded shadow-lg border-2 border-white rotate-2">
                            R$ {selectedService.priceValue.toFixed(2)}
                          </div>
                        </div>

                        <h3 className="text-white font-graffiti text-3xl uppercase leading-none drop-shadow-lg mb-2">
                          {selectedService.name}
                        </h3>
                        <div className="flex items-center gap-4 text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {selectedService.duration} min
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                          <span>{selectedService.tag || 'Barber Pro'}</span>
                        </div>

                        <div className="w-full h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 font-bold text-xs uppercase tracking-widest group-hover:bg-white group-hover:text-black transition-colors cursor-pointer">
                          Reservar Agora
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-xs font-mono mt-8 text-center max-w-md">
                    * Esta é uma representação fiel de como o card aparecerá para seus clientes no
                    modal de agendamento.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
