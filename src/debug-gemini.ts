import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env manually since we are running this with tsx/node
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ API Key not found in .env');
  process.exit(1);
}

console.log('🔑 Testing API Key:', apiKey.substring(0, 10) + '...');

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    console.log('📡 Fetching available models...');
    // Note: listModels might not be directly exposed on the main class in some versions,
    // but usually it's on the client or we can try a simple generation to test 'gemini-pro'

    // Actually, for @google/generative-ai, we might not have a direct listModels helper in the simplified client
    // without using the model manager, but let's try to just run a generation with a known safe model first.

    const safeModel = 'gemini-pro';
    console.log(`🧪 Testing fallback model: ${safeModel}`);
    const model = genAI.getGenerativeModel({ model: safeModel });
    const result = await model.generateContent('Hello');
    console.log(`✅ ${safeModel} is WORKING!`);
    console.log('Response:', result.response.text());
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Details:', JSON.stringify(error.response, null, 2));
    }
  }
}

listModels();
