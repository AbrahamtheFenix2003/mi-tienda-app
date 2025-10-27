import { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import { Role } from '@mi-tienda/types';

const VALID_ROLES: Role[] = ['SUPER_ADMIN', 'SUPER_VENDEDOR', 'VENDEDOR'];
const DEFAULT_ROLE: Role = 'VENDEDOR';

export const handleRegister = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const requestedRole = req.body.role as Role | undefined;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contrasena son requeridos' });
  }

  if (requestedRole && !VALID_ROLES.includes(requestedRole)) {
    return res.status(400).json({ message: 'Rol invalido' });
  }

  try {
    const user = await authService.registerUser({
      email,
      password,
      name,
      role: requestedRole ?? DEFAULT_ROLE,
    });

    // No devolvemos el password hasheado
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({ message: 'El email ya esta registrado' });
    }
    res.status(500).json({ message: 'Error al registrar el usuario', error });
  }
};

export const handleLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contrasena son requeridos' });
  }

  try {
    const loginResponse = await authService.loginUser({ email, password });
    res.status(200).json(loginResponse);
  } catch (error: any) {
    if (error.message === 'Credenciales invalidas') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error al iniciar sesion', error });
  }
};
