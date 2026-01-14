import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ConnectedClientDashboard } from './components/connected/ConnectedClientDashboard';
import { useAuth } from './contexts/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Lazy Load Dashboard Components
const DashboardHome = lazy(() =>
  import('./components/dashboard/DashboardHome').then(module => ({ default: module.DashboardHome }))
);
const ClientsManager = lazy(() =>
  import('./components/dashboard/ClientsManager').then(module => ({
    default: module.ClientsManager,
  }))
);
const CalendarView = lazy(() =>
  import('./components/dashboard/CalendarView').then(module => ({ default: module.CalendarView }))
);
const ServiceConfig = lazy(() =>
  import('./components/dashboard/ServiceConfig').then(module => ({ default: module.ServiceConfig }))
);
const FinanceiroPage = lazy(() =>
  import('./components/dashboard/FinanceiroPage').then(module => ({
    default: module.FinanceiroPage,
  }))
);
const SettingsView = lazy(() =>
  import('./components/dashboard/SettingsView').then(module => ({ default: module.SettingsView }))
);

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole: 'client' | 'barber' }> = ({
  children,
  allowedRole,
}) => {
  const { isAuthenticated, userType } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (userType !== allowedRole) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/client"
          element={
            <ProtectedRoute allowedRole="client">
              <ConnectedClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="barber">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <DashboardHome />
              </Suspense>
            }
          />
          <Route
            path="clients"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <ClientsManager />
              </Suspense>
            }
          />
          <Route
            path="calendar"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <CalendarView />
              </Suspense>
            }
          />
          <Route
            path="services"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <ServiceConfig />
              </Suspense>
            }
          />
          <Route
            path="financial"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <FinanceiroPage />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <SettingsView />
              </Suspense>
            }
          />
        </Route>
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
