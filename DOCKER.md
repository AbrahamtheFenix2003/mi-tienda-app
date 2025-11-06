# 🐳 Guía de Docker para Mi Tienda App

Esta guía te ayudará a desplegar la aplicación completa usando Docker y Docker Compose.

## 📋 Tabla de Contenidos

- [Prerrequisitos](#prerrequisitos)
- [Arquitectura de Contenedores](#arquitectura-de-contenedores)
- [Inicio Rápido](#inicio-rápido)
- [Comandos Útiles](#comandos-útiles)
- [Variables de Entorno](#variables-de-entorno)
- [Desarrollo Local](#desarrollo-local)
- [Deployment en Producción](#deployment-en-producción)
- [Troubleshooting](#troubleshooting)

---

## 📦 Prerrequisitos

### Instalar Docker

**Windows:**
- Descargar [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop/)
- Ejecutar instalador
- Reiniciar el sistema

**macOS:**
- Descargar [Docker Desktop para Mac](https://www.docker.com/products/docker-desktop/)
- Arrastrar Docker.app a Applications
- Abrir Docker desde Applications

**Linux (Ubuntu/Debian):**
```bash
# Actualizar paquetes
sudo apt-get update

# Instalar Docker
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER

# Reiniciar sesión para aplicar cambios
```

### Verificar Instalación

```bash
docker --version
# Salida esperada: Docker version 24.x.x

docker compose version
# Salida esperada: Docker Compose version v2.x.x
```

---

## 🏗️ Arquitectura de Contenedores

El proyecto usa **3 contenedores** que se comunican a través de una red interna:

```
┌─────────────────────────────────────────────────────┐
│                    Host Machine                      │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │         mi-tienda-network (Bridge)          │   │
│  │                                             │   │
│  │  ┌──────────────┐  ┌──────────────┐       │   │
│  │  │   Frontend   │  │   Backend    │       │   │
│  │  │  (Next.js)   │  │  (Express)   │       │   │
│  │  │  Port: 3000  │◄─┤  Port: 8080  │       │   │
│  │  └──────────────┘  └──────┬───────┘       │   │
│  │                            │               │   │
│  │                    ┌───────▼───────┐       │   │
│  │                    │   PostgreSQL  │       │   │
│  │                    │   Port: 5432  │       │   │
│  │                    └───────────────┘       │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  Acceso desde navegador:                            │
│  http://localhost:3000 → Frontend                   │
│  https://braholet-importaciones-core.global-atlas-solutions.com → Backend API                │
└─────────────────────────────────────────────────────┘
```

### Servicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **frontend** | 3000 | Next.js 16 en modo standalone (SSR) |
| **backend** | 8080 | Express + Prisma + TypeScript |
| **postgres** | 5432 | PostgreSQL 16 Alpine |

---

## 🚀 Inicio Rápido

### Opción 1: Levantar Todo con un Comando

```bash
# Desde la raíz del proyecto
docker compose up -d --build
```

Este comando:
1. ✅ Construye las imágenes del frontend y backend
2. ✅ Inicia PostgreSQL
3. ✅ Ejecuta migraciones de Prisma
4. ✅ Inicia el backend en puerto 8080
5. ✅ Inicia el frontend en puerto 3000

**Tiempo estimado:** 3-5 minutos (primera vez)

### Opción 2: Paso a Paso (Recomendado para debugging)

```bash
# 1. Construir imágenes sin iniciar
docker compose build

# 2. Iniciar solo la base de datos
docker compose up -d postgres

# 3. Esperar a que PostgreSQL esté listo
docker compose logs -f postgres
# Espera hasta ver: "database system is ready to accept connections"
# Presiona Ctrl+C para salir de los logs

# 4. Iniciar backend (ejecutará migraciones automáticamente)
docker compose up -d backend

# 5. Verificar que el backend esté funcionando
docker compose logs -f backend
# Espera hasta ver: "Server running on port 8080"

# 6. Iniciar frontend
docker compose up -d frontend

# 7. Verificar que todo esté funcionando
docker compose ps
```

### Verificar que Todo Funciona

```bash
# Ver estado de todos los servicios
docker compose ps

# Salida esperada:
# NAME                  STATUS    PORTS
# mi-tienda-db          Up        0.0.0.0:5432->5432/tcp
# mi-tienda-backend     Up        0.0.0.0:8080->8080/tcp
# mi-tienda-frontend    Up        0.0.0.0:3000->3000/tcp
```

### Acceder a la Aplicación

Abre tu navegador y visita:

- **Frontend:** http://localhost:3000
- **Backend API:** https://braholet-importaciones-core.global-atlas-solutions.com/api/v1
- **Login:** http://localhost:3000/login

---

## 🛠️ Comandos Útiles

### Gestión de Contenedores

```bash
# Ver logs de todos los servicios
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f postgres

# Ver solo las últimas 100 líneas
docker compose logs --tail=100 backend

# Detener todos los servicios
docker compose stop

# Iniciar servicios detenidos (sin rebuild)
docker compose start

# Reiniciar un servicio específico
docker compose restart backend

# Detener y eliminar contenedores (mantiene volúmenes)
docker compose down

# Detener, eliminar contenedores Y volúmenes (CUIDADO: borra la BD)
docker compose down -v
```

### Rebuilding

```bash
# Rebuild solo el frontend (después de cambios en código)
docker compose build frontend
docker compose up -d frontend

# Rebuild solo el backend
docker compose build backend
docker compose up -d backend

# Rebuild todo desde cero (sin cache)
docker compose build --no-cache

# Rebuild y reiniciar todo
docker compose up -d --build
```

### Ejecutar Comandos dentro de Contenedores

```bash
# Abrir shell en el backend
docker compose exec backend sh

# Abrir shell en el frontend
docker compose exec frontend sh

# Ejecutar comando sin entrar al shell
docker compose exec backend npm run prisma:studio
docker compose exec backend npx prisma migrate dev --name add_new_field

# Conectarse a PostgreSQL
docker compose exec postgres psql -U tienda_user -d mi_tienda_db
```

### Inspección y Debugging

```bash
# Ver uso de recursos
docker stats

# Inspeccionar un servicio
docker compose exec backend printenv | grep DATABASE_URL

# Ver health checks
docker compose ps
# Busca la columna STATUS: "Up (healthy)" o "Up (unhealthy)"

# Ver detalles completos de un contenedor
docker inspect mi-tienda-backend

# Ver redes
docker network ls
docker network inspect mi-tienda-app_mi-tienda-network
```

### Limpieza

```bash
# Eliminar contenedores detenidos
docker compose down

# Eliminar imágenes no utilizadas
docker image prune -a

# Eliminar volúmenes no utilizados
docker volume prune

# Limpieza completa del sistema Docker (CUIDADO)
docker system prune -a --volumes
```

---

## 🔧 Variables de Entorno

### Frontend (apps/frontend)

Variables que puedes configurar en `docker-compose.yml`:

```yaml
environment:
  # URL del backend (usa el nombre del servicio en Docker)
  NEXT_PUBLIC_API_URL: http://backend:8080/api/v1

  # Para desarrollo local fuera de Docker, usar:
  # NEXT_PUBLIC_API_URL: https://braholet-importaciones-core.global-atlas-solutions.com/api/v1

  NODE_ENV: production
  NEXT_TELEMETRY_DISABLED: 1
  PORT: 3000
  HOSTNAME: "0.0.0.0"
```

### Backend (apps/backend)

```yaml
environment:
  # Conexión a PostgreSQL (usa el nombre del servicio 'postgres')
  DATABASE_URL: "postgresql://tienda_user:supersecretpassword123@postgres:5432/mi_tienda_db?schema=public"

  PORT: 8080

  # Clave para firmar tokens JWT (CAMBIAR EN PRODUCCIÓN)
  JWT_SECRET: "mi-clave-secreta-para-jwt-2025"

  NODE_ENV: production
```

### PostgreSQL

```yaml
environment:
  POSTGRES_USER: tienda_user
  POSTGRES_PASSWORD: supersecretpassword123
  POSTGRES_DB: mi_tienda_db
```

---

## 💻 Desarrollo Local

### Opción 1: Desarrollo Híbrido (Recomendado)

Usa Docker solo para la base de datos y corre frontend/backend localmente:

```bash
# 1. Levantar solo PostgreSQL
docker compose up -d postgres

# 2. En una terminal, iniciar backend local
cd apps/backend
npm run dev

# 3. En otra terminal, iniciar frontend local
cd apps/frontend
npm run dev
```

**Ventajas:**
- ✅ Hot reload funciona perfectamente
- ✅ Debugging más fácil
- ✅ Cambios se reflejan instantáneamente
- ✅ No necesitas rebuild de imágenes

### Opción 2: Desarrollo 100% en Docker

```bash
# Modificar docker-compose.yml para desarrollo
# Agregar volumes para hot reload:

services:
  backend:
    volumes:
      - ./apps/backend/src:/app/apps/backend/src
      - ./apps/backend/uploads:/app/apps/backend/uploads
    command: npm run dev  # En lugar de npm start

  frontend:
    volumes:
      - ./apps/frontend:/app/apps/frontend
      - /app/apps/frontend/node_modules
      - /app/apps/frontend/.next
    command: npm run dev  # En lugar de node server.js
```

---

## 🌍 Deployment en Producción

### Variables de Entorno de Producción

Crea un archivo `.env.production` en la raíz:

```bash
# PostgreSQL
POSTGRES_USER=mi_usuario_prod
POSTGRES_PASSWORD=contraseña_super_segura_aquí
POSTGRES_DB=mi_tienda_production

# Backend
DATABASE_URL=postgresql://mi_usuario_prod:contraseña_super_segura_aquí@postgres:5432/mi_tienda_production?schema=public
JWT_SECRET=clave_jwt_muy_segura_y_larga_generada_aleatoriamente
PORT=8080
NODE_ENV=production

# Frontend
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com/api/v1
NEXT_TELEMETRY_DISABLED=1
```

### Usar Variables de Entorno

Modifica `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      # ...
```

Luego ejecuta:

```bash
# Cargar variables del archivo
docker compose --env-file .env.production up -d --build
```

### Deployment en VPS (DigitalOcean, AWS EC2, etc.)

```bash
# 1. Conectar al servidor
ssh usuario@tu-servidor.com

# 2. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. Clonar repositorio
git clone https://github.com/tu-usuario/mi-tienda-app.git
cd mi-tienda-app

# 4. Configurar variables de entorno
nano .env.production

# 5. Levantar servicios
docker compose --env-file .env.production up -d --build

# 6. Configurar Nginx como reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/mi-tienda
```

**Configuración Nginx:**

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass https://braholet-importaciones-core.global-atlas-solutions.com;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Uploads
    location /uploads/ {
        proxy_pass https://braholet-importaciones-core.global-atlas-solutions.com/uploads/;
    }
}
```

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/mi-tienda /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Configurar SSL con Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

### Deployment en Cloud Run (Google Cloud)

```bash
# 1. Build y push frontend
gcloud builds submit --tag gcr.io/PROJECT-ID/mi-tienda-frontend apps/frontend

# 2. Deploy frontend
gcloud run deploy mi-tienda-frontend \
  --image gcr.io/PROJECT-ID/mi-tienda-frontend \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_API_URL=https://backend-xxx.run.app/api/v1

# 3. Repetir para backend
gcloud builds submit --tag gcr.io/PROJECT-ID/mi-tienda-backend apps/backend
gcloud run deploy mi-tienda-backend \
  --image gcr.io/PROJECT-ID/mi-tienda-backend \
  --platform managed \
  --set-env-vars DATABASE_URL=postgres://...,JWT_SECRET=...
```

---

## 🔍 Troubleshooting

### Problema: Frontend no puede conectarse al backend

**Síntomas:**
- Errores de conexión en el navegador
- API requests fallan con `ERR_CONNECTION_REFUSED`

**Soluciones:**

```bash
# 1. Verificar que el backend esté corriendo
docker compose ps backend
# Debe mostrar "Up (healthy)"

# 2. Verificar logs del backend
docker compose logs backend

# 3. Si estás accediendo desde el navegador, usar localhost
# En docker-compose.yml, para desarrollo local:
environment:
  NEXT_PUBLIC_API_URL: https://braholet-importaciones-core.global-atlas-solutions.com/api/v1
# NO usar: http://backend:8080 (esto solo funciona entre contenedores)

# 4. Verificar red
docker network inspect mi-tienda-app_mi-tienda-network
```

### Problema: Migraciones de Prisma fallan

**Síntomas:**
- Backend no inicia
- Error: "Can't reach database server"

**Soluciones:**

```bash
# 1. Verificar que PostgreSQL esté corriendo
docker compose logs postgres

# 2. Verificar la conexión desde el backend
docker compose exec backend sh
# Dentro del contenedor:
npx prisma db pull
exit

# 3. Ejecutar migraciones manualmente
docker compose exec backend npx prisma migrate deploy

# 4. Regenerar Prisma Client
docker compose exec backend npx prisma generate
docker compose restart backend
```

### Problema: Imágenes no se cargan

**Síntomas:**
- Imágenes de productos no aparecen
- Error 404 en `/uploads/*`

**Soluciones:**

```bash
# 1. Verificar que el volumen esté montado
docker compose exec backend ls -la /app/apps/backend/uploads

# 2. Verificar permisos
docker compose exec backend chmod -R 755 /app/apps/backend/uploads

# 3. Verificar configuración de Next.js
# En next.config.ts debe estar:
images: {
  remotePatterns: [
    {
      protocol: 'http',
      hostname: 'backend',  # Para requests entre contenedores
      port: '8080',
      pathname: '/uploads/**',
    },
  ],
}
```

### Problema: "ENOSPC: System limit for number of file watchers reached"

**Síntoma:** Error en Linux cuando usas hot reload

**Solución:**

```bash
# Aumentar el límite de watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Problema: Build muy lento

**Soluciones:**

```bash
# 1. Limpiar cache de Docker
docker builder prune

# 2. Usar buildkit (más rápido)
export DOCKER_BUILDKIT=1
docker compose build

# 3. Verificar .dockerignore
# Asegúrate de que node_modules, .next, dist estén excluidos
```

### Problema: Puerto ya en uso

**Síntoma:** `Error: bind: address already in use`

**Soluciones:**

```bash
# En Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# En macOS/Linux
lsof -ti:3000 | xargs kill -9

# O cambiar el puerto en docker-compose.yml
ports:
  - "3001:3000"  # Host:Container
```

---

## 📊 Comparación: Desarrollo vs Producción

| Aspecto | Desarrollo | Producción |
|---------|-----------|------------|
| **Build** | Hot reload, source maps | Optimizado, minificado |
| **Tamaño** | ~800 MB | ~150 MB (standalone) |
| **Seguridad** | Permisos root OK | Usuario no-root |
| **Logs** | Verbose | Solo errores |
| **Variables** | `.env.local` | `.env.production` |
| **HTTPS** | No necesario | Obligatorio (Nginx + SSL) |

---

## 📚 Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Next.js Standalone Mode](https://nextjs.org/docs/app/api-reference/next-config-js/output)
- [Prisma Docker Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa esta guía de troubleshooting
2. Consulta los logs: `docker compose logs -f`
3. Verifica que todas las variables de entorno estén correctas
4. Prueba hacer rebuild desde cero: `docker compose down -v && docker compose up -d --build`

---

**Última actualización:** 2025-11-02
