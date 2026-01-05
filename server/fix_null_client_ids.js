import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';
dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.jgbhbbxclwibtyxwajnf:Trilhadocorte@aws-1-sa-east-1.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString,
});

async function runMigration() {
  try {
    await client.connect();
    console.log('🔌 Connected to DB');

    // 1. Get all appointments with NULL clientId
    const { rows: orphans } = await client.query(
      "SELECT * FROM appointments WHERE clientid IS NULL OR clientid = ''"
    );
    console.log(`🔍 Found ${orphans.length} orphaned appointments.`);

    for (const app of orphans) {
      if (!app.clientName) continue;

      // 2. Find matching client by name
      const { rows: clients } = await client.query('SELECT id FROM clients WHERE name ILIKE $1', [
        app.clientName,
      ]);

      if (clients.length > 0) {
        const matchingClient = clients[0];
        console.log(
          `✅ Mapping App ${app.id} (Name: ${app.clientName}) -> Client ID: ${matchingClient.id}`
        );

        // 3. Update appointment
        await client.query('UPDATE appointments SET clientid = $1 WHERE id = $2', [
          matchingClient.id,
          app.id,
        ]);
      } else {
        console.log(`⚠️ No client found for name: ${app.clientName}`);
      }
    }

    console.log('🎉 Migration Complete');
  } catch (err) {
    console.error('❌ Migration Failed:', err);
  } finally {
    await client.end();
  }
}

runMigration();
