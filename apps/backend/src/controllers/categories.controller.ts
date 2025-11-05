import { Request, Response } from 'express';
import * as categoryService from '../services/categories.service.js';

export const handleGetAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las categorías', error });
  }
};

export const handleCreateCategory = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'El nombre es requerido' });
  }

  try {
    const newCategory = await categoryService.createCategory(name);
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la categoría', error });
  }
};

export const handleUpdateCategory = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { name } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID de categoría inválido' });
  }

  if (!name) {
    return res.status(400).json({ message: 'El nombre es requerido' });
  }

  try {
    const updatedCategory = await categoryService.updateCategory(id, name);
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la categoría', error });
  }
};

export const handleDeleteCategory = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID de categoría inválido' });
  }

  try {
    await categoryService.deleteCategory(id);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la categoría', error });
  }
};

export const handleGetCategoryById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID de categoría inválido' });
  }

  try {
    const category = await categoryService.getCategoryById(id);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la categoría', error });
  }
};

export const handleGetCategoryProducts = async (req: Request, res: Response) => {
  const categoryId = parseInt(req.params.id, 10);

  if (isNaN(categoryId)) {
    return res.status(400).json({ message: 'ID de categoría inválido' });
  }

  try {
    const products = await categoryService.getCategoryProducts(categoryId);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos de la categoría', error });
  }
};