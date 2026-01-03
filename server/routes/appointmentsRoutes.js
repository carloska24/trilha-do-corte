import express from 'express';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  clearAppointments,
} from '../controllers/appointmentsController.js';

const router = express.Router();

import { authenticateToken } from '../middleware/auth.js';

// Protect all appointment routes
router.use(authenticateToken);

router.get('/', getAppointments);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/', clearAppointments);

export default router;
