import prisma from '../utils/prisma.js';
import { Prisma } from '@prisma/client';
import { Category } from '@mi-tienda/types';
import { Product } from '@mi-tienda/types';

// Tipo para los datos de entrada al crear/actualizar un producto
// Nota: code es obligatorio en DB pero se auto-genera en createProduct
export type ProductData = {
  name: string;
  slug: string;
  description?: string;
  price: Prisma.Decimal;
  originalPrice?: Prisma.Decimal;
  acquisitionCost?: Prisma.Decimal;
  stock: number;
  code?: string; // Opcional aquí porque se auto-genera, pero obligatorio en DB
  imageUrl?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  imageUrl4?: string;
  isFeatured?: boolean;
  tags?: string[];
  categoryId?: number;
};

type PrismaProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true };
}>;

const productInclude = {
  category: true,
} as const;

const mapCategory = (category: PrismaProductWithCategory['category']): Category | null => {
  if (!category) {
    return null;
  }

  return {
    id: category.id,
    name: category.name,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
};

const mapProduct = (product: PrismaProductWithCategory): Product => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  description: product.description ?? null,
  price: product.price.toString(),
  originalPrice: product.originalPrice ? product.originalPrice.toString() : null,
  acquisitionCost: product.acquisitionCost ? product.acquisitionCost.toString() : null,
  stock: product.stock,
  code: product.code, // Prisma: String (no nullable)
  imageUrl: product.imageUrl ?? null,
  imageUrl2: product.imageUrl2 ?? null,
  imageUrl3: product.imageUrl3 ?? null,
  imageUrl4: product.imageUrl4 ?? null,
  isFeatured: product.isFeatured, // Prisma: Boolean (no nullable)
  isActive: product.isActive, // Prisma: Boolean (no nullable)
  tags: product.tags,
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
  categoryId: product.categoryId ?? null,
  category: mapCategory(product.category),
});

/**
 * Obtiene todos los productos activos, incluyendo su categoria.
 */
export const getAllProducts = async (): Promise<Product[]> => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    include: productInclude,
    orderBy: {
      name: 'asc',
    },
  });

  return products.map(mapProduct);
};

/**
 * Busca un producto por su ID, incluyendo su categoria.
 */
export const getProductById = async (id: number): Promise<Product | null> => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });

  return product ? mapProduct(product) : null;
};

/**
 * Crea un nuevo producto.
 * @param data Objeto con los datos del producto.
 */
export const createProduct = async (data: ProductData): Promise<Product> => {
  // Auto-generar el SKU (código del producto)
  // Obtener el último producto para generar el siguiente número
  const lastProduct = await prisma.product.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  });

  const nextNumber = (lastProduct?.id ?? 0) + 1;
  const code = `P-${String(nextNumber).padStart(3, '0')}`; // P-001, P-002, etc.

  const product = await prisma.product.create({
    data: {
      ...data,
      code, // SKU auto-generado
      // Aseguramos que los campos opcionales que no vienen se manejen
      originalPrice: data.originalPrice || undefined,
      acquisitionCost: data.acquisitionCost || undefined,
      description: data.description || undefined,
      imageUrl: data.imageUrl || undefined,
      imageUrl2: data.imageUrl2 || undefined,
      imageUrl3: data.imageUrl3 || undefined,
      imageUrl4: data.imageUrl4 || undefined,
      isFeatured: data.isFeatured ?? false,
      tags: data.tags ?? [],
      categoryId: data.categoryId || undefined,
    },
    include: productInclude,
  });

  return mapProduct(product);
};

/**
 * Actualiza un producto existente.
 * @param id El ID del producto a actualizar.
 * @param data Objeto con los datos a actualizar.
 */
export const updateProduct = async (id: number, data: Partial<ProductData>): Promise<Product> => {
  // Hacemos una copia de los datos para poder modificarlos
  const updateData = { ...data };

  // ¡Clave! Eliminamos el campo 'stock' del objeto de datos.
  // Esto previene que se sobrescriba accidentalmente.
  if ('stock' in updateData) {
    delete (updateData as Partial<ProductData>).stock;
  }

  const product = await prisma.product.update({
    where: { id },
    data: updateData, // Usamos los datos limpios
    include: productInclude,
  });

  return mapProduct(product);
};

/**
 * Elimina un producto (soft delete - marca como inactivo).
 * @param id El ID del producto a eliminar.
 */
export const deleteProduct = async (id: number): Promise<Product> => {
  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false },
    include: productInclude,
  });

  return mapProduct(product);
};
