import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const SERVICES = [
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

const CLIENTS = [
  {
    id: 'c1',
    name: 'Carlos Oliveira',
    phone: '(11) 99999-1001',
    level: 2,
    lastVisit: '01/12/2023',
    img: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=200&auto=format&fit=crop',
    status: 'active',
    notes: 'Cliente fiel, gosta de conversar sobre futebol.',
    email: 'carlos@email.com',
  },
  {
    id: 'c2',
    name: 'Fernanda Souza',
    phone: '(11) 99999-1002',
    level: 5,
    lastVisit: '20/11/2023',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    status: 'vip',
    notes: 'Undercut lateral, sempre pontual.',
    email: 'fernanda@email.com',
  },
  {
    id: 'c3',
    name: 'Roberto Almeida',
    phone: '(11) 99999-1003',
    level: 1,
    lastVisit: 'Nunca',
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
    status: 'new',
    notes: 'Novo na região.',
    email: 'roberto@email.com',
  },
  {
    id: 'c4',
    name: 'Julia Mendes',
    phone: '(11) 99999-1004',
    level: 3,
    lastVisit: '15/10/2023',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    status: 'active',
    notes: 'Gosta de desenhos artísticos na nuca.',
    email: 'julia@email.com',
  },
  {
    id: 'c5',
    name: 'Ricardo "Monster"',
    phone: '(11) 99999-1005',
    level: 7,
    lastVisit: 'Hoje',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    status: 'vip',
    notes: 'Vem toda semana sagrado.',
    email: 'ricardo@email.com',
  },
  {
    id: 'c6',
    name: 'Paulo Estevão',
    phone: '(11) 99999-1006',
    level: 2,
    lastVisit: 'Nunca',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    status: 'new',
    notes: 'Agendou pelo Instagram.',
    email: 'paulo@email.com',
  },
  {
    id: 'c7',
    name: 'Marcelo Pires',
    phone: '(11) 99999-1007',
    level: 4,
    lastVisit: '05/11/2023',
    img: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
    status: 'active',
    notes: 'Sempre pede a mesma coisa: máquina 2 na lateral.',
    email: 'marcelo@email.com',
  },
  {
    id: 'c8',
    name: 'Gustavo Lima',
    phone: '(11) 99999-1008',
    level: 1,
    lastVisit: 'Nunca',
    img: null,
    status: 'new',
    notes: 'Veio por indicação.',
    email: 'gustavo@email.com',
  },
  {
    id: 'c9',
    name: 'Felipe Neto (Fake)',
    phone: '(11) 99999-1009',
    level: 6,
    lastVisit: '10/12/2023',
    img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
    status: 'active',
    notes: 'Cabelo colorido, gosta de mudar.',
    email: 'felipe@email.com',
  },
  {
    id: 'c10',
    name: 'Bruno Mars (Cover)',
    phone: '(11) 99999-1010',
    level: 10,
    lastVisit: 'Ontem',
    img: 'https://images.unsplash.com/photo-1618077553780-75539862f629?q=80&w=200&auto=format&fit=crop',
    status: 'vip',
    notes: 'Dono do show.',
    email: 'bruno@email.com',
  },
];

const seed = () => {
  // 1. Clear tables to avoid duplicates for this test
  db.run('DELETE FROM services', [], err => {
    if (err) console.log('Error clearing services', err);
    else console.log('Services cleared');

    // 2. Insert Services
    const stmtService = db.prepare(
      'INSERT INTO services (id, name, price, priceValue, description, icon, image) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    SERVICES.forEach(s => {
      stmtService.run(s.id, s.name, s.price, s.priceValue, s.description, s.icon, s.image);
    });
    stmtService.finalize(() => console.log('✅ 10 Services Inserted'));
  });

  db.run('DELETE FROM clients', [], err => {
    if (err) console.log('Error clearing clients', err);
    else console.log('Clients cleared');

    // 3. Insert Clients
    const stmtClient = db.prepare(
      'INSERT INTO clients (id, name, phone, level, lastVisit, img, status, notes, password, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    CLIENTS.forEach(c => {
      stmtClient.run(
        c.id,
        c.name,
        c.phone,
        c.level,
        c.lastVisit,
        c.img,
        c.status,
        c.notes,
        '123',
        c.email
      );
    });
    stmtClient.finalize(() => {
      console.log('✅ 10 Clients Inserted');
      db.close();
    });
  });
};

seed();
