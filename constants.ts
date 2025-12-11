import { ServiceItem, Barber, Appointment } from './types';

export const SERVICES: ServiceItem[] = [
  {
    id: '1',
    name: 'Corte',
    price: 'R$ 35,00',
    priceValue: 35,
    description: 'Corte completo (55min).',
    icon: 'scissors',
    image:
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Barba',
    price: 'R$ 25,00',
    priceValue: 25,
    description: 'Modelagem e acabamento (30min).',
    icon: 'razor',
    image:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Sobrancelha',
    price: 'R$ 10,00',
    priceValue: 10,
    description: 'Design de sobrancelha (10min).',
    icon: 'razor',
    image:
      'https://images.unsplash.com/photo-1599351431202-6e0005079746?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: '4',
    name: 'Pezinho',
    price: 'R$ 10,00',
    priceValue: 10,
    description: 'Acabamento do pezinho (15min).',
    icon: 'scissors',
    image:
      'https://images.unsplash.com/photo-1503951914875-befbb7470d03?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: '5',
    name: 'Hidratação',
    price: 'R$ 20,00',
    priceValue: 20,
    description: 'Tratamento capilar (30min).',
    icon: 'combo',
    image:
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400&auto=format&fit=crop',
  },
];

export const BARBERS: Barber[] = [
  {
    id: 'b1',
    name: 'Mestre Vapor',
    specialty: 'Fades & Freestyle',
    image:
      'https://images.unsplash.com/photo-1581803118522-7b72a50f7e9f?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'b2',
    name: 'Zero Grau',
    specialty: 'Barba Terapia',
    image:
      'https://images.unsplash.com/photo-1618077553780-75539862f629?q=80&w=400&auto=format&fit=crop',
  },
];

// Mock Data para simular o banco de dados
const today = new Date().toISOString().split('T')[0];

/** @deprecated - Use API instead. Removed from App.tsx */
export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '101',
    clientName: 'João da Silva',
    serviceId: '1',
    date: today,
    time: '09:00',
    status: 'completed',
    price: 45,
    photoUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '102',
    clientName: 'Pedro Skate',
    serviceId: '3',
    date: today,
    time: '10:30',
    status: 'confirmed',
    price: 70,
    photoUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: '103',
    clientName: 'Lucas Grafite',
    serviceId: '2',
    date: today,
    time: '14:00',
    status: 'pending',
    price: 35,
    photoUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '104',
    clientName: 'Marcos Trem',
    serviceId: '1',
    date: today,
    time: '16:00',
    status: 'pending',
    price: 45,
    photoUrl:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '105',
    clientName: 'Ana Style',
    serviceId: '1',
    date: today,
    time: '17:00',
    status: 'confirmed',
    price: 45,
    photoUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
  },
];

/** @deprecated - Use API instead */
export const CLIENT_MOCK_DATA = {
  id: 'client-mock-001',
  name: 'Passageiro Visitante',
  phone: '(11) 99999-9999',
  photoUrl:
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop',
  loyaltyPoints: 7, // 7 de 10 cortes
  upcoming: [
    {
      id: '201',
      clientName: 'Você',
      serviceId: '3',
      date: '2023-11-20',
      time: '15:00',
      status: 'confirmed',
      price: 70,
    } as Appointment,
  ],
  history: [
    {
      id: '90',
      clientName: 'Você',
      serviceId: '1',
      date: '2023-10-15',
      time: '14:00',
      status: 'completed',
      price: 45,
      photoUrl:
        'https://images.unsplash.com/photo-1599351431202-6e0005079746?q=80&w=200&auto=format&fit=crop',
    } as Appointment,
    {
      id: '80',
      clientName: 'Você',
      serviceId: '2',
      date: '2023-09-10',
      time: '10:00',
      status: 'completed',
      price: 35,
    } as Appointment,
  ],
};

/** @deprecated - Use API instead */
export const MOCK_CLIENTS = [
  {
    id: '1',
    name: 'Lucas Grafite',
    phone: '(11) 99888-7766',
    level: 4,
    lastVisit: '28/09/2023',
    img: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop',
    status: 'active',
    notes: 'Gosta de degradê navalhado. Torce pro Corinthians.',
  },
  {
    id: '2',
    name: 'Pedro Skate',
    phone: '(11) 91234-5678',
    level: 1,
    lastVisit: 'Ontem',
    img: null,
    status: 'new',
    notes: 'Primeira vez. Cabelo difícil de pentear.',
  },
  {
    id: '3',
    name: 'Marcos Trem',
    phone: '(11) 97777-1111',
    level: 8,
    lastVisit: '10/10/2023',
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
    status: 'vip',
    notes: 'Cliente antigo. Sempre pede café.',
  },
  {
    id: '4',
    name: 'João da Silva',
    phone: '(11) 95555-4444',
    level: 2,
    lastVisit: 'Hoje',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    status: 'active',
    notes: '',
  },
  {
    id: '5',
    name: 'Ana Style',
    phone: '(11) 93333-2222',
    level: 5,
    lastVisit: 'Hoje',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    status: 'active',
    notes: 'Desenho na nuca.',
  },
];
