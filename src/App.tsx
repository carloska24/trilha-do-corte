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
  const { services } = useData();

  if (!isBookingOpen) return null;

  return (
    <BookingModal
      isOpen={isBookingOpen}
      onClose={closeBooking}
      initialData={bookingInitialData}
      services={services}
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
