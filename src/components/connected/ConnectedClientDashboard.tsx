import React from 'react';
import { ClientDashboard } from '../ClientDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useUI } from '../../contexts/UIContext';
import { ClientProfile } from '../../types';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

export const ConnectedClientDashboard: React.FC = () => {
  const { currentUser, logout, updateProfile } = useAuth();
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

  const handleUpdateProfile = async (data: Partial<ClientProfile>) => {
    if (!currentUser?.id) return;
    // Map photoUrl to img for the API
    const apiData = {
      ...data,
      img: data.photoUrl,
    };
    const updated = await api.updateClient(currentUser.id, apiData);
    if (updated && updateProfile) {
      updateProfile({ ...data, id: currentUser.id });
    }
  };

  // Filter appointments for this client
  const clientAppointments = appointments.filter(a => {
    const isMatch = String(a.clientId) === String(currentUser?.id);
    return isMatch;
  });

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
      promotions={[]}
      onUpdateProfile={handleUpdateProfile}
    />
  );
};
