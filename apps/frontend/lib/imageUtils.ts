// lib/imageUtils.ts

/**
 * Convierte una URL relativa de imagen a una URL absoluta apuntando al backend
 * @param imageUrl - URL relativa (ej: '/uploads/1234.png') o absoluta
 * @returns URL absoluta (ej: 'http://localhost:8080/uploads/1234.png')
 */
export function getAbsoluteImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;

  // Si ya es una URL absoluta, retornarla tal cual
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Si es una URL relativa, agregar el backend URL
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // Asegurar que la URL comience con /
  const normalizedUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;

  return `${backendUrl}${normalizedUrl}`;
}
