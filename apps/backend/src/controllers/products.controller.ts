import { Request, Response } from 'express';
import * as productService from '../services/products.service.js';
import { ProductData } from '../services/products.service.js';
import { Decimal } from '@prisma/client/runtime/library';
import upload from '../config/multer.js';
import { updateProduct } from '../services/products.service.js';

// Helper para validar los datos de entrada
const validateProductData = (data: any): { error?: string } => {
  if (!data.name) return { error: 'El campo "name" es requerido' };
  if (!data.slug) return { error: 'El campo "slug" es requerido' };
  if (data.price === undefined) return { error: 'El campo "price" es requerido' };
  if (data.stock === undefined) return { error: 'El campo "stock" es requerido' };
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
  const { id } = req.params;
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
    stock: parseInt(data.stock, 10),
    stockMinimo: data.stockMinimo ? parseInt(data.stockMinimo, 10) : undefined,
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
  const { id } = req.params;
  const data = req.body;

  // Conversión de tipos para los campos que vienen
  if (data.price) data.price = new Decimal(data.price);
  if (data.originalPrice) data.originalPrice = new Decimal(data.originalPrice);
  if (data.acquisitionCost) data.acquisitionCost = new Decimal(data.acquisitionCost);
  if (data.stock) data.stock = parseInt(data.stock, 10);
  if (data.stockMinimo) data.stockMinimo = parseInt(data.stockMinimo, 10);

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
  const { id } = req.params;
  try {
    await productService.deleteProduct(id);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error });
  }
};

export const handleUploadProductImage = async (req: Request, res: Response) => {
  const { id } = req.params;

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