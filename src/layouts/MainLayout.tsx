import React from 'react';
import { Navbar } from '../components/Navbar';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useUI } from '../contexts/UIContext';
import { DashboardView } from '../types';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { openBooking } = useUI();

  // Map current path to "view" for Navbar
  const getSimulatedView = () => {
    if (location.pathname === '/') return 'landing';
    if (location.pathname.startsWith('/client')) return 'client';
    if (location.pathname.startsWith('/dashboard')) return 'barber';
    if (location.pathname.startsWith('/login')) return 'login-client'; // Defaulting to generic login view style
    return 'landing';
  };

  const handleViewChange = (view: string) => {
    if (view === 'landing') navigate('/');
    else if (view === 'client') navigate('/client');
    else if (view === 'barber') navigate('/dashboard');
    else if (view === 'login-client') navigate('/login?type=client');
    else if (view === 'login-barber') navigate('/login?type=barber');
  };

  const currentView = getSimulatedView();

  return (
    <>
      {/* Hide Navbar on login pages and Dashboard/Client Dashboards (they have their own layouts) */}
      {!location.pathname.startsWith('/login') &&
        !location.pathname.startsWith('/dashboard') &&
        !location.pathname.startsWith('/client') && (
          <Navbar
            currentView={currentView as any}
            onViewChange={handleViewChange}
            onOpenBooking={() => openBooking()}
            // Barber view state is now internal to BarberDashboard, but Navbar asks for it?
            // We provide dummy handlers if not in barber mode, or context if needed.
            // Navbar expects `barberView` prop for highlighting.
            // For now, we pass 'home' or need global state for barber sub-view?
            // Since BarberDashboard manages its own state in "Connected" version, Navbar highlights won't sync
            // unless we lift that state to UIContext or URL params.
            // Keeping it simple for phase 2: No sub-nav sync in main Navbar yet.
            barberView={'home'}
          />
        )}
      <main>
        <Outlet />
      </main>
    </>
  );
};
