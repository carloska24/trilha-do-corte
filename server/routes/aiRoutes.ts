import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { handleChat } from '../controllers/aiChatController.js';

const router = express.Router();

// Public Invite/Chat Route (Allows guests to inquire)
router.post('/chat', handleChat);

router.post('/command', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is missing directly in server process.env');
      return res.status(500).json({
        error: 'API Key not configured on server.',
        details: 'Check .env file in root or server directory.',
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
