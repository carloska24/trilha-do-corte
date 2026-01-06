import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import db from './db.js';

async function checkSQL() {
  console.log('--- AUDITORIA DE SQL E COLUNAS ---');

  // 1. Get Actual DB Schema
  const schemaQuery = `
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public';
  `;

  let validColumns = {};
  try {
    const res = await db.query(schemaQuery);
    res.rows.forEach(r => {
      if (!validColumns[r.table_name]) validColumns[r.table_name] = new Set();
      validColumns[r.table_name].add(r.column_name);
    });
  } catch (e) {
    console.error('Erro ao buscar schema:', e.message);
    return;
  }

  // 2. Scan Controllers for SQL
  const dirs = ['controllers'];
  let issues = 0;

  for (const dir of dirs) {
    const fullPath = path.join(__dirname, dir);
    const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(fullPath, file), 'utf-8');

      // Basic Regex to extract likely SQL strings (INSERT, SELECT, UPDATE)
      // This is heuristic and won't be perfect.
      const sqlRegex = /["'`]((SELECT|INSERT|UPDATE|DELETE).*?)["'`]/gis;
      let match;

      while ((match = sqlRegex.exec(content)) !== null) {
        const query = match[1];

        // Extract column names used in WHERE clause or INSERT
        // Looking for "columnName" (quoted) or columnName (unquoted)

        // Check for double-quoted columns (postgres case sensitive)
        const quotedColRegex = /"([^"]+)"/g;
        let qMatch;
        while ((qMatch = quotedColRegex.exec(query)) !== null) {
          const colName = qMatch[1];
          // Skip known non-columns or aliases if possible, currently naïve
          if (colName === 'dev_secret_123') continue; // Noise

          // Try to guess table from context or check ALL tables
          let found = false;
          for (const table in validColumns) {
            if (validColumns[table].has(colName)) {
              found = true;
              break;
            }
          }

          // If looks like camelCase but DB is usually snake_case or lowercase
          if (!found && /[A-Z]/.test(colName)) {
            console.log(`\n📂 ${dir}/${file}:`);
            console.log(
              `  ❓ Coluna citada "${colName}" pode não existir (Case Sensitive?). Query: "${query.substring(
                0,
                50
              )}..."`
            );
            issues++;
          }
        }
      }
    }
  }

  if (issues === 0) {
    console.log('✅ Nenhuma anomalia óbvia de colunas (aspas duplas) encontrada.');
  }
}

checkSQL();
