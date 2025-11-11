# Arquitectura del Sistema

## Estructura General
Mi Tienda App es una aplicación full-stack construida como un monorepo con tres componentes principales:
- Backend: API RESTful con Express.js y TypeScript
- Frontend: Aplicación web con Next.js 16 y React
- Packages: Paquete compartido de tipos TypeScript

## Arquitectura del Backend
- **Rutas**: `apps/backend/src/api/routes/` - Definición de endpoints API
- **Controladores**: `apps/backend/src/controllers/` - Lógica de manejo de requests
- **Servicios**: `apps/backend/src/services/` - Lógica de negocio
- **Middlewares**: `apps/backend/src/middlewares/` - Autenticación y validación
- **Utilidades**: `apps/backend/src/utils/` - Configuraciones como Prisma
- **Archivos estáticos**: `apps/backend/uploads/` - Almacenamiento de imágenes

## Arquitectura del Frontend
- **Páginas**: `apps/frontend/app/` - Rutas usando App Router de Next.js
- **Componentes**: `apps/frontend/components/` - Componentes reutilizables
- **Servicios**: `apps/frontend/services/` - Llamadas a la API
- **Hooks**: `apps/frontend/hooks/` - Lógica de estado
- **Contextos**: `apps/frontend/contexts/` - Manejo de estado global
- **Utilidades**: `apps/frontend/lib/` y `apps/frontend/utils/` - Funciones auxiliares

## Componentes del Frontend
- **Layout**: `apps/frontend/components/layout/` - Estructura común de la aplicación
- **UI**: `apps/frontend/components/ui/` - Componentes de interfaz base
- **Admin**: `apps/frontend/components/admin/` - Componentes específicos del panel administrativo
- **Store**: `apps/frontend/components/store/` - Componentes específicos de la tienda pública

## Servicios del Backend
- **Auth Service**: `apps/backend/src/services/auth.service.ts` - Manejo de autenticación y autorización
- **Products Service**: `apps/backend/src/services/products.service.ts` - Gestión de productos
- **Sales Service**: `apps/backend/src/services/sales.service.ts` - Procesamiento de ventas con lógica FIFO
- **Purchases Service**: `apps/backend/src/services/purchases.service.ts` - Gestión de compras
- **Inventory Service**: `apps/backend/src/services/inventory.service.ts` - Control de inventario
- **Cash Service**: `apps/backend/src/services/cash.service.ts` - Movimientos de caja
- **Dashboard Service**: `apps/backend/src/services/dashboard.service.ts` - Métricas y estadísticas

## Base de Datos
- **ORM**: Prisma con PostgreSQL
- **Esquema**: `apps/backend/prisma/schema.prisma` - Definición de modelos
- **Migraciones**: `apps/backend/prisma/migrations/` - Historial de cambios en DB
- **Seed**: `apps/backend/prisma/seed.ts` - Datos iniciales para desarrollo

## Modelo de Datos Principal
- **Usuarios**: Autenticación con JWT y roles jerárquicos
- **Productos**: Con control de stock, precios y múltiples imágenes
- **Categorías**: Jerarquía para organizar productos
- **Proveedores**: Con eliminación lógica
- **Ventas**: Con múltiples métodos de pago y deducción FIFO
- **Compras**: Con control de lotes y costos
- **Lotes de Stock**: Sistema FIFO para trazabilidad
- **Movimientos de Stock**: Registro completo de cambios
- **Movimientos de Caja**: Control financiero con trazabilidad

## Patrones de Diseño Clave
- **Arquitectura por capas**: Routes → Controllers → Services → Prisma
- **Sistema FIFO**: Para la gestión de inventario y cálculo de costos
- **Eliminación lógica**: Para productos y proveedores
- **Validación con Zod**: En ambos frontend y backend
- **Gestión de estado con React Query**: Para datos del servidor

## Rutas API Principales
- `POST /api/auth/login` - Autenticación
- `GET /api/products` - Listado de productos
- `POST /api/sales` - Procesamiento de ventas
- `POST /api/purchases` - Registro de compras
- `GET /api/dashboard/stats` - Métricas del panel
- `GET /api/inventory/movements` - Movimientos de stock
- `GET /api/cash/movements` - Movimientos de caja

## Configuración de Docker
- **docker-compose.yml**: Orquestación de servicios
- **Dockerfile**: Backend y frontend
- **Red interna**: Comunicación entre servicios
- **Volúmenes**: Persistencia de datos y hot reload en desarrollo