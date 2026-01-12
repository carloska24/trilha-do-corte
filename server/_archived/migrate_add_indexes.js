import db from './db.js';

async function verifyAndCreateIndexes() {
  console.log('🚀 (Agent Gamma) Iniciando Otimização de Índices...');

  try {
    // 1. Índice para Data (Buscas de Agenda)
    console.log('🔍 Verificando/Criando índice para "date"...');
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_appointments_date 
      ON appointments(date);
    `);
    console.log('✅ Índice idx_appointments_date garantido.');

    // 2. Índice para ClientId (Histórico do Cliente)
    console.log('🔍 Verificando/Criando índice para "clientid"...');
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_appointments_client 
      ON appointments(clientid);
    `);
    console.log('✅ Índice idx_appointments_client garantido.');

    // 3. Índice para Status (Opcional, mas útil para filtros)
    console.log('🔍 Verificando/Criando índice para "status"...');
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_appointments_status 
      ON appointments(status);
    `);
    console.log('✅ Índice idx_appointments_status garantido.');

    console.log('🏁 Otimização de Banco de Dados Concluída com Sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Falha na Otimização:', err);
    process.exit(1);
  }
}

verifyAndCreateIndexes();
