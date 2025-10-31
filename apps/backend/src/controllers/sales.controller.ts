// apps/backend/src/controllers/sales.controller.ts

import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { salesService } from '../services/sales.service.js';
import { saleSchema } from '@mi-tienda/types';

export const handleGetAllSales = async (req: Request, res: Response) => {
  try {
    const sales = await salesService.getAllSales();
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ventas', error });
  }
};

export const handleGetSaleById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID de venta inválido' });
  }

  try {
    const sale = await salesService.getSaleById(id);
    if (!sale) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    res.status(200).json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la venta', error });
  }
};

export const handleCreateSale = async (req: AuthRequest, res: Response) => {
  // Validar datos de entrada con Zod
  const validationResult = saleSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    return res.status(400).json({
      message: 'Datos de venta inválidos',
      errors: validationResult.error.issues
    });
  }

  const data = validationResult.data;

  // Verificar que el usuario está autenticado
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }

  try {
    const userId = req.user.id;
    const sale = await salesService.createSale(data, userId);
    res.status(201).json(sale);
  } catch (error: any) {
    // Manejo específico de errores
    if (error.message.includes('Stock insuficiente')) {
      return res.status(409).json({ message: error.message });
    }
    
    res.status(500).json({
      message: 'Error interno del servidor al crear la venta',
      error: error.message
    });
  }
};

// Placeholders para futuras implementaciones (PUT, DELETE)
// export const handleUpdateSale = async (req: AuthRequest, res: Response) => { ... };
// export const handleDeleteSale = async (req: AuthRequest, res: Response) => { ... };