// lib/productValidators.ts

import { Product } from '@mi-tienda/types';

/**
 * Valida que el nombre del producto sea único en la lista de productos
 * @param name - Nombre a validar
 * @param products - Lista de productos existentes
 * @param currentProductId - ID del producto actual (si estamos editando), para excluirlo de la validación
 * @returns true si el nombre es único, false si está duplicado
 */
export const isProductNameUnique = (
  name: string,
  products: Product[] | undefined,
  currentProductId?: number
): boolean => {
  if (!products) return true;

  return !products.some(
    (product) =>
      product.name.toLowerCase() === name.toLowerCase() &&
      product.id !== currentProductId
  );
};

/**
 * Valida que el slug del producto sea único en la lista de productos
 * @param slug - Slug a validar
 * @param products - Lista de productos existentes
 * @param currentProductId - ID del producto actual (si estamos editando), para excluirlo de la validación
 * @returns true si el slug es único, false si está duplicado
 */
export const isProductSlugUnique = (
  slug: string,
  products: Product[] | undefined,
  currentProductId?: number
): boolean => {
  if (!products) return true;

  return !products.some(
    (product) =>
      product.slug.toLowerCase() === slug.toLowerCase() &&
      product.id !== currentProductId
  );
};

/**
 * Obtiene el mensaje de error para nombre duplicado
 */
export const getNameDuplicateError = (): string => {
  return 'Este nombre ya está en uso. Por favor, elige uno diferente.';
};

/**
 * Obtiene el mensaje de error para slug duplicado
 */
export const getSlugDuplicateError = (): string => {
  return 'Este slug ya está en uso. Por favor, elige uno diferente.';
};
