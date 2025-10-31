# Arquitectura del Sistema

Visión general del monorepo, puntos de entrada, relaciones de componentes y flujos críticos para inventario y compras.

## Estructura y Entradas

- Monorepo con workspaces: frontend, backend y tipos compartidos.
- Puertos:
  - Backend: http://localhost:8080
  - Frontend: http://localhost:3000

### Backend (Express + TypeScript + Prisma)

- Entrada y arranque:
  - [server.ts](apps/backend/src/server.ts:1) inicia Express con PORT de entorno y log.
  - [app.ts](apps/backend/src/app.ts:1) configura middlewares base, JSON, urlencoded, CORS y estáticos:
    - Sirve estáticos desde /uploads → [app.ts](apps/backend/src/app.ts:20)
- Enrutamiento principal:
  - [api/index.ts](apps/backend/src/api/index.ts:1) monta subrutas bajo /api/v1:
    - /auth → [auth.routes.ts](apps/backend/src/api/routes/auth.routes.ts:1)
    - /categories → [categories.routes.ts](apps/backend/src/api/routes/categories.routes.ts:1)
    - /products → [products.routes.ts](apps/backend/src/api/routes/products.routes.ts:1)
    - /suppliers → [suppliers.routes.ts](apps/backend/src/api/routes/suppliers.routes.ts:1)
    - /purchases → [purchases.routes.ts](apps/backend/src/api/routes/purchases.routes.ts:1)
    - /sales → [sales.routes.ts](apps/backend/src/api/routes/sales.routes.ts:1)
- Seguridad:
  - Autenticación y autorización por rol con JWT:
    - [authenticateToken()](apps/backend/src/middlewares/auth.middleware.ts:15)
    - [authorizeRole()](apps/backend/src/middlewares/auth.middleware.ts:38)
- Subida y almacenamiento de archivos:
  - Multer con almacenamiento en disco y validación de imágenes:
    - [multer.ts](apps/backend/src/config/multer.ts:1)
  - Exposición de archivos subidos:
    - [app.ts](apps/backend/src/app.ts:21)

### Frontend (Next.js App Router + React Query + Auth Context)

- Proveedores globales:
  - Layout global con AuthProvider y QueryProvider:
    - [app/layout.tsx](apps/frontend/app/layout.tsx:13)
    - [QueryProvider.tsx](apps/frontend/components/QueryProvider.tsx:1)
    - [useAuth.tsx](apps/frontend/hooks/useAuth.tsx:1)
- Cliente HTTP:
  - Axios configurado con baseURL y helper para Authorization:
    - [services/api.ts](apps/frontend/services/api.ts:1)
- Imágenes remotas:
  - Patrón remoto para http://localhost:8080/uploads/**:
    - [next.config.ts](apps/frontend/next.config.ts:3)

### Tipos Compartidos (packages/types)

- Índice y módulos:
  - [index.ts](packages/types/src/index.ts:1) reexporta user, category, product, supplier, purchase.
- Contratos de dominio y validación:
  - Usuario y Roles: [user.ts](packages/types/src/user.ts:1)
  - Categoría y Zod: [category.ts](packages/types/src/category.ts:1)
  - Producto y Zod: [product.ts](packages/types/src/product.ts:1)
  - Compra y Zod: [purchase.ts](packages/types/src/purchase.ts:1)
  - Venta y Zod: [sale.ts](packages/types/src/sale.ts:1)

## Esquema de Datos (Prisma)

- Definiciones y relaciones principales en [schema.prisma](apps/backend/prisma/schema.prisma:1):
  - Enums: Role, OrderStatus, PaymentMethod, DeliveryMethod, StockMovementType, StockMovementSubType, CashMovementType, PurchaseStatus, LotStatus.
  - Modelos clave:
    - User, Category, Product, Supplier, Purchase, PurchaseItem, Sale, SaleItem.
    - Inventario y Caja: StockLot, StockMovement, CashMovement.
  - Relaciones críticas:
    - Product ↔ PurchaseItem ↔ Purchase ↔ Supplier.
    - Product ↔ SaleItem ↔ Sale ↔ User.
    - StockLot referencia Purchase y Supplier, con onDelete adecuados.
    - StockMovement referencia Product, StockLot y User.

## Flujo Crítico: Crear Venta e Impacto en Inventario (FIFO)

- Ruta y control:
  - [sales.routes.ts](apps/backend/src/api/routes/sales.routes.ts:1) define GET/POST y aplica auth/roles.
  - [handleCreateSale()](apps/backend/src/controllers/sales.controller.ts:1) valida con Zod y delega al servicio.
- Servicio transaccional:
  - [createSale()](apps/backend/src/services/sales.service.ts:1) ejecuta lógica ACID con prisma.$transaction:
    1) Validar stock de productos.
    2) Para cada item, descontar de `StockLot` en orden FIFO.
    3) Calcular costo total y ganancia de la venta.
    4) Crear `Sale` y `SaleItem`.
    5) Crear `StockMovement` de SALIDA por cada lote afectado.
    6) Crear `CashMovement` de ENTRADA por el total de la venta.
    7) Actualizar `Product.stock` y `StockLot.quantity`.
    8) Leer venta completa con relaciones y mapear DTO.

