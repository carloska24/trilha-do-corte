import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { UIProvider } from './contexts/UIContext';
import { AppRoutes } from './routes';
import { BookingModal } from './components/BookingModal';
import { useData } from './contexts/DataContext';
import { useUI } from './contexts/UIContext';

// Inner component to access UIContext & DataContext
const GlobalBookingModal = () => {
  const { isBookingOpen, closeBooking, bookingInitialData } = useUI();
  const { services, appointments, updateAppointments } = useData();

  if (!isBookingOpen) return null;

  return (
    <BookingModal
      isOpen={isBookingOpen}
      onClose={closeBooking}
      initialData={bookingInitialData}
      services={services}
      onSubmit={data => {
        // Create new appointment object
        const newAppointment = {
          id: Math.random().toString(36).substr(2, 9),
          ...data,
          status: 'pending' as const, // Force status type
          clientName: data.name,
          price: services.find(s => s.id === data.serviceId)?.priceValue || 0,
          photoUrl: undefined,
          notes: 'Agendamento Online',
        };

        // Update Context (Syncs to LocalStorage & Barber Dashboard)
        updateAppointments([...appointments, newAppointment]);

        // Close Modal
        // Note: BookingModal handles its own success state/delay before calling onSubmit usually,
        // or we can close it here. The modal implementation shows it has a success step.
        // Let's allow the modal to finish its flow if needed, but here we just update data.
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
