import React, { useState } from 'react';
import { BarberDashboard } from '../BarberDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import {
  BarberProfile,
  DashboardView,
  AppointmentStatus,
  Appointment,
  Client,
  Service,
} from '../../types';
import { useNavigate } from 'react-router-dom';

export const ConnectedBarberDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const {
    appointments,
    services,
    clients,
    refreshData,
    updateAppointments,
    updateServices,
    updateClients,
  } = useData();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<DashboardView>('home');
  // Temporary local state for dark mode until we move it to UIContext
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleStatusChange = (
    id: string,
    status: AppointmentStatus,
    photoUrl?: string,
    notes?: string
  ) => {
    // Implement or move logic from App.tsx
    // For now, updating local state via context method
    const updated = appointments.map(app =>
      app.id === id ? { ...app, status, photoUrl, notes } : app
    );
    updateAppointments(updated);
  };

  const handleNewAppointment = (data: Partial<Appointment>) => {
    // Implement addition logic
  };

  const handleUpdateProfile = (data: Partial<BarberProfile>) => {
    // Implement profile update in AuthContext?
  };

  const handleUpdateServices = (updatedServices: Service[]) => {
    updateServices(updatedServices);
  };

  const handleAddClient = (client: Client) => {
    updateClients([...clients, client]);
  };

  return (
    <BarberDashboard
      currentView={currentView}
      onViewChange={setCurrentView}
      appointments={appointments}
      onStatusChange={handleStatusChange}
      onNewAppointment={handleNewAppointment}
      barberProfile={currentUser as BarberProfile}
      onLogout={() => {
        logout();
        navigate('/');
      }}
      onUpdateProfile={handleUpdateProfile}
      onSettings={() => setCurrentView('services')}
      clients={clients}
      onAddClient={handleAddClient}
      services={services as Service[]}
      onUpdateServices={handleUpdateServices}
      isDarkMode={isDarkMode}
      toggleTheme={() => setIsDarkMode(!isDarkMode)}
    />
  );
};
