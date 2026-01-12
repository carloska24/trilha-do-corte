import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load from default location (cwd)
console.log('--- CWD Load ---');
console.log('CWD:', process.cwd());
dotenv.config();
printVars();

// 2. Load explicitly from ../.env
console.log('\n--- Explicit Load (../.env) ---');
dotenv.config({ path: path.join(__dirname, '../.env'), override: true });
printVars();

function printVars() {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  console.log('CLOUDINARY_CLOUD_NAME:', name ? `'${name}'` : 'UNDEFINED');
  console.log(
    'CLOUDINARY_API_KEY:',
    key ? `'${key.substring(0, 4)}...${key.slice(-4)}'` : 'UNDEFINED'
  );
  console.log('CLOUDINARY_API_SECRET:', secret ? 'SET (Hidden)' : 'UNDEFINED');

  if (name && name.trim() !== name)
    console.log('⚠️ WARNING: Name has leading/trailing whitespace!');
  if (key && key.trim() !== key) console.log('⚠️ WARNING: Key has leading/trailing whitespace!');
}
