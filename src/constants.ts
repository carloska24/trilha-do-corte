import { ServiceItem, Barber, Appointment, Combo } from './types';

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

export const MOCK_COMBOS: Combo[] = [
  {
    id: 'combo-noivo',
    title: 'DIA DO NOIVO',
    subtitle: 'Preparação completa para o grande dia',
    description:
      'Um ritual exclusivo para garantir que você esteja impecável. Inclui corte premium, tratamento de pele, e relaxamento.',
    priceValue: 250.0,
    items: [
      { serviceId: '1', customLabel: 'Corte Premium' }, // Corte
      { serviceId: '2', customLabel: 'Barba Terapia' }, // Barba
      { serviceId: '5', customLabel: 'Massagem Capilar' }, // Hidratação
    ],
    badge: 'PREMIUM',
    theme: 'tuxedo',
    active: true,
    featured: true,
  },
  {
    id: 'combo-pai-filho',
    title: 'PAI & FILHO',
    subtitle: 'O legado continua. Experiência em dobro.',
    description:
      'Momento especial para compartilhar. Dois cortes completos com atenção redobrada aos detalhes.',
    priceValue: 60.0,
    items: [{ serviceId: '1' }, { serviceId: '1', customLabel: 'Corte Kids' }],
    badge: 'FAMÍLIA',
    theme: 'neon',
    active: true,
    featured: true,
  },
];
