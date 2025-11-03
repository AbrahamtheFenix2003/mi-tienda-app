# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for an e-commerce POS and inventory management system ("mi-tienda") using Yarn workspaces. The project consists of:

- **Frontend**: Next.js 16 (App Router) with React 19, TanStack Query, React Hook Form, Zod validation, Tailwind CSS 4, Recharts
- **Backend**: Express.js 5.1 with TypeScript, Prisma ORM 6.18, PostgreSQL 16
- **Shared Types**: Centralized TypeScript types in `packages/types`

The system handles products, categories, sales, purchases, FIFO inventory tracking with lot system, suppliers, expenses, users, cash flow management, and dashboard analytics with PDF export capabilities.

## Monorepo Structure

```
mi-tienda-app/
├── apps/
│   ├── frontend/          # Next.js application
│   │   ├── app/           # Next.js App Router pages
│   │   │   ├── (admin)/   # Admin panel routes (route group)
│   │   │   │   ├── dashboard/      # Analytics & statistics
│   │   │   │   ├── productos/      # Product management
│   │   │   │   ├── categorias/     # Category management
│   │   │   │   ├── compras/        # Purchase orders
│   │   │   │   ├── punto-de-ventas/ # POS interface
│   │   │   │   ├── almacen/        # Inventory management
│   │   │   │   ├── caja/           # Cash management
│   │   │   │   ├── proveedores/    # Supplier management
│   │   │   │   └── reportes/       # Reports & PDF export
│   │   │   └── login/     # Public login page
│   │   ├── components/    # React components
│   │   │   ├── admin/     # Admin-specific components
│   │   │   ├── layout/    # Layout components
│   │   │   └── ui/        # Reusable UI components
│   │   ├── services/      # API integration services
│   │   └── hooks/         # Custom React hooks
│   └── backend/           # Express API
│       ├── prisma/        # Prisma schema and migrations
│       ├── src/
│       │   ├── api/       # API routes
│       │   │   └── routes/ # Route definitions (health, auth, products, etc.)
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
Install dependencies from root using npm (workspace configuration uses Yarn):
```bash
npm install           # Install all workspace dependencies
npm run dev          # Run all apps in development
npm run build        # Build all workspaces
npm run clean        # Clean build artifacts
```

### Backend (apps/backend)
```bash
cd apps/backend

# Development server with hot reload (tsx watch)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Production server (after build)
npm start

# Prisma Studio (database GUI - port 5555)
npm run studio

# Prisma operations
npm run generate              # Regenerate Prisma Client
npm run migrate:dev           # Create and apply migration (interactive)
npx prisma db push           # Push schema changes without migration
npx prisma migrate deploy    # Apply migrations (production)
npm run seed                 # Run database seeding
```

Backend runs on port 8080 by default.

### Frontend (apps/frontend)
```bash
cd apps/frontend

# Development server (port 3000)
npm run dev

# Production build
npm run build

# Production server (after build)
npm start

# Lint code
npm run lint
```

### Docker Commands
```bash
# Build and run all services (postgres, backend, frontend)
docker compose up -d --build

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop all services
docker compose down

