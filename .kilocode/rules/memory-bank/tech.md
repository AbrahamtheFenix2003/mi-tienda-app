# Tecnologías del Proyecto

## Tecnologías Principales

### Backend
- **Runtime**: Node.js v20+
- **Lenguaje**: TypeScript 5+
- **Framework**: Express.js 5.1
- **Base de Datos**: PostgreSQL 16
- **ORM**: Prisma 6.18
- **Autenticación**: JWT (JSON Web Tokens) con bcryptjs para hashing
- **Subida de archivos**: Multer para manejo de imágenes
- **Validación**: Zod para validación de esquemas
- **Servidor HTTP**: tsx para ejecución de TypeScript con hot reload

### Frontend
- **Framework**: Next.js 16 con App Router
- **Lenguaje**: TypeScript 5+
- **Librería UI**: React 19
- **Estilos**: Tailwind CSS 4
- **Gestión de estado**: React Query (@tanstack/react-query) para manejo de datos del servidor
- **Formularios**: React Hook Form con Zod para validación
- **Gráficos**: Recharts para visualizaciones
- **Generación de PDF**: jsPDF para reportes
- **HTTP Client**: Axios para llamadas a la API

### Infraestructura
- **Contenedores**: Docker con docker-compose
- **Redes**: Comunicación interna entre contenedores
- **Volúmenes**: Persistencia de datos de PostgreSQL
- **Configuración**: Variables de entorno con .env

## Configuración de Desarrollo

### Dependencias Principales (Backend)
- express: Framework web
- prisma: ORM y herramienta de migración
- @prisma/client: Cliente de Prisma
- bcryptjs: Hashing de contraseñas
- jsonwebtoken: Tokens JWT
- multer: Manejo de uploads
- zod: Validación de esquemas
- cors: Configuración de CORS
- dotenv: Variables de entorno

### Dependencias Principales (Frontend)
- next: Framework Next.js
- react, react-dom: Biblioteca React
- @tanstack/react-query: Gestión de estado del servidor
- react-hook-form: Gestión de formularios
- zod: Validación de esquemas
- recharts: Gráficos y visualizaciones
- jspdf: Generación de PDF
- axios: Cliente HTTP
- tailwindcss: Framework CSS

## Patrones de Arquitectura

### Backend
- Arquitectura por capas: Rutas → Controladores → Servicios → Prisma
- Validación con Zod en todos los endpoints
- Manejo de errores centralizado
- Autenticación basada en middleware JWT
- Sistema de logs y manejo de excepciones

### Frontend
- Arquitectura basada en App Router de Next.js
- Context API para estado global (autenticación, carrito)
- React Query para manejo de datos del servidor
- Componentes reutilizables con TypeScript
- Separación clara entre componentes de UI, admin y store

## Configuración de Docker

### Imágenes
- **Backend**: Node.js base con dependencias instaladas
- **Frontend**: Node.js base con Next.js
- **Base de datos**: PostgreSQL 16 con configuración persistente

### Volumes
- Persistencia de datos de PostgreSQL
- Hot reload para desarrollo
- Compartir archivos estáticos

## Herramientas de Desarrollo
- **Prisma Studio**: GUI para visualizar y manipular la base de datos
- **TypeScript**: Tipado estático en todo el proyecto
- **ESLint**: Linting de código
- **Docker**: Contenerización para desarrollo y producción
- **Git**: Control de versiones