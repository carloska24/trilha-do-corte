import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { handleChat } from '../controllers/aiChatController.js';

const router = express.Router();

// Initialize Google Generative AI outside of route handlers to reuse the instance
let genAI: GoogleGenerativeAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
  console.error('❌ GEMINI_API_KEY is missing. AI functionalities may not work.');
}

// Public Invite/Chat Route (Allows guests to inquire)
router.post('/chat', handleChat);

router.post('/generate-description', async (req: Request, res: Response) => {
  try {
    if (!genAI) {
      return res.status(500).json({
        error: 'API Key not configured on server.',
        details: 'Check .env file in root or server directory.',
      });
    }

    const { serviceName, category, duration, vibe } = req.body;

    // Server-side logging for debug
    console.log(`🤖 [AI] Generating description for: ${serviceName} (${vibe || 'Random'})`);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // Reverted to 2.5 per user request

    // Fallback prompt logic inside backend
    const prompt = `
      Você é um Barbeiro Expert e Copywriter de Luxo para a "Barber Pro System".
      Crie uma descrição curta, técnica e vendedora para o seguinte serviço:

      Serviço: ${serviceName}
      Categoria: ${category}
      Duração: ${duration} minutos

      CONTEXTO CRIATIVO (IMPORTANTE):
      O foco desta descrição deve ser: **${vibe || 'Luxo e Exclusividade'}**.
      Não mencione explicitamente o nome do foco, mas use palavras e tom que remetam a ele.

      Regras:
      1. Use tom profissional, moderno e "premium".
      2. Destaque os benefícios e a técnica.
      3. Máximo de 180 caracteres (ideal para caber no card).
      4. Sem emojis exagerados.
      5. Foco na experiência do cliente.

      Retorne APENAS o texto da descrição.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    res.json({ text });
  } catch (error: any) {
    console.error('AI Description Error:', error);
    res.status(500).json({
      error: 'Failed to generate description',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

router.post('/command', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!genAI) {
      console.error('❌ GEMINI_API_KEY is missing directly in server process.env');
      return res.status(500).json({
        error: 'API Key not configured on server.',
        details: 'Check .env file in root or server directory.',
      });
    }

    // Use global genAI instance
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ text });
  } catch (error: any) {
    console.error('❌ Gemini Server Error:', error);

    // Handle Quota/Rate Limit Errors Gracefully
    if (
      error.status === 429 ||
      error.message?.includes('429') ||
      error.message?.includes('Too Many Requests') ||
      error.message?.includes('Quota exceeded')
    ) {
      return res.json({
        text: '🤯 Eita! Muita gente falando comigo. Aguarde 30s e tente de novo? (Cota excedida)',
      });
    }

    res.status(500).json({
      error: 'Failed to process AI command',
      details: error.message,
    });
  }
});

// --- NEW SECURE ENDPOINTS (Migrated from Frontend) ---

// 1. Text Consultation
router.post('/consultation', async (req: Request, res: Response) => {
  try {
    if (!genAI) throw new Error('API Key missing');
    const { userDescription, hairType } = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const prompt = `
      Você é 'O Maquinista', barbeiro especialista.
      Cliente: "${userDescription}", Cabelo: "${hairType}".
      Sugira um corte moderno. Responda APENAS JSON válido:
      { "styleName": "Nome", "suggestion": "Descrição curta", "maintenanceLevel": "Médio" }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response
      .text()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error('Consultation Error:', error);
    res.status(500).json({ error: 'Consultation failed' });
  }
});

// 2. Image Consultation
router.post('/consultation-image', async (req: Request, res: Response) => {
  try {
    if (!genAI) throw new Error('API Key missing');
    const { userDescription, hairType, imageBase64 } = req.body;
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const prompt = `
      Analise a foto do rosto e o pedido: "${userDescription}", Cabelo: "${hairType}".
      Sugira um corte ideal. Responda APENAS JSON válido:
      { "styleName": "Nome", "suggestion": "Descrição", "maintenanceLevel": "Baixo/Médio/Alto" }
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
    ]);

    const text = result.response
      .text()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error('Visual Consultation Error:', error);
    res.status(500).json({ error: 'Visual analysis failed' });
  }
});

// 3. Image Generation
router.post('/generate-image', async (req: Request, res: Response) => {
  try {
    if (!genAI) throw new Error('API Key missing');
    const { description, styleName, userImageBase64 } = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    let payload: any[] = [];
    let prompt = '';

    if (userImageBase64) {
      const cleanBase64 = userImageBase64.split(',')[1] || userImageBase64;
      prompt = `
        Edit this photo to apply the following haircut: "${styleName}".
        Instructions:
        - Keep the person's face EXACTLY as it is.
        - Only modification should be the hair.
        - Apply this style: ${styleName} - ${description}.
        - Maintain the original lighting and angle.
        - High realism, 8k resolution.
        Generate the modified image.
      `;
      payload = [prompt, { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }];
    } else {
      prompt = `
        Create a high-quality, photorealistic portrait of a man with this specific haircut: "${styleName}".
        Details:
        - Haircut Style: ${styleName}
        - Analysis: ${description}
        - Setting: Modern, cinematic urban barber shop neon lighting.
        - Quality: 8k, highly detailed.
        Generate ONLY the image.
      `;
      payload = [prompt];
    }

    const result = await model.generateContent(payload);
    const response = await result.response;

    if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.inlineData) {
      const imgData = response.candidates[0].content.parts[0].inlineData;
      const finalImage = `data:${imgData.mimeType};base64,${imgData.data}`;
      res.json({ image: finalImage });
    } else {
      throw new Error('No image data returned');
    }
  } catch (error: any) {
    console.error('Image Gen Error:', error);
    res.status(500).json({ error: 'Image generation failed', details: error.message });
  }
});

// 4. Promo Generation
router.post('/generate-promo', async (req: Request, res: Response) => {
  try {
    if (!genAI) throw new Error('API Key missing');
    const { serviceName, price, context } = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const prompt = `
      Atue como um especialista em marketing para barbearias.
      Crie uma frase curta e chamativa (máximo 50 caracteres) para vender o serviço abaixo.
      
      Serviço: ${serviceName}
      Preço: R$ ${price}
      ${context ? `Contexto do Usuário: "${context}"` : ''}

      Regras de Tema (IMPORTANTE):
      1. Natal/Fim de Ano -> "christmas"
      2. Páscoa/Coelho -> "easter"
      3. Halloween -> "halloween"
      4. Verão -> "summer"
      5. Namorados -> "valentine"
      6. Black Friday -> "black_friday"
      7. Dia dos Pais -> "fathers_day"
      8. Dia das Mães -> "mothers_day"
      9. Carnaval -> "carnival"
      10. Promoção Relâmpago -> "offer"
      11. VIP/Luxury -> "premium"
      12. Outros -> "standard"

      Retorne APENAS um JSON válido:
      {
        "text": "Sua frase criativa aqui",
        "theme": "option",
        "discountValue": "R$ XX,XX" // Opcional
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response
      .text()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error('Promo Gen Error:', error);
    // Fallback response matches frontend structure
    res.json({ text: `Promoção especial para ${serviceName}!`, theme: 'standard' });
  }
});

export default router;
