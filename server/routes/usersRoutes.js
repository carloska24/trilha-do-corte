import express from 'express';
import {
  getClients,
  getBarbers,
  updateClientProfile,
  updateBarberProfile,
  createClientAdmin,
} from '../controllers/usersController.js';

const router = express.Router();

// Clients
router.get('/clients', getClients);
router.put('/clients/:id', updateClientProfile);
router.post('/clients', createClientAdmin);

// Barbers
router.get('/barbers', getBarbers);
router.put('/barbers/:id', updateBarberProfile);

export default router;
