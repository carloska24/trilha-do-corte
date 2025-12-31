import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

console.log(
  '🔌 Connecting to Postgres DB:',
  process.env.DATABASE_URL?.split('@')[1] || 'Unknown Host'
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase in many environments
  },
});

// Helper for single query
export const query = (text, params) => pool.query(text, params);

// Constants for Seeding
const DEFAULT_PASS_HASH = bcrypt.hashSync('123', 10);

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

const BARBERS = [
  {
    id: 'b1',
    name: 'Mestre Vapor',
    specialty: 'Fades & Freestyle',
    image:
      'https://images.unsplash.com/photo-1581803118522-7b72a50f7e9f?q=80&w=400&auto=format&fit=crop',
    email: 'mestre@trilha.com',
    password: DEFAULT_PASS_HASH,
  },
  {
    id: 'b2',
    name: 'Zero Grau',
    specialty: 'Barba Terapia',
    image:
      'https://images.unsplash.com/photo-1618077553780-75539862f629?q=80&w=400&auto=format&fit=crop',
    email: 'zero@trilha.com',
    password: DEFAULT_PASS_HASH,
  },
];

const CLIENTS = [
  {
    id: '1',
    name: 'Lucas Grafite',
    phone: '(11) 99888-7766',
    level: 4,
    lastVisit: '28/09/2023',
    img: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop',
    status: 'active',
    notes: 'Gosta de degradê navalhado. Torce pro Corinthians.',
    password: DEFAULT_PASS_HASH,
    email: 'lucas@email.com',
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
    password: DEFAULT_PASS_HASH,
    email: 'pedro@email.com',
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
    password: DEFAULT_PASS_HASH,
    email: 'marcos@email.com',
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
    password: DEFAULT_PASS_HASH,
    email: 'joao@email.com',
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
    password: DEFAULT_PASS_HASH,
    email: 'ana@email.com',
  },
];

const APPOINTMENTS = [];

// Init DB
(async () => {
  try {
    const client = await pool.connect();
    try {
      // Services
      await client.query(`
                CREATE TABLE IF NOT EXISTS services (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    price TEXT,
                    priceValue REAL,
                    description TEXT,
                    icon TEXT,
                    image TEXT,
                    category TEXT,
                    activePromo TEXT,
                    duration INTEGER,
                    badges TEXT
                )
            `);

      // Barbers
      await client.query(`
                CREATE TABLE IF NOT EXISTS barbers (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    specialty TEXT,
                    image TEXT,
                    email TEXT,
                    password TEXT
                )
            `);

      // Clients
      await client.query(`
                CREATE TABLE IF NOT EXISTS clients (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    phone TEXT,
                    level INTEGER,
                    lastVisit TEXT,
                    img TEXT,
                    status TEXT,
                    notes TEXT,
                    password TEXT,
                    email TEXT
                )
            `);

      // Appointments
      await client.query(`
                CREATE TABLE IF NOT EXISTS appointments (
                    id TEXT PRIMARY KEY,
                    clientName TEXT,
                    serviceId TEXT,
                    date TEXT,
                    time TEXT,
                    status TEXT,
                    price REAL,
                    photoUrl TEXT,
                    notes TEXT
                )
            `);

      // Seeding
      const servicesCheck = await client.query('SELECT count(*) as count FROM services');
      if (parseInt(servicesCheck.rows[0].count) === 0) {
        console.log('Seeding Services...');
        for (const s of SERVICES) {
          await client.query(
            'INSERT INTO services VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
            [
              s.id,
              s.name,
              s.price,
              s.priceValue,
              s.description,
              s.icon,
              s.image,
              s.category,
              s.activePromo ? JSON.stringify(s.activePromo) : null,
              s.duration,
              null,
            ]
          );
        }
      }

      const barbersCheck = await client.query('SELECT count(*) as count FROM barbers');
      if (parseInt(barbersCheck.rows[0].count) === 0) {
        console.log('Seeding Barbers...');
        for (const b of BARBERS) {
          await client.query('INSERT INTO barbers VALUES ($1, $2, $3, $4, $5, $6)', [
            b.id,
            b.name,
            b.specialty,
            b.image,
            b.email,
            b.password,
          ]);
        }
      }

      const clientsCheck = await client.query('SELECT count(*) as count FROM clients');
      if (parseInt(clientsCheck.rows[0].count) === 0) {
        console.log('Seeding Clients...');
        for (const c of CLIENTS) {
          await client.query(
            'INSERT INTO clients VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [
              c.id,
              c.name,
              c.phone,
              c.level,
              c.lastVisit,
              c.img,
              c.status,
              c.notes,
              c.password,
              c.email,
            ]
          );
        }
      }

      console.log('✅ Database Initialized (Postgres/Supabase)');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Failed to initialize DB:', err);
  }
})();

export default { query, pool };
