import { Request, Response } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import * as authService from '../services/auth.service.js';
import { Role } from '@mi-tienda/types';

// --- Esquemas de Validación con Zod 4 ---
const loginSchema = z.object({
  email: z
    .string({
      error: (issue) =>
        issue.input === undefined ? 'El email es requerido' : 'Email inválido',
    })
    .email({ error: 'Formato de email inválido' })
    .max(255, { error: 'El email no puede exceder 255 caracteres' }),
  password: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? 'La contraseña es requerida'
          : 'Contraseña inválida',
    })
    .min(8, { error: 'La contraseña debe tener al menos 8 caracteres' })
    .max(128, { error: 'La contraseña no puede exceder 128 caracteres' }),
});

const registerSchema = loginSchema.extend({
  name: z
    .string()
    .max(100, { error: 'El nombre no puede exceder 100 caracteres' })
    .optional(),
  role: z
    .enum(['SUPER_ADMIN', 'SUPER_VENDEDOR', 'VENDEDOR'], {
      error: 'Rol inválido',
    })
    .optional()
    .default('VENDEDOR'),
});

// --- Controladores ---
export const handleRegister = async (req: Request, res: Response) => {
  // Validar entrada con Zod
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: 'Datos de entrada inválidos',
      errors: validation.error.flatten().fieldErrors,
    });
  }

  const { email, password, name, role } = validation.data;

  try {
    const user = await authService.registerUser({
      email,
      password,
      name,
      role: role as Role,
    });

    // No devolvemos el password hasheado
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    // Manejo tipado de errores de Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'El email ya está registrado' });
      }
    }
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const handleLogin = async (req: Request, res: Response) => {
  // Validar entrada con Zod
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: 'Datos de entrada inválidos',
      errors: validation.error.flatten().fieldErrors,
    });
  }

  const { email, password } = validation.data;

  try {
    const loginResponse = await authService.loginUser({ email, password });
    res.status(200).json(loginResponse);
  } catch (error) {
    if (error instanceof Error && error.message === 'Credenciales invalidas') {
      return res.status(401).json({ message: error.message });
    }
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
