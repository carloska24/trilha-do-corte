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

// Componente Input movido para fora para evitar re-criação e perda de foco
const FormInput = ({
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

  // Render Service Selection as Compact Dropdown Overlay
  if (isServiceSelectionMode) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
        <div className="w-full max-w-sm bg-zinc-900 rounded-2xl border border-zinc-700/50 shadow-2xl overflow-hidden">
          {/* Compact Header */}
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors size={16} className="text-yellow-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Selecionar Serviço
              </h3>
            </div>
            <button
              onClick={() => setIsServiceSelectionMode(false)}
              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Compact Service List */}
          <div className="max-h-[50vh] overflow-y-auto scrollbar-hide">
            {services.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedServiceId(s.id);
                  setIsServiceSelectionMode(false);
                }}
                className={`w-full px-5 py-3.5 flex items-center justify-between transition-all border-b border-zinc-800/50 last:border-b-0
                  ${selectedServiceId === s.id ? 'bg-yellow-500/10' : 'hover:bg-zinc-800/50'}`}
              >
                <div className="flex items-center gap-3">
                  {/* Selection Indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                    ${
                      selectedServiceId === s.id
                        ? 'border-yellow-500 bg-yellow-500'
                        : 'border-zinc-600'
                    }`}
                  >
                    {selectedServiceId === s.id && <Check size={12} className="text-black" />}
                  </div>

                  {/* Service Name + Duration */}
                  <div className="text-left">
                    <span
                      className={`text-sm font-bold ${
                        selectedServiceId === s.id ? 'text-white' : 'text-zinc-300'
                      }`}
                    >
                      {s.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 ml-2">{s.duration}min</span>
                  </div>
                </div>

                {/* Price */}
                <span
                  className={`text-sm font-black ${
                    selectedServiceId === s.id ? 'text-yellow-500' : 'text-zinc-500'
                  }`}
                >
                  {s.price}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
        <FormInput
          icon={<User size={18} />}
          placeholder="Nome do cliente"
          value={clientName}
          onChange={e => setClientName(e.target.value)}
        />
        <FormInput
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
