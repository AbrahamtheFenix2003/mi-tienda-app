// apps/backend/src/api/routes/dashboard.routes.ts

import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { DashboardController } from '../../controllers/dashboard.controller.js';

const router = Router();
const controller = new DashboardController();

// Ruta para obtener estadísticas del dashboard
// Solo usuarios autenticados pueden acceder
router.get('/stats', authenticateToken, controller.handleGetDashboardStats);

// Ruta para obtener datos de gráficos con filtro de período
// Query params: startDate (ISO), endDate (ISO)
router.get('/charts', authenticateToken, controller.handleGetChartsData);

export default router;