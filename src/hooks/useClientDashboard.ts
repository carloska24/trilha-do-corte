import { useState, useEffect } from 'react';
import { Appointment, Combo, ServiceItem } from '../types';
import { MOCK_COMBOS } from '../constants';

interface UseClientDashboardProps {
  appointments: Appointment[];
  services: ServiceItem[];
  onOpenBooking: (preselected?: { serviceId?: string }) => void;
  onCancelBooking: (id: string) => void;
}

export const useClientDashboard = ({
  appointments,
  services,
  onOpenBooking,
  onCancelBooking,
}: UseClientDashboardProps) => {
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);
  const [activeTab, setActiveTab] = useState('dash');

  // Derived State
  const completedServicesCount = appointments.filter(a => a.status === 'completed').length;

  const upcoming = appointments
    .filter(a => a.status !== 'completed' && a.status !== 'cancelled')
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const history = appointments
    .filter(a => a.status === 'completed' || a.status === 'cancelled')
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // Logic
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
      onOpenBooking({ serviceId: id });
    }
  };

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
    alert(`Presença confirmada para o agendamento ${id.substring(0, 6)}!`);
    setIsNotificationsOpen(false);
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'profile') {
      setIsProfileSettingsOpen(true);
      return;
    }
    setActiveTab(tab);

    if (tab === 'services') {
      scrollToSection('services-section');
    } else if (tab === 'wallet') {
      scrollToSection('wallet-section');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Effects
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
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

  return {
    // State
    cancelConfirmId,
    setCancelConfirmId,
    isDrawerOpen,
    setIsDrawerOpen,
    isNotificationsOpen,
    setIsNotificationsOpen,
    isProfileSettingsOpen,
    setIsProfileSettingsOpen,
    selectedCombo,
    setSelectedCombo,
    activeTab,
    setActiveTab,

    // Derived
    completedServicesCount,
    upcoming,
    history,

    // Methods
    getServiceName,
    handleVitrineClick,
    handleCancelClick,
    scrollToSection,
    handleConfirmPresence,
    handleTabChange,
  };
};
