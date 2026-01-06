import { ServiceItem, Barber, Appointment, Combo } from './types';

export const SERVICES: ServiceItem[] = [
  // --- CABELO ---
  {
    id: 's1',
    name: 'Corte',
    price: 'R$ 35,00',
    priceValue: 35,
    description: 'Corte completo (45min).',
    icon: 'scissors',
    image: '/services/Corte.png',
    category: 'Cabelo',
    duration: 45,
  },
  {
    id: 's2',
    name: 'Corte Degradê',
    price: 'R$ 40,00',
    priceValue: 40,
    description: 'Fade perfeito com acabamento navalhado.',
    icon: 'clipper',
    image: '/services/Corte.png',
    category: 'Cabelo',
    duration: 50,
  },
  {
    id: 's6',
    name: 'Pezinho',
    price: 'R$ 15,00',
    priceValue: 15,
    description: 'Acabamento e contornos (15min).',
    icon: 'scissors',
    image: '/services/pezinho.png',
    category: 'Cabelo',
    duration: 15,
  },

  // --- BARBA ---
  {
    id: 's3',
    name: 'Barba',
    price: 'R$ 30,00',
    priceValue: 30,
    description: 'Modelagem e acabamento (30min).',
    icon: 'razor',
    image: '/services/Barba.png',
    category: 'Barba',
    duration: 30,
  },
  {
    id: 's4',
    name: 'Barba Desenhada',
    price: 'R$ 35,00',
    priceValue: 35,
    description: 'Alinhamento preciso e pigmentação.',
    icon: 'razor',
    image: '/services/pigmentacao.png',
    category: 'Barba',
    duration: 40,
  },

  // --- QUÍMICA ---
  {
    id: 's5',
    name: 'Hidratação',
    price: 'R$ 40,00',
    priceValue: 40,
    description: 'Tratamento capilar profundo.',
    icon: 'combo',
    image: '/services/hidratacao.png',
    category: 'Química',
    duration: 30,
  },
  {
    id: 's7',
    name: 'Pigmentação',
    price: 'R$ 35,00',
    priceValue: 35,
    description: 'Realce de cor para barba ou cabelo.',
    icon: 'sparkles',
    image: '/services/pigmentacao.png',
    category: 'Química',
    duration: 45,
  },
  {
    id: 's8',
    name: 'Platinado',
    price: 'R$ 120,00',
    priceValue: 120,
    description: 'Descoloração global e matização (Nevou).',
    icon: 'color',
    image: '/services/platinatado.png',
    category: 'Química',
    duration: 120,
  },
  {
    id: 's9',
    name: 'Luzes',
    price: 'R$ 80,00',
    priceValue: 80,
    description: 'Mechas na touca ou papel.',
    icon: 'color',
    image: '/services/luzes.png',
    category: 'Química',
    duration: 90,
  },
  {
    id: 's10',
    name: 'Alisamento',
    price: 'R$ 80,00',
    priceValue: 80,
    description: 'Alisamento capilar profissional.',
    icon: 'wind',
    image: '/services/Alisamento.png',
    category: 'Química',
    duration: 90,
  },
  {
    id: 's11',
    name: 'Progressiva',
    price: 'R$ 100,00',
    priceValue: 100,
    description: 'Redução de volume e alinhamento.',
    icon: 'wind',
    image: '/services/Progressiva.png',
    category: 'Química',
    duration: 120,
  },

  // --- ESTÉTICA ---
  {
    id: 's12',
    name: 'Sobrancelha',
    price: 'R$ 15,00',
    priceValue: 15,
    description: 'Design de sobrancelha (10min).',
    icon: 'razor',
    image: '/services/sobrancelha.png',
    category: 'Estética',
    duration: 15,
  },
  {
    id: 's13',
    name: 'Limpeza de Pele',
    price: 'R$ 50,00',
    priceValue: 50,
    description: 'Remoção de impurezas e revitalização.',
    icon: 'sparkles',
    image: '/services/limpeza-de-pele.png',
    category: 'Estética',
    duration: 45,
  },
  {
    id: 's14',
    name: 'Depilação (Nariz/Orelha)',
    price: 'R$ 20,00',
    priceValue: 20,
    description: 'Cera quente para nariz ou orelhas.',
    icon: 'sparkles',
    image: '/services/depilacao-nariz-orelha.png',
    category: 'Estética',
    duration: 20,
  },

  // --- COMBOS ---
  {
    id: 's15',
    name: 'Corte + Barba',
    price: 'R$ 60,00',
    priceValue: 60,
    description: 'Combo clássico.',
    icon: 'combo',
    image: '/services/corte-barba.png',
    category: 'Combo',
    duration: 75,
  },
  {
    id: 's16',
    name: 'Corte + Sobrancelha',
    price: 'R$ 45,00',
    priceValue: 45,
    description: 'Visual renovado.',
    icon: 'combo',
    image: '/services/corte-sobrancelha.png',
    category: 'Combo',
    duration: 55,
  },
  {
    id: 's17',
    name: 'Corte + Pigmentação',
    price: 'R$ 65,00',
    priceValue: 65,
    description: 'Corte com acabamento pigmentado.',
    icon: 'combo',
    image: '/services/corte-pigmentacao.png',
    category: 'Combo',
    duration: 80,
  },
  {
    id: 's18',
    name: 'Corte + Barba + Sobrancelha',
    price: 'R$ 70,00',
    priceValue: 70,
    description: 'Serviço completo.',
    icon: 'combo',
    image: '/services/Corte-Barba-sobrancelha.png',
    category: 'Combo',
    duration: 90,
  },
  {
    id: 's19',
    name: 'Pezinho + Sobrancelha',
    price: 'R$ 25,00',
    priceValue: 25,
    description: 'Manutenção rápida.',
    icon: 'scissors',
    image: '/services/pezinho-sobrancelha.png',
    category: 'Combo',
    duration: 25,
  },
  {
    id: 's20',
    name: 'Pezinho + Barba + Sobrancelha',
    price: 'R$ 45,00',
    priceValue: 45,
    description: 'Acabamento total.',
    icon: 'scissors',
    image: '/services/pezinho-barba-sobrancelha.png',
    category: 'Combo',
    duration: 50,
  },

  // --- Especiais ---
  {
    id: 's21',
    name: 'Pai & Filho',
    price: 'R$ 60,00',
    priceValue: 60,
    description: 'Corte para adulto e criança.',
    icon: 'combo',
    image: '/services/pai-e-filho.png',
    category: 'Combo',
    duration: 60,
  },
  {
    id: 's22',
    name: 'Dia do Noivo',
    price: 'R$ 250,00',
    priceValue: 250,
    description: 'Experiência completa para o grande dia.',
    icon: 'star',
    image: '/services/dia-do-noivo.png',
    category: 'Combo',
    duration: 180,
  },
  {
    id: 's23',
    name: 'Dia do Amigo',
    price: 'R$ 60,00',
    priceValue: 60,
    description: 'Traga um amigo e ganhe desconto.',
    icon: 'combo',
    image: '/services/dia-do-amigo.png',
    category: 'Combo',
    duration: 90,
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
// --- AVATAR PACK (Gamer / Cyberpunk / 3D Style) ---
export const AVATAR_PACK = [
  // Neon Masks & Helmets
  'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=200&auto=format&fit=crop', // Neon Mask
  'https://images.unsplash.com/photo-1614728853913-1e32005e319a?q=80&w=200&auto=format&fit=crop', // Cyber Helmet
  'https://images.unsplash.com/photo-1614726365723-49cfae9278b7?q=80&w=200&auto=format&fit=crop', // Red Hood
  'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=200&auto=format&fit=crop', // Dog Neon

  // 3D Renders & Art
  'https://images.unsplash.com/photo-1620641788427-7a1c42208d9f?q=80&w=200&auto=format&fit=crop', // Pink 3D Girl
  'https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=200&auto=format&fit=crop', // Abstract Neon
  'https://images.unsplash.com/photo-1635322966219-b75ed3a90533?q=80&w=200&auto=format&fit=crop', // Anime Girl
  'https://images.unsplash.com/photo-1614729931668-37963b6b3e8c?q=80&w=200&auto=format&fit=crop', // Red Cyborg

  // Futuristic People
  'https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?q=80&w=200&auto=format&fit=crop', // Man in Shadows
  'https://images.unsplash.com/photo-1578357078588-d3425aebd82d?q=80&w=200&auto=format&fit=crop', // Gas Mask
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop', // Classic Avatar (Safe fallback)
  'https://images.unsplash.com/photo-1639628735078-ed2f038a193e?q=80&w=200&auto=format&fit=crop', // 3D Character
];
