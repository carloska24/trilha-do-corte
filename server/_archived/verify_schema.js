import db from './db.js';

(async () => {
  try {
    console.log('🔍 Checking Appointments Table Schema...');
    const res = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'appointments'
    `);

    console.table(res.rows);

    console.log('🔍 Checking Current Appointments count...');
    const count = await db.query('SELECT count(*) FROM appointments');
    console.log('Count:', count.rows[0]);

    console.log('🔍 Checking IDs...');
    const ids = await db.query('SELECT id, status FROM appointments');
    console.table(ids.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
