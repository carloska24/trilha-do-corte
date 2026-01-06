import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirs = ['controllers', 'services'];
const commonImports = {
  db: /db\./,
  bcrypt: /bcrypt\./,
  jwt: /jwt\./,
  uuid: /uuid/,
  fs: /fs\./,
  path: /path\./,
};

console.log('--- AUDITORIA DE INTEGRIDADE DE CÓDIGO ---');
let issues = 0;

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) return;

  const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.js'));

  files.forEach(file => {
    const content = fs.readFileSync(path.join(fullPath, file), 'utf-8');
    const lines = content.split('\n');
    let fileIssues = [];

    // Check for common imports usage without import
    for (const [lib, usageRegex] of Object.entries(commonImports)) {
      if (usageRegex.test(content)) {
        // Simple check: does the file contain "import ... from 'lib'" or "import { ... } from 'lib'"
        // For 'db', it is usually "import db from '../db.js'"
        let importRegex;
        if (lib === 'db') importRegex = /import\s+db\s+from/i;
        else if (lib === 'uuid') importRegex = /import\s+.*uuid/i;
        else importRegex = new RegExp(`import\\s+.*${lib}`, 'i');

        if (!importRegex.test(content)) {
          // Double check for require (legacy)
          if (!content.includes(`require('${lib}')`) && !content.includes(`require("${lib}")`)) {
            fileIssues.push(`❓ Usa '${lib}' mas não parece importar.`);
          }
        }
      }
    }

    // Check for undefined variables (very basic heuristic)
    // Looking for "ReferenceError: X is not defined" candidates
    // This is hard to do perfectly with regex, so we stick to the imports check for now which caught the bcrypt error.

    if (fileIssues.length > 0) {
      console.log(`\n📂 ${dir}/${file}:`);
      fileIssues.forEach(i => console.log(`  - ${i}`));
      issues++;
    }
  });
});

if (issues === 0) {
  console.log('✅ Nenhum problema óbvio de importação encontrado nos diretórios verificados.');
} else {
  console.log(`\n⚠️ Encontrados problemas em ${issues} arquivos.`);
}
