import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
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
  const [currentDate, setCurrentDate] = useState(initialData.date);
  const [currentTime, setCurrentTime] = useState(initialData.time);
  const [selectedServiceId, setSelectedServiceId] = useState(initialData.serviceId || '');

  const [isTimeListOpen, setIsTimeListOpen] = useState(false);
  const [isServiceListOpen, setIsServiceListOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setClientName(initialData.clientName || '');
      setCurrentDate(initialData.date);
      setCurrentTime(initialData.time);
      setSelectedServiceId(initialData.serviceId || '');
      setIsTimeListOpen(false);
      setIsServiceListOpen(false);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    if (!clientName.trim() || !selectedServiceId || !currentTime) return;

    setIsSubmitting(true);
    try {
      await onConfirm({
        name: clientName,
        serviceId: selectedServiceId,
        date: getLocalISODate(currentDate), // Return string format YYYY-MM-DD
        time: currentTime,
        phone: '', // Optional
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

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="bg-[var(--bg-card)] w-full max-w-sm rounded-3xl border border-[var(--border-color)] shadow-[0_0_50px_rgba(0,0,0,0.8)] p-8 relative overflow-hidden group transition-colors duration-300">
        {/* Ambient Background Glows */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-neon-yellow/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Accent Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-linear-to-r from-transparent via-neon-yellow to-transparent shadow-[0_0_10px_#EAB308]"></div>

        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-1 block">
              {initialData.id ? 'Editar Detalhes' : 'Nova Solicitação'}
            </span>
            <h3 className="text-3xl font-black text-[var(--text-primary)] uppercase italic tracking-wider leading-none">
              Agendar
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-neon-yellow to-yellow-600">
                Horário
              </span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 relative z-10">
          {/* DATE & TIME CAPSULE */}
          <div className="bg-black/40 p-1 rounded-2xl border border-white/5 flex gap-1">
            {/* DATE */}
            <div className="flex-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-3 flex flex-col justify-between group/date hover:border-white/10 transition-colors relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover/date:opacity-100 transition-opacity"></div>
              <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest z-10">
                Data
              </label>
              <div className="flex items-center justify-between mt-1 z-10">
                <button
                  onClick={() => {
                    const d = new Date(currentDate);
                    d.setDate(d.getDate() - 1);
                    setCurrentDate(d);
                  }}
                  className="p-1 hover:bg-white/10 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[var(--text-primary)] font-bold text-sm uppercase">
                  {currentDate
                    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                    .replace('.', '')}
                </span>
                <button
                  onClick={() => {
                    const d = new Date(currentDate);
                    d.setDate(d.getDate() + 1);
                    setCurrentDate(d);
                  }}
                  className="p-1 hover:bg-white/10 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* TIME */}
            <div className="flex-[0.8] bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-3 flex flex-col justify-between group/time hover:border-neon-yellow/30 transition-colors relative overflow-hidden">
              <div className="absolute inset-0 bg-neon-yellow/5 opacity-0 group-hover/time:opacity-100 transition-opacity"></div>
              <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest z-10">
                Horário
              </label>

              <button
                onClick={() => setIsTimeListOpen(!isTimeListOpen)}
                className="flex items-center justify-between mt-1 z-10 w-full"
              >
                <span className="text-neon-yellow font-mono font-bold text-xl tracking-tight">
                  {currentTime || '--:--'}
                </span>
                <ChevronLeft
                  size={14}
                  className={`text-zinc-600 transition-transform ${
                    isTimeListOpen ? 'rotate-90' : '-rotate-90'
                  }`}
                />
              </button>

              {/* TIME DROPDOWN */}
              {isTimeListOpen && (
                <div className="absolute top-full right-0 mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,1)] z-50 w-40 max-h-48 overflow-y-auto custom-scrollbar p-1">
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
                        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(
                          2,
                          '0'
                        )}`;
                        return (
                          <button
                            key={timeStr}
                            onClick={() => {
                              setCurrentTime(timeStr);
                              setIsTimeListOpen(false);
                            }}
                            className={`px-2 py-2 text-xs font-mono font-bold rounded-lg transition-colors ${
                              currentTime === timeStr
                                ? 'bg-neon-yellow text-black'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
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
          <div className="space-y-4">
            {/* CLIENT NAME */}
            <div className="group relative">
              <div className="absolute left-4 top-3.5 pointer-events-none text-[var(--text-secondary)] group-focus-within:text-neon-yellow transition-colors">
                <span className="text-xs uppercase font-bold tracking-widest">Cliente</span>
              </div>
              <input
                autoFocus
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="Nome do cliente..."
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 pt-8 pb-3 text-[var(--text-primary)] font-bold placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-neon-yellow/50 focus:bg-[#1a1a1a] transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-800 group-focus-within:bg-neon-yellow transition-colors shadow-[0_0_10px_rgba(234,179,8,0)] group-focus-within:shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
            </div>

            {/* SERVICE SELECTOR */}
            <div className="group relative">
              <button
                onClick={() => setIsServiceListOpen(!isServiceListOpen)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 pt-8 pb-3 text-left font-bold focus:outline-none focus:border-neon-yellow/50 focus:bg-[#1a1a1a] transition-all flex justify-between items-center group-focus:border-neon-yellow/50"
              >
                <div className="absolute left-4 top-3.5 pointer-events-none text-[var(--text-secondary)] group-hover:text-neon-yellow transition-colors">
                  <span className="text-xs uppercase font-bold tracking-widest">Serviço</span>
                </div>

                <span
                  className={`text-[var(--text-primary)] ${
                    !selectedService ? 'text-[var(--text-secondary)]' : ''
                  }`}
                >
                  {selectedService?.name || 'Selecione...'}
                </span>

                <span className="text-neon-yellow text-sm bg-neon-yellow/10 px-2 py-0.5 rounded border border-neon-yellow/20">
                  {selectedService?.price || 'R$ --'}
                </span>
              </button>

              {/* SERVICE DROPDOWN */}
              {isServiceListOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 max-h-56 overflow-y-auto custom-scrollbar">
                  {services.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedServiceId(s.id);
                        setIsServiceListOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-bold border-b border-[var(--border-color)] transition-colors flex justify-between items-center group/opt
                            ${
                              selectedServiceId === s.id
                                ? 'bg-neon-yellow/10 text-neon-yellow'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                            }
                        `}
                    >
                      <span>{s.name}</span>
                      <span
                        className={`text-xs opacity-50 ${
                          selectedServiceId === s.id
                            ? 'text-neon-yellow'
                            : 'group-hover/opt:text-[var(--text-primary)]'
                        }`}
                      >
                        {s.price}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-5 bg-linear-to-r from-neon-yellow to-yellow-500 text-black font-black uppercase tracking-[0.2em] rounded-xl hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all mt-6 flex justify-center items-center gap-3 active:scale-[0.98] group/btn relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
            <span>{initialData.id ? 'Salvar Alterações' : 'Confirmar'}</span>
            <ChevronRight
              size={18}
              strokeWidth={3}
              className="group-hover/btn:translate-x-1 transition-transform"
            />
          </button>
        </div>

        {/* Footer decoration */}
        <div className="absolute bottom-4 left-0 w-full flex justify-center opacity-20 pointer-events-none">
          <div className="w-12 h-1 rounded-full bg-white/20"></div>
        </div>
      </div>
    </div>
  );
};
