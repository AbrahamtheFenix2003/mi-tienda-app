import prisma from '../utils/prisma.js';
import { Category } from '@prisma/client';

/**
 * Obtiene todas las categorías de la base de datos.
 */
export const getAllCategories = async (): Promise<Category[]> => {
  return prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });
};

/**
 * Crea una nueva categoría.
 * @param name El nombre de la nueva categoría.
 */
export const createCategory = async (name: string): Promise<Category> => {
  return prisma.category.create({
    data: {
      name,
    },
  });
};

/**
 * Actualiza una categoría existente.
 * @param id El ID de la categoría a actualizar.
 * @param name El nuevo nombre para la categoría.
 */
export const updateCategory = async (id: number, name: string): Promise<Category> => {
  return prisma.category.update({
    where: { id },
    data: { name },
  });
};

/**
 * Elimina una categoría.
 * @param id El ID de la categoría a eliminar.
 */
export const deleteCategory = async (id: number): Promise<Category> => {
  return prisma.category.delete({
    where: { id },
  });
};

/**
 * Busca una categoría por su ID.
 * @param id El ID de la categoría a buscar.
 */
export const getCategoryById = async (id: number): Promise<Category | null> => {
  return prisma.category.findUnique({
    where: { id },
  });
};

/**
 * Obtiene todos los productos asociados a una categoría.
 * @param categoryId El ID de la categoría.
 */
export const getCategoryProducts = async (categoryId: number) => {
  return prisma.product.findMany({
    where: { categoryId },
    include: {
      category: true,
    },
    orderBy: { name: 'asc' },
  });
};