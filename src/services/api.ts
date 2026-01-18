import { ServiceItem, Barber, Client, Appointment } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = BASE_URL ? `${BASE_URL}/api` : '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

export const api = {
  // Generic POST method for flexibility
  post: async (endpoint: string, body: any, options: RequestInit = {}) => {
    try {
      const headers = { ...getAuthHeaders(), ...options.headers };
      // Handle FormData (don't set Content-Type, let browser do it)
      if (body instanceof FormData) {
        delete (headers as any)['Content-Type'];
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: body instanceof FormData ? body : JSON.stringify(body),
      });

      const json = await response.json();
      return { data: json, status: response.status, ok: response.ok };
    } catch (error) {
      console.error(`API POST Error [${endpoint}]:`, error);
      throw error;
    }
  },

  loginClient: async (emailOrPhone: string, password: string): Promise<Client | null> => {
    try {
      const response = await fetch(`${API_URL}/login/client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password }),
      });
      if (!response.ok) return null;
      const json = await response.json();
      if (json.token) localStorage.setItem('token', json.token);
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
      if (json.token) localStorage.setItem('token', json.token);
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
      if (!response.ok) {
        const err = await response.json();
        console.warn('⚠️ Register failed:', err);
        throw new Error(err.error || 'Falha no cadastro');
      }
      const json = await response.json();
      if (json.token) localStorage.setItem('token', json.token);
      return json.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error; // Re-throw to be caught by UI
    }
  },

  registerBarber: async (data: any): Promise<Barber | null> => {
    try {
      const response = await fetch(`${API_URL}/register/barber`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) return null;
      const json = await response.json();
      if (json.token) localStorage.setItem('token', json.token);
      return json.data;
    } catch (error) {
      console.error('Register Barber error:', error);
      return null;
    }
  },

  getProfile: async (id: string): Promise<Client | null> => {
    try {
      const response = await fetch(`${API_URL}/clients/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) return null;
      const json = await response.json();
      // Backend returns { data: [client] } or { data: client }?
      // usersController.ts getClients returns array. getClientById?
      // Wait, usersRoutes usually has /clients but usersController "getClients" returns ALL.
      // I need to check usersRoutes.ts to see if /clients/:id exists.
      return json.data;
    } catch (error) {
      console.error('getProfile error:', error);
      return null;
    }
  },

  updateClient: async (id: string, data: Partial<Client>): Promise<Client | null> => {
    try {
      const response = await fetch(`${API_URL}/clients/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`⚠️ [API] updateClient failed: ${response.status}`, errorData);
        return null;
      }
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('❌ Update Client error:', error);
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting service:', error);
      return false;
    }
  },

  // --- IMAGES ---
  uploadImage: async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData, // No Content-Type header needed, fetch sets it for FormData
      });
      if (!response.ok) throw new Error('Upload failed');
      const json = await response.json();
      return json.url;
    } catch (e) {
      console.error('Upload Error:', e);
      return null;
    }
  },

  // --- BARBERS ---

  getBarbers: async (): Promise<Barber[]> => {
    try {
      const response = await fetch(`${API_URL}/barbers`, {
        headers: getAuthHeaders(),
      });
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Error fetching barbers:', error);
      return [];
    }
  },

  updateBarber: async (id: string, data: Partial<Barber>): Promise<Barber | null> => {
    try {
      const response = await fetch(`${API_URL}/barbers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`⚠️ [API] updateBarber failed: ${response.status}`, errorData);
        return null;
      }
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('❌ Update Barber error:', error);
      return null;
    }
  },

  getClients: async (): Promise<Client[]> => {
    try {
      const response = await fetch(`${API_URL}/clients`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) return [];
      const json = await response.json();
      return json.data || [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  },

  createClient: async (client: Omit<Client, 'id'>): Promise<Client | null> => {
    try {
      const response = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(client),
      });
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Error creating client:', error);
      return null;
    }
  },

  deleteClient: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/clients/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting client:', error);
      return false;
    }
  },

  getAppointments: async (): Promise<Appointment[]> => {
    try {
      const response = await fetch(`${API_URL}/appointments?_t=${Date.now()}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) return [];
      const json = await response.json();
      if (!json.data) return [];

      // Handle Postgres lowercase return for clientId if needed
      return json.data.map((appt: any) => ({
        ...appt,
        clientId: appt.clientId || appt.clientid,
        barberId: appt.barberId || appt.barberid,
        serviceId: appt.serviceId || appt.serviceid,
        clientName: appt.clientName || appt.clientname,
        photoUrl: appt.photoUrl || appt.photourl,
      }));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  },

  createAppointment: async (appointment: Omit<Appointment, 'id'>): Promise<Appointment | null> => {
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(appointment),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: Falha ao criar agendamento`);
      }

      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error; // UI catches this
    }
  },

  updateAppointment: async (
    id: string,
    data: Partial<Appointment>
  ): Promise<Appointment | null> => {
    try {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`⚠️ [API] updateAppointment failed: ${response.status}`, errorData);
        return null;
      }
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('❌ Error updating appointment:', error);
      return null;
    }
  },

  clearAppointments: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return response.ok;
    } catch (error) {
      console.error('Error clearing appointments:', error);
      return false;
    }
  },

  // --- SETTINGS ---
  getSettings: async (): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/settings`);
      const json = await response.json();
      return json;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
  },

  updateSettings: async (settings: any): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`⚠️ [API] updateSettings failed: ${response.status}`, errorData);
        return null;
      }
      const json = await response.json();
      return json;
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      return null;
    }
  },
};
