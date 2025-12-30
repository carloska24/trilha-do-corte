import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Data extracted from src/constants.ts
const FULL_SERVICES = [
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

async function seed() {
  try {
    const client = await pool.connect();

    console.log('--- SEEDING PRODUCTION DATABASE ---');
    console.log('Target:', process.env.DATABASE_URL.split('@')[1]);

    // Optional: clear existing services to avoid duplicates if ID matches
    // But let's create ON CONFLICT DO UPDATE to be safe

    for (const s of FULL_SERVICES) {
      const sql = `
                INSERT INTO services (id, name, price, priceValue, description, icon, image, category, duration)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    price = EXCLUDED.price,
                    priceValue = EXCLUDED.priceValue,
                    description = EXCLUDED.description,
                    icon = EXCLUDED.icon,
                    image = EXCLUDED.image,
                    category = EXCLUDED.category,
                    duration = EXCLUDED.duration;
            `;
      await client.query(sql, [
        s.id,
        s.name,
        s.price,
        s.priceValue,
        s.description,
        s.icon,
        s.image,
        s.category,
        s.duration,
      ]);
      console.log(`✅ Upserted: ${s.name}`);
    }

    console.log('🎉 Seeding Complete!');
    client.release();
  } catch (err) {
    console.error('❌ Seed Failed:', err);
  } finally {
    await pool.end();
  }
}

seed();
