import React from 'react';
import { ClientDashboard } from '../ClientDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useUI } from '../../contexts/UIContext';
import { ClientProfile } from '../../types';
import { useNavigate } from 'react-router-dom';

export const ConnectedClientDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { appointments, services, updateAppointments } = useData();
  const { openBooking } = useUI();
  const navigate = useNavigate();

  const handleCancelBooking = (id: string) => {
    const updated = appointments.map(app =>
      app.id === id ? { ...app, status: 'cancelled' as const } : app
    );
    updateAppointments(updated);
  };

  const handleRebook = (appointment: any) => {
    openBooking({
      serviceId: appointment.serviceId,
    });
  };

  // Filter appointments for this client
  const clientAppointments = appointments.filter(a => a.clientId === currentUser?.id);

  return (
    <ClientDashboard
      client={currentUser as ClientProfile}
      appointments={clientAppointments}
      allAppointments={appointments}
      onOpenBooking={openBooking}
      onCancelBooking={handleCancelBooking}
      onRebook={handleRebook}
      services={services}
      onLogout={() => {
        logout();
        navigate('/');
      }}
      promotions={[]} // Implement promotions in DataContext later
      onUpdateProfile={() => {}} // Implement profile update
    />
  );
};
