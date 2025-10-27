import { Router } from 'express';
import * as authController from '../../controllers/auth.controller.js';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', authController.handleRegister);

// POST /api/v1/auth/login
router.post('/login', authController.handleLogin);

export default router;