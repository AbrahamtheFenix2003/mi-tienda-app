import { Request, Response } from 'express';
import * as productService from '../services/products.service.js';
import { ProductData } from '../services/products.service.js';
import { Prisma } from '@prisma/client';
import upload from '../config/multer.js';
import { updateProduct } from '../services/products.service.js';

// Usar Prisma.Decimal en lugar de importar Decimal directamente
const Decimal = Prisma.Decimal;

// Helper para validar los datos de entrada
const validateProductData = (data: any): { error?: string } => {
  if (!data.name) return { error: 'El campo "name" es requerido' };
  if (!data.slug) return { error: 'El campo "slug" es requerido' };
  if (data.price === undefined) return { error: 'El campo "price" es requerido' };
  return {};
};

export const handleGetAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos', error });
  }
};

export const handleGetProductById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID de producto inválido' });
  }

  try {
    const product = await productService.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el producto', error });
  }
};

export const handleCreateProduct = async (req: Request, res: Response) => {
  const data = req.body;
  // Sanitizar campos eliminados
  if ('stockMinimo' in data) delete data.stockMinimo;

  // Validación básica
  const { error } = validateProductData(data);
  if (error) {
    return res.status(400).json({ message: error });
  }

  // Convertir precio y stock a los tipos correctos
  const productData: ProductData = {
    ...data,
    price: new Decimal(data.price),
    originalPrice: data.originalPrice ? new Decimal(data.originalPrice) : undefined,
    acquisitionCost: data.acquisitionCost ? new Decimal(data.acquisitionCost) : undefined,
    stock: data.stock !== undefined ? parseInt(data.stock, 10) : 0,
  };

  try {
    const newProduct = await productService.createProduct(productData);
    res.status(201).json(newProduct);
  } catch (error: any) {
    // Manejar error de slug duplicado
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      return res.status(409).json({ message: 'El "slug" (URL) ya existe' });
    }
    res.status(500).json({ message: 'Error al crear el producto', error });
  }
};

export const handleUpdateProduct = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID de producto inválido' });
  }

  const data = req.body;

  // Sanitizar campos eliminados
  if ('stockMinimo' in data) delete data.stockMinimo;
  // No permitir editar el código SKU
  if ('code' in data) delete data.code;

  // Conversión de tipos para los campos que vienen
  if (data.price) data.price = new Decimal(data.price);
  if (data.originalPrice) data.originalPrice = new Decimal(data.originalPrice);
  if (data.acquisitionCost) data.acquisitionCost = new Decimal(data.acquisitionCost);
  if (data.stock) data.stock = parseInt(data.stock, 10);

  try {
    const updatedProduct = await productService.updateProduct(id, data);
    res.status(200).json(updatedProduct);
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      return res.status(409).json({ message: 'El "slug" (URL) ya existe' });
    }
    res.status(500).json({ message: 'Error al actualizar el producto', error });
  }
};

export const handleDeleteProduct = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID de producto inválido' });
  }

  try {
    await productService.deleteProduct(id);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error });
  }
};

export const handleUploadProductImage = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID de producto inválido' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo de imagen.' });
  }

  // Construir la URL relativa donde se puede acceder a la imagen
  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    // Actualizar SOLO el campo imageUrl del producto
    const updatedProduct = await productService.updateProduct(id, { imageUrl });
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error al guardar URL de imagen:', error);
    // Nota: podríamos borrar el archivo físico si falla la BD
    res.status(500).json({ message: 'Error al actualizar la imagen del producto', error });
  }
};

export const handleUploadProductImages = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID de producto inválido' });
  }

  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return res.status(400).json({ message: 'No se subieron archivos de imagen.' });
  }

  // Limitar a 3 imágenes máximo
  const files = req.files.slice(0, 3);
  const imageUrls = files.map((file) => `/uploads/${file.filename}`);

  try {
    // Actualizar los campos imageUrl, imageUrl2, imageUrl3
    const updateData: any = {};
    if (imageUrls[0]) updateData.imageUrl = imageUrls[0];
    if (imageUrls[1]) updateData.imageUrl2 = imageUrls[1];
    if (imageUrls[2]) updateData.imageUrl3 = imageUrls[2];

    const updatedProduct = await productService.updateProduct(id, updateData);
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error al guardar URLs de imágenes:', error);
    res.status(500).json({ message: 'Error al actualizar las imágenes del producto', error });
  }
};

export const handleUploadProductImageByIndex = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { index } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID de producto inválido' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo de imagen.' });
  }

  // Validar que el índice sea válido (0, 1, 2)
  const imageIndex = parseInt(index, 10);
  if (isNaN(imageIndex) || imageIndex < 0 || imageIndex > 2) {
    return res.status(400).json({ message: 'Índice de imagen inválido. Debe ser 0, 1 o 2.' });
  }

  // Construir la URL relativa donde se puede acceder a la imagen
  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    // Determinar qué campo actualizar según el índice
    const updateData: any = {};
    if (imageIndex === 0) {
      updateData.imageUrl = imageUrl;
    } else if (imageIndex === 1) {
      updateData.imageUrl2 = imageUrl;
    } else if (imageIndex === 2) {
      updateData.imageUrl3 = imageUrl;
    }

    const updatedProduct = await productService.updateProduct(id, updateData);
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(`Error al guardar URL de imagen ${imageIndex}:`, error);
    res.status(500).json({ message: `Error al actualizar la imagen ${imageIndex + 1} del producto`, error });
  }
};

export const handleDeleteProductImageByIndex = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { index } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID de producto inválido' });
  }

  // Validar que el índice sea válido (0, 1, 2)
  const imageIndex = parseInt(index, 10);
  if (isNaN(imageIndex) || imageIndex < 0 || imageIndex > 2) {
    return res.status(400).json({ message: 'Índice de imagen inválido. Debe ser 0, 1 o 2.' });
  }

  try {
    // Determinar qué campo poner en null según el índice
    const updateData: any = {};
    if (imageIndex === 0) {
      updateData.imageUrl = null;
    } else if (imageIndex === 1) {
      updateData.imageUrl2 = null;
    } else if (imageIndex === 2) {
      updateData.imageUrl3 = null;
    }

    const updatedProduct = await productService.updateProduct(id, updateData);
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(`Error al eliminar imagen ${imageIndex}:`, error);
    res.status(500).json({ message: `Error al eliminar la imagen ${imageIndex + 1} del producto`, error });
  }
};