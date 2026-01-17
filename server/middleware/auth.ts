import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  // FORMAT: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('CRITICAL ERROR: JWT_SECRET is not defined in environment variables.');
    return res.status(500).json({ error: 'Erro interno de configuração de segurança.' });
  }

  jwt.verify(token, secret, (err: any, user: any) => {
    if (err) {
      console.error('❌ Token Inválido:', err.message);
      return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }

    // Anexa o usuário decodificado à requisição
    (req as AuthenticatedRequest).user = user;
    next();
  });
};
