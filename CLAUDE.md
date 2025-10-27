# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for an e-commerce inventory and sales management system ("mi-tienda") using npm workspaces. The project consists of:

- **Frontend**: Next.js 16 (App Router) with React 19, TanStack Query, React Hook Form, Zod validation, Tailwind CSS 4
- **Backend**: Express.js with TypeScript (ESM modules), Prisma ORM, PostgreSQL
- **Shared Types**: Centralized TypeScript types in `packages/types`

The system handles products, categories, sales, purchases, inventory tracking with FIFO lot system, suppliers, expenses, users, and cash flow management.

## Monorepo Structure

```
mi-tienda-app/
├── apps/
│   ├── frontend/          # Next.js application
│   │   ├── app/           # Next.js App Router pages
│   │   │   ├── (admin)/   # Admin panel routes (route group)
│   │   │   └── login/     # Public login page
│   │   ├── components/    # React components
│   │   │   ├── admin/     # Admin-specific components
│   │   │   ├── layout/    # Layout components
│   │   │   └── ui/        # Reusable UI components
│   │   └── utils/         # Frontend utilities
│   └── backend/           # Express API
│       ├── prisma/        # Prisma schema and migrations
│       ├── src/
│       │   ├── api/       # API routes and controllers
│       │   │   └── routes/ # Route definitions
│       │   ├── config/    # Configuration (multer, etc.)
│       │   ├── controllers/ # Request handlers
│       │   ├── middlewares/ # Auth and other middleware
│       │   ├── services/  # Business logic layer
│       │   └── utils/     # Backend utilities
│       └── uploads/       # Static file storage
└── packages/
    └── types/             # Shared TypeScript types
```

## Development Commands

### Root Level (Monorepo)
All workspaces use npm (no Yarn or pnpm). Install dependencies from root:
```bash
npm install
```

### Backend (apps/backend)
```bash
cd apps/backend

# Development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Production server (after build)
npm run start

# Prisma Studio (database GUI)
npm run studio

# Prisma migrations
npx prisma migrate dev          # Create and apply migration
npx prisma migrate deploy       # Apply migrations (production)
npx prisma generate            # Regenerate Prisma Client
npx prisma db push             # Push schema changes without migration
npm run migrate:dev --workspace=@mi-tienda/backend -- --name <migration-name> # Create migration with name
```

The backend runs on port 8080 by default. Uses ESM modules with ts-node loader.

### Frontend (apps/frontend)
```bash
cd apps/frontend

# Development server
npm run dev

# Production build
npm run build

# Production server (after build)
npm run start

# Lint code
npm run lint
```

The frontend runs on port 3000 by default.

## Key Architecture Details

### Backend Architecture

**Module System**: Uses ESM (type: "module" in package.json). All imports must include `.js` extensions even for `.ts` files due to TypeScript + Node ESM resolution.

**Database Layer**: Prisma with PostgreSQL
- Schema: `apps/backend/prisma/schema.prisma`
- Complex inventory system with FIFO lot tracking via `StockLot` model
- Enums for: Role, OrderStatus, PaymentMethod, DeliveryMethod, StockMovementType, etc.

**Service Layer Pattern**: Business logic is in services (e.g., `auth.service.ts`, `products.service.ts`), not controllers. Controllers only handle request/response.

**API Structure**:
- Base path: `/api/v1`
- Routes organized by resource: `auth.routes.ts`, `products.routes.ts`, `categories.routes.ts`
- All routes mounted in `apps/backend/src/api/index.ts`

**Authentication**: JWT-based with bcryptjs for password hashing. Auth middleware in `middlewares/auth.middleware.ts`.

**File Uploads**: Multer configuration in `config/multer.ts`. Files stored in `apps/backend/uploads/` and served statically at `/uploads`.

**Environment Variables**: `.env` file in `apps/backend/`. Required vars:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT signing
- `PORT`: Server port (default 8080)

### Frontend Architecture

**Routing**: Next.js App Router with route groups
- `(admin)` route group for authenticated admin pages
- Public routes at root level

**State Management**:
- Server state: TanStack Query (React Query) via `QueryProvider.tsx`
- Form state: React Hook Form with Zod validation

**API Integration**: Axios for HTTP requests. Backend URL configured in Next.js config for image optimization.

**Image Handling**: Next.js Image component configured to accept images from `http://localhost:8080/uploads/**` (see `next.config.ts`).

**Styling**: Tailwind CSS 4 with PostCSS. Uses `@headlessui/react` for accessible UI components.

**Path Aliases**: `@/*` maps to root directory (see `tsconfig.json`).

### Shared Types

Types defined in `packages/types/src/` and exported via `index.ts`. Import in other workspaces:
```typescript
import { User, Product, Category } from '@mi-tienda/types';
```

## Database Schema Notes

### Core Models
- **User**: Panel users with roles (SUPER_ADMIN, SUPER_VENDEDOR, VENDEDOR)
- **Product**: Products with multiple image URLs, stock tracking, pricing
- **Category**: Product categories
- **Sale**: Orders/sales with status, payment/delivery methods, customer info
- **Purchase**: Inventory purchases from suppliers
- **Supplier**: Vendor information
- **Expense**: Operating expenses
- **StockLot**: FIFO inventory lots with expiry dates
- **StockMovement**: Inventory transaction log
- **CashMovement**: Cash flow transaction log

### Important Relationships
- Products have `acquisitionCost` (average cost from lots) and `stock` (total from all lots)
- Sales use FIFO to deduct from oldest lots first
- `StockMovement` tracks all inventory changes with references to sales/purchases
- `CashMovement` tracks all cash with previous/new balance for auditing

### Legacy Support
Products have `stockInicial` and `precioCompraInicial` fields for historical data before lot system implementation.

## Code Style Conventions

- TypeScript strict mode enabled on both apps
- Backend uses ESM imports with `.js` extensions
- Frontend uses JSX transform (no React import needed in components)
- Prefer async/await over promises
- Use Prisma's type-safe client for all database operations
- Controllers should be thin; business logic belongs in services

## Testing the Application

1. Ensure PostgreSQL is running and accessible
2. Create `.env` in `apps/backend/` with required variables
3. Run Prisma migrations: `cd apps/backend && npx prisma migrate dev`
4. Start backend: `cd apps/backend && npm run dev`
5. Start frontend: `cd apps/frontend && npm run dev`
6. Access admin panel at `http://localhost:3000/(admin route)`
7. Login page at `http://localhost:3000/login`

## Common Workflows

### Adding a New Product Feature
1. Update Prisma schema in `apps/backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev` to create migration
3. Add/update types in `packages/types/src/product.ts`
4. Create service methods in `apps/backend/src/services/products.service.ts`
5. Add controller methods in `apps/backend/src/controllers/`
6. Define routes in `apps/backend/src/api/routes/products.routes.ts`
7. Update frontend components in `apps/frontend/components/admin/`
8. Add API calls using TanStack Query hooks

### Adding a New API Endpoint
1. Define route in appropriate file under `apps/backend/src/api/routes/`
2. Create controller in `apps/backend/src/controllers/`
3. Implement business logic in `apps/backend/src/services/`
4. Add authentication middleware if needed
5. Test endpoint before integrating with frontend

### Handling Images
- Backend stores in `apps/backend/uploads/`
- Serve via `/uploads` path
- Frontend uses Next.js Image with remote pattern for localhost:8080
- Product model supports 4 image URLs (imageUrl, imageUrl2, imageUrl3, imageUrl4)
