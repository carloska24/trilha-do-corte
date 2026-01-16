import express from 'express';
import {
  cleanSchedule,
  createBackup,
  restoreBackup,
} from '../controllers/maintenanceController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../uploadService.js'; // Reusing existing multer config or create simple one

const router = express.Router();

// All routes here should be protected (Admin only ideally, currently just auth)
router.use(authenticateToken);

router.post('/clean-schedule', cleanSchedule);
router.get('/backup', createBackup);
router.post('/restore', upload.single('backupFile'), restoreBackup);

export default router;
