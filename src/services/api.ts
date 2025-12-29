import { ServiceItem, Barber, Client, Appointment } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = BASE_URL ? `${BASE_URL}/api` : '/api';

export const api = {
  loginClient: async (emailOrPhone: string, password: string): Promise<Client | null> => {
    try {
      const response = await fetch(`${API_URL}/login/client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password }),
      });
      if (!response.ok) return null;
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  loginBarber: async (email: string, password: string): Promise<Barber | null> => {
    try {
      const response = await fetch(`${API_URL}/login/barber`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) return null;
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  registerClient: async (data: any): Promise<Client | null> => {
    try {
      const response = await fetch(`${API_URL}/register/client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) return null;
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Register error:', error);
      return null;
    }
  },

  getServices: async (): Promise<ServiceItem[]> => {
    try {
      const response = await fetch(`${API_URL}/services?_t=${Date.now()}`);
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  },

  createService: async (service: Omit<ServiceItem, 'id'>): Promise<ServiceItem | null> => {
    try {
      const response = await fetch(`${API_URL}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(service),
      });
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Error creating service:', error);
      return null;
    }
  },

  updateService: async (id: string, service: Partial<ServiceItem>): Promise<ServiceItem | null> => {
    try {
      const response = await fetch(`${API_URL}/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(service),
      });
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Error updating service:', error);
      return null;
    }
  },

  deleteService: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/services/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting service:', error);
      return false;
    }
  },

  getBarbers: async (): Promise<Barber[]> => {
    try {
      const response = await fetch(`${API_URL}/barbers`);
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Error fetching barbers:', error);
      return [];
    }
  },

  getClients: async (): Promise<Client[]> => {
    try {
      const response = await fetch(`${API_URL}/clients`);
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  },

  createClient: async (client: Omit<Client, 'id'>): Promise<Client | null> => {
    try {
      const response = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(client),
      });
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Error creating client:', error);
      return null;
    }
  },

  getAppointments: async (): Promise<Appointment[]> => {
    try {
      const response = await fetch(`${API_URL}/appointments`);
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  },

  createAppointment: async (appointment: Omit<Appointment, 'id'>): Promise<Appointment | null> => {
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointment),
      });
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      return null;
    }
  },
};
