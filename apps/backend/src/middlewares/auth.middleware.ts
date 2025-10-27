import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@mi-tienda/types';

// Interfaz personalizada para la request
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

// Middleware para autenticar token JWT
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined;

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No se proveyo token.' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ message: 'Error interno: El secreto del servidor no esta configurado.' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as { id: string; email: string; role: Role };
    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token invalido o expirado.' });
  }
};

// Middleware para autorizar por rol
export const authorizeRole = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acceso denegado. No tienes los permisos necesarios.' });
    }

    next();
  };
};
