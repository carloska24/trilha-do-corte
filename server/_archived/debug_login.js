import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const TEST_PASS = '123';

console.log('🕵️‍♀️ Investigando PROFUNDO...');

db.all('SELECT * FROM barbers', (err, rows) => {
  if (err) console.error(err);
  rows.forEach(async b => {
    const match = await bcrypt.compare(TEST_PASS, b.password).catch(e => `Error: ${e.message}`);
    console.log(`Barber [${b.email}]`);
    console.log(`  Pass DB: "${b.password.substring(0, 10)}..." (Len: ${b.password.length})`);
    console.log(`  Match '123'? ${match}`);
  });
});

db.all('SELECT * FROM clients', (err, rows) => {
  if (err) console.error(err);
  rows.slice(0, 3).forEach(async c => {
    const match = await bcrypt.compare(TEST_PASS, c.password).catch(e => `Error: ${e.message}`);
    console.log(`Client [${c.name}]`);
    console.log(`  Pass DB: "${c.password.substring(0, 10)}..." (Len: ${c.password.length})`);
    console.log(`  Match '123'? ${match}`);
  });
});
