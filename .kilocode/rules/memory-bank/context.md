# Contexto Actual

## Foco de Trabajo

El foco actual del desarrollo es la implementación y estabilización del módulo de **Punto de Venta (POS)**. Se ha completado la funcionalidad crítica para crear una venta, con su correspondiente impacto transaccional en el inventario (descuento de lotes FIFO) y en la caja.

## Cambios Recientes

-   **Módulo de Ventas (Backend)**: Se implementó el endpoint `POST /api/v1/sales` que, de forma transaccional:
    -   Valida el stock disponible.
    -   Descuenta productos de los lotes de stock más antiguos (FIFO).
    -   Calcula el costo y la ganancia de la venta.
    -   Crea registros en los modelos `Sale`, `SaleItem`.
    -   Genera `StockMovement` de salida y `CashMovement` de entrada.
    -   Actualiza el stock en los modelos `Product` y `StockLot`.
-   **Módulo de Ventas (Frontend)**: Se desarrolló la interfaz en `apps/frontend` para:
    -   Listar las ventas existentes (`/punto-de-ventas`).
    -   Crear nuevas ventas (`/punto-de-ventas/nuevo`) a través de un formulario con búsqueda de productos y un carrito de compras dinámico.
-   **Validación Zod**: Se integró `zod` en el backend y frontend para validar los formularios de creación de ventas.
-   **Tipos y Esquema**: Se añadieron los modelos `Sale` y `SaleItem` al `schema.prisma` y los tipos correspondientes en `packages/types`.

## Próximos Pasos

1.  **Anulación de Ventas**: Implementar la funcionalidad para anular una venta existente. Esto requerirá una lógica transaccional para revertir los movimientos de stock y de caja.
2.  **Detalles de Venta**: Crear un modal o página para ver los detalles completos de una venta.
3.  **Edición de Compras**: Continuar con la implementación de la edición de compras, que fue pausada para priorizar el módulo de ventas.
4.  **Reportería de Ventas**: Desarrollar vistas en el frontend para analizar las ventas por día, por producto y por vendedor.