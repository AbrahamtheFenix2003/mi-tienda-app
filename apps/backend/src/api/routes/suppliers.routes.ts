import { Router } from 'express';
import * as supplierController from '../../controllers/suppliers.controller.js';
import { authenticateToken, authorizeRole } from '../../middlewares/auth.middleware.js';
import { Role } from '@mi-tienda/types';

const router = Router();
const allowedRoles: Role[] = ['SUPER_ADMIN', 'SUPER_VENDEDOR'];

router.use(authenticateToken);
router.use(authorizeRole(allowedRoles));

// CRUD
router.get('/', supplierController.handleGetAllSuppliers);
router.get('/:id', supplierController.handleGetSupplierById);
router.post('/', supplierController.handleCreateSupplier);
router.put('/:id', supplierController.handleUpdateSupplier);
router.delete('/:id', supplierController.handleDeleteSupplier);

export default router;