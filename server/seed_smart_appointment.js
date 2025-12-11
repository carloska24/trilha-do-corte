import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath);

console.log('🗓️  Ajustando Agenda Inteligente & Serviços...');

const CLIENT_NAMES = [
  'Carlos Silva',
  'Bruno Souza',
  'André Lima',
  'Felipe Santos',
  'Ricardo Oliveira',
];

// Helper to get local date string YYYY-MM-DD
const getLocalDateStr = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d
    .toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .split('/')
    .reverse()
    .join('-');
};

db.serialize(() => {
  // 1. UPDATE 'Pezinho' to 10 minutes (Fixing user observation)
  db.run(
    "UPDATE services SET duration = 10 WHERE name LIKE '%Pezinho%' AND name NOT LIKE '%+%'",
    err => {
      if (!err) console.log('✅ Serviço "Pezinho" atualizado para 10 min.');
    }
  );

  // 2. Clear Appointments
  db.run('DELETE FROM appointments', err => {
    if (!err) console.log('❌ Agenda limpa.');
  });

  // 3. SEED Appointments for TODAY and TOMORROW
  // Fetch specific services to demonstrate the logic better
  // We want: Corte (55), Barba (30), Pezinho (10)
  db.all(
    'SELECT * FROM services WHERE name IN ("Corte", "Barba", "Pezinho", "Sobrancelha", "Hidratação") ORDER BY duration DESC',
    (err, services) => {
      if (err || !services || services.length === 0) return;

      const datesToSeed = [getLocalDateStr(0), getLocalDateStr(1)]; // Today and Tomorrow

      const stmt = db.prepare(
        'INSERT INTO appointments (id, clientName, serviceId, date, time, status, price, photoUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );

      datesToSeed.forEach((dateStr, dateIdx) => {
        let currentStartTime = '09:00'; // Start at 9 AM
        let idCounter = 100 + dateIdx * 10;

        console.log(`\n📅 Gerando para: ${dateStr}`);

        // Generate 5 slots
        for (let i = 0; i < 5; i++) {
          // Pick service cyclically
          const service = services[i % services.length];
          const clientName = CLIENT_NAMES[i % CLIENT_NAMES.length];

          const duration = service.duration;
          const buffer = 5; // Smart Buffer

          // Calculate End
          const [hours, minutes] = currentStartTime.split(':').map(Number);
          const startTotalMins = hours * 60 + minutes;
          const endTotalMins = startTotalMins + duration;
          const nextStartMins = endTotalMins + buffer;

          // Format Times
          const formatTime = totalMins => {
            const h = Math.floor(totalMins / 60);
            const m = totalMins % 60;
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          };

          const nextStartTime = formatTime(nextStartMins);
          const endTime = formatTime(endTotalMins);

          console.log(
            `   ➕ ${currentStartTime} às ${endTime} | ${clientName} (${service.name} - ${duration}min) | Limpeza: 5min > Próximo: ${nextStartTime}`
          );

          const id = `smart_${idCounter++}`;
          stmt.run(
            id,
            clientName,
            service.id,
            dateStr,
            currentStartTime,
            'confirmed',
            service.priceValue,
            null
          );

          currentStartTime = nextStartTime;
        }
      });

      stmt.finalize(() => {
        console.log('\n✅ Agenda Inteligente Gerada com Sucesso!');
      });
    }
  );
});
