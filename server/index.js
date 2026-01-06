import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { upload } from './uploadService.js';
import 'dotenv/config'; // Load environment variables

// Import Routes
import authRoutes from './routes/authRoutes.js';
import servicesRoutes from './routes/servicesRoutes.js';
import appointmentsRoutes from './routes/appointmentsRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Debug Middleware to log all requests
app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.url} | Origin: ${req.headers.origin || 'Unknown'}`);
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: '30d', // Cache for 30 days
    immutable: true, // Content won't change
  })
);

// --- ROUTES ---

// Upload Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
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

// Mount specialized routes
app.use('/api', authRoutes); // Handles /api/login/* and /api/register/*
app.use('/api/services', servicesRoutes); // Handles /api/services/*
app.use('/api/appointments', appointmentsRoutes); // Handles /api/appointments/*
app.use('/api', usersRoutes); // Handles /api/clients, /api/barbers
app.use('/api/ai', aiRoutes); // Handles /api/ai/command

// Global Error Handler
app.use((err, req, res, next) => {
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
});
