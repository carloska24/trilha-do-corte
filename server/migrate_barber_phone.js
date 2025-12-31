import db from './db.js';

async function migrate() {
  try {
    console.log('🔄 Migrating Barbers Table...');
    await db.query('ALTER TABLE barbers ADD COLUMN IF NOT EXISTS phone TEXT');
    console.log('✅ Phone column added to barbers.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Failed:', err);
    process.exit(1);
  }
}

migrate();
