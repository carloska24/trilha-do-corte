import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Calendar,
  Clock,
  CheckCircle,
  Loader2,
  ChevronRight,
  User,
  Scissors,
  ChevronLeft,
  MapPin,
  Smartphone,
  Crown,
  Search,
} from 'lucide-react';
import { ServiceItem, BookingData } from '../types';
import { PromoBadge } from './ui/PromoBadge';
import { TicketCard } from './ui/TicketCard';
import { ServiceCard } from './ui/ServiceCard';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: BookingData) => void;
  initialData?: Partial<BookingData>;
  services: ServiceItem[];
}

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const MOCK_IMAGES: Record<string, string> = {
  default:
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=400&auto=format&fit=crop',
  Corte:
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400&auto=format&fit=crop',
  Barba:
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=400&auto=format&fit=crop',
};

const STEPS = [
  { number: 1, title: 'Serviço' },
  { number: 2, title: 'Agenda' },
  { number: 3, title: 'Passageiro' },
  { number: 4, title: 'Bilhete' },
];

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  services,
}) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BookingData>({
    name: '',
    phone: '',
    serviceId: '',
    date: '',
    time: '',
  });

  const dateInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize data
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        name: initialData?.name || '',
        phone: initialData?.phone || '',
        serviceId: initialData?.serviceId || (services.length > 0 ? services[0].id : ''),
        date: '',
        time: '',
      }));
      setStep(1);
    }
  }, [isOpen, initialData, services]);

  if (!isOpen) return null;

  // Helper to get current service
  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const selectedService = services.find(s => s.id === formData.serviceId);

  const handleNext = () => {
    if (step === 1 && formData.serviceId) setStep(2);
    if (step === 2 && formData.date && formData.time) setStep(3);
    if (step === 3 && formData.name && formData.phone) handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      if (onSubmit) {
        onSubmit(formData);
      }
      setIsLoading(false);
      setStep(4); // Success step
    }, 1500);
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-[#111] border border-white/10 w-[95%] md:w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] md:h-auto md:max-h-[90vh] animate-[fadeIn_0.3s_ease-out]">
        {/* Header with Steps */}
        <div className="px-6 pt-6 pb-4 bg-[#151515] border-b border-white/5 relative z-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black font-graffiti text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-neon-yellow">NOVA</span> VIAGEM
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex justify-between relative">
            {/* Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -z-10 -translate-y-1/2 rounded-full"></div>

            {STEPS.map(s => (
              <div
                key={s.number}
                className={`flex flex-col items-center gap-2 relative z-10 
                  ${
                    step >= s.number ? 'text-neon-yellow' : 'text-gray-600'
                  } transition-colors duration-300`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-4 transition-all duration-500
                      ${
                        step === s.number
                          ? 'bg-neon-yellow text-black border-black shadow-[0_0_15px_rgba(234,179,8,0.5)] scale-110'
                          : step > s.number
                          ? 'bg-neon-yellow text-black border-neon-yellow'
                          : 'bg-[#111] border-gray-800 text-gray-500'
                      }`}
                >
                  {step > s.number ? <CheckCircle size={14} /> : s.number}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative min-h-[400px]">
          {/* STEP 1: SERVICE SELECTION */}
          {step === 1 && (
            <div className="space-y-4 animate-[slideRight_0.3s_ease-out]">
              <div className="relative mb-4 group">
                <Search
                  className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-yellow transition-colors"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="ESCOLHA SEU DESTINO"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-800 focus:border-neon-yellow text-sm font-bold text-white uppercase tracking-widest pl-6 py-2 focus:outline-none placeholder-gray-600 transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 pb-2">
                {filteredServices.map((s, index) => (
                  <div key={s.id} className="h-full">
                    <ServiceCard
                      service={s}
                      isSelected={formData.serviceId === s.id}
                      onClick={() => setFormData({ ...formData, serviceId: s.id })}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: DATE & TIME */}
          {step === 2 && (
            <div className="space-y-6 animate-[slideRight_0.3s_ease-out]">
              {/* Date Picker */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                  Data da Partida
                </label>
                <div
                  onClick={() => {
                    try {
                      dateInputRef.current?.showPicker();
                    } catch (e) {
                      dateInputRef.current?.focus();
                    }
                  }}
                  className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-neon-yellow transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-neon-yellow group-hover:text-black transition-colors">
                    <Calendar size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase font-bold">Data Selecionada</p>
                    <input
                      ref={dateInputRef}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className="bg-transparent text-white font-mono font-bold text-lg w-full focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                    />
                  </div>
                  <ChevronRight className="text-gray-600" />
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                  Horário de Embarque
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {TIME_SLOTS.map(time => (
                    <button
                      key={time}
                      onClick={() => setFormData({ ...formData, time })}
                      className={`py-3 rounded-lg text-sm font-bold font-mono transition-all duration-300 border
                             ${
                               formData.time === time
                                 ? 'bg-neon-yellow border-neon-yellow text-black shadow-[0_0_10px_rgba(234,179,8,0.3)] scale-105'
                                 : 'bg-[#1a1a1a] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'
                             }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                {!formData.time && formData.date && (
                  <p className="text-xs text-red-500 mt-2 animate-pulse">* Selecione um horário</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: IDENTIFICATION */}
          {step === 3 && (
            <div className="space-y-6 animate-[slideRight_0.3s_ease-out]">
              <div className="bg-gradient-to-br from-gray-800 to-black p-0.5 rounded-2xl">
                <div className="bg-[#111] rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <User size={100} className="text-white" />
                  </div>

                  <h3 className="text-lg font-black text-white uppercase mb-6 relative z-10 flex items-center gap-2">
                    <span className="w-1 h-6 bg-neon-yellow rounded-full"></span>
                    Identificação
                  </h3>

                  <div className="space-y-4 relative z-10">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">
                        Passageiro
                      </label>
                      <div className="flex items-center gap-3 bg-black/50 border border-gray-800 rounded-xl px-4 py-3 focus-within:border-neon-yellow transition-colors">
                        <User size={18} className="text-gray-400" />
                        <input
                          type="text"
                          placeholder="Nome Completo"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="bg-transparent w-full text-white font-bold focus:outline-none uppercase placeholder-gray-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">
                        Contato
                      </label>
                      <div className="flex items-center gap-3 bg-black/50 border border-gray-800 rounded-xl px-4 py-3 focus-within:border-neon-yellow transition-colors">
                        <Smartphone size={18} className="text-gray-400" />
                        <input
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="bg-transparent w-full text-white font-mono focus:outline-none placeholder-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl p-4 flex gap-4 items-center border border-white/5">
                <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center">
                  <img
                    src={selectedService?.image}
                    className="w-full h-full object-cover rounded-lg filter grayscale"
                    alt=""
                  />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Resumo</p>
                  <p className="text-white font-bold text-sm leading-tight">
                    {selectedService?.name}
                  </p>
                  <p className="text-neon-yellow font-mono text-xs">
                    {formData.date ? new Date(formData.date).toLocaleDateString() : ''} às{' '}
                    {formData.time}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION (Ticket) */}
          {/* STEP 4: CONFIRMATION (Ticket) */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-between h-full py-2 animate-[popIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)]">
              {/* Top Content Group */}
              <div className="flex flex-col items-center w-full min-h-0 shrink-0">
                {/* Gold Check Animation - Smaller on mobile */}
                <div className="relative w-16 h-16 mb-2 flex items-center justify-center shrink-0">
                  <div className="absolute inset-0 bg-[#AA8238]/20 rounded-full animate-ping"></div>
                  <div className="relative z-10">
                    <svg
                      width="50"
                      height="50"
                      viewBox="0 0 100 100"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                    >
                      <path
                        d="M50 95C74.8528 95 95 74.8528 95 50C95 25.1472 74.8528 5 50 5C25.1472 5 5 25.1472 5 50C5 74.8528 25.1472 95 50 95Z"
                        fill="url(#paint0_linear)"
                        stroke="#F4D079"
                        strokeWidth="2"
                      />
                      <path
                        d="M30 50L45 65L70 35"
                        stroke="#111"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <defs>
                        <linearGradient
                          id="paint0_linear"
                          x1="5"
                          y1="5"
                          x2="95"
                          y2="95"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#AA8238" />
                          <stop offset="0.5" stopColor="#F4D079" />
                          <stop offset="1" stopColor="#866223" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                <h2 className="text-2xl font-black font-graffiti text-transparent bg-clip-text bg-gradient-to-r from-[#AA8238] via-[#F4D079] to-[#866223] mb-1 drop-shadow-sm text-center shrink-0 leading-none">
                  RESERVA CONFIRMADA!
                </h2>

                <div className="mb-2 flex justify-center w-full shrink-0">
                  <button
                    onClick={() => {
                      const msg = `*Trilha do Corte* - Reserva Confirmada!%0A%0AOlá *${formData.name}*! ✂️%0A%0ASua reserva para *${selectedService?.name}* foi confirmada com sucesso.%0A📅 Data: ${formData.date}%0A⏰ Horário: ${formData.time}%0A📍 Unidade: Central - SP%0A%0APor favor, chegue com 10 minutos de antecedência.`;
                      window.open(
                        `https://wa.me/55${formData.phone.replace(/\D/g, '')}?text=${msg}`,
                        '_blank'
                      );
                    }}
                    className="text-[10px] text-neon-yellow hover:text-white underline decoration-dashed underline-offset-4 flex items-center gap-1.5"
                  >
                    <span>Não recebeu? Reenviar no WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Ticket Stub Visual - Main Focus */}
              <div className="w-full flex-1 flex items-center justify-center my-1 animate-[flipDamp_0.8s_ease-out] min-h-0">
                {/* No Scale - Matches max-w of button */}
                <TicketCard
                  data={formData}
                  service={selectedService}
                  ticketId={Math.random().toString(36).substr(2, 6).toUpperCase()}
                  className="w-full max-w-sm"
                />
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full max-w-sm bg-gradient-to-b from-[#F4D079] via-[#cfab59] to-[#AA8238] text-[#1a150c] font-black uppercase tracking-widest py-3 rounded-xl shadow-[0_4px_15px_rgba(234,179,8,0.2)] hover:shadow-[0_6px_20px_rgba(234,179,8,0.4)] hover:brightness-110 active:scale-[0.98] transition-all duration-300 border-t border-[#fff]/40 text-sm shrink-0"
              >
                Fechar Bilheteria
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step < 4 && (
          <div className="p-6 bg-[#151515] border-t border-white/5 flex gap-4">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={
                (step === 1 && !formData.serviceId) ||
                (step === 2 && (!formData.date || !formData.time)) ||
                (step === 3 && (!formData.name || !formData.phone)) ||
                isLoading
              }
              className="flex-1 bg-neon-yellow text-black font-black uppercase tracking-wider rounded-xl py-4 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : step === 3 ? (
                <>
                  Confirmar Reserva <CheckCircle size={20} />
                </>
              ) : (
                <>
                  Próximo Passo{' '}
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
