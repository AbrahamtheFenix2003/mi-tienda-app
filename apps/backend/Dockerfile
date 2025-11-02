# ============================================
# Stage 1: Base - Sistema base con dependencias
# ============================================
FROM node:20-alpine AS base

# Instalar dependencias del sistema necesarias para Prisma
RUN apk add --no-cache openssl libc6-compat

# Establecer directorio de trabajo
WORKDIR /app

# ============================================
# Stage 2: Dependencies - Instalación de dependencias
# ============================================
FROM base AS dependencies

# Copiar archivos de configuración del monorepo
COPY package.json package-lock.json* ./

# Copiar configuraciones de workspaces
COPY packages/types/package.json ./packages/types/
COPY apps/backend/package.json ./apps/backend/

# Instalar todas las dependencias (incluye dev para compilación)
# Usar npm ci para instalación reproducible desde lockfile
RUN npm ci

# ============================================
# Stage 3: Build - Compilación de tipos y backend
# ============================================
FROM dependencies AS build

# IMPORTANTE: Copiar schema de Prisma PRIMERO para generar el cliente
# Esto es necesario porque @mi-tienda/types depende de @prisma/client
COPY apps/backend/prisma ./apps/backend/prisma

# Generar Prisma Client ANTES de compilar tipos
RUN npm run generate --workspace=@mi-tienda/backend

# Copiar código fuente del paquete de tipos compartidos
COPY packages/types ./packages/types

# Compilar paquete de tipos (ahora puede usar @prisma/client)
RUN npm run build --workspace=@mi-tienda/types

# Copiar código fuente del backend
COPY apps/backend ./apps/backend

# Compilar TypeScript del backend
RUN npm run build --workspace=@mi-tienda/backend

# Eliminar devDependencies pero mantener workspaces de producción
# Esto mantiene @mi-tienda/types porque está en dependencies
RUN npm prune --omit=dev

# ============================================
# Stage 4: Production - Imagen final optimizada
# ============================================
FROM base AS production

# Variables de entorno de producción
ENV NODE_ENV=production
ENV PORT=8080

# Copiar package.json del monorepo
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json* ./

# Copiar node_modules de producción (ya procesado con npm prune)
# Esto incluye symlinks de workspaces correctamente configurados
COPY --from=build /app/node_modules ./node_modules

# Copiar workspace de tipos (package.json + dist compilado)
COPY --from=build /app/packages/types/package.json ./packages/types/package.json
COPY --from=build /app/packages/types/dist ./packages/types/dist

# Copiar backend (package.json + dist compilado)
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /app/apps/backend/dist ./apps/backend/dist

# Copiar schema de Prisma y seed (necesario para migraciones y seed en runtime)
COPY --from=build /app/apps/backend/prisma ./apps/backend/prisma

# Copiar script de entrada para ejecutar migraciones
COPY apps/backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Hacer el script ejecutable y crear directorio para uploads
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && \
    mkdir -p /app/apps/backend/uploads && \
    chown -R node:node /app

# Cambiar a usuario non-root por seguridad
USER node

# Exponer puerto de la aplicación
EXPOSE 8080

# Health check para verificar que el servidor está respondiendo
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Cambiar al directorio del backend
WORKDIR /app/apps/backend

# Usar script de entrada para ejecutar migraciones antes de iniciar
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Comando para iniciar la aplicación
CMD ["npm", "start"]
