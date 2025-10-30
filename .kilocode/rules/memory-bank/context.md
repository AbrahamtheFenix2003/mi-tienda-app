# Contexto Actual

## Foco de Trabajo

El foco actual del desarrollo es estabilizar y expandir el módulo de **Compras e Inventario**. La funcionalidad crítica de crear una compra y su impacto transaccional en el stock (lotes y movimientos) está implementada.

## Cambios Recientes

-   **Creación de Compras**: Se implementó el endpoint `POST /api/v1/purchases` que, de forma transaccional, crea la compra, genera lotes de stock y registra los movimientos de inventario correspondientes.
-   **Validación Zod**: Se integró `zod` en el backend y frontend para validar los formularios de creación de compras, asegurando la integridad de los datos.
-   **Interfaz de Compras**: Se desarrolló la interfaz en `apps/frontend` para listar y crear nuevas compras, incluyendo búsqueda de productos y un carrito de compras.

## Próximos Pasos

1.  **Edición de Compras**: Implementar la funcionalidad para editar una compra existente. Esto requerirá lógica transaccional compleja para revertir o ajustar los movimientos de stock y lotes previos.
2.  **Anulación de Compras**: Crear el flujo para anular una compra, que también debe revertir los movimientos de inventario asociados.
3.  **Reportería Básica**: Desarrollar vistas en el frontend para visualizar los movimientos de stock por producto y un historial de compras por proveedor.
4.  **Gestión de Caja**: Implementar los `CashMovement` para que se registren automáticamente al crear una compra, afectando el saldo de caja según el método de pago.