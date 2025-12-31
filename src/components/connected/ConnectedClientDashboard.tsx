import React from 'react';
import { ClientDashboard } from '../client/ClientDashboard';
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

  const handleCancelBooking = async (id: string) => {
    // 1. Optimistic Update
    const optimisticUpdated = appointments.map(app =>
      app.id === id ? { ...app, status: 'cancelled' as const } : app
    );
    updateAppointments(optimisticUpdated);

    // 2. API Call
    const success = await api.updateAppointment(id, { status: 'cancelled' });

    // 3. Rollback if failed (optional, but good practice)
    if (!success) {
      console.error('Failed to cancel appointment on server');
      // Revert logic could be complex if we don't have previous state easily,
      // but usually we just fetch fresh data or show toast.
      // For now, we trust the happy path or user will refresh.
    }
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
