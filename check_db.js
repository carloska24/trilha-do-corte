import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'server/database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.all('SELECT * FROM clients', (err, rows) => {
    if (err) {
      console.error('Error querying clients:', err);
    } else {
      console.log('Clients:', rows);
    }
  });

  db.all('SELECT * FROM barbers', (err, rows) => {
    if (err) {
      console.error('Error querying barbers:', err);
    } else {
      console.log('Barbers:', rows);
    }
  });
});

db.close();
