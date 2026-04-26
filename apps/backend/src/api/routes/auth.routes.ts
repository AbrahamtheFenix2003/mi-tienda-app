import { Router } from 'express';
import * as authController from '../../controllers/auth.controller.js';
import { authenticateToken, authorizeRole } from '../../middlewares/auth.middleware.js';

const router = Router();

// POST /api/v1/auth/login - Público
router.post('/login', authController.handleLogin);

// POST /api/v1/auth/register - Solo SUPER_ADMIN puede crear usuarios
router.post(
  '/register',
  authenticateToken,
  authorizeRole(['SUPER_ADMIN']),
  authController.handleRegister
);

export default router;