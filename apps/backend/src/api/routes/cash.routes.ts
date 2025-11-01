// apps/backend/src/api/routes/cash.routes.ts

import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { CashController } from '../../controllers/cash.controller.js';

const router = Router();
const controller = new CashController();

// Ruta para obtener todos los movimientos de caja
// Solo usuarios autenticados pueden acceder
router.get('/movements', authenticateToken, controller.handleGetCashMovements);

export default router;