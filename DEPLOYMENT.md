# Guía de Despliegue - Mi Tienda App

Esta guía cubre el proceso de despliegue de la aplicación en diferentes entornos, desde desarrollo local hasta producción.

## Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
3. [Despliegue Local (sin Docker)](#despliegue-local-sin-docker)
4. [Despliegue con Docker (desarrollo)](#despliegue-con-docker-desarrollo)
5. [Despliegue en Producción](#despliegue-en-producción)
6. [Configuración de CORS](#configuración-de-cors)
7. [SSL/TLS (HTTPS)](#ssltls-https)
8. [Troubleshooting](#troubleshooting)

---

## Requisitos Previos

### Para desarrollo local:
- Node.js 18+ y npm
- PostgreSQL 16+
- Git

### Para Docker:
- Docker 24+
- Docker Compose v2+

### Para producción:
- Servidor con Docker instalado, o
- Plataforma cloud (AWS, GCP, Azure, DigitalOcean, etc.)
- Dominio configurado con DNS
- Certificado SSL/TLS (Let's Encrypt recomendado)

---

## Configuración de Variables de Entorno

### 1. Variables para Docker Compose (raíz del proyecto)

Copie `.env.example` a `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Edite `.env` con sus valores:

```env
# Base de datos
POSTGRES_USER=tienda_user
POSTGRES_PASSWORD=<contraseña-fuerte-aquí>
POSTGRES_DB=mi_tienda_db

# Backend
PORT=8080
JWT_SECRET=<token-secreto-aleatorio-de-32-caracteres>
NODE_ENV=production
CORS_ORIGINS=https://www.your-domain.com,https://your-domain.com

# Frontend
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
NEXT_INTERNAL_API_BASE_URL=http://backend:8080
```

**Generar JWT_SECRET fuerte:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Variables para Backend (apps/backend/.env)

Para desarrollo local sin Docker:

```bash
cd apps/backend
cp .env.example .env
```

Configuración típica:
```env
DATABASE_URL=postgresql://tienda_user:password@localhost:5432/mi_tienda_db?schema=public
PORT=8080
JWT_SECRET=<mismo-que-arriba>
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000
```

### 3. Variables para Frontend (apps/frontend/.env.local)

Para desarrollo local sin Docker:

```bash
cd apps/frontend
cp .env.example .env.local
```

Configuración típica:
```env
NEXT_PUBLIC_API_URL=https://braholet-importaciones-core.global-atlas-solutions.com/api/v1
NEXT_PUBLIC_API_BASE_URL=https://braholet-importaciones-core.global-atlas-solutions.com
NEXT_INTERNAL_API_BASE_URL=https://braholet-importaciones-core.global-atlas-solutions.com
NEXT_TELEMETRY_DISABLED=1
```

---

## Despliegue Local (sin Docker)

### 1. Instalar dependencias

Desde la raíz del proyecto:
```bash
npm install
```

### 2. Configurar base de datos

Asegúrese de que PostgreSQL esté corriendo y cree la base de datos:
```bash
psql -U postgres
CREATE DATABASE mi_tienda_db;
CREATE USER tienda_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE mi_tienda_db TO tienda_user;
\q
```

### 3. Ejecutar migraciones

```bash
cd apps/backend
npm run migrate:dev
npm run seed  # Opcional: datos de prueba
```

### 4. Iniciar servicios

Terminal 1 - Backend:
```bash
cd apps/backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd apps/frontend
npm run dev
```

### 5. Acceder a la aplicación

- Frontend: http://localhost:3000
- Backend API: https://braholet-importaciones-core.global-atlas-solutions.com/api/v1
- Health check: https://braholet-importaciones-core.global-atlas-solutions.com/api/v1/health

---

## Despliegue con Docker (desarrollo)

### 1. Configurar variables de entorno

Edite `.env` en la raíz del proyecto (ver sección anterior).

### 2. Construir y ejecutar

```bash
docker compose up -d --build
```

### 3. Ver logs

```bash
# Todos los servicios
docker compose logs -f

# Solo backend
docker compose logs -f backend

# Solo frontend
docker compose logs -f frontend
```

### 4. Ejecutar migraciones (primera vez)

Las migraciones se ejecutan automáticamente gracias a `docker-entrypoint.sh`, pero si necesita ejecutarlas manualmente:

```bash
docker compose exec backend npm run migrate:deploy
docker compose exec backend npm run seed
```

### 5. Acceder a la aplicación

- Frontend: http://localhost:3000
- Backend API: https://braholet-importaciones-core.global-atlas-solutions.com/api/v1

### 6. Detener servicios

```bash
docker compose down

# Con eliminación de volúmenes (CUIDADO: elimina datos)
docker compose down -v
```

---

## Despliegue en Producción

### Opción 1: Servidor con Docker

#### 1. Preparar el servidor

```bash
# En su servidor (Ubuntu/Debian)
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git

# Iniciar Docker
sudo systemctl start docker
sudo systemctl enable docker
```

#### 2. Clonar el repositorio

```bash
cd /var/www
git clone https://github.com/su-usuario/mi-tienda-app.git
cd mi-tienda-app
```

#### 3. Configurar variables de entorno

```bash
cp .env.example .env
nano .env  # Editar con valores de producción
```

**Valores críticos para producción:**
```env
# IMPORTANTE: Use sus dominios reales
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
CORS_ORIGINS=https://www.your-domain.com,https://your-domain.com

# Use contraseñas fuertes
POSTGRES_PASSWORD=<contraseña-muy-fuerte>
JWT_SECRET=<token-aleatorio-de-32-caracteres>

NODE_ENV=production
```

#### 4. Configurar Nginx como proxy reverso

Instalar Nginx:
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Crear configuración para el frontend (`/etc/nginx/sites-available/mi-tienda-frontend`):
```nginx
server {
    listen 80;
    server_name www.your-domain.com your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Crear configuración para el backend API (`/etc/nginx/sites-available/mi-tienda-backend`):
```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass https://braholet-importaciones-core.global-atlas-solutions.com;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Aumentar tamaño máximo de upload para imágenes
    client_max_body_size 10M;
}
```

Habilitar sitios:
```bash
sudo ln -s /etc/nginx/sites-available/mi-tienda-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/mi-tienda-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Configurar SSL con Let's Encrypt

```bash
# Frontend
sudo certbot --nginx -d www.your-domain.com -d your-domain.com

# Backend API
sudo certbot --nginx -d api.your-domain.com
```

Certbot configurará automáticamente HTTPS y renovación automática.

#### 6. Iniciar aplicación

```bash
cd /var/www/mi-tienda-app
docker compose up -d --build
```

#### 7. Verificar despliegue

```bash
# Verificar contenedores
docker compose ps

# Verificar logs
docker compose logs -f

# Health check
curl https://api.your-domain.com/api/v1/health
```

### Opción 2: Plataformas Cloud

#### AWS (usando ECS o EC2)

1. **EC2:** Siga los pasos de "Servidor con Docker" arriba
2. **ECS:** Use las imágenes Docker y configure task definitions
3. **RDS:** Use PostgreSQL administrado en lugar de contenedor

#### Google Cloud Platform

1. **Compute Engine:** Similar a EC2
2. **Cloud Run:** Despliegue contenedores directamente
3. **Cloud SQL:** PostgreSQL administrado

#### DigitalOcean

1. **Droplet:** Servidor virtual con Docker
2. **App Platform:** Despliegue automatizado desde GitHub
3. **Managed PostgreSQL:** Base de datos administrada

#### Vercel (Frontend) + Railway/Render (Backend)

**Frontend en Vercel:**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desde apps/frontend
cd apps/frontend
vercel --prod
```

Configure variables de entorno en Vercel Dashboard:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_API_BASE_URL`

**Backend en Railway/Render:**
- Conecte su repositorio GitHub
- Configure variables de entorno
- Ejecute migraciones automáticamente

---

## Configuración de CORS

El backend usa la variable `CORS_ORIGINS` para controlar qué dominios pueden acceder a la API.

### Desarrollo:
```env
CORS_ORIGINS=http://localhost:3000
```

### Producción:
```env
CORS_ORIGINS=https://www.your-domain.com,https://your-domain.com,https://api.your-domain.com
```

### Permitir todos (NO recomendado en producción):
```env
CORS_ORIGINS=*
```

---

## SSL/TLS (HTTPS)

### Desarrollo local (opcional)

Puede usar mkcert para HTTPS en desarrollo:
```bash
# Instalar mkcert
brew install mkcert  # macOS
# o
choco install mkcert # Windows
# o
apt install mkcert   # Linux

# Generar certificados
mkcert -install
mkcert localhost 127.0.0.1 ::1
```

### Producción

**Opción 1: Let's Encrypt (gratis, recomendado)**
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

**Opción 2: Certificado comercial**
- Compre certificado SSL de proveedor (GoDaddy, Namecheap, etc.)
- Configure en Nginx:
```nginx
ssl_certificate /path/to/certificate.crt;
ssl_certificate_key /path/to/private.key;
```

---

## Troubleshooting

### Problema: CORS errors en el navegador

**Solución:**
1. Verifique que `CORS_ORIGINS` incluya su dominio
2. Asegúrese de que el frontend use el dominio correcto en `NEXT_PUBLIC_API_URL`
3. Reinicie el backend después de cambiar CORS

### Problema: Imágenes no se cargan

**Solución:**
1. Verifique `NEXT_PUBLIC_API_BASE_URL` en el frontend
2. Asegúrese de que Nginx permita tamaño de archivo adecuado (`client_max_body_size`)
3. Verifique permisos en `apps/backend/uploads/`

### Problema: Error de conexión a base de datos

**Solución:**
1. Verifique que PostgreSQL esté corriendo: `docker compose ps`
2. Verifique `DATABASE_URL` en variables de entorno
3. Verifique logs: `docker compose logs postgres`

### Problema: Build failures en Docker

**Solución:**
1. Limpie caché de Docker: `docker system prune -a`
2. Reconstruya: `docker compose up -d --build --force-recreate`
3. Verifique espacio en disco: `df -h`

### Problema: 502 Bad Gateway en Nginx

**Solución:**
1. Verifique que los contenedores estén corriendo: `docker compose ps`
2. Verifique logs de Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Verifique firewall: `sudo ufw status`

---

## Monitoreo y Mantenimiento

### Logs

```bash
# Logs en tiempo real
docker compose logs -f

# Logs de un servicio específico
docker compose logs -f backend

# Últimas 100 líneas
docker compose logs --tail=100
```

### Backups de base de datos

```bash
# Crear backup
docker compose exec postgres pg_dump -U tienda_user mi_tienda_db > backup.sql

# Restaurar backup
docker compose exec -T postgres psql -U tienda_user mi_tienda_db < backup.sql
```

### Actualizar aplicación

```bash
cd /var/www/mi-tienda-app
git pull
docker compose down
docker compose up -d --build
```

### Renovación de certificados SSL

Let's Encrypt se renueva automáticamente con certbot, pero puede verificar:
```bash
sudo certbot renew --dry-run
```

---

## Checklist de Despliegue

- [ ] Variables de entorno configuradas
- [ ] Contraseñas fuertes generadas
- [ ] JWT_SECRET aleatorio configurado
- [ ] CORS configurado con dominios correctos
- [ ] DNS apuntando al servidor
- [ ] SSL/TLS configurado
- [ ] Nginx configurado como proxy reverso
- [ ] Firewall configurado (puertos 80, 443 abiertos)
- [ ] Migraciones de base de datos ejecutadas
- [ ] Backup automático configurado
- [ ] Logs configurados y monitoreados
- [ ] Health checks funcionando
- [ ] Pruebas end-to-end realizadas

---

## Soporte

Para problemas o preguntas adicionales, consulte:
- [CLAUDE.md](./CLAUDE.md) - Documentación del proyecto
- [README.md](./README.md) - Información general
- Issues en GitHub