### Diagrama de Secuencia: POST /api/v1/sales

```mermaid
sequenceDiagram
autonumber
participant Client
participant Frontend
participant Backend
participant Controller
participant Service
participant Prisma

Client->>Frontend: Submit SaleForm
Frontend->>Backend: POST /api/v1/sales + JWT
Backend->>Controller: Route match sales.routes
Controller->>Controller: Zod parse saleSchema
Controller->>Service: createSale data userId
Service->>Prisma: $transaction begin
Prisma-->>Service: tx handle
Service->>Prisma: findMany Product (check stock)
Service->>Prisma: findMany StockLot (FIFO)
Service->>Prisma: create Sale
Service->>Prisma: createMany SaleItem
Service->>Prisma: updateMany StockLot (decrement stock)
Service->>Prisma: updateMany Product (decrement stock)
Service->>Prisma: createMany StockMovement
Service->>Prisma: create CashMovement
Service->>Prisma: read Sale include relations
Prisma-->>Service: Sale full
Service-->>Controller: Mapped Sale DTO
Controller-->>Frontend: 201 Created JSON
Frontend-->>Client: Render success```

## Flujo: Gestión de Productos e Imágenes

- Endpoints protegidos SUPER_ADMIN:
  - Crear/Actualizar/Eliminar: [products.routes.ts](apps/backend/src/api/routes/products.routes.ts:16)
- Subida de imágenes:
  - Single: [handleUploadProductImage()](apps/backend/src/controllers/products.controller.ts:130) con [upload.single](apps/backend/src/api/routes/products.routes.ts:42)
  - Múltiples: [handleUploadProductImages()](apps/backend/src/controllers/products.controller.ts:155) con [upload.array](apps/backend/src/api/routes/products.routes.ts:51)
  - Por índice 0..2: [handleUploadProductImageByIndex()](apps/backend/src/controllers/products.controller.ts:185)
  - Borrado por índice: [handleDeleteProductImageByIndex()](apps/backend/src/controllers/products.controller.ts:225)
- Exposición pública de archivos:
  - [app.ts](apps/backend/src/app.ts:21) sirve /uploads/**

## Seguridad y Autorización

- Autenticación:
  - [authenticateToken()](apps/backend/src/middlewares/auth.middleware.ts:15) verifica JWT con JWT_SECRET.
- Autorización por roles:
  - [authorizeRole()](apps/backend/src/middlewares/auth.middleware.ts:38) compara contra roles permitidos por ruta.
- Frontend:
  - Contexto de sesión, persistencia y headers:
    - [useAuth.tsx](apps/frontend/hooks/useAuth.tsx:32) mantiene token y user en localStorage.
    - [setAuthToken()](apps/frontend/services/api.ts:22) inyecta Authorization Bearer.

## Decisiones Técnicas Clave

- Node ESM + TypeScript NodeNext:
  - Importaciones con sufijo .js en runtime ESM.
- Prisma como ORM con PostgreSQL:
  - Tipado estricto y mapping a DTO para frontend: [sales.service.ts](apps/backend/src/services/sales.service.ts:1)
- Validación en frontera:
  - Zod en shared types y validación en controller: [sales.controller.ts](apps/backend/src/controllers/sales.controller.ts:1)
- State Management:
  - TanStack Query con cliente singleton browser: [QueryProvider.tsx](apps/frontend/components/QueryProvider.tsx:24)

## Mapa de Directorios Relevantes

- Backend
  - app/server: [app.ts](apps/backend/src/app.ts:1), [server.ts](apps/backend/src/server.ts:1)
  - api: [index.ts](apps/backend/src/api/index.ts:1) y subrutas
  - controllers/services: capas separadas p/ negocio
  - middlewares: [auth.middleware.ts](apps/backend/src/middlewares/auth.middleware.ts:1)
  - config: [multer.ts](apps/backend/src/config/multer.ts:1)
  - prisma: [schema.prisma](apps/backend/prisma/schema.prisma:1), migrations
- Frontend
  - app router: [app/layout.tsx](apps/frontend/app/layout.tsx:13)
  - providers: [QueryProvider.tsx](apps/frontend/components/QueryProvider.tsx:1), [useAuth.tsx](apps/frontend/hooks/useAuth.tsx:1)
  - services: [api.ts](apps/frontend/services/api.ts:1)
  - next config: [next.config.ts](apps/frontend/next.config.ts:3)
- Shared Types
  - índice: [index.ts](packages/types/src/index.ts:1)
  - dominios: [product.ts](packages/types/src/product.ts:1), [purchase.ts](packages/types/src/purchase.ts:1), [category.ts](packages/types/src/category.ts:1), [user.ts](packages/types/src/user.ts:1), [sale.ts](packages/types/src/sale.ts:1)

## Puntos de Atención y Extensiones

- Consistencia de Roles:
  - Roles fuentes en Prisma y en [user.ts](packages/types/src/user.ts:5). Mantener alineados.
- Integridad de inventario:
  - Todas las mutaciones de stock deben generar StockMovement y actualizar Product.stock en transacción.
- Próximas extensiones sugeridas:
  - Endpoints PUT/DELETE de ventas para anulación y edición.
  - Auditoría de CashMovement en compras según método de pago.