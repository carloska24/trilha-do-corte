import express from 'express';
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from '../controllers/servicesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getServices);
router.post('/', authenticateToken, createService);
router.put('/:id', authenticateToken, updateService);
router.delete('/:id', authenticateToken, deleteService);

export default router;
