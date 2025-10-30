# Descripción del Producto

## Propósito del Proyecto

Este proyecto, "Mi Tienda", es una aplicación web full-stack diseñada para ser una solución integral de e-commerce. Combina un **panel de administración** para la gestión interna del negocio con una **tienda en línea (storefront)** de cara al cliente.

El objetivo es centralizar y automatizar las operaciones clave, desde la compra de mercancía a proveedores hasta la venta final a clientes, manteniendo un control preciso del stock y la contabilidad básica, y ofreciendo una experiencia de compra fluida.

## Problemas que Resuelve

1.  **Doble Plataforma:** Evita la necesidad de sistemas separados para la gestión interna (ERP/POS) y la venta online (e-commerce), unificando todo en una sola aplicación.
2.  **Control de Inventario Sincronizado:** Reemplaza sistemas manuales propensos a errores por un inventario automatizado y en tiempo real que se actualiza tanto con las compras a proveedores como con las ventas a clientes.
3.  **Trazabilidad de Productos:** Implementa un sistema de lotes (FIFO) que permite conocer el costo de adquisición exacto de cada producto vendido, mejorando el cálculo de la rentabilidad.
4.  **Gestión Centralizada:** Unifica la gestión de productos, categorías, proveedores, compras y ventas en una única plataforma accesible para el personal autorizado.
5.  **Experiencia de Cliente Moderna:** Ofrece a los clientes una interfaz de tienda online para explorar productos por categorías, buscar y filtrar, y eventualmente, realizar compras.

## Cómo Debería Funcionar

La aplicación se divide en dos grandes áreas:

1.  **Panel de Administración (`/admin`):** Una interfaz interna protegida por roles para la gestión del negocio.
    -   **SUPER_ADMIN:** Control total sobre usuarios, productos, categorías, proveedores y transacciones.
    -   **SUPER_VENDEDOR:** Puede gestionar inventario (compras) y realizar ventas.
    -   **VENDEDOR:** Rol limitado, enfocado en registrar ventas.

2.  **Tienda en Línea (Storefront - `/`):** Una interfaz pública para que los clientes exploren y compren productos.
    -   Vista de catálogo de productos.
    -   Navegación por categorías.
    -   Búsqueda y filtrado por nombre, precio, etc.
    -   (A futuro) Carrito de compras y proceso de checkout.

El flujo de inventario es central: se inicia con el **registro de una compra** a un proveedor en el panel de admin, lo que crea **lotes de stock**. Cuando un cliente realiza una **venta** a través de la tienda online, el sistema descuenta los productos de los lotes más antiguos (FIFO).

## Objetivos de Experiencia de Usuario (UX)

### Para el Panel de Administración:

-   **Eficiencia Operativa:** Formularios rápidos e intuitivos para la gestión diaria.
-   **Claridad de la Información:** Listados claros con búsqueda y filtrado potentes.
-   **Seguridad y Roles:** La interfaz se adapta al rol del usuario, mostrando solo las acciones permitidas.

### Para la Tienda en Línea:

-   **Navegación Intuitiva:** Los clientes deben poder encontrar productos fácilmente.
-   **Diseño Atractivo y Responsivo:** Una experiencia de compra agradable en cualquier dispositivo.
-   **Rendimiento Rápido:** Tiempos de carga optimizados para no perder ventas.