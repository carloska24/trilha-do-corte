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
  const { services, appointments, updateAppointments } = useData();
  console.log('GlobalBookingModal rendering, useAuth:', useAuth);
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
            updateAppointments([...appointments, createdAppointment]);
          } else {
            // Fallback (Offline?): Use local ID if API fails?
            // For now, let's assume connectivity or at least optimistic update
            // But if API fails, createdAppointment is null.
            console.error('Failed to create appointment via API');
            // We could add a local-only one but that leads to sync issues.
            // Let's create an optimistic one just in case, or show error?
            // User requested persistence, so falling back to local storage (via updateAppointments) is better than nothing,
            // but the ID will be wrong if we sync later.
            // Let's stick to API first logic as per DataContext "Cloud First".
            // If it fails, maybe we should alert.
            // But for this step, just logging.

            // Actually, keep the optimistic update behavior for responsiveness?
            // "Disappearing on F5" means it wasn't saved. API call fixes that.
            // If API fails, it WILL disappear on F5 regardless.
          }
        } catch (error) {
          console.error('Error creating appointment:', error);
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
