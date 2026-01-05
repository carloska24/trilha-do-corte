import React, { useState } from 'react';
import { Appointment, ClientProfile, ServiceItem, Combo } from '../../types';
import { MOCK_COMBOS, SERVICES as ALL_SERVICES } from '../../constants';
import { ComboBookingModal } from '../ComboBookingModal';
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
  Wallet,
  Gift,
} from 'lucide-react';
import { PromotionsCarousel } from './PromotionsCarousel';
import { ClientFooter } from './ClientFooter';
import { ServiceShowcase } from './ServiceShowcase';
import { PortfolioGallery } from './PortfolioGallery';
import { ClientHeader } from './ClientHeader';
import { VitrineDestaques } from './VitrineDestaques';
import { ClientBottomNav } from './ClientBottomNav';
import { ClientMobileDrawer } from './ClientMobileDrawer';
import { NotificationsSheet } from './NotificationsSheet';
import { LoyaltyCard } from './LoyaltyCard';
import { TicketCard } from '../ui/TicketCard';

import { ClientProfileSettings } from './ClientProfileSettings';

interface ClientDashboardProps {
  client: ClientProfile;
  appointments: Appointment[];
  allAppointments: Appointment[];
  onOpenBooking: (preselected?: { serviceId?: string }) => void;
  onCancelBooking: (id: string) => void;
  onRebook: (appointment: Appointment) => void;
  services: ServiceItem[];
  onLogout: () => void;
  promotions?: any[];
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
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);

  // Calculate real completed services count for Tier logic
  const completedServicesCount = appointments.filter(a => a.status === 'completed').length;

  const getServiceName = (id: string) => services.find(s => s.id === id)?.name || 'Serviço';

  const handleVitrineClick = (id?: string) => {
    if (!id) {
      onOpenBooking();
      return;
    }
    const combo = MOCK_COMBOS.find(c => c.id === id);
    if (combo) {
      setSelectedCombo(combo);
    } else {
      // Simple fallback if not a combo found in mocks
      // Assume it is a service ID
      onOpenBooking({ serviceId: id });
    }
  };

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
      const headerOffset = 85;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleConfirmPresence = (id: string) => {
    // Logic to confirm (API call would go here in future)
    alert(`Presença confirmada para o agendamento ${id.substring(0, 6)}!`);
    setIsNotificationsOpen(false);
  };

  // Active Tab State for Bottom Nav
  const [activeTab, setActiveTab] = useState('dash');

  // Scroll Spy / Intersection Observer
  React.useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px', // Trigger when section is in middle of screen
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.id === 'top-section') setActiveTab('dash');
          if (entry.target.id === 'services-section') setActiveTab('services');
          if (entry.target.id === 'wallet-section') setActiveTab('wallet');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = ['top-section', 'services-section', 'wallet-section'];

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleTabChange = (tab: string) => {
    if (tab === 'profile') {
      setIsProfileSettingsOpen(true);
      return;
    }

    // Instant Visual Feedback
    setActiveTab(tab);

    // Optimized Scroll
    if (tab === 'services') {
      scrollToSection('services-section');
    } else if (tab === 'wallet') {
      scrollToSection('wallet-section');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-transparent pt-20 pb-0 transition-colors duration-300 overflow-x-hidden">
      {/* DRAWER MENU */}
      <ClientMobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        client={client}
        onLogout={onLogout}
        onUpdateProfile={onUpdateProfile}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileSettingsOpen(true)}
      />

      {/* NOTIFICATIONS SHEET */}
      <NotificationsSheet
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        appointments={appointments}
        onConfirmAppointment={handleConfirmPresence}
        onOpenBooking={onOpenBooking}
      />

      {/* COMBO BOOKING MODAL */}
      {selectedCombo && (
        <ComboBookingModal
          isOpen={!!selectedCombo}
          onClose={() => setSelectedCombo(null)}
          combo={selectedCombo}
        />
      )}

      {/* PROFILE SETTINGS MODAL */}
      <ClientProfileSettings
        isOpen={isProfileSettingsOpen}
        onClose={() => setIsProfileSettingsOpen(false)}
        client={client}
        onSave={onUpdateProfile}
      />

      {/* APP HEADER */}
      <ClientHeader
        client={client}
        onOpenMenu={() => setIsDrawerOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        {/* 1. PRÓXIMO EMBARQUE (UPCOMING TICKET) - MOVED TO TOP */}
        <section className="px-4 mt-4" id="top-section">
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 mb-4 w-fit cursor-pointer select-none active:scale-95 transition-transform"
          >
            <Ticket className="text-neon-yellow" size={20} />
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">
              Próximo{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-yellow to-neon-orange">
                Embarque
              </span>
            </h2>
          </div>

          {upcoming.length > 0 ? (
            <div
              className={`flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 custom-scrollbar w-full ${
                upcoming.length === 1 ? 'justify-center' : 'px-[calc(50%-42.5%)] sm:px-4'
              }`}
            >
              {upcoming.map(app => (
                <div
                  key={app.id}
                  className="w-[85vw] sm:w-[320px] snap-center relative flex justify-center py-4 shrink-0 transition-transform"
                >
                  <TicketCard
                    data={{
                      name: client.name,
                      phone: client.phone,
                      serviceId: app.serviceId,
                      date: app.date,
                      time: app.time,
                    }}
                    service={
                      services.find(s => String(s.id) === String(app.serviceId)) ||
                      ALL_SERVICES.find(s => String(s.id) === String(app.serviceId))
                    }
                    ticketId={`COD-${app.id.substring(0, 6)}`}
                    rating={client.level || 1}
                    serviceCount={completedServicesCount}
                    className="w-full max-w-none" // Overriding default max-w-[340px]
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
              ))}
            </div>
          ) : (
            <div
              onClick={onOpenBooking}
              className="bg-[#101010] border border-gray-800/50 rounded-xl p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-neon-yellow/50 transition-all relative overflow-hidden min-h-[250px]"
            >
              {/* Background Image Layer */}
              <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10"></div>
                <img
                  src="/ticket-bg.png"
                  onError={e => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=800&auto=format&fit=crop'; // Fallback texture
                  }}
                  className="w-full h-full object-cover object-center transition-all duration-700"
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
        <section id="vitrine-section" className="animate-[fadeIn_0.5s_ease-out]">
          {/* Use mock promotions if available, otherwise fallback to services */}
          <VitrineDestaques services={services} onBook={handleVitrineClick} />
        </section>

        {/* 3. MENU DE ESTILO (SERVICES) */}
        <section id="services-section" className="relative pt-4">
          <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>

          {/* Header added here since ServiceShowcase might not expose it easily, or wrapper it */}
          <div
            onClick={() => scrollToSection('services-section')}
            className="px-4 py-4 flex items-center gap-2 cursor-pointer select-none active:scale-95 transition-transform w-fit"
          >
            <Scissors className="text-neon-yellow" size={20} />
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">
              Menu de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-yellow to-neon-orange">
                Estilo
              </span>
            </h2>
          </div>

          <ServiceShowcase
            services={services}
            onBookService={s => onOpenBooking({ serviceId: s.id })}
          />
        </section>

        {/* 4. LOYALTY & UPCOMING (Grid) */}
        <section
          id="wallet-section"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 px-4 pt-0 relative"
        >
          <div className="lg:col-span-5 space-y-4">
            <div
              onClick={() => scrollToSection('wallet-section')}
              className="flex items-center gap-2 w-fit cursor-pointer select-none active:scale-95 transition-transform group"
            >
              <Wallet
                className="text-neon-yellow group-hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] transition-all"
                size={20}
              />
              <h2 className="text-xl font-black text-white uppercase tracking-tighter group-hover:text-gray-200 transition-colors">
                Trilha{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-yellow to-neon-orange group-hover:brightness-110">
                  Card
                </span>
              </h2>
            </div>
            <LoyaltyCard client={client} onClick={() => scrollToSection('wallet-section')} />
          </div>

          <div className="lg:col-span-7 space-y-6 hidden lg:block">
            {/* Desktop-only placement */}
          </div>
        </section>

        {/* 5. PORTFOLIO / GALLERY */}
        <section id="gallery-section">
          <PortfolioGallery />
        </section>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <ClientBottomNav
        currentTab={activeTab}
        onTabChange={handleTabChange}
        onOpenBooking={onOpenBooking}
      />

      {/* DESKTOP FOOTER */}
      <ClientFooter />
    </div>
  );
};
