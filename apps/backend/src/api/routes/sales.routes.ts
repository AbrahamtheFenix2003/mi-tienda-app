// apps/backend/src/api/routes/sales.routes.ts

import { Router } from 'express';
import * as salesController from '../../controllers/sales.controller.js';
import { authenticateToken, authorizeRole } from '../../middlewares/auth.middleware.js';
import { Role } from '@mi-tienda/types';

const router = Router();
const allowedRoles: Role[] = ['SUPER_ADMIN', 'SUPER_VENDEDOR', 'VENDEDOR'];

router.use(authenticateToken);
router.use(authorizeRole(allowedRoles));

// GET endpoints - Implementados
router.get('/', salesController.handleGetAllSales);
router.get('/:id', salesController.handleGetSaleById);

// POST endpoint - Crear nueva venta
router.post('/', salesController.handleCreateSale);

// Placeholders para futuras implementaciones (PUT, DELETE)

// PUT /:id - Actualizar venta
// router.put('/:id', salesController.handleUpdateSale);

// DELETE /:id (Eliminar venta)
// router.delete('/:id', salesController.handleDeleteSale);

// PUT /:id/annul - Anular venta
router.put('/:id/annul', salesController.handleAnnulSale);

export default router;