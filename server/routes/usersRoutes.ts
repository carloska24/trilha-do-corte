import express from 'express';
import {
  getClients,
  getBarbers,
  updateClientProfile,
  updateBarberProfile,
  createClientAdmin,
  deleteClient,
} from '../controllers/usersController.js';

const router = express.Router();

// Clients
import { authenticateToken } from '../middleware/auth.js';

// Clients
router.get('/clients', authenticateToken, getClients);
router.put('/clients/:id', authenticateToken, updateClientProfile);
router.post('/clients', authenticateToken, createClientAdmin);
router.delete('/clients/:id', authenticateToken, deleteClient);

// Barbers
router.get('/barbers', authenticateToken, getBarbers);
router.put('/barbers/:id', authenticateToken, updateBarberProfile);

export default router;
