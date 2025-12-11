import React, { useState } from 'react';
import { Appointment, ClientProfile, ServiceItem } from '../types';
import {
  Scissors,
  Ticket,
  Plus,
  X,
  RefreshCw,
  Camera,
  ImageIcon,
  MapPin,
  QrCode,
  CalendarDays,
  User,
  LogOut,
  Star,
  Wallet, // Wallet was previously imported separately but already in lucide-react imports? No, added here.
} from 'lucide-react';
import { PromotionsCarousel } from './client/PromotionsCarousel';
import { ClientFooter } from './client/ClientFooter';
import { ServiceShowcase } from './client/ServiceShowcase';
import { PortfolioGallery } from './client/PortfolioGallery';
import { ClientHeader } from './client/ClientHeader';
import { VitrineDestaques } from './client/VitrineDestaques';
import { ClientBottomNav } from './client/ClientBottomNav';
import { ClientMobileDrawer } from './client/ClientMobileDrawer';
import { NotificationsSheet } from './client/NotificationsSheet';
import { TicketCard } from './ui/TicketCard';

interface ClientDashboardProps {
  client: ClientProfile;
  appointments: Appointment[];
  allAppointments: Appointment[]; // Para a galeria geral
  onOpenBooking: () => void;
  onCancelBooking: (id: string) => void;
  onRebook: (appointment: Appointment) => void;
  services: ServiceItem[];
  onLogout: () => void;
  promotions?: ServiceItem[];
  onUpdateProfile: (data: Partial<ClientProfile>) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  client,
  appointments,
  allAppointments,
  onOpenBooking,
  onCancelBooking,
  onRebook,
  services,
  onLogout,
  promotions,
  onUpdateProfile,
}) => {
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const getServiceName = (id: string) => services.find(s => s.id === id)?.name || 'Serviço';

  // Sort upcoming vs history
  const upcoming = appointments
    .filter(a => a.status !== 'completed' && a.status !== 'cancelled')
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const history = appointments
    .filter(a => a.status === 'completed' || a.status === 'cancelled')
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const handleCancelClick = (id: string) => {
    if (cancelConfirmId === id) {
      onCancelBooking(id);
      setCancelConfirmId(null);
    } else {
      setCancelConfirmId(id);
      setTimeout(() => setCancelConfirmId(null), 5000);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleConfirmPresence = (id: string) => {
    // Logic to confirm (API call would go here in future)
    alert(`Presença confirmada para o agendamento ${id.substring(0, 6)}!`);
    setIsNotificationsOpen(false);
  };

  return (
    <div className="min-h-screen bg-transparent pt-20 pb-24 transition-colors duration-300 overflow-x-hidden">
      {/* DRAWER MENU */}
      <ClientMobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        client={client}
        onLogout={onLogout}
        onUpdateProfile={onUpdateProfile}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* NOTIFICATIONS SHEET */}
      <NotificationsSheet
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        appointments={appointments}
        onConfirmAppointment={handleConfirmPresence}
      />

      {/* APP HEADER */}
      <ClientHeader
        client={client}
        onOpenMenu={() => setIsDrawerOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        {/* 1. PRÓXIMO EMBARQUE (UPCOMING TICKET) - MOVED TO TOP */}
        <section className="px-4 mt-4">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2 mb-4">
            <Ticket className="text-purple-500" size={20} />
            Próximo <span className="text-gray-600">Embarque</span>
          </h2>

          {upcoming.length > 0 ? (
            upcoming.map(app => (
              <div key={app.id} className="relative w-full flex justify-center py-4">
                <TicketCard
                  data={{
                    name: client.name,
                    phone: client.phone,
                    serviceId: app.serviceId,
                    date: app.date,
                    time: app.time,
                  }}
                  service={services.find(s => s.id === app.serviceId)}
                  ticketId={`RID-${app.id.substring(0, 6)}`}
                  rating={5} // Hardcoded 5 stars as "Premium Client" simulation for now, or use Math.min(5, Math.floor(client.totalVisits / 5))
                />

                {/* Cancel Button Overlaid or Below */}
                <div className="absolute bottom-[-10px] z-20">
                  <button
                    onClick={() => handleCancelClick(app.id)}
                    className={`py-2 px-6 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-xl transition-all flex items-center justify-center gap-2 border
                                ${
                                  cancelConfirmId === app.id
                                    ? 'bg-red-600 text-white border-red-500 animate-pulse'
                                    : 'bg-[#111] text-gray-500 border-white/10 hover:text-white hover:border-white'
                                }`}
                  >
                    {cancelConfirmId === app.id ? (
                      'Confirmar Cancelamento?'
                    ) : (
                      <>
                        <X size={12} /> Cancelar Reserva
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div
              onClick={onOpenBooking}
              className="bg-[#101010] border border-gray-800/50 rounded-xl p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-neon-yellow/50 transition-all relative overflow-hidden min-h-[250px]"
            >
              {/* Background Image Layer */}
              {/* Background Image Layer */}
              <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10"></div>
                <img
                  src="/ticket-bg.png"
                  onError={e => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=800&auto=format&fit=crop'; // Fallback texture
                  }}
                  className="w-full h-full object-cover object-center filter grayscale group-hover:grayscale-0 transition-all duration-700"
                  alt="Background"
                />
              </div>

              {/* Content - Relative z-10 to sit above background */}
              <div className="relative z-10 flex flex-col items-center justify-end h-64 w-full py-8 gap-6">
                {/* ICON (A etiqueta) */}
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-gray-800 group-hover:border-neon-yellow/50">
                    <Ticket
                      className="text-gray-400 group-hover:text-neon-yellow transition-colors"
                      size={24}
                    />
                  </div>
                </div>

                {/* TEXTS - Pushed to bottom via justify-end */}
                <div className="flex flex-col items-center">
                  <h3 className="text-white font-black text-2xl mb-1 font-graffiti tracking-wider group-hover:text-neon-yellow transition-colors drop-shadow-lg">
                    SEM VIAGENS
                  </h3>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest max-w-xs drop-shadow-md">
                    Sua agenda está livre. Que tal marcar um trato no visual?
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 2. VITRINE DESTAQUES (WAS 1) */}
        <section className="animate-[fadeIn_0.5s_ease-out]">
          {/* Use mock promotions if available, otherwise fallback to services */}
          <VitrineDestaques
            services={promotions && promotions.length > 0 ? promotions : services}
            onBook={id => onOpenBooking()}
          />
        </section>

        {/* 2. MENU RÁPIDO (ACTION GRID) */}
        <section className="px-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">
            Acesso Rápido
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={onOpenBooking}
              className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 flex flex-col items-center gap-2 hover:border-neon-yellow transition-colors group"
            >
              <div className="w-10 h-10 bg-neon-yellow/10 rounded-full flex items-center justify-center text-neon-yellow group-hover:bg-neon-yellow group-hover:text-black transition-colors">
                <Plus size={20} />
              </div>
              <span className="text-white font-bold text-xs uppercase">Novo Agendamento</span>
            </button>

            <button
              onClick={() => scrollToSection('wallet-section')}
              className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 flex flex-col items-center gap-2 hover:border-blue-500 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Ticket size={20} />
              </div>
              <span className="text-white font-bold text-xs uppercase">Minhas Reservas</span>
            </button>

            <button
              onClick={() => scrollToSection('wallet-section')}
              className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 flex flex-col items-center gap-2 hover:border-purple-500 transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Wallet size={20} />
              </div>
              <span className="text-white font-bold text-xs uppercase">Carteira Digital</span>
            </button>

            <button
              onClick={() => scrollToSection('wallet-section')}
              className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 flex flex-col items-center gap-2 hover:border-green-500 transition-colors group"
            >
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                <Star size={20} />
              </div>
              <span className="text-white font-bold text-xs uppercase">Clube VIP</span>
            </button>
          </div>
        </section>

        {/* 3. MENU DE ESTILO (SERVICES) */}
        <section id="services-section" className="relative pt-4">
          <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
          <ServiceShowcase services={services} onBookService={s => onOpenBooking()} />
        </section>

        {/* 4. LOYALTY & UPCOMING (Grid) */}
        <section
          id="wallet-section"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 px-4 relative"
        >
          {/* LEFT: Loyalty Card */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2 mb-4">
              <Scissors className="text-neon-orange" size={20} />
              Fidelidade <span className="text-gray-600">Pro</span>
            </h2>

            <div className="relative group perspective-1000 cursor-pointer" onClick={() => {}}>
              <div className="absolute -inset-1 bg-gradient-to-r from-neon-yellow to-neon-orange rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-[#1a1a1a] rounded-xl overflow-hidden shadow-2xl transform transition-transform group-hover:rotate-x-2">
                {/* Card Header */}
                <div className="h-32 bg-gradient-to-br from-gray-800 to-black relative p-6 flex justify-between items-start">
                  <div className="opacity-20 absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                  <div className="relative z-10 w-full">
                    <div className="flex justify-between items-start w-full mb-8">
                      <span className="font-graffiti text-white text-2xl">
                        VIP <span className="text-neon-yellow">CARD</span>
                      </span>
                      <QrCode className="text-white/80" />
                    </div>
                    <div className="h-1 w-full bg-gray-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neon-yellow shadow-[0_0_10px_#EAB308]"
                        style={{ width: `${(client.loyaltyPoints / 10) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-end mt-1">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                        Progresso do Nível
                      </span>
                      <span className="text-neon-yellow font-bold text-xs">
                        {client.loyaltyPoints * 10}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Slots */}
                <div className="bg-[#111] p-6 grid grid-cols-5 gap-3">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-full flex items-center justify-center border-2 transition-all relative
                                ${
                                  i < client.loyaltyPoints
                                    ? 'border-neon-yellow bg-neon-yellow/10 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                                    : 'border-white/10 bg-white/5'
                                }`}
                    >
                      {i < client.loyaltyPoints ? (
                        <Scissors size={14} className="text-neon-yellow -rotate-45" />
                      ) : i === 9 ? (
                        <Star className="text-gray-700 w-4 h-4" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-black p-4 flex justify-between items-center border-t border-white/10">
                  <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                    <RefreshCw size={12} className="animate-spin-slow" /> Atualizado Automaticamente
                  </span>
                  <span className="text-white font-bold text-xs">
                    Faltam <span className="text-neon-orange">{10 - client.loyaltyPoints}</span>{' '}
                    para resgate
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 hidden lg:block">
            {/* Desktop-only placement, or remove if moving entirely to top mobile-first */}
            {/* Since we moved it to the top, we might want to hide it here to avoid duplication, 
                 OR keep it for desktop layout if the top one is mobile only. 
                 The user request implies moving it generally. 
                 Let's keep the Loyalty card taking full width or adjust grid.
                 For now, I will Comment out the duplication to ensure it only appears at the top 
                 as per "FIRST view" request. */}
          </div>
        </section>

        {/* 5. PORTFOLIO / GALLERY */}
        <section id="gallery-section">
          <PortfolioGallery />
        </section>

        {/* 6. HISTORY (Lookbook) */}
        <section className="bg-[#1a1a1a] mx-4 p-8 rounded-xl border border-white/5">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
            <Camera size={20} className="text-blue-500" />
            Seu Histórico{' '}
            <span className="text-gray-400 font-normal text-sm ml-auto cursor-pointer hover:text-neon-yellow underline">
              Ver tudo
            </span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {history.slice(0, 4).map((app, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="aspect-square bg-black rounded-sm overflow-hidden relative mb-2">
                  {app.photoUrl ? (
                    <img
                      src={app.photoUrl}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                    {new Date(app.date).toLocaleDateString()}
                  </div>
                </div>
                <p className="font-bold text-white text-sm truncate">
                  {getServiceName(app.serviceId)}
                </p>
                <p className="text-xs text-gray-500">
                  {app.status === 'completed' ? 'Finalizado' : 'Cancelado'}
                </p>
              </div>
            ))}
            {history.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-400 text-sm">
                Ainda não há registros no seu histórico.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <ClientBottomNav
        currentTab="dash"
        onTabChange={tab => {
          if (tab === 'profile') {
            setIsDrawerOpen(true); // Open drawer for profile/settings
          } else if (tab === 'services') {
            scrollToSection('services-section');
          } else if (tab === 'wallet') {
            scrollToSection('wallet-section');
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onOpenBooking={onOpenBooking}
      />

      {/* DESKTOP FOOTER */}
      <ClientFooter />
    </div>
  );
};
