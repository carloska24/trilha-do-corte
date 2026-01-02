import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from root (two levels up from server/) to ensure we get the same env as the app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('Checking Cloudinary Config...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'OK' : 'MISSING');
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'OK' : 'MISSING');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'OK' : 'MISSING');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Pinging Cloudinary API...');

cloudinary.api
  .ping()
  .then(res => {
    console.log('Cloudinary Connection OK:', res);
  })
  .catch(err => {
    console.error('Cloudinary Connection Failed:', err);
  });
