# Contexto Actual

## Foco de Trabajo

Se amplió el foco hacia el **Flujo de Caja**, añadiendo el endpoint de movimientos de caja en el backend y el tipo compartido correspondiente, manteniendo la base del módulo de **Gestión de Almacén** ya implementada.

## Cambios Recientes

-   **Módulo de Almacén (Frontend)**: Se ha creado la página principal en `apps/frontend/app/(admin)/almacen/page.tsx`.
    -   Implementa una interfaz de pestañas para "Lotes de Stock" y "Historial de Movimientos".
    -   Utiliza TanStack Query para cargar los datos de ambos endpoints del backend de forma paralela.
    -   Maneja los estados de carga, error y vacío para una mejor experiencia de usuario.
-   **Componentes de Tabla (Frontend)**: Se crearon los componentes `StockLotsTable` y `StockMovementsTable` para renderizar los datos en la página de "Almacén".
-   **Servicio de Inventario (Frontend)**: Se creó `apps/frontend/services/inventoryService.ts` con las funciones `fetchStockLots` y `fetchStockMovements` para comunicarse con la API.
-   **Tipos Compartidos**:
    -   Se añadió `packages/types/src/inventory.ts` con las interfaces `StockLot` y `StockMovement`, y los enums correspondientes. Exportado en [`index.ts`](packages/types/src/index.ts:1).
    -   Se añadió `packages/types/src/cash.ts` con el tipo `CashMovementWithRelations` basado en `CashMovement` e incluyendo `user` de forma tipada. Exportado en [`index.ts`](packages/types/src/index.ts:1).
-   **Endpoints de Inventario (Backend)**: Endpoints de solo lectura para consultar el estado del inventario:
    -   `GET /api/v1/inventory/lots`: Obtiene todos los lotes de stock con sus relaciones (producto y proveedor).
    -   `GET /api/v1/inventory/movements`: Obtiene todos los movimientos de stock con sus relaciones (producto, lote y usuario).
    -   Ambos endpoints están protegidos por autenticación JWT y autorización por roles (SUPER_ADMIN, SUPER_VENDEDOR).
-   **Flujo de Caja (Backend)**:
    -   Endpoint `GET /api/v1/cash/movements` implementado y protegido por autenticación JWT.
    -   Lógica de negocio en [`cash.service.ts`](apps/backend/src/services/cash.service.ts:1), controlador en [`cash.controller.ts`](apps/backend/src/controllers/cash.controller.ts:1), rutas en [`cash.routes.ts`](apps/backend/src/api/routes/cash.routes.ts:1) y montaje en el router principal en [`api/index.ts`](apps/backend/src/api/index.ts:1).
    -   Consulta Prisma con `include: { user: true }` y `orderBy: { createdAt: 'desc' }`. No se incluye relación a venta en el payload de caja.

## Próximos Pasos

1.  **Frontend de Caja**: Implementar visualización de movimientos de caja en el panel admin:
    -   Servicio HTTP, hook con React Query y tabla de listado.
2.  **Edición de Compras**: Retomar la implementación de edición de compras.
3.  **Reportería de Ventas**: Vistas para análisis por día, producto y vendedor.
4.  **Tests Backend (opcional)**: Añadir pruebas para el servicio y controlador de caja.