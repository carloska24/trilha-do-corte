import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const RESET_PASS = '123';
const SALT_ROUNDS = 10;

console.log('🔄 Iniciando RESET de senhas para "123"...');

const newHash = bcrypt.hashSync(RESET_PASS, SALT_ROUNDS);
console.log(`🔑 Novo Hash Gerado: ${newHash.substring(0, 15)}...`);

db.serialize(() => {
  // Update Clients
  db.run('UPDATE clients SET password = ?', [newHash], function (err) {
    if (err) console.error('Error updating clients:', err);
    else console.log(`✅ ${this.changes} Clientes resetados com sucesso.`);
  });

  // Update Barbers
  db.run('UPDATE barbers SET password = ?', [newHash], function (err) {
    if (err) console.error('Error updating barbers:', err);
    else console.log(`✅ ${this.changes} Barbeiros resetados com sucesso.`);
  });
});

setTimeout(() => {
  db.close();
  console.log('🏁 Reset Concluído.');
}, 2000);
