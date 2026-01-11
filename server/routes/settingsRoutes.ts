import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public read (for Landing Page/Client App)
router.get('/', getSettings);

// Protected write (Dashboard)
router.put('/', authenticateToken, updateSettings);

export default router;
