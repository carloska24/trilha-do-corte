import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  Loader2,
  ChevronRight,
  User,
  ChevronLeft,
  Smartphone,
  ChevronDown,
} from 'lucide-react';
import { ServiceItem, BookingData, Appointment } from '../types';
import { SERVICES as ALL_SERVICES } from '../constants';
import { TicketCard } from './ui/TicketCard';
import { ServiceCard } from './ui/ServiceCard';
import { useData } from '../contexts/DataContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: BookingData) => void;
  initialData?: Partial<BookingData>;
  services: ServiceItem[];
  appointments?: Appointment[];
}

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
  appointments = [],
}) => {
  const { shopSettings } = useData();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BookingData>({
    name: '',
    phone: '',
    serviceId: '',
    date: '',
    time: '',
  });

  const [searchQuery, setSearchQuery] = useState('');

  // --- STATES from PublicAgenda for Calendar Logic ---
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Initialize data
  useEffect(() => {
    if (isOpen) {
      const initialDateStr = initialData?.date || '';
      let initialDateObj = new Date();

      if (initialDateStr) {
        // Fix timezone issue when parsing YYYY-MM-DD
        const [y, m, d] = initialDateStr.split('-').map(Number);
        // Note: Month in Date constructor is 0-indexed
        initialDateObj = new Date(y, m - 1, d);
      }

      setFormData(prev => ({
        ...prev,
        name: initialData?.name || '',
        phone: initialData?.phone || '',
        serviceId: initialData?.serviceId || (services.length > 0 ? services[0].id : ''),
        date: initialDateStr,
        time: initialData?.time || '',
      }));

      setSelectedDate(initialDateObj);
      setStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Sync selectedDate state to formData.date
  useEffect(() => {
    const dateStr =
      selectedDate.getFullYear() +
      '-' +
      String(selectedDate.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(selectedDate.getDate()).padStart(2, '0');

    if (formData.date !== dateStr) {
      setFormData(prev => ({ ...prev, date: dateStr, time: '' })); // Reset time when date changes
    }
  }, [selectedDate]);

  // --- LOGIC copied/adapted from PublicAgenda ---

  // 1. Generate Next 30 Days
  const generateDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  };
  const daysList = generateDays();

  // Scroll to selected day
  useEffect(() => {
    if (scrollRef.current && isOpen && step === 2) {
      // Optional: scroll logic if needed
    }
  }, [selectedDate, isOpen, step]);

  // 2. Month Calendar Helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Dom

    const result = [];
    for (let i = 0; i < firstDay; i++) result.push(null);
    for (let i = 1; i <= days; i++) result.push(new Date(year, month, i));
    return result;
  };

  const changeMonth = (val: number) => {
    const newM = new Date(currentMonth);
    newM.setMonth(currentMonth.getMonth() + val);
    setCurrentMonth(newM);
  };

  // 3. Smart Time Slots Generation
  const generateTimeSlots = () => {
    // Validar dia fechado: Domingo retorna array vazio
    if (selectedDate.getDay() === 0) return [];

    // Check Exceptions
    const dateKey =
      selectedDate.getFullYear() +
      '-' +
      String(selectedDate.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(selectedDate.getDate()).padStart(2, '0');

    const exception = shopSettings?.exceptions?.[dateKey];

    // Default hours or Exception hours
    const startH = exception?.startHour ?? (shopSettings?.startHour || 9);
    const endH = exception?.endHour ?? (shopSettings?.endHour || 19);

    if (exception?.closed || startH >= endH) return [];

    const GRID_INTERVAL = 15; // 15 min granularity

    // Occupied Ranges (from appointments prop)
    const dayAppointments = appointments.filter(app => {
      // app.date is string YYYY-MM-DD
      return app.date === dateKey && app.status !== 'cancelled';
    });

    const occupiedRanges = dayAppointments.map(app => {
      const [h, m] = app.time.split(':').map(Number);
      const startMin = h * 60 + m;

      // Use service duration if available, else standard 30
      const service =
        services.find(s => s.id === app.serviceId) ||
        ALL_SERVICES.find(s => s.id === app.serviceId);
      const duration = service?.duration || 30;

      return { start: startMin, end: startMin + duration };
    });

    // Generate Slots
    const slots = [];
    const startOfDayMin = startH * 60;
    const endOfDayMin = endH * 60;

    // Duration of CURRENTLY selected service (to check if it fits)
    const selectedServiceObj =
      services.find(s => s.id === formData.serviceId) ||
      ALL_SERVICES.find(s => s.id === formData.serviceId);
    const serviceDuration = selectedServiceObj?.duration || 30;

    for (let time = startOfDayMin; time < endOfDayMin; time += GRID_INTERVAL) {
      const currentSlotStart = time;
      const currentSlotEnd = time + serviceDuration;

      // Check Overlap
      const isOccupied = occupiedRanges.some(range => {
        return currentSlotStart < range.end && currentSlotEnd > range.start;
      });

      // Check Past
      const now = new Date();
      const isToday = dateKey === now.toISOString().split('T')[0];
      const nowTotalMinutes = now.getHours() * 60 + now.getMinutes();
      const isPassed = isToday && currentSlotStart < nowTotalMinutes;

      const h = Math.floor(time / 60);
      const m = time % 60;
      const timeLabel = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      slots.push({
        label: timeLabel,
        minutes: time,
        status: isOccupied ? 'occupied' : isPassed ? 'passed' : 'available',
      });
    }

    return slots.filter(s => s.status !== 'passed');
  };

  const timeSlotsObjects = generateTimeSlots();

  // Is Closed Day?
  const dateKey =
    selectedDate.getFullYear() +
    '-' +
    String(selectedDate.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(selectedDate.getDate()).padStart(2, '0');
  const isClosed = shopSettings?.exceptions?.[dateKey]?.closed; // Removed .getDay() check

  // --- END LOGIC ---

  if (!isOpen) return null;

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const selectedService =
    services.find(s => s.id === formData.serviceId) ||
    ALL_SERVICES.find(s => s.id === formData.serviceId);

  const handleNext = () => {
    if (step === 1 && formData.serviceId) setStep(2);
    if (step === 2 && formData.date && formData.time) setStep(3);
    if (step === 3 && formData.name && formData.phone) handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const sendWhatsAppMessage = () => {
    const dateParts = formData.date.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    const mapLink = 'https://www.google.com/maps?q=Rua+Monsenhor+Landell+de+Moura,+129+Campinas+SP';
    const EMOJI = {
      CHECK: '\u2705',
      USER: '\uD83D\uDC64',
      SCISSORS: '\u2702',
      CALENDAR: '\uD83D\uDCC5',
      CLOCK: '\uD83D\uDD50',
      PIN: '\uD83D\uDCCD',
      BARBER: '\uD83D\uDC88',
    };

    const msg =
      `${mapLink}\n\n` +
      `${EMOJI.CHECK} AGENDAMENTO CONFIRMADO\n\n` +
      `${EMOJI.USER} Passageiro: ${formData.name}\n\n` +
      `${EMOJI.SCISSORS} Servico: ${selectedService?.name || ''}\n` +
      `${EMOJI.CALENDAR} Data: ${formattedDate}\n` +
      `${EMOJI.CLOCK} Horario: ${formData.time}\n` +
      `${EMOJI.PIN} Unidade: Jardim Sao Marcos\n\n` +
      `${EMOJI.BARBER} Te esperamos para mais um corte de respeito.`;

    const encodedMsg = encodeURIComponent(msg);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=55${formData.phone.replace(
      /\D/g,
      ''
    )}&text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      setIsLoading(false);
      setStep(4);
    } catch (error) {
      console.error('Booking failed:', error);
      setIsLoading(false);
      alert('Ops! Horário indisponível ou erro ao agendar. Tente outro horário.');
    }
  };

  const changeDay = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

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
        <div className="px-6 pt-6 pb-4 bg-[#151515] border-b border-white/5 relative z-20 shrink-0">
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
        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1 relative min-h-[400px]">
          {/* STEP 1: SERVICE SELECTION */}
          {step === 1 && (
            <div className="space-y-4 animate-[slideRight_0.3s_ease-out]">
              <div className="relative mb-4 group">
                {/* Search Icon */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 pl-2 pointer-events-none">
                  <div className="w-4 h-4 border-2 border-gray-600 rounded-full group-focus-within:border-neon-yellow transition-colors relative">
                    <div className="absolute -bottom-1 -right-1 w-2 h-0.5 bg-gray-600 group-focus-within:bg-neon-yellow rotate-45 origin-top-left transition-colors"></div>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="ESCOLHA SEU DESTINO"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-800 focus:border-neon-yellow text-sm font-bold text-white uppercase tracking-widest pl-8 py-2 focus:outline-none placeholder-gray-600 transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
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

          {/* STEP 2: AGENDA (UPDATED LOGIC & COMPACTNESS) */}
          {step === 2 && (
            <div className="space-y-4 animate-[slideRight_0.3s_ease-out]">
              {/* DATA SELECIONADA & CALENDAR TRIGGER */}
              <div
                className={`
                        bg-[#111] border rounded-xl p-3 mb-2 flex justify-between items-center transition-all group hover:border-gray-700
                        ${isClosed ? 'border-red-900/50 bg-red-900/10' : 'border-gray-800'}
                    `}
              >
                <button
                  onClick={e => {
                    e.stopPropagation();
                    changeDay(-1);
                  }}
                  className="p-2 text-gray-400 hover:text-neon-yellow transition-colors cursor-pointer rounded-full hover:bg-white/5"
                >
                  <ChevronLeft size={18} />
                </button>

                <div
                  onClick={() => setIsCalendarOpen(true)}
                  className="text-center cursor-pointer hover:scale-105 transition-transform select-none"
                >
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block">
                    DATA DA PARTIDA
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <CalendarIcon
                      size={16}
                      className={`${isClosed ? 'text-red-500' : 'text-neon-yellow'}`}
                    />
                    <span
                      className={`text-lg font-black uppercase tracking-wider transition-colors ${
                        isClosed ? 'text-red-500' : 'text-white'
                      }`}
                    >
                      {selectedDate
                        .toLocaleDateString('pt-BR', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                        })
                        .replace('.', '')
                        .toUpperCase()}
                    </span>
                    {selectedDate.toDateString() === new Date().toDateString() && (
                      <span className="bg-green-500/20 text-green-500 text-[9px] font-bold px-1.5 py-0.5 rounded border border-green-500/30">
                        HOJE
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    changeDay(1);
                  }}
                  className="p-2 text-gray-400 hover:text-neon-yellow transition-colors cursor-pointer rounded-full hover:bg-white/5"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* CARROSSEL DE DIAS */}
              <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-2 pb-2 mb-2 custom-scrollbar snap-x"
              >
                {daysList.map(day => {
                  const isSelected = day.toDateString() === selectedDate.toDateString();
                  const isToday = day.toDateString() === new Date().toDateString();

                  const dKey =
                    day.getFullYear() +
                    '-' +
                    String(day.getMonth() + 1).padStart(2, '0') +
                    '-' +
                    String(day.getDate()).padStart(2, '0');
                  const dayClosed = shopSettings?.exceptions?.[dKey]?.closed;

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`flex-shrink-0 w-14 h-16 rounded-xl flex flex-col items-center justify-center border transition-all snap-center
                                            ${
                                              dayClosed
                                                ? isSelected
                                                  ? 'bg-red-900/30 border-red-500 text-red-500'
                                                  : 'bg-[#150505] border-red-900/30 text-red-700 opacity-70'
                                                : isSelected
                                                ? 'bg-neon-yellow border-neon-yellow text-black scale-105 shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                                                : 'bg-[#111] border-gray-800 text-gray-500 hover:border-gray-600 hover:bg-[#151515] hover:text-white'
                                            }
                                        `}
                    >
                      <span className="text-[9px] font-bold uppercase">
                        {day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                      </span>
                      <span className="text-xl font-black">{day.getDate()}</span>
                      {isToday && !isSelected && (
                        <div className="w-1 h-1 bg-green-500 rounded-full mt-0.5"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* TIME SLOTS GRID */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                  Horário de Embarque
                </label>

                {isClosed ? (
                  <div className="flex flex-col items-center justify-center py-6 border border-dashed border-red-900/30 rounded-xl bg-red-900/5">
                    <X size={24} className="text-red-500 mb-2 opacity-50" />
                    <span className="text-red-500 font-bold uppercase tracking-widest text-xs">
                      Não haverá atendimento
                    </span>
                    <span className="text-red-800 text-[10px] mt-1">Selecione outro dia</span>
                  </div>
                ) : (
                  <>
                    {timeSlotsObjects.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <Clock className="w-6 h-6 mx-auto mb-2 opacity-20" />
                        <p className="text-[10px] uppercase tracking-widest">
                          Sem horários disponíveis
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-4 md:grid-cols-5 gap-2 transition-all duration-500">
                          {timeSlotsObjects.slice(0, isExpanded ? undefined : 15).map(slot => {
                            let baseClasses =
                              'flex flex-col items-center justify-center py-2.5 rounded-lg border transition-all duration-200';

                            if (slot.status === 'occupied') {
                              return (
                                <div
                                  key={slot.label}
                                  className={`${baseClasses} bg-gray-900/50 border-gray-800 opacity-30 cursor-not-allowed`}
                                >
                                  <span className="text-sm font-bold text-gray-500 font-mono line-through">
                                    {slot.label}
                                  </span>
                                </div>
                              );
                            }

                            return (
                              <button
                                key={slot.label}
                                onClick={() => setFormData({ ...formData, time: slot.label })}
                                className={`
                                                            ${baseClasses}
                                                            ${
                                                              formData.time === slot.label
                                                                ? 'bg-neon-yellow border-neon-yellow text-black shadow-[0_0_10px_rgba(234,179,8,0.3)] scale-105'
                                                                : 'bg-[#111] border-gray-800 text-white hover:bg-neon-yellow hover:text-black hover:border-neon-yellow hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                                                            }
                                                            group
                                                        `}
                              >
                                <span className="text-sm font-bold font-mono group-hover:font-black">
                                  {slot.label}
                                </span>
                                {formData.time !== slot.label && (
                                  <span className="text-[8px] font-bold uppercase text-green-500 group-hover:text-black mt-0.5 leading-none">
                                    Livre
                                  </span>
                                )}
                                {formData.time === slot.label && (
                                  <span className="text-[8px] font-bold uppercase text-black mt-0.5 leading-none">
                                    OK
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {timeSlotsObjects.length > 15 && (
                          <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full flex items-center justify-center gap-2 mt-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronDown className="rotate-180" size={14} /> Menos Horários
                              </>
                            ) : (
                              <>
                                <ChevronDown size={14} /> Ver Mais Horários (
                                {timeSlotsObjects.length - 15})
                              </>
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </>
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
                    {formData.date
                      ? new Date(formData.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                          year: '2-digit',
                          month: '2-digit',
                          day: '2-digit',
                        })
                      : ''}{' '}
                    às {formData.time}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION (Ticket) */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-between h-full py-2 animate-[popIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)]">
              {/* Top Content Group */}
              <div className="flex flex-col items-center w-full min-h-0 shrink-0">
                {/* Gold Check Animation */}
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
              </div>

              {/* Ticket Stub Visual */}
              <div className="w-full flex-1 flex items-center justify-center my-1 animate-[flipDamp_0.8s_ease-out]">
                <TicketCard
                  data={formData}
                  service={selectedService}
                  ticketId={Math.random().toString(36).substr(2, 6).toUpperCase()}
                  rating={1}
                  className="w-full max-w-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="w-full max-w-sm space-y-3 shrink-0">
                <button
                  onClick={sendWhatsAppMessage}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black uppercase tracking-widest py-3 rounded-xl shadow-[0_0_15px_rgba(37,211,102,0.4)] hover:shadow-[0_0_25px_rgba(37,211,102,0.6)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Smartphone size={20} />
                  Enviar no WhatsApp
                </button>

                <button
                  onClick={onClose}
                  className="w-full bg-gradient-to-b from-[#F4D079] via-[#cfab59] to-[#AA8238] text-[#1a150c] font-black uppercase tracking-widest py-3 rounded-xl shadow-[0_4px_15px_rgba(234,179,8,0.2)] hover:shadow-[0_6px_20px_rgba(234,179,8,0.4)] hover:brightness-110 active:scale-[0.98] transition-all duration-300 border-t border-[#fff]/40 text-sm"
                >
                  Concluir
                </button>
              </div>
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

      {/* MODAL CALENDARIO (Pop-up over the existing modal) */}
      {isCalendarOpen && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1a1a1a] w-full max-w-xs rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
            {/* Header Modal */}
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#222]">
              <h3 className="font-black text-white uppercase tracking-wider text-sm flex items-center gap-2">
                <CalendarIcon size={16} className="text-neon-yellow" /> Selecionar Data
              </h3>
              <button
                onClick={e => {
                  e.stopPropagation();
                  setIsCalendarOpen(false);
                }}
                className="text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              {/* Navegação Mês */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-2 hover:bg-white/10 rounded-full text-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-2 hover:bg-white/10 rounded-full text-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Grid Dias */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                  <div key={i} className="text-[10px] font-bold text-gray-500">
                    {d}
                  </div>
                ))}
                {getDaysInMonth(currentMonth).map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`}></div>;
                  const isSelected = day.toDateString() === selectedDate.toDateString();
                  const isToday = day.toDateString() === new Date().toDateString();

                  const dKey =
                    day.getFullYear() +
                    '-' +
                    String(day.getMonth() + 1).padStart(2, '0') +
                    '-' +
                    String(day.getDate()).padStart(2, '0');
                  const dayClosed = shopSettings?.exceptions?.[dKey]?.closed; // Simple check

                  return (
                    <button
                      key={idx}
                      disabled={dayClosed && !isSelected}
                      onClick={() => {
                        setSelectedDate(day);
                        setIsCalendarOpen(false);
                      }}
                      className={`
                                aspect-square rounded flex items-center justify-center text-xs font-bold transition-all
                                ${
                                  dayClosed
                                    ? 'bg-red-900/10 text-red-700 border border-red-900/20 cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-neon-yellow text-black'
                                    : 'bg-[#111] text-white hover:bg-[#333]'
                                }
                                ${
                                  isToday && !isSelected && !dayClosed
                                    ? 'border border-blue-500 text-blue-500'
                                    : ''
                                }
                            `}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
