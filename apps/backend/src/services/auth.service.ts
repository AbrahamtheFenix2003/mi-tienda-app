import prisma from '../utils/prisma.js';
import { User, Role, LoginResponse } from '@mi-tienda/types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// --- REGISTRO ---
type RegisterData = {
  email: string;
  password: string;
  name?: string;
  role: Role;
};

type LoginData = {
  email: string;
  password: string;
};

const sanitizeUser = (user: { id: string; email: string; name: string | null; role: string }): User => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role as Role,
});

export const registerUser = async (data: RegisterData): Promise<User> => {
  // 1. Hashear la contrasena
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // 2. Crear el usuario en la BD
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role,
    },
  });

  return sanitizeUser(user);
};

// --- LOGIN ---
export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  // 1. Buscar usuario por email
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error('Credenciales invalidas'); // Error generico por seguridad
  }

  // 2. Comparar la contrasena enviada con la hasheada
  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new Error('Credenciales invalidas');
  }

  // 3. Si todo es valido, generar el JWT
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET no esta configurado en el servidor');
  }

  const safeUser = sanitizeUser(user);

  const tokenPayload = {
    id: safeUser.id,
    email: safeUser.email,
    role: safeUser.role,
  };

  const token = jwt.sign(tokenPayload, jwtSecret, {
    expiresIn: '7d', // El token expira en 7 dias
  });

  return {
    token,
    user: safeUser,
  };
};
