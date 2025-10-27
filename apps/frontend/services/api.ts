// /services/api.ts

import axios from 'axios';

// 1. URL base de la API del backend
// Usamos NEXT_PUBLIC_ para que la variable de entorno sea accesible en el cliente
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// 2. Crea una instancia de Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Función para adjuntar el token JWT a las cabeceras de la API.
 * Se usa para todas las peticiones a rutas protegidas.
 * @param token El token JWT a adjuntar.
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    // Si hay un token, lo adjuntamos
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Si no hay token o es null, eliminamos la cabecera
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;