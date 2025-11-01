// apps/backend/src/api/routes/inventory.routes.ts

import { Router } from 'express';
import { inventoryController } from '../../controllers/inventory.controller.js';
import { authenticateToken, authorizeRole } from '../../middlewares/auth.middleware.js';

const router = Router();

/**
 * @route GET /api/v1/inventory/lots
 * @desc Obtiene todos los lotes de stock
 * @access SUPER_ADMIN, SUPER_VENDEDOR
 */
router.get(
  '/lots',
  authenticateToken,
  authorizeRole(['SUPER_ADMIN', 'SUPER_VENDEDOR']),
  inventoryController.handleGetStockLots
);

/**
 * @route GET /api/v1/inventory/movements
 * @desc Obtiene todos los movimientos de stock
 * @access SUPER_ADMIN, SUPER_VENDEDOR
 */
router.get(
  '/movements',
  authenticateToken,
  authorizeRole(['SUPER_ADMIN', 'SUPER_VENDEDOR']),
  inventoryController.handleGetStockMovements
);

export default router;