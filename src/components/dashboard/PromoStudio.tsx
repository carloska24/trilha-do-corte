import React, { useState, useEffect, useRef } from 'react';
import { Service, BadgeConfig } from '../../types';
import { X } from 'lucide-react';
import { PromoControls } from './promo/PromoControls';
import { PromoPreview } from './promo/PromoPreview';
import { ServiceSelector } from './promo/ServiceSelector';

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

  // COMPATIBILITY ALIASES
  const config = activeBadge || createDefaultBadge(selectedService?.name || 'Service');
  const setConfig = (newConfig: BadgeConfig) => {
    if (activeBadgeIndex !== null && badges[activeBadgeIndex]) {
      updateActiveBadge(newConfig);
    } else {
      // Auto-Create on Edit (User interacted while in Empty State)
      const newBadge = {
        ...createDefaultBadge(selectedService?.name || 'Service'),
        ...newConfig,
      };
      setBadges([newBadge]);
      setActiveBadgeIndex(0);
    }
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

  // HISTORY STATE (Undo/Redo)
  const [history, setHistory] = useState<BadgeConfig[][]>([]);
  const [future, setFuture] = useState<BadgeConfig[][]>([]);

  // Helper to push to history before making changes
  const saveToHistory = () => {
    setHistory(prev => [...prev, badges]);
    setFuture([]); // Clear future on new action
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    const previousBadges = newHistory.pop();
    if (previousBadges) {
      setFuture(prev => [badges, ...prev]);
      setBadges(previousBadges);
      setHistory(newHistory);
      // Reset active index if out of bounds
      if (activeBadgeIndex !== null && activeBadgeIndex >= previousBadges.length) {
        setActiveBadgeIndex(previousBadges.length > 0 ? 0 : null);
      }
    }
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const newFuture = [...future];
    const nextBadges = newFuture.shift();
    if (nextBadges) {
      setHistory(prev => [...prev, badges]);
      setBadges(nextBadges);
      setFuture(newFuture);
    }
  };

  // Wrap atomic actions with history
  const handleAddNewLayer = () => {
    saveToHistory();
    const newBadge = createDefaultBadge(selectedService?.name || 'Service');
    const newBadges = [...badges, newBadge];
    setBadges(newBadges);
    setActiveBadgeIndex(newBadges.length - 1); // Select the new one
  };

  const handleDeleteLayer = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    saveToHistory();
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
      onSavePromo(selectedServiceId, { badges });
      onClose();
    }
  };

  const handleApply = () => {
    if (selectedServiceId) {
      saveToHistory();
      // Create new badge
      const newBadge = createDefaultBadge(selectedService?.name || 'Service');
      const newBadgesList = [...badges, newBadge];

      // Update Local State
      setBadges(newBadgesList);
      setActiveBadgeIndex(newBadgesList.length - 1); // Select the new one

      // Save Global State (With the new badge included) - Optional, maybe wait for explicit save?
      // onSavePromo(selectedServiceId, { badges: newBadgesList });
    }
  };

  const handleReset = () => {
    saveToHistory();
    // TRUE RESET: Clear all badges.
    setBadges([]);
    setActiveBadgeIndex(null);
  };

  const handleBack = () => {
    if (initialServiceId) {
      onClose();
    } else {
      setStep(1);
      setSelectedServiceId(null);
    }
  };

  // Wrapper for update that doesn't save history (for TextInput) vs ones that do?
  // For now we just pass setConfig directly.

  const [viewMode, setViewMode] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Header - Full Width Banner */}
        <div className="relative w-full h-32 bg-[#101010] border-b border-[#222] p-0 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 z-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')]"></div>

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
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-[var(--text-secondary)] hover:text-white border border-white/5 hover:border-white/20 transition-all z-20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto md:overflow-hidden flex flex-col md:flex-row">
          {/* STEP 1: SERVICE SELECTOR */}
          {step === 1 && (
            <ServiceSelector
              services={services}
              selectedServiceId={selectedServiceId}
              onSelect={id => {
                setSelectedServiceId(id);
                setStep(2);
              }}
            />
          )}

          {/* STEP 2: PLAYGROUND */}
          {step === 2 && selectedService && (
            <div className="w-full flex flex-col lg:flex-row h-auto md:h-full">
              {/* LEFT: CONTROLS */}
              <PromoControls
                config={config}
                setConfig={setConfig}
                selectedService={selectedService}
                badges={badges}
                activeBadgeIndex={activeBadgeIndex}
                onBack={handleBack}
                onSave={handleSave}
                onApplyNew={handleApply}
                onReset={handleReset}
                onUndo={handleUndo}
                onRedo={handleRedo}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />

              {/* RIGHT: PREVIEW */}
              <div className="w-full h-auto min-h-[400px] lg:h-full border-t border-[var(--border-color)] lg:border-none">
                <PromoPreview selectedService={selectedService} badges={badges} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
