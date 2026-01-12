import db from './db.js';

(async () => {
  try {
    console.log('🔍 Checking Constraints on appointments...');
    const res = await db.query(`
      SELECT conname, pg_get_constraintdef(c.oid)
      FROM pg_constraint c 
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE conrelid = 'appointments'::regclass::oid;
    `);
    console.table(res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
