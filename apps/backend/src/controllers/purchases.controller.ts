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

export const handleUpdatePurchase = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID de compra inválido' });
  }

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
    const updatedPurchase = await purchasesService.updatePurchase(id, validationResult.data, userId);
    res.status(200).json(updatedPurchase);
  } catch (error: any) {
    console.error("Error al actualizar la compra:", error);

    // Capturar errores de negocio específicos
    if (error.message.includes("utilizado") || error.message.includes("reducir") || error.message.includes("eliminar")) {
      return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    if (error.message.includes("anulada") || error.message.includes("no encontr")) {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: 'Error interno al actualizar la compra', error: error.message });
  }
};

export const handleAnnulPurchase = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID de compra inválido' });
  }

  if (!userId) {
    return res.status(401).json({ message: "Usuario no autenticado." });
  }

  try {
    const annulledPurchase = await purchasesService.annulPurchase(id, userId);
    res.status(200).json(annulledPurchase);
  } catch (error: any) {
    console.error("Error al anular la compra:", error);
    
    // Capturar el error de negocio específico
    if (error.message.includes("ya fue utilizado")) {
      return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    if (error.message.includes("no encontrada") || error.message.includes("ya ha sido anulada")) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Error interno al anular la compra', error: error.message });
  }
};

// export const handleDeletePurchase = async (req: Request, res: Response) => {
//   // TODO: Implementar eliminación de compra
// };