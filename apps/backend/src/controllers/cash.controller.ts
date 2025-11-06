// apps/backend/src/controllers/cash.controller.ts

import { Request, Response } from 'express';
import { CashService } from '../services/cash.service.js';
import { manualMovementSchema } from '@mi-tienda/types';
import { ZodError } from 'zod';

// Interfaz extendida para incluir el usuario en la Request
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export class CashController {
  private cashService: CashService;

  constructor() {
    this.cashService = new CashService();
  }

  handleGetCashMovements = async (req: Request, res: Response) => {
    try {
      const movements = await this.cashService.getCashMovements();
      res.status(200).json(movements);
    } catch (error) {
      console.error('Error in handleGetCashMovements:', error);
      res.status(500).json({ message: 'Error fetching cash movements' });
    }
  };

  handleCreateManualMovement = async (req: Request, res: Response) => {
    try {
      // Validar los datos de entrada con el esquema Zod
      const validatedData = manualMovementSchema.parse(req.body);
      
      // Obtener el ID del usuario desde el token JWT (agregado por el middleware de autenticación)
      const userId = (req as any).user.id;
      
      // Crear el movimiento manual a través del servicio
      const newMovement = await this.cashService.createManualMovement(validatedData, userId);
      
      res.status(201).json(newMovement);
    } catch (error) {
      console.error('Error in handleCreateManualMovement:', error);
      
      if (error instanceof ZodError) {
        // Error de validación de Zod
        res.status(400).json({
          message: 'Datos inválidos',
          errors: error.issues
        });
      } else {
        // Error interno del servidor
        res.status(500).json({ message: 'Error creating manual movement' });
      }
    }
  };

  handleUpdateManualMovement = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Validar los datos de entrada con el esquema Zod (parcial para actualización)
      const validatedData = manualMovementSchema.partial().parse(req.body);

      // Actualizar el movimiento manual a través del servicio
      const updatedMovement = await this.cashService.updateManualMovement(id, validatedData);

      res.status(200).json(updatedMovement);
    } catch (error) {
      console.error('Error in handleUpdateManualMovement:', error);

      if (error instanceof ZodError) {
        // Error de validación de Zod
        res.status(400).json({
          message: 'Datos inválidos',
          errors: error.issues
        });
      } else if (error instanceof Error && error.message.includes('Record to update not found')) {
        // Error de registro no encontrado en Prisma
        res.status(404).json({ message: 'Movimiento no encontrado' });
      } else {
        // Error interno del servidor
        res.status(500).json({ message: 'Error updating manual movement' });
      }
    }
  };

  handleDeleteManualMovement = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Eliminar el movimiento manual a través del servicio
      await this.cashService.deleteManualMovement(id);

      res.status(200).json({ message: 'Movimiento eliminado correctamente' });
    } catch (error) {
      console.error('Error in handleDeleteManualMovement:', error);

      if (error instanceof Error) {
        if (error.message.includes('Movimiento no encontrado')) {
          res.status(404).json({ message: 'Movimiento no encontrado' });
        } else if (error.message.includes('Solo se pueden eliminar movimientos manuales')) {
          res.status(400).json({ message: 'Solo se pueden eliminar movimientos manuales' });
        } else {
          res.status(500).json({ message: error.message });
        }
      } else {
        // Error interno del servidor
        res.status(500).json({ message: 'Error deleting manual movement' });
      }
    }
  };
}