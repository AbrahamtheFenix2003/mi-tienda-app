/**
 * Utilidades para manejo de imágenes en diferentes entornos
 * Resuelve el problema de URLs de imágenes entre desarrollo local y Docker
 */

/**
 * Construye la URL completa para una imagen según el entorno
 * @param imagePath - Ruta de la imagen (ej: "nombre.jpg" o URL completa)
 * @returns URL completa de la imagen
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return '';
  }

  // Si la imagen ya tiene una URL completa, úsala
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Determinar la URL base según el entorno y contexto
  let baseUrl: string;

  if (process.env.NODE_ENV === 'production') {
    // En producción, verificar si estamos en el navegador (cliente) o en el servidor
    if (typeof window !== 'undefined') {
      // En el navegador (cliente), usar la URL pública del API
      baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    } else {
      // En el servidor, usar la URL interna del backend (para Docker/K8s)
      baseUrl = process.env.NEXT_INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    }
  } else {
    // En desarrollo, usar la URL pública del API
    baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  }

  // Si el path ya incluye /uploads/, evitar duplicación
  const cleanImagePath = imagePath.startsWith('/uploads/')
    ? imagePath.replace('/uploads/', '')
    : imagePath;

  return `${baseUrl}/uploads/${cleanImagePath}`;
};

/**
 * Obtiene la URL base de la API según el entorno
 * @returns URL base de la API
 */
export const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
};

/**
 * Construye la URL para múltiples imágenes (arrays)
 * @param imagePaths - Array de rutas de imágenes
 * @returns Array de URLs completas
 */
export const getImageUrls = (imagePaths: (string | null | undefined)[]): string[] => {
  return imagePaths.map(imagePath => getImageUrl(imagePath));
};

/**
 * Verifica si una URL es válida para mostrar
 * @param url - URL a verificar
 * @returns true si la URL es válida
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // URLs válidas empiezan con http o son rutas relativas válidas
  return url.startsWith('http') || (!url.startsWith('data:') && url.length > 0);
};

/**
 * Obtiene la primera imagen válida de un array
 * @param images - Array de imágenes
 * @returns Primera imagen válida o string vacío
 */
export const getFirstValidImage = (images: (string | null | undefined)[]): string => {
  if (!images || images.length === 0) return '';
  
  const validImage = images.find(img => img && img.trim() !== '');
  return validImage ? getImageUrl(validImage) : '';
};

/**
 * Alias para getImageUrl para compatibilidad con código existente
 * @param imagePath - Ruta de la imagen
 * @returns URL completa de la imagen
 */
export const getAbsoluteImageUrl = getImageUrl;

/**
 * Verifica si una URL es local (del mismo dominio)
 * @param url - URL a verificar
 * @returns true si es una URL local
 */
export const isLocalUrl = (url: string): boolean => {
  if (!url) return false;

  // Si no empieza con http, es relativa (local)
  if (!url.startsWith('http')) return true;

  // Obtener los hosts configurados
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  const internalApiBaseUrl = process.env.NEXT_INTERNAL_API_BASE_URL || '';

  // Extraer hostnames de las URLs configuradas
  const configuredHosts = [apiBaseUrl, internalApiBaseUrl].filter(Boolean);

  // Verificar si la URL contiene alguno de los hosts configurados
  return configuredHosts.some(host => url.includes(host.replace('http://', '').replace('https://', '')));
};
