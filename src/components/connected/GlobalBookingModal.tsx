import React from 'react';
import { BookingModal } from '../BookingModal';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useUI } from '../../contexts/UIContext';
import { api } from '../../services/api';

export const GlobalBookingModal = () => {
  const { isBookingOpen, closeBooking, bookingInitialData } = useUI();
  const { services, appointments, updateAppointments, refreshData } = useData();
  const { currentUser } = useAuth(); // Get current user

  if (!isBookingOpen) return null;

  // Auto-fill logic: Merge currentUser info with any initial data (e.g. rebooking)
  const mergedInitialData = {
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    ...bookingInitialData,
  };

  return (
    <BookingModal
      isOpen={isBookingOpen}
      onClose={closeBooking}
      initialData={mergedInitialData}
      services={services}
      appointments={appointments}
      onSubmit={async data => {
        // Prepare payload for API (omit ID, let backend generate it)
        const appointmentPayload = {
          ...data,
          clientId: currentUser?.id,
          status: 'pending' as const,
          clientName: data.name,
          price: services.find(s => s.id === data.serviceId)?.priceValue || 0,
          photoUrl: undefined,
          notes: 'Agendamento Online',
        };

        try {
          // Persist to Backend
          const createdAppointment = await api.createAppointment(appointmentPayload);

          if (createdAppointment) {
            // Update Context with the REAL appointment from DB
            // DEFENSIVE: Ensure clientId is present locally even if API response omits it
            const confirmedAppt = { ...createdAppointment, clientId: currentUser?.id };

            // IMPORTANT: Immediately refresh data from API to ensure sync and persistence verification
            await refreshData();

            // As a fallback/optimistic update, we also update state directly
            // This ensures instant feedback even if refreshData is slow or cached
            updateAppointments([...appointments, confirmedAppt]);
          } else {
            throw new Error(
              'Falha ao criar agendamento (retorno nulo API). Verifique conflitos de horário.'
            );
          }
        } catch (err) {
          console.error('Failed to create appointment via API', err);
          // Re-throw so BookingModal knows it failed
          throw err;
        }
      }}
    />
  );
};
