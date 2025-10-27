// services/authService.ts
import api from './api';
// Importamos los tipos desde el paquete compartido
import { LoginResponse } from '@mi-tienda/types';

// Interfaz para los datos que enviamos al login
interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Llama al endpoint de login de la API.
 * @param credentials - Objeto con email y password.
 * @returns Una promesa que resuelve a LoginResponse (token y usuario).
 */
export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error en el servicio de login:', error);
    throw error;
  }
};