import { Router } from 'express';
import healthRoutes from './routes/health.routes.js';
import categoryRoutes from './routes/categories.routes.js';
import productRoutes from './routes/products.routes.js';
import authRoutes from './routes/auth.routes.js';
import supplierRoutes from './routes/suppliers.routes.js';
import purchaseRoutes from './routes/purchases.routes.js';
import salesRoutes from './routes/sales.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import cashRoutes from './routes/cash.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const router = Router();

// Health check endpoint (no auth required)
router.use('/health', healthRoutes);

// <-- 2. MONTAR RUTAS DE AUTH -->
router.use('/auth', authRoutes);
 
// Montar las rutas de categorías
router.use('/categories', categoryRoutes);
 
// Montar rutas de productos
router.use('/products', productRoutes);
 
// Montar rutas de proveedores
router.use('/suppliers', supplierRoutes);
 
// Montar rutas de compras
router.use('/purchases', purchaseRoutes);
 
// Montar rutas de ventas
router.use('/sales', salesRoutes);

// Montar rutas de inventario
router.use('/inventory', inventoryRoutes);

// Montar rutas de caja
router.use('/cash', cashRoutes);

// Montar rutas de reportes
router.use('/reports', reportsRoutes);

// Montar rutas del dashboard
router.use('/dashboard', dashboardRoutes);
 
export default router;