# Access Postgres directly
docker compose exec postgres psql -U tienda_user -d mi_tienda_db
```

## Key Architecture Details

### Backend Architecture

**API Structure**:
- Base path: `/api/v1`
- Key routes: `/health`, `/auth`, `/products`, `/categories`, `/purchases`, `/sales`, `/inventory`, `/cash`, `/reports`, `/dashboard`
- All routes mounted in `apps/backend/src/api/index.ts`
- Static uploads served at `/uploads`

**Service Layer Pattern**:
- Business logic is in services (e.g., `auth.service.ts`, `products.service.ts`, `purchases.service.ts`)
- Controllers only handle request/response
- Complex logic in:
  - `purchases.service.ts` - Purchase order processing, cash movements, inventory updates
  - `sales.service.ts` - Sale processing with FIFO lot deduction, cash tracking, sale annulment
  - `inventory.service.ts` - Stock lot management, FIFO calculations
  - `cash.service.ts` - Cash flow tracking with balance calculations
  - `dashboard.service.ts` - Analytics and statistics generation

**Database Layer**: Prisma with PostgreSQL
- Schema: `apps/backend/prisma/schema.prisma`
- 13 models: User, Category, Product, Sale, SaleItem, Purchase, PurchaseItem, Expense, Supplier, StockLot, StockMovement, CashMovement
- Complex FIFO inventory via `StockLot` model with `LotStatus` (ACTIVE, EXHAUSTED, EXPIRED)
- Enums: Role, OrderStatus, PaymentMethod, DeliveryMethod, StockMovementType, PurchaseStatus, LotStatus

**Authentication**:
- JWT-based with bcryptjs password hashing
- Middleware: `middlewares/auth.middleware.ts`
- User roles: SUPER_ADMIN, SUPER_VENDEDOR, VENDEDOR

**File Uploads**:
- Multer configuration in `config/multer.ts`
- Files stored in `apps/backend/uploads/`
- Served statically at `/uploads`

**Environment Variables** (`.env` in `apps/backend/`):
```
DATABASE_URL=postgresql://tienda_user:password@localhost:5432/mi_tienda_db
PORT=8080
JWT_SECRET=your-secret-key
```

**Docker Configuration**:
- Multi-stage Dockerfile for optimized builds
- `docker-entrypoint.sh` handles database readiness checks, migrations, and seeding
- `docker-compose.yml` orchestrates postgres, backend, and frontend services

### Frontend Architecture

**Routing**: Next.js App Router with route groups
- `(admin)` route group for authenticated admin pages
- Public routes at root level
- Dynamic routes use Next.js conventions (`[id]` folder pattern)

**State Management**:
- Server state: TanStack Query (React Query v5) via `QueryProvider.tsx`
- Form state: React Hook Form with Zod validation
- API services organized in `services/` directory

**API Integration**:
- Axios configured in `services/api.ts`
- Service files: `authService.ts`, `productService.ts`, `purchaseService.ts`, `salesService.ts`, `dashboardService.ts`, etc.
- Base URL: `http://localhost:8080/api/v1`

**Key Features**:
- **Dashboard**: Statistics cards, sales charts (Recharts), category analysis
- **POS**: Point of sale interface with cart management
- **Reports**: PDF export using jsPDF + jsPDF-autotable
- **Inventory**: FIFO lot tracking, stock movements, low stock alerts

**Image Handling**:
- Next.js Image component configured for `http://localhost:8080/uploads/**`
- Remote patterns configured in `next.config.ts`
- Product model supports 4 image URLs

**Styling**:
- Tailwind CSS 4 with PostCSS
- `@headlessui/react` for accessible UI components
- Lucide React for icons

**Path Aliases**: `@/*` maps to root directory (see `tsconfig.json`)

### Shared Types

Types defined in `packages/types/src/` and exported via `index.ts`. Import in other workspaces:
```typescript
import { User, Product, Category, Sale, Purchase } from '@mi-tienda/types';
```

Key type files:
- `user.ts` - User and authentication types
- `product.ts` - Product and category types
- `purchase.ts` - Purchase order types
- `sale.ts` - Sale and sale item types
- `inventory.ts` - StockLot and StockMovement types
- `cash.ts` - CashMovement types
- `reports.ts` - Report types

## Database Schema Notes

### Core Models
- **User**: Staff/admin accounts with roles (SUPER_ADMIN, SUPER_VENDEDOR, VENDEDOR)
- **Product**: Products with multiple images, stock tracking, pricing (retail, wholesale)
- **Category**: Product categorization
- **Sale**: Customer transactions with status, payment/delivery methods
- **SaleItem**: Line items for sales
- **Purchase**: Inventory purchases from suppliers with status tracking
- **PurchaseItem**: Line items for purchases
- **Supplier**: Vendor information with contact details
- **Expense**: Operating expenses with category and payment method
- **StockLot**: FIFO inventory lots with expiry dates and status
- **StockMovement**: Complete audit trail of inventory changes
- **CashMovement**: Financial transaction tracking with balance history

### Important Business Logic

**FIFO Inventory System**:
- Products track total stock across all lots
- Each purchase creates `StockLot` entries with quantity and cost
- Sales automatically deduct from oldest lots first
- Lots have status: ACTIVE (in use), EXHAUSTED (depleted), EXPIRED (past expiry date)
- `StockMovement` records every change with type (PURCHASE, SALE, ADJUSTMENT, etc.)

**Cash Flow Tracking**:
- Every financial transaction creates a `CashMovement` record
- Tracks previous balance, amount, and new balance for audit trail
- Linked to sales, purchases, and expenses
- Balance calculations are precise and traceable

**Purchase Processing** (`purchases.service.ts`):
- Creates purchase record with status (PENDIENTE, RECIBIDO, CANCELADO)
- Generates stock lots for received purchases
- Creates stock movements for audit trail
- Updates product stock and acquisition costs
- Records cash movements for payments

