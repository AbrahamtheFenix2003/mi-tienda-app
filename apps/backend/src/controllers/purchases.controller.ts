import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { purchaseSchema } from '@mi-tienda/types';
import * as purchasesService from '../services/purchases.service.js';

export const handleGetAllPurchases = async (req: Request, res: Response) => {
  try {
    const purchases = await purchasesService.getAllPurchases();
    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener compras', error });
  }
};

export const handleGetPurchaseById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID de compra inválido' });
  }

  try {
    const purchase = await purchasesService.getPurchaseById(id);
    if (!purchase) {
      return res.status(404).json({ message: 'Compra no encontrada' });
    }
    res.status(200).json(purchase);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la compra', error });
  }
};

export const handleCreatePurchase = async (req: AuthRequest, res: Response) => {
  // Validar datos de entrada con Zod
  const validationResult = purchaseSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ message: "Datos inválidos", errors: validationResult.error.issues });
  }

  // Obtener ID del usuario autenticado
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Usuario no autenticado." });
  }

  try {
    const newPurchase = await purchasesService.createPurchase(validationResult.data, userId);
    res.status(201).json(newPurchase);
  } catch (error: any) {
    console.error("Error al crear la compra:", error);
    // Podrías añadir manejo específico para errores de FK (producto/proveedor no existen) si es necesario
    res.status(500).json({ message: 'Error interno al crear la compra', error: error.message });
  }
};

// Placeholders para métodos futuros (PUT, DELETE)
// export const handleUpdatePurchase = async (req: Request, res: Response) => {
//   // TODO: Implementar actualización de compra
// };

// export const handleDeletePurchase = async (req: Request, res: Response) => {
//   // TODO: Implementar eliminación de compra
// };