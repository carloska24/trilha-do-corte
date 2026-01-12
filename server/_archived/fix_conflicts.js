import db from './db.js';

(async () => {
  try {
    console.log('🧹 Limpando Duplicatas e Corrigindo Status...');

    // 1. Buscar todos com status NULL
    const { rows } = await db.query('SELECT id, date, time FROM appointments WHERE status IS NULL');

    console.log(`Encontrados ${rows.length} agendamentos com status NULL.`);

    for (const app of rows) {
      try {
        // Tentar atualizar para 'pending'
        await db.query("UPDATE appointments SET status = 'pending' WHERE id = $1", [app.id]);
        console.log(`✅ ID ${app.id} corrigido para 'pending'.`);
      } catch (err) {
        // Se der erro de unicidade (23505), deletamos
        if (err.code === '23505') {
          console.log(
            `⚠️ Conflito detectado no ID ${app.id} (${app.date} ${app.time}). Deletando duplicata...`
          );
          await db.query('DELETE FROM appointments WHERE id = $1', [app.id]);
        } else {
          console.error(`❌ Erro inesperado no ID ${app.id}:`, err.message);
        }
      }
    }

    console.log('🏁 Limpeza concluída.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro Fatal:', err);
    process.exit(1);
  }
})();
