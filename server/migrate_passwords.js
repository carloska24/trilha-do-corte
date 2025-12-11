import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const hashPassword = password => {
  // Check common bcrypt prefixes
  if (
    password &&
    (password.startsWith('$2a$') || password.startsWith('$2b$')) &&
    password.length >= 60
  ) {
    return password;
  }
  return bcrypt.hashSync(password, 10);
};

const runQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const runUpdate = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const migrate = async () => {
  console.log('🔒 Iniciando Migração Robusta...');

  try {
    // 1. Clients
    const clients = await runQuery('SELECT id, password FROM clients');
    console.log(`Encontrados ${clients.length} clientes.`);

    for (const client of clients) {
      const newPass = hashPassword(client.password);
      if (newPass !== client.password) {
        await runUpdate('UPDATE clients SET password = ? WHERE id = ?', [newPass, client.id]);
        console.log(`Updated Client ${client.id}`);
      }
    }

    // 2. Barbers
    const barbers = await runQuery('SELECT id, password FROM barbers');
    console.log(`Encontrados ${barbers.length} barbeiros.`);

    for (const barber of barbers) {
      const newPass = hashPassword(barber.password);
      if (newPass !== barber.password) {
        await runUpdate('UPDATE barbers SET password = ? WHERE id = ?', [newPass, barber.id]);
        console.log(`Updated Barber ${barber.id}`);
      }
    }

    console.log('🏁 Migração Finalizada com Sucesso!');
  } catch (e) {
    console.error('❌ Erro na migração:', e);
  } finally {
    db.close();
  }
};

migrate();
