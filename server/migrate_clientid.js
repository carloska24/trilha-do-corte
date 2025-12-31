import db from './db.js';

async function migrate() {
  try {
    console.log('🔄 Starting Migration: Adding clientId to appointments...');

    // Check if column exists
    const check = await db.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='appointments' AND column_name='clientid'"
    );

    if (check.rows.length === 0) {
      console.log('➕ Column missing. Adding it now...');
      await db.query('ALTER TABLE appointments ADD COLUMN clientId TEXT');
      console.log('✅ Column added successfully.');
    } else {
      console.log('ℹ️ Column already exists.');
    }

    console.log('🧹 Cleaning up orphan appointments (optional step for cleanliness)...');
    await db.query('DELETE FROM appointments WHERE clientId IS NULL');

    console.log('✅ Migration Complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Failed:', err);
    process.exit(1);
  }
}

migrate();
