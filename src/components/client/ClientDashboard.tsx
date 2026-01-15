import React from 'react';
import { Appointment, ClientProfile, ServiceItem } from '../../types';
import { SERVICES as ALL_SERVICES } from '../../constants';
import { ComboBookingModal } from '../ComboBookingModal';
import { Scissors, Ticket, X, Wallet } from 'lucide-react';
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
import { useClientDashboard } from '../../hooks/useClientDashboard';

interface ClientDashboardProps {
  client: ClientProfile;
  appointments: Appointment[];
  allAppointments: Appointment[]; // Not used in this view but kept for interface compat if needed
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
  onOpenBooking,
  onCancelBooking,
  services,
  onLogout,
  onUpdateProfile,
}) => {
  const {
    cancelConfirmId,
    // setCancelConfirmId, // Internal to hook
    isDrawerOpen,
    setIsDrawerOpen,
    isNotificationsOpen,
    setIsNotificationsOpen,
    isProfileSettingsOpen,
    setIsProfileSettingsOpen,
    selectedCombo,
    setSelectedCombo,
    activeTab,
    // setActiveTab, // Internal to hook

    completedServicesCount,
    upcoming,
    // history, // Not used in main view currently

    // getServiceName, // Not used directly in JSX
    handleVitrineClick,
    handleCancelClick,
    scrollToSection,
    handleConfirmPresence,
    handleTabChange,
  } = useClientDashboard({
    appointments,
    services,
    onOpenBooking,
    onCancelBooking,
  });

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
        {/* 1. PRÓXIMO EMBARQUE (UPCOMING TICKET) */}
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
                    serviceCount={0} // TEMP: Forcing 0 for Silver/Empty test
                    className="w-full max-w-none"
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
              onClick={() => onOpenBooking()}
              className="bg-gradient-to-r from-[#101010] to-[#151515] border border-gray-800/50 rounded-2xl p-5 flex items-center gap-5 group cursor-pointer hover:border-neon-yellow/50 transition-all relative overflow-hidden"
            >
              {/* Background subtle */}
              <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity">
                <img
                  src="/ticket-bg.png"
                  onError={e => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=800&auto=format&fit=crop';
                  }}
                  className="w-full h-full object-cover"
                  alt=""
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
              </div>

              {/* Icon */}
              <div className="relative z-10 w-14 h-14 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-gray-700 group-hover:border-neon-yellow/50 shrink-0">
                <Ticket
                  className="text-gray-500 group-hover:text-neon-yellow transition-colors"
                  size={24}
                />
              </div>

              {/* Content */}
              <div className="relative z-10 flex-1">
                <h3 className="text-white font-black text-lg mb-0.5 font-graffiti tracking-wide group-hover:text-neon-yellow transition-colors">
                  SEM VIAGENS
                </h3>
                <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                  Sua agenda está livre
                </p>
              </div>

              {/* CTA */}
              <div className="relative z-10 shrink-0">
                <div className="bg-neon-yellow text-black font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl group-hover:scale-105 transition-transform shadow-lg">
                  Agendar
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 2. VITRINE DESTAQUES */}
        <section id="vitrine-section" className="animate-[fadeIn_0.5s_ease-out]">
          <VitrineDestaques services={services} onBook={handleVitrineClick} />
        </section>

        {/* 3. MENU DE ESTILO */}
        <section id="services-section" className="relative pt-4">
          <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>

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

        {/* 4. LOYALTY */}
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
          <div className="lg:col-span-7 space-y-6 hidden lg:block"></div>
        </section>

        {/* 5. PORTFOLIO */}
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
