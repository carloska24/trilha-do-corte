import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Appointment, ServiceItem, Client, ShopSettings } from '../types';
import { api } from '../services/api';

interface DataContextType {
  appointments: Appointment[];
  services: ServiceItem[];
  clients: Client[];
  shopSettings: ShopSettings;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  updateAppointments: (appointments: Appointment[]) => void;
  updateServices: (services: ServiceItem[]) => void;
  updateClients: (clients: Client[]) => void;
  updateShopSettings: (settings: ShopSettings) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize empty - Always fetch from API (Cloud First)
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Settings with defaults (09:00 - 20:00, 60min interval)
  const [shopSettings, setShopSettings] = useState<ShopSettings>(() => {
    const saved = localStorage.getItem('shopSettings');
    return saved
      ? JSON.parse(saved)
      : { startHour: 9, endHour: 20, slotInterval: 60, exceptions: {} };
  });

  const [isLoading, setIsLoading] = useState(false);

  // ... (refreshData definition remains same, just ensuring it's called)

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch public data always
      const servicesRequest = api.getServices();
      const appointmentsRequest = api.getAppointments();

      // Fetch protected data only if token exists (simple check)
      const token = localStorage.getItem('token');
      const clientsRequest = token ? api.getClients() : Promise.resolve([]);

      const [fetchedServices, fetchedAppointments, fetchedClients] = await Promise.all([
        servicesRequest,
        appointmentsRequest,
        clientsRequest,
      ]);

      const normalizedServices = fetchedServices.map((s: any) => {
        // Handle Postgres lowercase keys
        const priceVal = s.priceValue ?? s.pricevalue;
        const priceRaw = s.price;

        return {
          ...s,
          // Adapter for Backend Schema mismatch:
          // Ensure priceValue is a number. Check both CamelCase and lowercase.
          priceValue:
            priceVal !== undefined && priceVal !== null
              ? Number(priceVal)
              : typeof priceRaw === 'number'
              ? priceRaw
              : 0,
          // Ensure visual price string exists
          price:
            typeof priceRaw === 'string'
              ? priceRaw
              : `R$ ${(
                  (priceVal !== undefined && priceVal !== null ? Number(priceVal) : 0) ||
                  (typeof priceRaw === 'number' ? priceRaw : 0)
                )
                  .toFixed(2)
                  .replace('.', ',')}`,
          // Normalize activePromo if needed (handle lowercase from DB if not already handled by backend)
          activePromo: s.activePromo || (s.activepromo ? JSON.parse(s.activepromo) : undefined),
        };
      });

      setServices(normalizedServices);
      setAppointments(fetchedAppointments);
      setClients(fetchedClients);

      // We can still save to LS for backup, but we won't read from it on init
      localStorage.setItem('services', JSON.stringify(normalizedServices));
      localStorage.setItem('appointments', JSON.stringify(fetchedAppointments));
      localStorage.setItem('clients', JSON.stringify(fetchedClients));
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Force Fetch on Mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

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

  useEffect(() => {
    localStorage.setItem('shopSettings', JSON.stringify(shopSettings));
  }, [shopSettings]);

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
      if (e.key === 'shopSettings' && e.newValue) {
        setShopSettings(JSON.parse(e.newValue));
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
        shopSettings,
        isLoading,
        refreshData,
        updateAppointments: setAppointments,
        updateServices: setServices,
        updateClients: setClients,
        updateShopSettings: setShopSettings,
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
