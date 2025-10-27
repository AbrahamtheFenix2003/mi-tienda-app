import { Router } from 'express';
import categoryRoutes from './routes/categories.routes.js';
import productRoutes from './routes/products.routes.js';
import authRoutes from './routes/auth.routes.js';
import supplierRoutes from './routes/suppliers.routes.js';
 
const router = Router();
 
// <-- 2. MONTAR RUTAS DE AUTH -->
router.use('/auth', authRoutes);
 
// Montar las rutas de categorías
router.use('/categories', categoryRoutes);
 
// Montar rutas de productos
router.use('/products', productRoutes);
 
// Montar rutas de proveedores
router.use('/suppliers', supplierRoutes);
 
// ... aquí montaremos /orders, etc.
 
export default router;