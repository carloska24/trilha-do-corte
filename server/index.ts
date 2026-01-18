import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { upload } from './uploadService.js';
import 'dotenv/config'; // Load environment variables

// Import Rate Limiters
import { generalLimiter, authLimiter, appointmentLimiter } from './middleware/rateLimiter.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import servicesRoutes from './routes/servicesRoutes.js';
import appointmentsRoutes from './routes/appointmentsRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import avatarsRoutes from './routes/avatarRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Debug Middleware to log all requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`📡 [${req.method}] ${req.url} | Origin: ${req.headers.origin || 'Unknown'}`);
  next();
});

// Security: Limit JSON body size to prevent DoS (was 50mb)
app.use(express.json({ limit: '1mb' }));

// Apply general rate limiter to all API routes
app.use('/api', generalLimiter);

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: '30d', // Cache for 30 days
    immutable: true, // Content won't change
  })
);

// Serve Avatars Statically (Needed for /api/avatars logic)
app.use(
  '/avatars',
  express.static(path.join(__dirname, '../public/avatars'), {
    maxAge: '7d',
  })
);

// --- ROUTES ---

// Upload Endpoint
app.post('/api/upload', upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }
    // Cloudinary returns URL in req.file.path
    res.json({ url: req.file.path });
  } catch (err) {
    console.error('Upload Configuration Error:', err);
    res.status(500).json({
      error: 'Falha no upload.',
      details: err.message || 'Erro desconhecido',
      hint: err.http_code === 401 ? 'Verifique as credenciais do Cloudinary no .env' : undefined,
    });
  }
});

// Mount specialized routes with appropriate rate limiters
app.use('/api/login', authLimiter); // Strict limiter for login routes
app.use('/api/register', authLimiter); // Strict limiter for register routes
app.use('/api', authRoutes); // Handles /api/login/* and /api/register/*
app.use('/api/services', servicesRoutes); // Handles /api/services/*
app.use('/api/appointments', appointmentLimiter, appointmentsRoutes); // Rate limited appointments
app.use('/api', usersRoutes); // Handles /api/clients, /api/barbers
app.use('/api/ai', aiRoutes); // Handles /api/ai/command

app.use('/api/avatars', avatarsRoutes); // Handles /api/avatars list
app.use('/api/settings', settingsRoutes); // Handles /api/settings
app.use('/api/maintenance', maintenanceRoutes); // Handles /api/maintenance

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('🔥 [Critical Error] Unhandled Exception:', err);
  res.status(500).json({
    error: 'Erro interno do servidor.',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// --- SERVER START ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📂 Modular Architecture Active`);
  // Restart trigger
});
