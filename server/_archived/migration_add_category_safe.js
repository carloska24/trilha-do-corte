import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath);

console.log('🔌 Running Migration: Add Category Column...');

db.serialize(() => {
  db.run('ALTER TABLE services ADD COLUMN category TEXT', err => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('⚠️ Column "category" already exists. Skipping.');
      } else {
        console.error('❌ Error adding column:', err.message);
      }
    } else {
      console.log('✅ Column "category" added successfully.');
    }
  });

  // Also add activePromo if missing, just in case
  db.run('ALTER TABLE services ADD COLUMN activePromo TEXT', err => {
    if (!err) console.log('✅ Column "activePromo" added successfully.');
  });
});

db.close(() => {
  console.log('🔒 Database connection closed.');
});
