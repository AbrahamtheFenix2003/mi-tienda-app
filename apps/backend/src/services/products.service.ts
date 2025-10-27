import prisma from '../utils/prisma.js';
import { Prisma } from '@prisma/client';
import { Product, Category } from '@mi-tienda/types';

// Tipo para los datos de entrada al crear/actualizar un producto
export type ProductData = {
  name: string;
  slug: string;
  description?: string;
  price: Prisma.Decimal;
  originalPrice?: Prisma.Decimal;
  acquisitionCost?: Prisma.Decimal;
  stock: number;
  code?: string;
  imageUrl?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  imageUrl4?: string;
  isFeatured?: boolean;
  tags?: string[];
  categoryId?: string;
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
  code: product.code ?? null,
  imageUrl: product.imageUrl ?? null,
  imageUrl2: product.imageUrl2 ?? null,
  imageUrl3: product.imageUrl3 ?? null,
  imageUrl4: product.imageUrl4 ?? null,
  isFeatured: product.isFeatured ?? false,
  tags: product.tags ?? [],
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
  categoryId: product.categoryId ?? null,
  category: mapCategory(product.category),
});

/**
 * Obtiene todos los productos, incluyendo su categoria.
 */
export const getAllProducts = async (): Promise<Product[]> => {
  const products = await prisma.product.findMany({
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
export const getProductById = async (id: string): Promise<Product | null> => {
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
  const product = await prisma.product.create({
    data: {
      ...data,
      // Aseguramos que los campos opcionales que no vienen se manejen
      originalPrice: data.originalPrice || undefined,
      acquisitionCost: data.acquisitionCost || undefined,
      code: data.code || undefined,
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
export const updateProduct = async (id: string, data: Partial<ProductData>): Promise<Product> => {
  const product = await prisma.product.update({
    where: { id },
    data,
    include: productInclude,
  });

  return mapProduct(product);
};

/**
 * Elimina un producto.
 * @param id El ID del producto a eliminar.
 */
export const deleteProduct = async (id: string): Promise<Product> => {
  const product = await prisma.product.delete({
    where: { id },
    include: productInclude,
  });

  return mapProduct(product);
};
