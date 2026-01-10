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

export default router;
