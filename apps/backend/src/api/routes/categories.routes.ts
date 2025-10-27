import { Router } from 'express';
import * as categoryController from '../../controllers/categories.controller.js';
import { authenticateToken, authorizeRole } from '../../middlewares/auth.middleware.js';
import { Role } from '@mi-tienda/types';

const router = Router();
const SUPER_ADMIN_ONLY: Role[] = ['SUPER_ADMIN'];

// GET /api/v1/categories
router.get('/', categoryController.handleGetAllCategories);

// GET /api/v1/categories/:id
router.get('/:id', categoryController.handleGetCategoryById);

// POST /api/v1/categories
router.post(
  '/',
  authenticateToken,
  authorizeRole(SUPER_ADMIN_ONLY),
  categoryController.handleCreateCategory
);

// PUT /api/v1/categories/:id
router.put(
  '/:id',
  authenticateToken,
  authorizeRole(SUPER_ADMIN_ONLY),
  categoryController.handleUpdateCategory
);

// DELETE /api/v1/categories/:id
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole(SUPER_ADMIN_ONLY),
  categoryController.handleDeleteCategory
);

export default router;
