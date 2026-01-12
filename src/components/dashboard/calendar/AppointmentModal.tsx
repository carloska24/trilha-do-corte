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
  Phone,
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

  // Helper Components for consistency with User's code
  const Input = ({
    icon,
    placeholder,
    value,
    onChange,
    inputMode,
  }: {
    icon: React.ReactNode;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputMode?: 'text' | 'numeric' | 'tel';
  }) => (
    <div className="mb-3 flex items-center gap-3 bg-[#0d0d0d] rounded-xl p-4 border border-white/5 transition-colors focus-within:border-yellow-400/50">
      <div className="text-yellow-400">{icon}</div>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-transparent outline-none text-white w-full placeholder:text-white/30 font-medium"
        inputMode={inputMode}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center backdrop-blur-sm animate-fade-in">
      <div className="w-[360px] rounded-3xl bg-linear-to-b from-[#141414] to-black p-5 shadow-2xl border border-white/5 relative overflow-visible">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white italic tracking-wide">
            NOVO <span className="text-yellow-400">AGENDAMENTO</span>
          </h1>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* DATA + HORA */}
        <div className="rounded-2xl border border-yellow-400/30 p-4 flex mb-4 bg-black/20">
          {/* DATA SECTION */}
          <div className="flex-1 text-center border-r border-white/10 pr-2">
            <p className="text-[10px] text-white/50 mb-1 uppercase tracking-widest font-bold">
              Data
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  const d = new Date(currentDate);
                  d.setDate(d.getDate() - 1);
                  setCurrentDate(d);
                }}
                className="text-yellow-400 text-xl cursor-pointer hover:scale-110 transition-transform p-1"
              >
                ‹
              </button>
              <span className="text-white font-bold text-sm uppercase whitespace-nowrap">
                {currentDate.getDate()}{' '}
                {currentDate
                  .toLocaleDateString('pt-BR', { month: 'short' })
                  .replace('.', '')
                  .toUpperCase()}
              </span>
              <button
                onClick={() => {
                  const d = new Date(currentDate);
                  d.setDate(d.getDate() + 1);
                  setCurrentDate(d);
                }}
                className="text-yellow-400 text-xl cursor-pointer hover:scale-110 transition-transform p-1"
              >
                ›
              </button>
            </div>
          </div>

          {/* TIME SECTION */}
          <div className="flex-1 text-center pl-2 relative">
            <p className="text-[10px] text-white/50 mb-1 uppercase tracking-widest font-bold">
              Horário
            </p>
            <div
              onClick={() => setIsTimeListOpen(!isTimeListOpen)}
              className="flex items-center justify-center gap-2 cursor-pointer hover:bg-white/5 rounded-lg py-1 transition-colors"
            >
              <span className="text-white font-bold text-lg">{currentTime || '--:--'}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  currentTime ? 'bg-yellow-400 shadow-[0_0_8px_#FACC15]' : 'bg-red-500'
                }`}
              />
            </div>

            {/* Time Dropdown (Absolute) */}
            {isTimeListOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar p-2">
                <div className="grid grid-cols-2 gap-1">
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
                      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                      return (
                        <button
                          key={timeStr}
                          onClick={e => {
                            e.stopPropagation();
                            setCurrentTime(timeStr);
                            setIsTimeListOpen(false);
                          }}
                          className={`py-1.5 text-xs font-bold rounded-md transition-colors ${
                            currentTime === timeStr
                              ? 'bg-yellow-400 text-black'
                              : 'text-gray-400 hover:bg-white/5 hover:text-white'
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

        {/* INPUTS */}
        <Input
          icon={<User size={18} />}
          placeholder="Nome do cliente"
          value={clientName}
          onChange={e => setClientName(e.target.value)}
        />
        <Input
          icon={<Phone size={18} />} // Using Lucide 'Phone' or custom SVG
          placeholder="(00) 00000-0000"
          value={clientPhone}
          onChange={e => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 11) v = v.slice(0, 11);
            if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
            if (v.length > 9) v = `${v.slice(0, 9)}-${v.slice(9)}`;
            setClientPhone(v);
          }}
          inputMode="numeric"
        />

        {/* SERVICE SELECT */}
        <div
          onClick={() => setIsServiceSelectionMode(true)}
          className="mb-2 flex items-center justify-between bg-[#0d0d0d] rounded-xl p-4 border border-white/5 cursor-pointer hover:bg-[#141414] transition-colors hover:border-white/10"
        >
          <div className="flex items-center gap-3 text-white/80">
            <div className="text-yellow-400">
              <Scissors size={18} />
            </div>
            <span className={`font-medium ${selectedService ? 'text-white' : 'text-white/40'}`}>
              {selectedService ? selectedService.name : 'Selecionar Serviço'}
            </span>
          </div>
          <span className="text-white/40 text-xl">›</span>
        </div>

        {/* CONFIRM BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="mt-5 w-full py-4 rounded-2xl bg-linear-to-r from-yellow-400 to-yellow-500 text-black font-bold text-lg hover:scale-[1.02] transition-transform active:scale-[0.98] shadow-lg shadow-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'CONFIRMAR ✓'
          )}
        </button>
      </div>
    </div>
  );
};
