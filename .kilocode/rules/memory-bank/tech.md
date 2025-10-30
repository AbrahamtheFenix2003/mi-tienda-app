# Stack Tecnológico y Configuraciones

Este documento detalla las tecnologías, librerías clave y configuraciones del proyecto.

## General

- **Gestor de Paquetes**: npm workspaces para gestionar el monorepo.
- **Lenguaje**: TypeScript en todo el stack (frontend, backend, tipos).

## Backend (`apps/backend`)

- **Framework**: Express.js
- **Entorno de Ejecución**: Node.js con `type: "module"` (ESM).
  - **Runner**: `tsx` para desarrollo con hot-reload.
- **ORM**: Prisma con PostgreSQL.
  - **Cliente**: `@prisma/client`
- **Autenticación**: JWT (`jsonwebtoken`) con `bcryptjs` para hashing.
- **Subida de Archivos**: `multer` para manejar `multipart/form-data`.
- **CORS**: Habilitado a través del middleware `cors`.
- **Variables de Entorno**: `dotenv` para cargar desde `.env`.
- **Configuración TypeScript (`tsconfig.json`)**:
  - **Target**: `ES2022`
  - **Module System**: `NodeNext`
  - **Strict Mode**: `true`
  - **Output**: transpila a `./dist`.

### Dependencias Clave (Backend)

- `express`: Framework web.
- `@prisma/client`: Cliente de base deatos.
- `jsonwebtoken`: Creación y verificación de tokens JWT.
- `bcryptjs`: Hashing de contraseñas.
- `multer`: Middleware para subida de archivos.
- `cors`: Middleware para Cross-Origin Resource Sharing.
- `zod`: (vía `packages/types`) para validación de esquemas.

## Frontend (`apps/frontend`)

- **Framework**: Next.js (App Router).
- **Librería UI**: React.
- **Gestión de Estado (Servidor)**: TanStack Query (React Query).
- **Gestión de Formularios**: React Hook Form con `@hookform/resolvers` para Zod.
- **Cliente HTTP**: Axios.
- **Estilos**: Tailwind CSS.
- **Iconos**: `lucide-react`.
- **Configuración TypeScript (`tsconfig.json`)**:
  - **Target**: `ES2017`
  - **Module System**: `esnext` con `bundler` resolution.
  - **JSX**: `react-jsx` (no requiere importar React en cada componente).
  - **Strict Mode**: `true`.

### Dependencias Clave (Frontend)

- `next`: Framework de React.
- `react`, `react-dom`: Librerías de UI.
- `@tanstack/react-query`: Gestión de estado del servidor, caching, etc.
- `axios`: Cliente HTTP para consumir la API backend.
- `react-hook-form`: Manejo de formularios.
- `zod`: Validación de esquemas de formularios.
- `tailwindcss`: Framework de CSS.

## Tipos Compartidos (`packages/types`)

- **Propósito**: Centralizar las interfaces y tipos de TypeScript, así como los esquemas de validación de Zod, para asegurar consistencia entre el frontend y el backend.
- **Dependencias**:
  - `zod`: Para la creación de esquemas de validación.
- **Configuración TypeScript (`tsconfig.json`)**:
  - **Target**: `ES2022`
  - **Module System**: `NodeNext`
  - **Generación de Tipos**: `declaration: true` para emitir archivos `.d.ts`.

## Flujo de Trabajo y Build

- **Instalación**: `npm install` en la raíz del monorepo.
- **Desarrollo**:
  - Backend: `npm run dev --workspace=@mi-tienda/backend`
  - Frontend: `npm run dev --workspace=@mi-tienda/frontend`
- **Build de Producción**:
  - Se debe ejecutar el build en cada workspace (`apps/backend`, `apps/frontend`, `packages/types`).