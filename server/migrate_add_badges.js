import db from './db.js';

console.log("Running Migration: Add 'badges' column to 'services' table...");

db.run('ALTER TABLE services ADD COLUMN badges TEXT', err => {
  if (err) {
    if (err.message.includes('duplicate column name')) {
      console.log("⚠️ Column 'badges' already exists. Skipping.");
    } else {
      console.error('❌ Migration Failed:', err.message);
      process.exit(1);
    }
  } else {
    console.log("✅ Migration Success: Added 'badges' column.");
  }

  // Verify
  db.all('PRAGMA table_info(services)', (err, rows) => {
    if (err) console.error('Check failed:', err);
    else {
      const hasBadges = rows.some(col => col.name === 'badges');
      console.log("Verification: 'badges' column present?", hasBadges);
    }
  });
});
