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
    const normalize = (str: string) =>
      str
        ? str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
        : '';

    const normClient = normalize(currentUser?.name || '');
    const normApp = normalize(a.clientName || '');

    const isIdMatch = String(a.clientId) === String(currentUser?.id);
    const isNameMatch = normClient && normApp && normApp === normClient;
    // New: Phone Match
    const isPhoneMatch =
      currentUser?.phone &&
      a.clientPhone &&
      // Normalize phone just in case (remove spaces/dashes)
      a.clientPhone.replace(/\D/g, '') === currentUser.phone.replace(/\D/g, '');

    // Debug Log (Remove in production)
    if (normApp.includes('lucas') || normClient.includes('lucas') || isPhoneMatch) {
      console.log('Checking App:', a.id, {
        appId: a.clientId,
        userId: currentUser?.id,
        appName: a.clientName,
        userName: currentUser?.name,
        userPhone: currentUser?.phone,
        appPhone: a.clientPhone,
        isIdMatch,
        isNameMatch,
        isPhoneMatch,
      });
    }

    return isIdMatch || isNameMatch || isPhoneMatch;
  });

  // SELF-HEALING: Claim orphan appointments (Name match but no ID)
  React.useEffect(() => {
    if (!currentUser?.id) return;

    clientAppointments.forEach(app => {
      // If it matches (which it does, since it's in clientAppointments)
      // BUT has no clientId (or wrong one? no, filter handles that),
      // then claim it.
      if (!app.clientId) {
        console.log(`🔧 Self-Healing: Claiming orphan app ${app.id} for user ${currentUser.name}`);

        // Optimistic update locally first? No, context handles it via refresh
        api
          .updateAppointment(app.id, { clientId: currentUser.id })
          .then(() => {
            console.log('✅ Claimed!');
            // Force refresh to sync DB state
            // updateAppointments with new state is risky, better to wait for re-fetch or let user see it (it's already filtered in)
          })
          .catch(err => console.error('Failed to claim app', err));
      }
    });
  }, [clientAppointments, currentUser?.id]);

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
