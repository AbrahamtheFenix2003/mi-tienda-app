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
  // Log the incoming request body for debugging
  console.log("📦 Purchase creation request received:", JSON.stringify(req.body, null, 2));

  // Validar datos de entrada con Zod
  const validationResult = purchaseSchema.safeParse(req.body);
  if (!validationResult.success) {
    console.error("❌ Validation failed:", validationResult.error.issues);
    return res.status(400).json({ message: "Datos inválidos", errors: validationResult.error.issues });
  }

  console.log("✅ Validation passed:", JSON.stringify(validationResult.data, null, 2));

  // Obtener ID del usuario autenticado
  const userId = req.user?.id;
  if (!userId) {
    console.error("❌ User not authenticated");
    return res.status(401).json({ message: "Usuario no autenticado." });
  }

  console.log("👤 User ID:", userId);

  try {
    const newPurchase = await purchasesService.createPurchase(validationResult.data, userId);
    console.log("✅ Purchase created successfully:", newPurchase.id);
    res.status(201).json(newPurchase);
  } catch (error: any) {
    console.error("❌ Error al crear la compra:", error);
    console.error("Error stack:", error.stack);

    // Handle specific database errors
    if (error.code === 'P2003') {
      // Check if it's a user foreign key error
      if (error.meta?.constraint === 'Purchase_registeredById_fkey') {
        return res.status(401).json({
          message: 'Sesión inválida. Por favor, cierra sesión y vuelve a iniciar sesión.',
          error: 'El usuario asociado a tu sesión no existe en la base de datos.'
        });
      }

      return res.status(400).json({
        message: 'Error de referencia: El proveedor o producto no existe',
        error: error.message
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({
        message: 'Conflicto: Ya existe un registro con esos datos',
        error: error.message
      });
    }

    // Podrías añadir manejo específico para errores de FK (producto/proveedor no existen) si es necesario
    res.status(500).json({ message: 'Error interno al crear la compra', error: error.message, details: error.stack });
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