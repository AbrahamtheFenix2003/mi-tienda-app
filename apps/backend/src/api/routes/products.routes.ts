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
 
// --- RUTAS PARA SUBIR IMÁGENES ---
// POST /api/v1/products/:id/upload-image (una sola imagen)
router.post(
  '/:id/upload-image',
  authenticateToken,
  authorizeRole(SUPER_ADMIN_ONLY),
  upload.single('image'),
  productController.handleUploadProductImage
);

// POST /api/v1/products/:id/upload-images (múltiples imágenes, hasta 3)
router.post(
  '/:id/upload-images',
  authenticateToken,
  authorizeRole(SUPER_ADMIN_ONLY),
  upload.array('images', 3),
  productController.handleUploadProductImages
);

// POST /api/v1/products/:id/upload-image/:index (una imagen por índice 0, 1 o 2)
router.post(
  '/:id/upload-image/:index',
  authenticateToken,
  authorizeRole(SUPER_ADMIN_ONLY),
  upload.single('image'),
  productController.handleUploadProductImageByIndex
);

// DELETE /api/v1/products/:id/image/:index (eliminar imagen por índice 0, 1 o 2)
router.delete(
  '/:id/image/:index',
  authenticateToken,
  authorizeRole(SUPER_ADMIN_ONLY),
  productController.handleDeleteProductImageByIndex
);
// ------------------------------------

export default router;
