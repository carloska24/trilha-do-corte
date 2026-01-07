import express from 'express';
import {
  loginClient,
  loginBarber,
  registerClient,
  registerBarber,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login/client', loginClient);
router.post('/login/barber', loginBarber);
router.post('/register/client', registerClient);
router.post('/register/barber', registerBarber);

export default router;
