# ============================================
# Stage 1: Base - Sistema base con dependencias
# ============================================
FROM node:20-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

# Establecer directorio de trabajo
WORKDIR /app

# ============================================
# Stage 2: Dependencies - Instalación de dependencias
# ============================================
FROM base AS dependencies

# Instalar openssl necesario para Prisma
RUN apk add --no-cache openssl

# Copiar archivos de configuración del monorepo
COPY package.json package-lock.json* ./

# Copiar configuraciones de workspaces
COPY packages/types/package.json ./packages/types/
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/backend/package.json ./apps/backend/

# Instalar todas las dependencias (incluye dev para compilación)
# Usar npm ci para instalación reproducible desde lockfile
RUN npm ci

# ============================================
# Stage 3: Build - Compilación de tipos y frontend
# ============================================
FROM dependencies AS build

# IMPORTANTE: Copiar schema de Prisma PRIMERO para generar el cliente
# Esto es necesario porque @mi-tienda/types depende de @prisma/client
COPY apps/backend/prisma ./apps/backend/prisma

# Generar Prisma Client ANTES de compilar tipos
# Esto crea los tipos necesarios en node_modules/@prisma/client
RUN npm run generate --workspace=@mi-tienda/backend

# Copiar código fuente del paquete de tipos compartidos
COPY packages/types ./packages/types

# Compilar paquete de tipos (ahora puede usar @prisma/client)
RUN npm run build --workspace=@mi-tienda/types

# Copiar código fuente del frontend
COPY apps/frontend ./apps/frontend

# Cambiar al directorio del frontend
WORKDIR /app/apps/frontend

# Variables de entorno para el build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build de Next.js en modo standalone
# Esto genera una versión optimizada con solo las dependencias necesarias
RUN npm run build

# ============================================
# Stage 4: Production - Imagen final optimizada
# ============================================
FROM base AS production

# Variables de entorno de producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Cambiar al directorio de trabajo
WORKDIR /app

# Copiar archivos públicos
COPY --from=build /app/apps/frontend/public ./apps/frontend/public

# Copiar la build standalone (incluye solo dependencias necesarias)
# Next.js automáticamente crea esta estructura optimizada
COPY --from=build --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./

# Copiar archivos estáticos generados (CSS, JS, imágenes optimizadas)
COPY --from=build --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto de la aplicación
EXPOSE 3000

# Health check para verificar que el servidor está respondiendo
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# El standalone incluye su propio server.js optimizado
CMD ["node", "apps/frontend/server.js"]
