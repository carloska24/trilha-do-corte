import db from './db.js';

async function reset() {
  try {
    console.log('⚠️  STARTING FULL DATABASE RESET ⚠️');
    console.log('-----------------------------------');

    console.log('🗑️  Deleting ALL Appointments...');
    await db.query('DELETE FROM appointments');
    console.log('✅ Appointments cleared.');

    console.log('🗑️  Deleting ALL Clients...');
    await db.query('DELETE FROM clients');
    console.log('✅ Clients cleared.');

    console.log('🗑️  Deleting ALL Barbers...');
    await db.query('DELETE FROM barbers');
    console.log('✅ Barbers cleared.');

    console.log('-----------------------------------');
    console.log('✨ SYSTEM CLEAN & READY FOR FRESH START ✨');
    console.log('   - Next Client ID will be: 0');
    console.log('   - All previous test data is gone.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Reset Failed:', err);
    process.exit(1);
  }
}

reset();
