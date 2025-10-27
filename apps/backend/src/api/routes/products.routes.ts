import { Router } from 'express';
import * as productController from '../../controllers/products.controller.js';
import { authenticateToken, authorizeRole } from '../../middlewares/auth.middleware.js';
import { Role } from '@mi-tienda/types';
import upload from '../../config/multer.js';
 
const router = Router();
const SUPER_ADMIN_ONLY: Role[] = ['SUPER_ADMIN'];
 
// --- Rutas Públicas (GET) ---
router.get('/', productController.handleGetAllProducts);
router.get('/:id', productController.handleGetProductById);
 
// --- Rutas Protegidas (Solo SUPER_ADMIN) ---
 
// POST /api/v1/products
router.post(
  '/',
  authenticateToken,
  authorizeRole(SUPER_ADMIN_ONLY),
  productController.handleCreateProduct
);
 
// PUT /api/v1/products/:id
router.put(
  '/:id',
  authenticateToken,
  authorizeRole(SUPER_ADMIN_ONLY),
  productController.handleUpdateProduct
);
 
// DELETE /api/v1/products/:id
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole(SUPER_ADMIN_ONLY),
  productController.handleDeleteProduct
);
 
// --- NUEVA RUTA PARA SUBIR IMAGEN ---
// POST /api/v1/products/:id/upload-image
router.post(
  '/:id/upload-image',
  authenticateToken,
  authorizeRole(SUPER_ADMIN_ONLY),
  upload.single('image'),
  productController.handleUploadProductImage
);
// ------------------------------------
 
export default router;
