import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const SERVICES = [
  {
    id: 's1',
    name: 'Corte Social',
    price: 'R$ 35,00',
    priceValue: 35,
    description: 'Corte clássico na tesoura ou máquina.',
    icon: 'scissors',
    image:
      'https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 's2',
    name: 'Corte Degradê',
    price: 'R$ 40,00',
    priceValue: 40,
    description: 'Fade perfeito com acabamento navalhado.',
    icon: 'clipper',
    image:
      'https://images.unsplash.com/photo-1593444002685-6449175d27b1?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 's3',
    name: 'Barba Tradicional',
    price: 'R$ 30,00',
    priceValue: 30,
    description: 'Toalha quente e massagem facial.',
    icon: 'razor',
    image:
      'https://images.unsplash.com/photo-1503951914875-befbb7470d03?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 's4',
    name: 'Barba Desenhada',
    price: 'R$ 35,00',
    priceValue: 35,
    description: 'Alinhamento preciso e pigmentação.',
    icon: 'razor',
    image:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 's5',
    name: 'Sobrancelha',
    price: 'R$ 15,00',
    priceValue: 15,
    description: 'Limpeza e alinhamento na navalha.',
    icon: 'razor',
    image:
      'https://images.unsplash.com/photo-1599351431202-6e0005079746?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 's6',
    name: 'Pezinho e Acabamento',
    price: 'R$ 15,00',
    priceValue: 15,
    description: 'Manutenção dos contornos.',
    icon: 'scissors',
    image:
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 's7',
    name: 'Corte + Barba (Combo)',
    price: 'R$ 60,00',
    priceValue: 60,
    description: 'O pacote completo do homem moderno.',
    icon: 'combo',
    image:
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 's8',
    name: 'Platinado Nevou',
    price: 'R$ 120,00',
    priceValue: 120,
    description: 'Descoloração global e matização.',
    icon: 'color',
    image:
      'https://images.unsplash.com/photo-1618077553780-75539862f629?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 's9',
    name: 'Luzes / Reflexo',
    price: 'R$ 80,00',
    priceValue: 80,
    description: 'Mechas na touca para iluminar.',
    icon: 'color',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 's10',
    name: 'Hidratação Profunda',
    price: 'R$ 40,00',
    priceValue: 40,
    description: 'Recuperação dos fios pós-química.',
    icon: 'combo',
    image:
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400&auto=format&fit=crop',
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
