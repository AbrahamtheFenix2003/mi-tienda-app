# Contexto Actual

## Foco de Trabajo

El foco de trabajo se ha centrado en la creación del nuevo módulo de **Gestión de Almacén**. Se ha sentado la base tanto en el backend como en el frontend para visualizar el estado del inventario.

## Cambios Recientes

-   **Módulo de Almacén (Frontend)**: Se ha creado la página principal en `apps/frontend/app/(admin)/almacen/page.tsx`.
    -   Implementa una interfaz de pestañas para "Lotes de Stock" y "Historial de Movimientos".
    -   Utiliza TanStack Query para cargar los datos de ambos endpoints del backend de forma paralela.
    -   Maneja los estados de carga, error y vacío para una mejor experiencia de usuario.
-   **Componentes de Tabla (Frontend)**: Se crearon los componentes `StockLotsTable` y `StockMovementsTable` para renderizar los datos en la página de "Almacén".
-   **Servicio de Inventario (Frontend)**: Se creó `apps/frontend/services/inventoryService.ts` con las funciones `fetchStockLots` y `fetchStockMovements` para comunicarse con la API.
-   **Tipos Compartidos**: Se ha añadido el fichero `packages/types/src/inventory.ts` con las interfaces `StockLot` y `StockMovement`, y los enums correspondientes. Se han exportado correctamente en el `index.ts` del paquete.
-   **Endpoints de Inventario (Backend)**: Se implementaron endpoints de solo lectura para consultar el estado del inventario:
    -   `GET /api/v1/inventory/lots`: Obtiene todos los lotes de stock con sus relaciones (producto y proveedor).
    -   `GET /api/v1/inventory/movements`: Obtiene todos los movimientos de stock con sus relaciones (producto, lote y usuario).
    -   Ambos endpoints están protegidos por autenticación JWT y autorización por roles (SUPER_ADMIN, SUPER_VENDEDOR).

## Próximos Pasos

1.  **Flujo de Caja**: Implementar la funcionalidad para visualizar y gestionar los movimientos de caja.
2.  **Edición de Compras**: Continuar con la implementación de la edición de compras, que fue pausada para priorizar el módulo de ventas.
3.  **Reportería de Ventas**: Desarrollar vistas en el frontend para analizar las ventas por día, por producto y por vendedor.