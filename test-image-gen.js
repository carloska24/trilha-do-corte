import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyCTG-8W-LLtBnVUnLYukP_2qwjdGcf2F0Y';
const genAI = new GoogleGenerativeAI(apiKey);

async function testImageGen() {
  console.log('Testing Image Generation with gemini-2.5-flash-image...');
  const modelName = 'gemini-2.5-flash-image';

  try {
    const model = genAI.getGenerativeModel({ model: modelName });

    // Simple prompt to test generation capability
    const prompt = 'A futuristic barber shop logo with neon lights, vector art style.';

    console.log(`Sending prompt to ${modelName}...`);
    const result = await model.generateContent(prompt);
    const response = await result.response;

    console.log('Response received.');
    console.log(JSON.stringify(response, null, 2));
  } catch (e) {
    console.log('Failed:', e.message);
    if (e.response) {
      console.log('Details:', JSON.stringify(e.response, null, 2));
    }
  }
}

testImageGen();
