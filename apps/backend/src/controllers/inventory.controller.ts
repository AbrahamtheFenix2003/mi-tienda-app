// apps/backend/src/controllers/inventory.controller.ts

import { Request, Response } from 'express';
import { inventoryService } from '../services/inventory.service.js';

export const inventoryController = {
  /**
   * Handler para obtener todos los lotes de stock
   */
  async handleGetStockLots(req: Request, res: Response) {
    try {
      const lots = await inventoryService.getStockLots();
      return res.status(200).json(lots);
    } catch (error) {
      console.error('Error en handleGetStockLots:', error);
      return res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  /**
   * Handler para obtener todos los movimientos de stock
   */
  async handleGetStockMovements(req: Request, res: Response) {
    try {
      const movements = await inventoryService.getStockMovements();
      return res.status(200).json(movements);
    } catch (error) {
      console.error('Error en handleGetStockMovements:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  /**
   * Handler para obtener los lotes de un producto específico
   */
  async handleGetProductStockLots(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const id = parseInt(productId, 10);

      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID de producto inválido' });
      }

      const lots = await inventoryService.getProductStockLots(id);
      return res.status(200).json(lots);
    } catch (error) {
      console.error('Error en handleGetProductStockLots:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },
};