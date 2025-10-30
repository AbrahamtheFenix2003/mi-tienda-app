import { Router } from 'express';
import * as purchaseController from '../../controllers/purchases.controller.js';
import { authenticateToken, authorizeRole } from '../../middlewares/auth.middleware.js';
import type { Role } from '@mi-tienda/types';

const router = Router();
const allowedRoles: Role[] = ['SUPER_ADMIN', 'SUPER_VENDEDOR'];

router.use(authenticateToken);
router.use(authorizeRole(allowedRoles));

// GET endpoints - Implementados
router.get('/', purchaseController.handleGetAllPurchases);
router.get('/:id', purchaseController.handleGetPurchaseById);

// POST endpoint - Crear nueva compra
router.post('/', purchaseController.handleCreatePurchase);

// PUT /:id - Actualizar compra
router.put('/:id', purchaseController.handleUpdatePurchase);

// PUT /:id/annul - Anular compra
router.put('/:id/annul', purchaseController.handleAnnulPurchase);

// DELETE /:id (Eliminar compra)
// router.delete('/:id', purchaseController.handleDeletePurchase);

export default router;