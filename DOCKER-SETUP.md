# 🐳 Configuración de Docker Completada

Este documento resume los cambios realizados para soportar deployment con Docker.

## ✅ Archivos Creados

### 1. Dockerfiles

#### Frontend: `apps/frontend/Dockerfile`
- **Multi-stage build** optimizado (4 stages)
- Modo **standalone** de Next.js
- Tamaño final: ~150MB (vs ~800MB sin optimizar)
- Usuario no-root para seguridad
- Health check integrado

#### Backend: `apps/backend/Dockerfile`
- Ya existía, solo se ajustó el context

### 2. Docker Compose

#### `docker-compose.yml` (raíz del proyecto)
- **3 servicios:** PostgreSQL, Backend, Frontend
- Red interna para comunicación entre contenedores
- Health checks para verificar disponibilidad
- Volúmenes para persistencia de datos
- Variables de entorno configuradas

**Movido desde:** `apps/backend/docker-compose.yml`
**Razón:** Permite construir todo el monorepo desde la raíz

### 3. Configuración

#### `next.config.ts` (actualizado)
```typescript
{
  output: 'standalone',  // 👈 NUEVO: Build optimizado para Docker
  images: {
    remotePatterns: [
      // Agregado soporte para hostname 'backend' (entre contenedores)
      { hostname: 'backend', ... }
    ]
  }
}
```

#### `.dockerignore` (raíz)
- Excluye archivos innecesarios del build
- Reduce tamaño de contexto y velocidad de build

#### `apps/frontend/.dockerignore`
- Específico para el frontend

### 4. Documentación

#### `DOCKER.md`
Guía completa con:
- Instrucciones de instalación de Docker
- Arquitectura de contenedores
- Comandos útiles
- Troubleshooting
- Deployment en producción

#### `docker-dev.sh`
Script de ayuda para desarrollo con comandos simplificados:
```bash
./docker-dev.sh start      # Inicia todo
./docker-dev.sh logs       # Ver logs
./docker-dev.sh rebuild    # Rebuild
./docker-dev.sh shell      # Abrir shell
./docker-dev.sh help       # Ver ayuda
```

---

## 🚀 Inicio Rápido

