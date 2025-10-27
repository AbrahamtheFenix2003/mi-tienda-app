// packages/types/src/user.ts

// 1. Definimos el tipo Role manualmente.
// Esta es la FUENTE ÚNICA DE VERDAD.
export type Role = "SUPER_ADMIN" | "SUPER_VENDEDOR" | "VENDEDOR";

// 2. Interfaz para el objeto User
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role; // Usamos nuestro tipo
}

// 3. Interfaz para la respuesta de la API de Login
export interface LoginResponse {
  token: string;
  user: User;
}