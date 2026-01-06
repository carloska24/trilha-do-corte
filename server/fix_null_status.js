import db from './db.js';

(async () => {
  try {
    console.log('🛠️ Corrigindo Status NULL no Banco de Dados...');

    const { rowCount } = await db.query(`
      UPDATE appointments 
      SET status = 'pending' 
      WHERE status IS NULL
    `);

    console.log(`✅ ${rowCount} agendamentos atualizados de NULL para 'pending'.`);
    console.log('🔒 Agora o índice único deve funcionar corretamente.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err);
    process.exit(1);
  }
})();
