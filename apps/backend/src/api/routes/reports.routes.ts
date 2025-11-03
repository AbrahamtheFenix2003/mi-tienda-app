// apps/backend/src/api/routes/reports.routes.ts

import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { ReportsController } from '../../controllers/reports.controller.js';

const router = Router();
const reportsController = new ReportsController();

router.get('/sales', authenticateToken, reportsController.handleGetSalesReport);

export default router;