**Sale Processing** (`sales.service.ts`):
- FIFO lot deduction logic
- Automatic cost calculation from lots
- Cash movement recording
- Sale annulment support (reverses all transactions)
- Stock movement audit trail

**Dashboard Analytics** (`dashboard.service.ts`):
- Real-time statistics (total sales, products, low stock alerts)
- Sales by category breakdown
- Date range filtering
- Chart data for visualizations

### Legacy Support
Products have `stockInicial` and `precioCompraInicial` fields for historical data before lot system implementation.

## Code Style Conventions

- TypeScript strict mode enabled
- Backend uses ESM imports with `.js` extensions in imports
- Frontend uses JSX transform (no React import needed)
- Prefer async/await over promises
- Use Prisma's type-safe client for all database operations
- Controllers are thin; business logic belongs in services
- Service methods should handle transactions for data consistency

## Testing the Application

### Local Development (Without Docker)
1. Ensure PostgreSQL is running
2. Create `.env` in `apps/backend/` with database credentials
3. Run migrations: `cd apps/backend && npm run migrate:dev`
4. Seed database: `npm run seed`
5. Start backend: `npm run dev` (port 8080)
6. Start frontend: `cd apps/frontend && npm run dev` (port 3000)
7. Access login at `http://localhost:3000/login`
8. Access admin panel at `http://localhost:3000/dashboard`

### Docker Development
1. Ensure `.env` files are configured
2. Run `docker compose up -d --build`
3. Check logs: `docker compose logs -f`
4. Access frontend at `http://localhost:3000`
5. Backend API at `http://localhost:8080/api/v1`
6. Health check: `http://localhost:8080/api/v1/health`

## Common Workflows

### Adding a New Feature to the System
1. **Update Database Schema**: Edit `apps/backend/prisma/schema.prisma`
2. **Create Migration**: `cd apps/backend && npm run migrate:dev -- --name feature_name`
3. **Generate Prisma Client**: `npm run generate`
4. **Update Shared Types**: Add types in `packages/types/src/`
5. **Implement Service**: Create business logic in `apps/backend/src/services/`
6. **Add Controller**: Create request handler in `apps/backend/src/controllers/`
7. **Define Routes**: Add routes in `apps/backend/src/api/routes/`
8. **Create Frontend Service**: Add API calls in `apps/frontend/services/`
9. **Build UI Components**: Create pages/components in `apps/frontend/app/(admin)/`
10. **Test Integration**: Verify end-to-end functionality

### Modifying Purchase or Sale Logic
- Main files: `apps/backend/src/services/purchases.service.ts` and `sales.service.ts`
- Consider impact on: StockLot, StockMovement, CashMovement, Product.stock
- Use Prisma transactions for atomicity
- Update related cash movements when modifying financial logic
- Test FIFO calculations thoroughly

### Adding a New API Endpoint
1. Define route in `apps/backend/src/api/routes/*.routes.ts`
2. Create controller method in `apps/backend/src/controllers/`
3. Implement business logic in `apps/backend/src/services/`
4. Add authentication middleware if needed: `auth.middleware.ts`
5. Test with Postman/curl before frontend integration

### Handling Product Images
- Backend stores in `apps/backend/uploads/` directory
- Served via `/uploads` static path
- Frontend uses Next.js Image with remote pattern for `localhost:8080`
- Product model supports 4 images: `imageUrl`, `imageUrl2`, `imageUrl3`, `imageUrl4`
- Use Multer for file upload handling

### Working with Dashboard Analytics
- Service: `apps/backend/src/services/dashboard.service.ts`
- Routes: `apps/backend/src/api/routes/dashboard.routes.ts`
- Frontend: `apps/frontend/app/(admin)/dashboard/`
- Uses Recharts for visualizations
- Implements date range filtering and statistics calculations

### Generating Reports
- Reports are generated in frontend using jsPDF
- Logic typically in `apps/frontend/app/(admin)/reportes/`
- Can export sales reports, inventory reports, financial reports
- Supports PDF download with custom formatting

## Important Notes

- **Monorepo**: Uses Yarn workspaces defined in root `package.json`
- **Database Migrations**: Always create migrations for schema changes in production
- **FIFO Logic**: Critical for accurate cost tracking - test thoroughly when modifying
- **Cash Movements**: Must maintain balance integrity - use transactions
- **Docker Images**: Multi-stage builds optimize production image size
- **Type Safety**: Shared types package ensures consistency across frontend/backend
- **Authentication**: All admin routes require JWT token in Authorization header
- **Health Check**: `/api/v1/health` endpoint for monitoring and Docker health checks
