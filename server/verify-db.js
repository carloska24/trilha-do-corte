import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;

console.log('--- DB VERIFICATION SCRIPT ---');
console.log('Target URL:', process.env.DATABASE_URL || 'UNDEFINED');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is missing!');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function run() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected successfully!');

    // Check Services
    const res = await client.query('SELECT id, name, price, priceValue FROM services');
    console.log(`📊 Found ${res.rowCount} services in the database:`);
    res.rows.forEach(r => {
      console.log(` - [${r.id}] ${r.name} (${r.price} / ${r.priceValue})`);
    });

    // Check Barbers
    const resBarbers = await client.query('SELECT count(*) as count FROM barbers');
    console.log(`💈 Barbers count: ${resBarbers.rows[0].count}`);

    client.release();
  } catch (err) {
    console.error('❌ Connection or Query Failed:', err);
  } finally {
    await pool.end();
  }
}

run();
