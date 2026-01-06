import db from './db.js';

(async () => {
  try {
    console.log('🔍 Diagnosticando Agendamentos Duplicados...');

    // Buscar todos os agendamentos (sem filtro de data para ver formatos estranhos)
    // Ordenar por data/hora
    const { rows } = await db.query(`
      SELECT id, clientName, date, time, status FROM appointments 
      ORDER BY date DESC, time ASC
    `);

    console.log(`📊 Total de agendamentos encontrados: ${rows.length}`);

    // Agrupar por data/hora para achar duplicatas
    const grouped = {};
    rows.forEach(r => {
      const key = `${r.date}|${r.time}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });

    Object.keys(grouped).forEach(key => {
      const group = grouped[key];
      if (group.length > 1) {
        console.log(`\n⚠️ DUPLICATA ENCONTRADA: ${key}`);
        group.forEach(g => {
          console.log(`   - ID: ${g.id} | Cliente: ${g.clientName} | Status: ${g.status}`);
        });
      }
    });

    console.log('\n--- Fim do Diagnóstico ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err);
    process.exit(1);
  }
})();
