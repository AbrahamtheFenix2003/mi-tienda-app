Este es un proyecto de aplicación web full-stack desarrollado en un monorepo. La aplicación está diseñada para ser una solución integral de e-commerce, combinando un panel de administración para la gestión del negocio con una tienda en línea para clientes.

- **Frontend**: Construido con Next.js y TypeScript, ubicado en `apps/frontend`. Proporciona tanto el panel de administración para la gestión de inventario y compras, como la tienda en línea (storefront) para los clientes.

- **Backend**: Construido con Node.js, Express y TypeScript, ubicado en `apps/backend`. Gestiona la lógica de negocio, la autenticación y las operaciones de la base de datos a través de una API REST. Utiliza Prisma como ORM para interactuar con la base de datos.

- **Tipos Compartidos**: El directorio `packages/types` contiene las definiciones de tipos de TypeScript que se comparten entre el frontend y el backend, asegurando la consistencia de los datos en toda la aplicación.