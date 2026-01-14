import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Appointment, ServiceItem, Client, ShopSettings } from '../types';
import { SERVICES } from '../constants';
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

  // Settings with defaults - Server fetch will override these
  // DON'T read from localStorage on init to avoid stale data from other devices
  const [shopSettings, setShopSettings] = useState<ShopSettings>({
    startHour: 9,
    endHour: 19,
    slotInterval: 30,
    closedDays: [0],
    exceptions: {},
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

      const [fetchedServices, fetchedAppointments, fetchedClients, fetchedSettings] =
        await Promise.all([
          servicesRequest,
          appointmentsRequest,
          clientsRequest,
          api.getSettings(),
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

      // Sort services based on the order in constants.SERVICES
      const sortedServices = normalizedServices.sort((a: any, b: any) => {
        let indexA = SERVICES.findIndex(s => s.id === a.id);
        let indexB = SERVICES.findIndex(s => s.id === b.id);

        if (indexA === -1) indexA = SERVICES.findIndex(s => s.name === a.name);
        if (indexB === -1) indexB = SERVICES.findIndex(s => s.name === b.name);

        const valA = indexA === -1 ? 999 : indexA;
        const valB = indexB === -1 ? 999 : indexB;

        return valA - valB;
      });

      setServices(sortedServices);
      setAppointments(fetchedAppointments);
      setClients(fetchedClients);
      if (fetchedSettings) {
        setShopSettings(fetchedSettings);
        localStorage.setItem('shopSettings', JSON.stringify(fetchedSettings));
      }

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

  // Custom Update Function for Settings (Optimistic + API)
  const handleUpdateShopSettings = async (newSettings: ShopSettings) => {
    setShopSettings(newSettings); // Optimist
    localStorage.setItem('shopSettings', JSON.stringify(newSettings));

    // API Call
    const updated = await api.updateSettings(newSettings);
    if (!updated) {
      console.error('Failed to sync settings with DB');
      // Optionally revert or show toast (but simpler to just log for now)
    }
  };

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
        updateShopSettings: handleUpdateShopSettings,
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
