import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Appointment, ServiceItem, Client } from '../types';
import { api } from '../services/api';

interface DataContextType {
  appointments: Appointment[];
  services: ServiceItem[];
  clients: Client[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  updateAppointments: (appointments: Appointment[]) => void;
  updateServices: (services: ServiceItem[]) => void;
  updateClients: (clients: Client[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from LocalStorage for seamless UX before API loads
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('appointments');
    return saved ? JSON.parse(saved) : [];
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem('services');
    return saved ? JSON.parse(saved) : [];
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('clients');
    return saved ? JSON.parse(saved) : [];
  });

  const [isLoading, setIsLoading] = useState(false);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedServices, fetchedAppointments, fetchedClients] = await Promise.all([
        api.getServices(),
        api.getAppointments(),
        api.getClients(),
      ]);

      // Only update if we don't have local data?
      // For now, in "Mock Mode", we should probably NOT overwrite with API data if we want persistence.
      // But let's leave this function as "Force Refresh" logic.

      setServices(fetchedServices);
      setAppointments(fetchedAppointments);
      setClients(fetchedClients);

      // Update local storage
      localStorage.setItem('services', JSON.stringify(fetchedServices));
      localStorage.setItem('appointments', JSON.stringify(fetchedAppointments));
      localStorage.setItem('clients', JSON.stringify(fetchedClients));
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial Fetch - SMART STRATEGY
  // If we have no services (empty localStorage), fetch default/mock data.
  // If we have data, keep it (don't overwrite with mocks).
  useEffect(() => {
    if (services.length === 0) {
      refreshData();
    }
  }, [refreshData, services.length]);

  // Sync state changes to LoalStorage
  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  // LISTEN FOR CROSS-TAB CHANGES (Multi-Tab Sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'services' && e.newValue) {
        setServices(JSON.parse(e.newValue));
      }
      if (e.key === 'appointments' && e.newValue) {
        setAppointments(JSON.parse(e.newValue));
      }
      if (e.key === 'clients' && e.newValue) {
        setClients(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <DataContext.Provider
      value={{
        appointments,
        services,
        clients,
        isLoading,
        refreshData,
        updateAppointments: setAppointments,
        updateServices: setServices,
        updateClients: setClients,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
