// apps/backend/src/api/routes/cash.routes.ts

import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { CashController } from '../../controllers/cash.controller.js';

const router = Router();
const controller = new CashController();

// Ruta para obtener todos los movimientos de caja
// Solo usuarios autenticados pueden acceder
router.get('/movements', authenticateToken, controller.handleGetCashMovements);

// Rutas para movimientos manuales de caja
// Solo usuarios autenticados pueden acceder
router.post('/manual', authenticateToken, controller.handleCreateManualMovement);
router.put('/manual/:id', authenticateToken, controller.handleUpdateManualMovement);
router.delete('/manual/:id', authenticateToken, controller.handleDeleteManualMovement);

export default router;