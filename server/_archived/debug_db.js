import db from './db.js';

async function check() {
  try {
    console.log('Listing ALL active appointments...');
    const { rows } = await db.query('SELECT * FROM appointments ORDER BY date ASC, time ASC');
    console.log('Found:', rows.length);

    if (rows.length > 0) {
      console.log('--- DETAILS ---');
      console.table(
        rows.map(r => ({
          date: r.date,
          time: r.time,
          client: r.clientname,
          id: r.id,
          clientId: r.clientid,
        }))
      );
      console.log('--- FIXING: Assigning ALL appointments to Client ID 0 ---');
      await db.query("UPDATE appointments SET clientId = '0'");
      console.log('FIX SUCCESSFUL');
      console.log('--- CLEANING: Deleting duplicate client ID 1 ---');
      await db.query("DELETE FROM clients WHERE id = '1'");
      console.log('CLEANUP SUCCESSFUL');
      console.log('--- END ---');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
