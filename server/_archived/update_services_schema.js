import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath);

const REAL_SERVICES = [
  {
    name: 'Corte',
    price: 35,
    duration: 55,
    category: 'Cabelo',
    image:
      'https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Barba',
    price: 25,
    duration: 30,
    category: 'Barba',
    image:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Sobrancelha',
    price: 10,
    duration: 10,
    category: 'Estética',
    image:
      'https://images.unsplash.com/photo-1599351431202-6e0005079746?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Pezinho',
    price: 10,
    duration: 15,
    category: 'Cabelo',
    image:
      'https://images.unsplash.com/photo-1593702295094-aea8c5c13dcf?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Hidratação',
    price: 20,
    duration: 25,
    category: 'Estética',
    image:
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Pezinho + Sobrancelha',
    price: 20,
    duration: 20,
    category: 'Combo',
    image:
      'https://images.unsplash.com/photo-1503951914875-befbb7470d03?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Pezinho + Barba+ sobrancelha',
    price: 35,
    duration: 35,
    category: 'Combo',
    image:
      'https://images.unsplash.com/photo-1635273050471-1e4929a367c4?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Corte + Sobrancelha',
    price: 45,
    duration: 55,
    category: 'Combo',
    image:
      'https://images.unsplash.com/photo-1517832606299-7ae9b720a47e?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Corte + Barba',
    price: 55,
    duration: 55,
    category: 'Combo',
    image:
      'https://images.unsplash.com/photo-1512413316925-fd4b93f31521?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Corte + Barba + Sobrancelha',
    price: 60,
    duration: 55,
    category: 'Combo',
    image:
      'https://images.unsplash.com/photo-1534351296726-2a2ec9697f64?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Corte + Pigmentação',
    price: 50,
    duration: 55,
    category: 'Combo',
    image:
      'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Luzes a partir',
    price: 50,
    duration: 60,
    category: 'Química',
    image:
      'https://images.unsplash.com/photo-1620331311520-246422fd82f9?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Platinado a partir',
    price: 80,
    duration: 60,
    category: 'Química',
    image:
      'https://images.unsplash.com/photo-1617372591400-9226cb8ee338?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Progressiva, Selagem ou Botox a partir',
    price: 60,
    duration: 60,
    category: 'Química',
    image:
      'https://images.unsplash.com/photo-1560066984-121868942fd5?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Alisamento',
    price: 25,
    duration: 10,
    category: 'Química',
    image:
      'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Limpeza de pele',
    price: 20,
    duration: 25,
    category: 'Estética',
    image:
      'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Depilação Nariz + Orelha',
    price: 20,
    duration: 10,
    category: 'Estética',
    image:
      'https://images.unsplash.com/photo-1599351431202-6e0005079746?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Depilação Nariz',
    price: 10,
    duration: 10,
    category: 'Estética',
    image:
      'https://images.unsplash.com/photo-1599351431202-6e0005079746?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Depilação Orelha',
    price: 10,
    duration: 10,
    category: 'Estética',
    image:
      'https://images.unsplash.com/photo-1599351431202-6e0005079746?q=80&w=400&auto=format&fit=crop',
  },
  {
    name: 'Pigmentação',
    price: 25,
    duration: 30,
    category: 'Barba',
    image:
      'https://images.unsplash.com/photo-1552697525-2487920ab718?q=80&w=400&auto=format&fit=crop',
  },
];

console.log('🔄 Iniciando atualização da Tabela de Serviços...');

db.serialize(() => {
  // 1. Drop existing table
  db.run('DROP TABLE IF EXISTS services', err => {
    if (err) console.error('Erro ao dropar tabela:', err);
    else console.log('✅ Tabela antiga removida.');
  });

  // 2. Create new table with updated schema
  db.run(
    `
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT,
      price TEXT,
      priceValue REAL,
      duration INTEGER,
      description TEXT,
      icon TEXT,
      image TEXT,
      category TEXT,
      activePromo TEXT
    )
  `,
    err => {
      if (err) console.error('Erro ao criar tabela:', err);
      else console.log('✅ Nova tabela criada com colunas duration e category.');
    }
  );

  // 3. Insert Data
  const stmt = db.prepare(
    'INSERT INTO services (id, name, price, priceValue, duration, description, icon, image, category, activePromo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  REAL_SERVICES.forEach((s, index) => {
    const id = (100 + index).toString();
    const priceFormatted = `R$ ${s.price.toFixed(2).replace('.', ',')}`;
    const description = `${s.name} profissional (${s.duration}min).`; // Placeholder description, AI will improve later
    const icon = 'scissors';

    stmt.run(
      id,
      s.name,
      priceFormatted,
      s.price,
      s.duration,
      description,
      icon,
      s.image,
      s.category,
      null
    );
  });

  stmt.finalize(() => {
    console.log(`✅ ${REAL_SERVICES.length} serviços inseridos com sucesso!`);
    db.close();
  });
});
