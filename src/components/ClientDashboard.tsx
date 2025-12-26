import React, { useState } from 'react';
import { Appointment, ClientProfile, ServiceItem, Combo } from '../types';
import { MOCK_COMBOS } from '../constants';
import { ComboBookingModal } from './ComboBookingModal';
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

import { ClientProfileSettings } from './client/ClientProfileSettings';

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
      onOpenBooking();
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
        <section className="px-4 mt-4">
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 mb-4 w-fit cursor-pointer select-none active:scale-95 transition-transform"
          >
            <Ticket className="text-purple-500" size={20} />
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">
              Próximo <span className="text-gray-600">Embarque</span>
            </h2>
          </div>

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
            <Scissors className="text-neon-orange" size={20} />
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">
              Menu de <span className="text-neon-orange">Estilo</span>
            </h2>
          </div>

          <ServiceShowcase services={services} onBookService={s => onOpenBooking()} />
        </section>

        {/* 4. LOYALTY & UPCOMING (Grid) */}
        <section
          id="wallet-section"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 px-4 pt-0 relative"
        >
          {/* LEFT: Loyalty Card */}
          <div className="lg:col-span-5 space-y-4">
            <div
              onClick={() => scrollToSection('wallet-section')}
              className="flex items-center gap-2 mb-2 cursor-pointer select-none active:scale-95 transition-transform w-fit"
            >
              <Scissors className="text-neon-orange" size={18} />
              <h2 className="text-lg font-black text-white uppercase tracking-tighter">
                Fidelidade <span className="text-gray-600">Pro</span>
              </h2>
            </div>

            <div className="relative group perspective-1000 cursor-pointer" onClick={() => {}}>
              <div className="absolute -inset-1 bg-gradient-to-r from-neon-yellow to-neon-orange rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-[#1a1a1a] rounded-xl overflow-hidden shadow-2xl transform transition-transform group-hover:rotate-x-2">
                {/* Card Header */}
                <div className="bg-gradient-to-br from-gray-800 to-black relative p-4 flex justify-between items-start">
                  <div className="opacity-20 absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                  <div className="relative z-10 w-full">
                    <div className="flex justify-between items-start w-full mb-4">
                      <span className="font-graffiti text-white text-xl">
                        VIP <span className="text-neon-yellow">CARD</span>
                      </span>
                      <QrCode className="text-white/80 w-5 h-5" />
                    </div>
                    <div className="h-1 w-full bg-gray-700/50 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-neon-yellow shadow-[0_0_10px_#EAB308]"
                        style={{ width: `${(client.loyaltyPoints / 10) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                        Nível
                      </span>
                      <span className="text-neon-yellow font-bold text-[10px]">
                        {client.loyaltyPoints * 10}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Slots */}
                <div className="bg-[#111] p-3 grid grid-cols-5 gap-2">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-full flex items-center justify-center border transition-all relative
                                ${
                                  i < client.loyaltyPoints
                                    ? 'border-neon-yellow bg-neon-yellow/10 shadow-[0_0_5px_rgba(234,179,8,0.2)]'
                                    : 'border-white/10 bg-white/5'
                                }`}
                    >
                      {i < client.loyaltyPoints ? (
                        <Scissors size={10} className="text-neon-yellow -rotate-45" />
                      ) : i === 9 ? (
                        <Star className="text-gray-700 w-3 h-3" />
                      ) : (
                        <div className="w-1 h-1 rounded-full bg-gray-800"></div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-black p-3 flex justify-between items-center border-t border-white/10">
                  <span className="text-gray-500 text-[9px] uppercase font-bold tracking-widest flex items-center gap-1.5">
                    <RefreshCw size={10} className="animate-spin-slow" /> Atualizado
                  </span>
                  <span className="text-white font-bold text-[10px]">
                    Faltam <span className="text-neon-orange">{10 - client.loyaltyPoints}</span>
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
      </div>

      {/* MOBILE BOTTOM NAV */}
      <ClientBottomNav
        currentTab="dash"
        onTabChange={tab => {
          if (tab === 'profile') {
            setIsProfileSettingsOpen(true); // FIXED: Opens Profile Modal instead of Drawer
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
