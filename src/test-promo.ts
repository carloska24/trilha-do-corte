import { generatePromoPhrase } from './services/geminiService';
import dotenv from 'dotenv';
import path from 'path';

// Load .env manually
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testPromo() {
  console.log('Testing generatePromoPhrase...');

  if (!process.env.VITE_GEMINI_API_KEY) {
    console.warn('⚠️ No API Key found in .env. The service might return a default mock.');
  }

  const result1 = await generatePromoPhrase('Corte Degradê', 45.0, 'Natal');
  console.log('Result (Natal):', result1);

  const result2 = await generatePromoPhrase('Barba Completa', 30.0, 'VIP');
  console.log('Result (VIP):', result2);

  const result3 = await generatePromoPhrase('Sobrancelha', 15.0, '');
  console.log('Result (Standard):', result3);
}

testPromo();
