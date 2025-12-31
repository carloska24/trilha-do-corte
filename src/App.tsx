import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { UIProvider } from './contexts/UIContext';
import { AppRoutes } from './routes';
import { BookingModal } from './components/BookingModal';
import { useData } from './contexts/DataContext';
import { useUI } from './contexts/UIContext';
import { api } from './services/api';

// Inner component to access UIContext & DataContext
const GlobalBookingModal = () => {
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
            // DEFENSIVE: Ensure clientId is present locally even if API response omits it (common with some backend framworks)
            const confirmedAppt = { ...createdAppointment, clientId: currentUser?.id };

            // IMPORTANT: Immediately refresh data from API to ensure sync and persistence verification
            // This fixes the "disappearing on refresh" issue by ensuring what we have in UI is what IS in the DB
            await refreshData();

            // As a fallback/optimistic update, we also update state directly if for some reason refresh fails
            // but refreshData is the source of truth
            // updateAppointments([...appointments, confirmedAppt]);
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <UIProvider>
            <GlobalBookingModal />
            <AppRoutes />
          </UIProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Correction: I should update App.tsx to JUST render the structure properly.
// But wait, my routes.tsx handles the routing logic.
// MainLayout is a wrapper around the content.
// A common pattern is:
// <Routes>
//   <Route element={<MainLayout />}>
//      <Route path="/" ... />
//   </Route>
// </Routes>
//
// But my `routes.tsx` is defined as a component `AppRoutes` that returns `<Routes>...</Routes>`.
// So inside `App.tsx`, if I render `<AppRoutes />`, where does `MainLayout` go?
// Use `AppRoutes` to define the entire tree including Layout!

export default App;
