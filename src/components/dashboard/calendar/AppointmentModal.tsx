import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Scissors,
  Calendar,
  Clock,
  Check,
  ChevronDown,
} from 'lucide-react';
import { Service, ShopSettings, BookingData } from '../../../types';
import { getLocalISODate } from '../../../utils/dateUtils';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    id?: string | null;
    date: Date;
    time: string;
    clientName?: string;
    serviceId?: string;
  };
  services: Service[];
  shopSettings: ShopSettings;
  onConfirm: (data: BookingData & { id?: string | null }) => Promise<void>;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  initialData,
  services,
  shopSettings,
  onConfirm,
}) => {
  const [clientName, setClientName] = useState(initialData.clientName || '');
  const [clientPhone, setClientPhone] = useState('');
  const [currentDate, setCurrentDate] = useState(initialData.date);
  const [currentTime, setCurrentTime] = useState(initialData.time);
  const [selectedServiceId, setSelectedServiceId] = useState(initialData.serviceId || '');

  const [isTimeListOpen, setIsTimeListOpen] = useState(false);
  const [isServiceSelectionMode, setIsServiceSelectionMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setClientName(initialData.clientName || '');
      setClientPhone('');
      setCurrentDate(initialData.date);
      setCurrentTime(initialData.time);
      setSelectedServiceId(initialData.serviceId || '');
      setIsTimeListOpen(false);
      setIsServiceSelectionMode(false);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    // Validate: Name, Service, Time. Phone is technically optional for legacy reasons but recommended.
    // However, user specifically asked for it. Let's make it mandatory if we want to enforce it?
    // Usually for "Provisional", Name is enough, but user said "precisamos inserir o campo telefone".
    // I will keep it as standard required check for UX if desired, but for now just passing it.
    if (!clientName.trim() || !selectedServiceId || !currentTime) return;

    setIsSubmitting(true);
    try {
      await onConfirm({
        name: clientName,
        phone: clientPhone, // Passing the new phone
        serviceId: selectedServiceId,
        date: getLocalISODate(currentDate),
        time: currentTime,
        id: initialData.id,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService = services.find(s => s.id === selectedServiceId);

  if (!isOpen) return null;

  // Render Service Selection Overlay
  if (isServiceSelectionMode) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-secondary)]">
            <h3 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
              Selecionar Serviço
            </h3>
            <button
              onClick={() => setIsServiceSelectionMode(false)}
              className="p-2 rounded-full hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
            {services.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedServiceId(s.id);
                  setIsServiceSelectionMode(false);
                }}
                className={`w-full p-4 rounded-xl border flex justify-between items-center transition-all duration-200 group
                  ${
                    selectedServiceId === s.id
                      ? 'bg-neon-yellow/10 border-neon-yellow/50 shadow-[0_0_20px_rgba(234,179,8,0.1)]'
                      : 'bg-transparent border-[var(--border-color)] hover:border-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      selectedServiceId === s.id
                        ? 'bg-neon-yellow text-black'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <Scissors size={18} />
                  </div>
                  <div className="text-left">
                    <div
                      className={`font-bold text-sm ${
                        selectedServiceId === s.id
                          ? 'text-[var(--text-primary)]'
                          : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {s.name}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] opacity-80">
                      {s.duration} min
                    </div>
                  </div>
                </div>
                <div
                  className={`font-mono font-bold text-sm ${
                    selectedServiceId === s.id ? 'text-neon-yellow' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {s.price}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md group transition-all duration-300">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-yellow/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative p-6 z-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase italic tracking-wider leading-none">
                Novo <span className="text-neon-yellow">Agendamento</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500 hover:border-red-500 transition-all shadow-lg active:scale-95"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {/* UNIFIED DATE & TIME BAR */}
            <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] flex overflow-hidden min-h-[88px] relative shadow-sm group/bar hover:border-[var(--text-secondary)]/30 transition-colors">
              {/* DATE SECTION (60%) */}
              <div className="flex-1 flex items-center justify-between px-3 py-2 border-r border-[var(--border-color)] relative group/date hover:bg-[var(--bg-card)] transition-colors">
                <button
                  onClick={() => {
                    const d = new Date(currentDate);
                    d.setDate(d.getDate() - 1);
                    setCurrentDate(d);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-all active:scale-95"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-1">
                    Data
                  </span>
                  <div className="flex items-center gap-2">
                    <Calendar
                      size={14}
                      className="text-neon-yellow opacity-0 group-hover/date:opacity-100 transition-opacity absolute -ml-6"
                    />
                    <span className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight leading-none group-hover/date:translate-x-1 transition-transform">
                      {currentDate
                        .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                        .replace('.', '')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const d = new Date(currentDate);
                    d.setDate(d.getDate() + 1);
                    setCurrentDate(d);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-all active:scale-95"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* TIME SECTION (40%) */}
              <div
                onClick={() => setIsTimeListOpen(!isTimeListOpen)}
                className="w-[40%] flex flex-col items-center justify-center relative cursor-pointer hover:bg-[var(--bg-card)] transition-colors group/time"
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                    Horário
                  </span>
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-shadow duration-300 ${
                      currentTime ? 'bg-neon-yellow shadow-[0_0_8px_#EAB308]' : 'bg-red-500/50'
                    }`}
                  ></div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-2xl font-mono font-bold text-[var(--text-primary)] tracking-tighter group-hover/time:text-neon-yellow transition-colors">
                    {currentTime || '--:--'}
                  </span>
                  <ChevronDown
                    size={14}
                    className="text-[var(--text-secondary)] mt-1 group-hover/time:text-neon-yellow transition-colors"
                  />
                </div>

                {/* Time Dropdown (Centered relative to container) */}
                {isTimeListOpen && (
                  <div className="absolute top-full right-0 left-0 mt-2 -mx-12 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar p-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-4 gap-1.5">
                      {Array.from(
                        {
                          length:
                            (shopSettings.endHour - shopSettings.startHour) *
                            (60 / (shopSettings.slotInterval || 60)),
                        },
                        (_, i) => {
                          const totalMinutes =
                            shopSettings.startHour * 60 + i * (shopSettings.slotInterval || 60);
                          const h = Math.floor(totalMinutes / 60);
                          const m = totalMinutes % 60;
                          const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(
                            2,
                            '0'
                          )}`;
                          return (
                            <button
                              key={timeStr}
                              onClick={e => {
                                e.stopPropagation();
                                setCurrentTime(timeStr);
                                setIsTimeListOpen(false);
                              }}
                              className={`py-2 text-xs font-mono font-bold rounded-lg transition-all ${
                                currentTime === timeStr
                                  ? 'bg-neon-yellow text-black shadow-lg shadow-neon-yellow/20'
                                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'
                              }`}
                            >
                              {timeStr}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Client Input Group */}
            <div className="space-y-3">
              {/* Name Input */}
              <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] p-4 flex items-center gap-4 transition-all focus-within:border-neon-yellow/50 focus-within:shadow-[0_0_20px_rgba(234,179,8,0.1)] focus-within:bg-[var(--bg-card)]">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                  <User size={20} />
                </div>
                <div className="flex-1">
                  <input
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="Nome do cliente"
                    className="w-full bg-transparent border-none p-0 text-[var(--text-primary)] font-bold text-lg placeholder:text-[var(--text-secondary)]/50 focus:ring-0 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] p-4 flex items-center gap-4 transition-all focus-within:border-neon-yellow/50 focus-within:shadow-[0_0_20px_rgba(234,179,8,0.1)] focus-within:bg-[var(--bg-card)]">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <input
                    value={clientPhone}
                    onChange={e => {
                      // Basic Phone Mask (BR)
                      let v = e.target.value.replace(/\D/g, '');
                      if (v.length > 11) v = v.slice(0, 11);
                      if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
                      if (v.length > 9) v = `${v.slice(0, 9)}-${v.slice(9)}`;
                      setClientPhone(v);
                    }}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-transparent border-none p-0 text-[var(--text-primary)] font-bold text-lg placeholder:text-[var(--text-secondary)]/50 focus:ring-0 focus:outline-none"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>

            {/* Service Selection Button */}
            <button
              onClick={() => setIsServiceSelectionMode(true)}
              className={`w-full bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] p-4 flex items-center gap-4 transition-all hover:border-neon-yellow/50 hover:bg-[var(--bg-card)] group ${
                selectedService ? 'border-neon-yellow/50 bg-[var(--bg-card)]' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  selectedService
                    ? 'bg-neon-yellow text-black'
                    : 'bg-[var(--bg-primary)] text-[var(--text-secondary)]'
                }`}
              >
                <Scissors size={20} />
              </div>
              <div className="flex-1 text-left">
                <div
                  className={`font-bold text-lg leading-tight ${
                    selectedService ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {selectedService?.name || 'Selecionar Serviço'}
                </div>
                {selectedService && (
                  <div className="text-xs text-neon-yellow mt-0.5">{selectedService.price}</div>
                )}
              </div>
              <ChevronRight
                size={20}
                className="text-[var(--text-secondary)] group-hover:text-neon-yellow transition-colors"
              />
            </button>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full mt-8 py-5 rounded-2xl bg-linear-to-r from-neon-yellow to-yellow-500 text-black font-black uppercase tracking-widest text-lg shadow-lg hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Confirmar</span>
                <Check size={20} strokeWidth={3} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
