import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Gallery } from './components/Gallery';
import { AiConsultant } from './components/AiConsultant';
import { BookingModal } from './components/BookingModal';
import { Footer } from './components/Footer';
import { ClientDashboard } from './components/ClientDashboard';
import { BarberDashboard } from './components/BarberDashboard';
import { AuthScreen } from './components/AuthScreen';
// import { MOCK_APPOINTMENTS } from './constants';
import { api } from './services/api';
import {
  Appointment,
  AppointmentStatus,
  BookingData,
  AiConsultationResponse,
  SavedStyle,
  BarberProfile,
  DashboardView,
  Client,
} from './types';
import { CheckCircle, AlertCircle, Bookmark } from 'lucide-react';
import { generateId } from './utils';

function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingInitialData, setBookingInitialData] = useState<Partial<BookingData> | undefined>(
    undefined
  );

  // Updated view types to include auth screens
  const [currentView, setCurrentView] = useState<
    'landing' | 'login-client' | 'login-barber' | 'client' | 'barber'
  >(() => {
    const saved = localStorage.getItem('currentView');
    return (saved as any) || 'landing';
  });

  // Persist View
  React.useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  // State específico para navegação dentro do painel do barbeiro
  const [barberView, setBarberView] = useState<DashboardView>('home');

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // State global simulado com persistência
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('appointments');
    return saved ? JSON.parse(saved) : [];
  });

  // Perfil do Cliente Logado com persistência
  const [clientProfile, setClientProfile] = useState(() => {
    const saved = localStorage.getItem('clientProfile');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: Ensure ID and arrays exist for legacy data
      if (!parsed.id) parsed.id = generateId();
      if (!parsed.history || !Array.isArray(parsed.history)) parsed.history = [];
      if (!parsed.savedStyles || !Array.isArray(parsed.savedStyles)) parsed.savedStyles = [];
      return parsed;
    }
    return {
      id: generateId(),
      name: '',
      phone: '',
      loyaltyPoints: 0,
      history: [],
      savedStyles: [] as SavedStyle[],
    };
  });

  // Clientes Globais
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('clients');
    return saved ? JSON.parse(saved) : [];
  });

  // Services State
  const [services, setServices] = useState<any[]>(() => {
    const saved = localStorage.getItem('services');
    return saved ? JSON.parse(saved) : [];
  });

  // Perfil do Barbeiro Logado com persistência
  const [barberProfile, setBarberProfile] = useState<BarberProfile>(() => {
    const saved = localStorage.getItem('barberProfile');
    return saved
      ? JSON.parse(saved)
      : {
          name: 'Barbeiro Chefe',
          email: 'admin@trilhadocorte.com',
          photoUrl: undefined,
        };
  });

  // Fetch Initial Data
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedServices, fetchedAppointments, fetchedClients] = await Promise.all([
          api.getServices(),
          api.getAppointments(),
          api.getClients(),
        ]);

        // Always set the data from API if it returns success, effectively overwriting local cache.
        // This ensures the dashboard is always in sync with the backend.
        setServices(fetchedServices);
        setAppointments(fetchedAppointments);
        setClients(fetchedClients);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };

    fetchData();
  }, []);

  // --- THEME LOGIC ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    // Default to dark if not set
    return saved ? JSON.parse(saved) : true;
  });

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  // Apply Theme Class
  React.useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', JSON.stringify(true));
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', JSON.stringify(false));
    }
  }, [isDarkMode]);

  // Efeitos para salvar no localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('appointments', JSON.stringify(appointments));
    } catch (error) {
      console.error('Error saving appointments to localStorage:', error);
    }
  }, [appointments]);

  React.useEffect(() => {
    try {
      localStorage.setItem('clientProfile', JSON.stringify(clientProfile));
    } catch (error) {
      console.error('Error saving clientProfile to localStorage:', error);
    }
  }, [clientProfile]);

  React.useEffect(() => {
    try {
      localStorage.setItem('barberProfile', JSON.stringify(barberProfile));
    } catch (error) {
      console.error('Error saving barberProfile to localStorage:', error);
      // Optional: Notify user that changes might not be persisted
    }
  }, [barberProfile]);

  React.useEffect(() => {
    try {
      localStorage.setItem('clients', JSON.stringify(clients));
    } catch (error) {
      console.error('Error saving clients to localStorage:', error);
    }
  }, [clients]);

  // REMOVED: Services sync to localStorage caused QuotaExceededError due to Base64 images.
  // We rely on the API for services now.
  React.useEffect(() => {
    try {
      localStorage.setItem('services', JSON.stringify(services));
    } catch (error) {
      console.error('Error saving services to localStorage:', error);
    }
  }, [services]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenBooking = () => {
    setBookingInitialData(
      currentView === 'client'
        ? { name: clientProfile.name, phone: clientProfile.phone }
        : undefined
    );
    setIsBookingOpen(true);
  };

  const handleNewBooking = async (data: BookingData) => {
    // Encontrar preço
    const service = services.find(s => s.id === data.serviceId);
    const price = service ? service.priceValue : 0;

    const newAppointment: Appointment = {
      id: generateId(),
      clientName: currentView === 'client' ? clientProfile.name : data.name,
      serviceId: data.serviceId,
      date: data.date,
      time: data.time,
      status: 'pending',
      price: price,
    };

    setAppointments([...appointments, newAppointment]);
    showNotification('Agendamento solicitado com sucesso!');
  };

  const handleStatusChange = (
    id: string,
    status: AppointmentStatus,
    photoUrl?: string,
    notes?: string
  ) => {
    setAppointments(prev =>
      prev.map(app => {
        if (app.id === id) {
          return {
            ...app,
            status,
            photoUrl: photoUrl || app.photoUrl, // Mantém a foto se já existir ou adiciona nova
            notes: notes || app.notes,
          };
        }
        return app;
      })
    );

    if (status === 'completed') {
      showNotification('Corte finalizado e registrado!');
    }
  };

  const handleCancelBooking = (id: string) => {
    setAppointments(prev =>
      prev.map(app => {
        if (app.id === id) {
          return { ...app, status: 'cancelled' };
        }
        return app;
      })
    );
    showNotification('Agendamento cancelado.', 'error');
  };

  const handleRebook = (appointment: Appointment) => {
    setBookingInitialData({
      name: clientProfile.name,
      phone: clientProfile.phone,
      serviceId: appointment.serviceId,
      // Não preenchemos data/hora para o usuário escolher
    });
    setIsBookingOpen(true);
  };

  const handleSaveStyle = (style: AiConsultationResponse) => {
    const newStyle: SavedStyle = {
      ...style,
      id: generateId(),
      dateSaved: new Date().toISOString(),
    };

    setClientProfile(prev => ({
      ...prev,
      savedStyles: [newStyle, ...prev.savedStyles],
    }));

    showNotification('Estilo salvo no seu perfil!');
  };

  // Helper function to handle registration/login data coming from AuthScreen
  const handleAuthSuccess = (
    role: 'client' | 'barber',
    userData?: { name: string; photoUrl?: string; emailOrPhone: string }
  ) => {
    if (userData) {
      if (role === 'client') {
        setClientProfile(prev => ({
          ...prev,
          name: userData.name,
          phone: userData.emailOrPhone,
          photoUrl: userData.photoUrl || prev.photoUrl, // Keep existing photo if new one is not provided
        }));
      } else {
        setBarberProfile({
          name: userData.name,
          email: userData.emailOrPhone,
          photoUrl: userData.photoUrl,
        });
      }
    }

    showNotification(role === 'client' ? 'Bem-vindo ao vagão!' : 'Painel de Controle Ativado.');
    setCurrentView(role);
    if (role === 'barber') setBarberView('home'); // Reset view on login
  };

  // Funções específicas do Barbeiro
  const handleBarberLogout = () => {
    setCurrentView('landing');
    showNotification('Turno encerrado. Bom descanso!', 'success');
  };

  const handleUpdateBarberProfile = (data: Partial<BarberProfile>) => {
    setBarberProfile(prev => ({ ...prev, ...data }));
    showNotification('Foto de perfil atualizada!');
  };

  const handleBarberSettings = () => {
    setBarberView('settings'); // Redireciona para tela de "Ajustes"
  };

  const handleAddClient = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
    showNotification('Novo passageiro cadastrado!');
  };

  return (
    <div className="bg-transparent text-white font-sans selection:bg-neon-yellow selection:text-black">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-24 right-4 z-[100] px-6 py-4 rounded shadow-2xl flex items-center gap-3 animate-[slideTrack_0.3s_ease-out] border
          ${
            notification.type === 'success'
              ? 'bg-green-900/90 border-green-500 text-white'
              : 'bg-red-900/90 border-red-500 text-white'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold">{notification.message}</span>
        </div>
      )}

      {/* Navbar - Only show for landing and auth screens */}
      {(currentView === 'landing' ||
        currentView === 'login-client' ||
        currentView === 'login-barber') && (
        <Navbar
          onOpenBooking={handleOpenBooking}
          currentView={currentView}
          onViewChange={view => setCurrentView(view)}
          barberView={barberView}
          onBarberViewChange={setBarberView}
        />
      )}

      <main>
        {currentView === 'landing' && (
          <>
            <Hero onOpenBooking={handleOpenBooking} />
            <Services onOpenBooking={handleOpenBooking} services={services} />
            <AiConsultant onOpenBooking={handleOpenBooking} onSaveStyle={handleSaveStyle} />

            <Gallery />
          </>
        )}

        {/* AUTH SCREENS */}
        {currentView === 'login-client' && (
          <AuthScreen
            type="client"
            onLoginSuccess={userData => handleAuthSuccess('client', userData)}
            onGoBack={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'login-barber' && (
          <AuthScreen
            type="barber"
            onLoginSuccess={userData => handleAuthSuccess('barber', userData)}
            onGoBack={() => setCurrentView('landing')}
          />
        )}

        {/* DASHBOARDS */}
        {currentView === 'client' && (
          <ClientDashboard
            client={clientProfile}
            appointments={appointments.filter(
              a => a.clientName === clientProfile.name || a.clientName === 'Você'
            )}
            allAppointments={appointments.filter(a => a.status === 'completed' && a.photoUrl)}
            onOpenBooking={handleOpenBooking}
            onCancelBooking={handleCancelBooking}
            onRebook={handleRebook}
            services={services}
            promotions={services.filter(s => s.featured)}
            onUpdateProfile={updated => {
              setClientProfile(prev => ({ ...prev, ...updated }));
              showNotification('Perfil atualizado com sucesso!');
            }}
            onLogout={() => {
              setCurrentView('landing');
              showNotification('Até a próxima! 👋', 'success');
            }}
          />
        )}

        {currentView === 'barber' && (
          <BarberDashboard
            currentView={barberView}
            appointments={appointments}
            onStatusChange={handleStatusChange}
            onNewAppointment={handleNewBooking}
            barberProfile={barberProfile}
            onLogout={handleBarberLogout}
            onUpdateProfile={handleUpdateBarberProfile}
            onSettings={handleBarberSettings}
            onViewChange={setBarberView}
            clients={clients}
            onAddClient={handleAddClient}
            services={services}
            onUpdateServices={setServices}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
          />
        )}
      </main>

      {currentView === 'landing' && <Footer />}

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSubmit={handleNewBooking}
        initialData={bookingInitialData}
        services={services}
      />
    </div>
  );
}

export default App;
