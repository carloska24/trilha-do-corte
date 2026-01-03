import express from 'express';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  clearAppointments,
} from '../controllers/appointmentsController.js';

const router = express.Router();

import { authenticateToken } from '../middleware/auth.js';

// Public route for availability
router.get('/', getAppointments);

// Protect all other appointment routes
router.use(authenticateToken);

// router.get('/', getAppointments); // Moved up to allow public access
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/', clearAppointments);

export default router;
