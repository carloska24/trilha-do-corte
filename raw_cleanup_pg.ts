import pg from 'pg';
const { Client } = pg;

// Manually parse DATABASE_URL or hardcode for this script
// URL format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
// Assuming typical local setup or reading from process.env if available (but this script runs standalone)
// I will try to read env, or assume local default if env missing (but env usually loaded by next/vite)
// Let's rely on dotenv flow or just parse the .env file in the script.

import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('🧹 Cleaning with Native PG Driver...');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in env.');
    return;
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // DELETE query
    const res = await client.query(`
      DELETE FROM "appointments"
      WHERE 
        ("clientname" NOT ILIKE '%Carlos%' OR "clientname" IS NULL)
        AND ("clientname" NOT ILIKE '%Barbeiro%')
    `);

    console.log(`🗑️ Deleted ${res.rowCount} appointments using PG.`);
  } catch (err) {
    console.error('PG Error:', err);
  } finally {
    await client.end();
  }
}

main();