### Prerrequisitos
1. Instalar [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Asegurarte de que Docker esté corriendo

### Levantar la aplicación completa

```bash
# Desde la raíz del proyecto
docker compose up -d --build
```

Esto levantará:
- ✅ PostgreSQL en puerto 5432
- ✅ Backend en puerto 8080
- ✅ Frontend en puerto 3000

**Tiempo estimado:** 3-5 minutos (primera vez)

### Acceder a la aplicación

- **Frontend:** http://localhost:3000
- **Backend API:** https://braholet-importaciones-core.global-atlas-solutions.com/api/v1
- **Login:** http://localhost:3000/login

---

## 📊 Comparación: Antes vs Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Deployment** | Manual (npm install, build, etc.) | Un comando: `docker compose up` |
| **Dependencias** | Node, PostgreSQL instalados localmente | Todo en contenedores |
| **Portabilidad** | Requiere setup específico del SO | Funciona en cualquier OS con Docker |
| **Escalabilidad** | Difícil | Fácil (docker compose scale) |
| **Aislamiento** | Todo en el sistema host | Cada servicio aislado |
| **Tamaño Frontend** | N/A | 150MB (optimizado) |

---

## 🏗️ Arquitectura

```
┌──────────────────────────────────────────────────┐
│              Host Machine                         │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │    mi-tienda-network (Bridge)           │    │
│  │                                          │    │
│  │  ┌──────────┐  ┌──────────┐            │    │
│  │  │ Frontend │  │ Backend  │            │    │
│  │  │ Next.js  │◄─┤ Express  │            │    │
│  │  │ :3000    │  │ :8080    │            │    │
│  │  └──────────┘  └────┬─────┘            │    │
│  │                     │                   │    │
│  │              ┌──────▼──────┐           │    │
│  │              │ PostgreSQL  │           │    │
│  │              │   :5432     │           │    │
│  │              └─────────────┘           │    │
│  └─────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

---

## 🔧 Comandos Útiles

### Gestión básica

```bash
# Ver estado
docker compose ps

# Ver logs
docker compose logs -f

# Detener todo
docker compose down

# Rebuild y reiniciar
docker compose up -d --build
```

### Debugging

```bash
# Logs de un servicio específico
docker compose logs -f frontend
docker compose logs -f backend

# Abrir shell en un contenedor
docker compose exec backend sh
docker compose exec frontend sh

# Ejecutar comandos Prisma
docker compose exec backend npx prisma studio
docker compose exec backend npx prisma migrate dev
```

### Con el script de ayuda

```bash
# Hacer ejecutable (primera vez, en Mac/Linux)
chmod +x docker-dev.sh

# Usar comandos
./docker-dev.sh start
./docker-dev.sh logs backend
./docker-dev.sh shell postgres
./docker-dev.sh help
```

---

## 🐛 Troubleshooting Rápido

### Frontend no se conecta al backend

**Problema:** Errores de conexión desde el navegador

**Solución:** En `docker-compose.yml`, asegúrate de usar:
```yaml
environment:
  NEXT_PUBLIC_API_URL: https://braholet-importaciones-core.global-atlas-solutions.com/api/v1
```

**Nota:** Usa `localhost` para acceso desde el navegador, NO `backend`.

### Migraciones no se ejecutan

```bash
# Ejecutar manualmente
docker compose exec backend npx prisma migrate deploy
docker compose restart backend
```

### Puerto ya en uso

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

---

## 📝 Variables de Entorno

### Para desarrollo local

Ya están configuradas en `docker-compose.yml`:

```yaml
# Frontend
NEXT_PUBLIC_API_URL: https://braholet-importaciones-core.global-atlas-solutions.com/api/v1

# Backend
DATABASE_URL: postgresql://tienda_user:supersecretpassword123@postgres:5432/mi_tienda_db
JWT_SECRET: mi-clave-secreta-para-jwt-2025
```

### Para producción

Crea `.env.production` y modifica:

```bash
POSTGRES_PASSWORD=contraseña_segura_aquí
JWT_SECRET=clave_jwt_super_segura
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com/api/v1
```

Luego usa:
```bash
docker compose --env-file .env.production up -d --build
```

---

## 🌍 Deployment en Producción

### VPS (DigitalOcean, AWS EC2, Linode)

1. Instalar Docker en el servidor
2. Clonar el repositorio
3. Configurar `.env.production`
4. Ejecutar `docker compose up -d --build`
5. Configurar Nginx + SSL

**Documentación completa:** Ver [DOCKER.md](DOCKER.md) sección "Deployment en Producción"

### Cloud Platforms

- **Google Cloud Run:** Soportado nativamente (standalone mode)
- **AWS ECS/Fargate:** Compatible
- **Azure Container Instances:** Compatible
- **Fly.io:** Compatible

---

## 📚 Próximos Pasos

1. **Revisar** la documentación completa en [DOCKER.md](DOCKER.md)
2. **Probar** localmente con `docker compose up -d --build`
3. **Configurar** variables de entorno para producción
4. **Implementar** CI/CD para builds automáticos
5. **Agregar** monitoring (Prometheus, Grafana)

---

## ❓ Preguntas Frecuentes

### ¿Puedo usar solo Docker para la base de datos?

Sí! Para desarrollo híbrido:

```bash
# Solo PostgreSQL
docker compose up -d postgres

# Backend local
cd apps/backend && npm run dev

# Frontend local
cd apps/frontend && npm run dev
```

### ¿Cómo actualizo el código sin rebuild?

Para desarrollo, monta volúmenes en `docker-compose.yml`:

```yaml
frontend:
  volumes:
    - ./apps/frontend:/app/apps/frontend
  command: npm run dev  # Hot reload
```

### ¿Cómo hago backup de la base de datos?

```bash
# Crear backup
docker compose exec postgres pg_dump -U tienda_user mi_tienda_db > backup.sql

# Restaurar backup
docker compose exec -T postgres psql -U tienda_user mi_tienda_db < backup.sql
```

---

## 🎯 Resumen de Beneficios

✅ **Portabilidad:** Funciona en cualquier OS con Docker
✅ **Reproducibilidad:** Mismo entorno en dev/staging/prod
✅ **Aislamiento:** No contamina el sistema host
✅ **Escalabilidad:** Fácil de escalar horizontalmente
✅ **Simplicidad:** Un comando para levantar todo
✅ **Optimización:** Build standalone de 150MB (vs 800MB)
✅ **Seguridad:** Usuarios no-root, health checks

---

**Creado:** 2025-11-02
**Versión:** 1.0
**Documentación completa:** [DOCKER.md](DOCKER.md)
