import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'database.sqlite');
console.log('🔌 Conectando ao Banco de Dados para Restauração BÁSICA:', dbPath);
const db = new sqlite3.Database(dbPath);

// The "Golden List" based on user feedback (No "Degradê", just "Corte")
// Mapped to Local Images for consistency
const SERVICES = [
  {
    id: '1',
    name: 'Corte',
    price: 'R$ 35,00',
    priceValue: 35,
    description: 'Corte completo (45min).',
    icon: 'scissors',
    image: '/services/Corte.png',
    category: 'Cabelo',
  },
  {
    id: '2',
    name: 'Barba',
    price: 'R$ 30,00',
    priceValue: 30,
    description: 'Modelagem e acabamento (30min).',
    icon: 'razor',
    image: '/services/Barba.png',
    category: 'Barba',
  },
  {
    id: '3',
    name: 'Sobrancelha',
    price: 'R$ 15,00',
    priceValue: 15,
    description: 'Design de sobrancelha (10min).',
    icon: 'razor',
    image: '/services/sobrancelha.png',
    category: 'Estética',
  },
  {
    id: '4',
    name: 'Pezinho',
    price: 'R$ 15,00',
    priceValue: 15,
    description: 'Acabamento e contornos (15min).',
    icon: 'scissors',
    image: '/services/pezinho.png',
    category: 'Cabelo',
  },
  {
    id: '5',
    name: 'Hidratação',
    price: 'R$ 40,00',
    priceValue: 40,
    description: 'Tratamento capilar profundo.',
    icon: 'combo',
    image: '/services/hidratacao.png',
    category: 'Química',
  },
];

const restore = () => {
  db.serialize(() => {
    // Ensure column exists just in case
    db.run('ALTER TABLE services ADD COLUMN category TEXT', () => {});

    db.run('DELETE FROM services', [], err => {
      if (err) console.log('❌ Erro ao limpar serviços', err);

      const stmt = db.prepare(
        'INSERT INTO services (id, name, price, priceValue, description, icon, image, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );
      SERVICES.forEach(s => {
        stmt.run(s.id, s.name, s.price, s.priceValue, s.description, s.icon, s.image, s.category);
      });
      stmt.finalize(() => {
        console.log(`✅ ${SERVICES.length} Serviços BÁSICOS Restaurados com Categorias!`);
        db.close();
      });
    });
  });
};

restore();
