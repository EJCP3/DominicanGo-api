import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string;
      foto?: string | null;
    }
  }
}


export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No autorizado. Token no proporcionado.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      res.status(401).json({ success: false, message: 'No autorizado. Usuario no encontrado.' });
      return;
    }

    req.user = { id: user.id, email: user.email, name: user.name, foto: user.foto };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'No autorizado. Token inválido o expirado.' });
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (user) {
      req.user = { id: user.id, email: user.email, name: user.name, foto: user.foto };
    }
    next();
  } catch {
    next();
  }
};
