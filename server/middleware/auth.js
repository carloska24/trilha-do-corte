import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // FORMAT: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  // Fallback secret para desenvolvimento, idealmente deve vir do .env
  const secret = process.env.JWT_SECRET || 'dev_secret_123';

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      console.error('❌ Token Inválido:', err.message);
      return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }

    // Anexa o usuário decodificado à requisição
    req.user = user;
    next();
  });
};
