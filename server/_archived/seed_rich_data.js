import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath);

console.log('💎 Semeando Histórico Rico de Clientes...');

const CLIENTS = [
  { name: 'Carlos Silva', id: 'c1' },
  { name: 'Bruno Souza', id: 'c2' },
  { name: 'André Lima', id: 'c3' },
  { name: 'Felipe Santos', id: 'c4' },
  { name: 'Ricardo Oliveira', id: 'c5' },
];

const PAST_Services = [
  { name: 'Corte Degrade', price: 35, category: 'Cabelo' },
  { name: 'Barba Terapia', price: 30, category: 'Barba' },
  { name: 'Combo Completo', price: 60, category: 'Combo' },
  { name: 'Pezinho + Sobrancelha', price: 20, category: 'Estética' },
];

function getRandomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Get dates in the past
const getPastDate = daysAgo => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

db.serialize(() => {
  // We only want to INSERT past history, keep future appointments
  const stmt = db.prepare(
    'INSERT INTO appointments (id, clientName, serviceId, date, time, status, price, photoUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  CLIENTS.forEach(client => {
    // Generate 3-5 past appointments for each
    const historyCount = Math.floor(Math.random() * 3) + 3;

    for (let i = 1; i <= historyCount; i++) {
      const daysAgo = i * 14 + Math.floor(Math.random() * 5); // roughly every 2 weeks
      const service = PAST_Services[Math.floor(Math.random() * PAST_Services.length)];
      const date = getPastDate(daysAgo);
      const time = `${10 + Math.floor(Math.random() * 8)}:00`;

      const id = `hist_${client.id}_${i}`;

      console.log(`   🔙 Histórico: ${client.name} - ${service.name} em ${date}`);

      // Note: serviceId 'custom' implies we might not link to current services table 1:1 for history,
      // but for visual consistency let's try to link if possible or just rely on name/price logic in frontend if ID fails.
      // For this specific UI, we rely on 'clientName' matching.

      stmt.run(id, client.name, 'custom_hist', date, time, 'completed', service.price, null);
    }
  });

  stmt.finalize(() => {
    console.log('✅ Histórico Rico Gerado!');
  });
});
