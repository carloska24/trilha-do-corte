import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const MOCK_CLIENTS = [
  {
    name: 'Eduardo "Fumaça"',
    phone: '(11) 98888-1111',
    level: 3,
    lastVisit: '01/12/2023',
    img: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
    status: 'active',
    notes: 'Gosta de degradê bem baixo.',
    email: 'edu@email.com',
  },
  {
    name: 'Jorge da Hornet',
    phone: '(11) 97777-2222',
    level: 5,
    lastVisit: '20/11/2023',
    img: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=200&auto=format&fit=crop',
    status: 'vip',
    notes: 'Sempre faz barba e cabelo. Motoboy.',
    email: 'jorge@email.com',
  },
  {
    name: 'Arthur TI',
    phone: '(11) 96666-3333',
    level: 2,
    lastVisit: 'Ontem',
    img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
    status: 'active',
    notes: 'Trabalho remoto, vem em horários alternativos.',
    email: 'arthur@email.com',
  },
  {
    name: 'MC Kevinho Cover',
    phone: '(11) 95555-4444',
    level: 1,
    lastVisit: 'Nunca',
    img: 'https://images.unsplash.com/photo-1618077553780-75539862f629?q=80&w=200&auto=format&fit=crop',
    status: 'new',
    notes: 'Quer platinar na próxima.',
    email: 'kevinho@email.com',
  },
  {
    name: 'Sr. Antônio',
    phone: '(11) 94444-5555',
    level: 10,
    lastVisit: '05/12/2023',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    status: 'vip',
    notes: 'Cliente desde a inauguração. Cafezinho obrigatório.',
    email: 'antonio@email.com',
  },
  {
    name: 'Felipe Skate',
    phone: '(11) 93333-6666',
    level: 2,
    lastVisit: '15/10/2023',
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
    status: 'inactive',
    notes: 'Sumido. Mandar promoção.',
    email: 'felipe@email.com',
  },
  {
    name: 'Rafaela Style',
    phone: '(11) 92222-7777',
    level: 4,
    lastVisit: '25/11/2023',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    status: 'active',
    notes: 'Undercut com desenho.',
    email: 'rafa@email.com',
  },
  {
    name: 'Vitor Gym',
    phone: '(11) 91111-8888',
    level: 6,
    lastVisit: 'Hoje',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    status: 'active',
    notes: 'Vem direto da academia.',
    email: 'vitor@email.com',
  },
  {
    name: 'Lucas Gamer',
    phone: '(11) 99999-0000',
    level: 1,
    lastVisit: 'Nunca',
    img: null,
    status: 'new',
    notes: 'Vi a propaganda no Insta.',
    email: 'lucasgame@email.com',
  },
  {
    name: 'Matheus Barba',
    phone: '(11) 90000-9999',
    level: 7,
    lastVisit: '02/12/2023',
    img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&auto=format&fit=crop',
    status: 'active',
    notes: 'Só faz barba. Toalha quente.',
    email: 'matheus@email.com',
  },
];

const insertClients = () => {
  const stmt = db.prepare(
    'INSERT INTO clients (id, name, phone, level, lastVisit, img, status, notes, password, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  MOCK_CLIENTS.forEach((c, index) => {
    const id = `mock_${Date.now()}_${index}`;
    stmt.run(
      id,
      c.name,
      c.phone,
      c.level,
      c.lastVisit,
      c.img,
      c.status,
      c.notes,
      '123',
      c.email,
      err => {
        if (err) {
          console.error(`Error inserting ${c.name}:`, err.message);
        } else {
          console.log(`Inserted: ${c.name}`);
        }
      }
    );
  });

  stmt.finalize(() => {
    console.log('Finished inserting mock clients.');
    db.close();
  });
};

insertClients();
