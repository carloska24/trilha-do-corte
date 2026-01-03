import express from 'express';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  clearAppointments,
} from '../controllers/appointmentsController.js';

const router = express.Router();

import { authenticateToken } from '../middleware/auth.js';

// Public route for availability and booking (Guest/Landing Page support)
router.get('/', getAppointments);
router.post('/', createAppointment);

// Protect all other appointment routes (Updates/Deletes)
router.use(authenticateToken);

router.put('/:id', updateAppointment);
router.delete('/', clearAppointments);

export default router;
