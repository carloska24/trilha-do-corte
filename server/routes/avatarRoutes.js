import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para a pasta 'public/avatars' na raiz do projeto
// server/routes -> server -> trilha -> public/avatars
const AVATARS_DIR = path.join(__dirname, '../../public/avatars');

router.get('/', (req, res) => {
  try {
    // Se a pasta não existir, cria-a
    if (!fs.existsSync(AVATARS_DIR)) {
      fs.mkdirSync(AVATARS_DIR, { recursive: true });
      return res.json({ avatars: [] });
    }

    const files = fs.readdirSync(AVATARS_DIR);

    // Filtrar apenas imagens
    const avatars = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => `/avatars/${file}`); // Retornar URL relativa pública

    res.json({ avatars });
  } catch (error) {
    console.error('Error reading avatars directory:', error);
    res.status(500).json({ error: 'Failed to list avatars' });
  }
});

export default router;
