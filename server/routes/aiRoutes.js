import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/command', authenticateToken, async (req, res) => {
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
  } catch (error) {
    console.error('❌ Gemini Server Error:', error);
    res.status(500).json({
      error: 'Failed to process AI command',
      details: error.message,
    });
  }
});

export default router;
