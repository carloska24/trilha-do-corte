import db from './db.js';

async function migrateConstraints() {
  console.log('🛡️ (Agent Gamma) Iniciando Blindagem de Banco...');

  try {
    // 1. Race Condition Shield: Partial Unique Index
    console.log('🔒 Criando Constraint ANTI-DOUBLE-BOOKING...');
    // Allows multiple cancelled, but only ONE active (pending/confirmed/completed) per slot
    await db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_slot 
      ON appointments(date, time) 
      WHERE status != 'cancelled';
    `);
    console.log('✅ Índice Único idx_unique_active_slot criado (Race Conditions ELIMINADAS).');

    // 2. Data Integrity: Foreign Key
    console.log('🔗 Criando Foreign Key para ClientID...');
    // Note: This relies on 'clientid' column actually storing IDs that exist in 'clients' table.
    // If messy data exists, this will fail. We wrap in try/catch to report but not crash script.
    try {
      await db.query(`
          ALTER TABLE appointments 
          ADD CONSTRAINT fk_client 
          FOREIGN KEY (clientid) 
          REFERENCES clients(id)
          ON DELETE SET NULL; -- If client is deleted, keep history but detach
        `);
      console.log('✅ Foreign Key fk_client criada com sucesso.');
    } catch (fkError) {
      console.warn('⚠️ AVISO: Não foi possível criar Foreign Key. Pode haver IDs orfãos no banco.');
      console.warn('Detalhe:', fkError.message);
    }

    console.log('🏁 Blindagem Concluída!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro Crítico na Migração:', err);
    process.exit(1);
  }
}

migrateConstraints();
