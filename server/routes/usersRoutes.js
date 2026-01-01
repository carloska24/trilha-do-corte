import express from 'express';
import {
  getClients,
  getBarbers,
  updateClientProfile,
  createClientAdmin,
} from '../controllers/usersController.js';

const router = express.Router();

// Clients
router.get('/clients', getClients);
router.put('/clients/:id', updateClientProfile);
router.post('/clients', createClientAdmin);

// Barbers
router.get('/barbers', getBarbers);

export default router;
