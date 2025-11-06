# Despliegue del Backend con Docker

Este documento describe cómo construir y desplegar el backend de la aplicación "Mi Tienda" utilizando Docker y Docker Compose.

## Requisitos Previos

- Docker instalado en tu sistema
- Docker Compose instalado en tu sistema

## Estructura de Archivos

```
apps/backend/
├── Dockerfile
├── .dockerignore
├── docker-compose.yml
└── DOCKER_DEPLOY.md (este archivo)
```

## Dockerfile

El `Dockerfile` define cómo construir la imagen Docker para el backend:

```dockerfile
# Usar la imagen oficial de Node.js como imagen base
FROM node:18-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de configuración de npm
COPY package*.json ./

# Copiar los archivos de configuración del monorepo
COPY ../../package*.json ../../*.json ./

# Instalar las dependencias
RUN npm ci --only=production

# Copiar el código fuente y los archivos de configuración
COPY . .

# Generar el cliente de Prisma
RUN npx prisma generate

# Compilar el código TypeScript
RUN npm run build

# Exponer el puerto en el que la aplicación escuchará
EXPOSE 8080

# Comando para ejecutar la aplicación
CMD ["npm", "start"]
```

## .dockerignore

El archivo `.dockerignore` especifica qué archivos y directorios deben ser ignorados durante la construcción de la imagen Docker:

```
node_modules
dist
.env
.git
.gitignore
README.md
Dockerfile
.dockerignore
*.md
*.log
.nyc_output
.coverage
.nyc_output
.coverage
.vscode
.DS_Store
uploads/*
!uploads/.gitkeep
```

## Docker Compose

El archivo `docker-compose.yml` define los servicios necesarios para ejecutar la aplicación:

```yaml
# Versión del formato de docker-compose
version: '3.8'

# Definición de los servicios (contenedores)
services:
  # Nombre de nuestro servicio de base de datos
  postgres:
    # Usaremos la imagen oficial de Postgres v16, en su versión ligera "alpine"
    image: postgres:16-alpine
    
    # Le damos un nombre específico al contenedor para identificarlo fácilmente
    container_name: mi-tienda-db
    
    # Política de reinicio: si el contenedor se detiene, Docker intentará levantarlo de nuevo
    restart: always
    
    # Variables de entorno para configurar la base de datos
    environment:
      POSTGRES_USER: tienda_user # El usuario de la base de datos
      POSTGRES_PASSWORD: supersecretpassword123 # La contraseña (cámbiala si quieres)
      POSTGRES_DB: mi_tienda_db # El nombre de la base de datos que se creará
      
    # Mapeo de puertos: conecta el puerto 5432 de tu máquina al 5432 del contenedor
    # Esto nos permite conectarnos a la base de datos desde localhost:5432
    ports:
      - "5432:5432"
      
    # Volúmenes: aquí es donde se guardarán los datos de forma persistente
    # Incluso si borramos el contenedor, los datos en este volumen no se perderán
    volumes:
      - pgdata:/var/lib/postgresql/data

  # Servicio del backend
  backend:
    # Construir la imagen desde el Dockerfile en el directorio actual
    build: .
    
    # Le damos un nombre específico al contenedor para identificarlo fácilmente
    container_name: mi-tienda-backend
    
    # Política de reinicio: si el contenedor se detiene, Docker intentará levantarlo de nuevo
    restart: always
    
    # Variables de entorno
    environment:
      DATABASE_URL: "postgresql://tienda_user:supersecretpassword123@postgres:5432/mi_tienda_db?schema=public"
      PORT: 8080
      JWT_SECRET: "mi-clave-secreta-para-jwt-2025"
      
    # Mapeo de puertos: conecta el puerto 8080 de tu máquina al 8080 del contenedor
    # Esto nos permite acceder a la API desde localhost:8080
    ports:
      - "8080:8080"
      
    # Volúmenes: montar el directorio uploads para persistencia de archivos
    volumes:
      - ./uploads:/app/uploads
      
    # Dependencias: el backend debe esperar a que la base de datos esté lista
    depends_on:
      - postgres

# Definición de los volúmenes que Docker gestionará
volumes:
  pgdata: {}
```

## Construcción y Ejecución

Para construir y ejecutar los servicios definidos en `docker-compose.yml`, sigue estos pasos:

1. Abre una terminal en el directorio `apps/backend`
2. Ejecuta el siguiente comando para construir las imágenes y levantar los contenedores:

```bash
docker-compose up --build
```

Este comando:
- Construirá la imagen del backend usando el `Dockerfile`
- Descargará la imagen de PostgreSQL si no está presente
- Creará y levantará ambos contenedores (base de datos y backend)
- Mapeará los puertos necesarios
- Configurará los volúmenes para persistencia de datos

3. Para detener los servicios, presiona `Ctrl+C` en la terminal o ejecuta:

```bash
docker-compose down
```

## Variables de Entorno

El backend requiere las siguientes variables de entorno:

- `DATABASE_URL`: URL de conexión a la base de datos PostgreSQL
- `PORT`: Puerto en el que escuchará el servidor (por defecto 8080)
- `JWT_SECRET`: Clave secreta para firmar los tokens JWT

## Persistencia de Datos

- La base de datos se almacena en un volumen Docker llamado `pgdata`
- Los archivos subidos se almacenan en el directorio `uploads` del host, montado en el contenedor

## Acceso a la Aplicación

Una vez que los contenedores estén en ejecución:

- La API estará disponible en `https://braholet-importaciones-core.global-atlas-solutions.com`
- La base de datos estará disponible en `localhost:5432`

## Comandos Útiles

### Ver los logs de los contenedores

```bash
docker-compose logs
```

### Acceder al contenedor de la base de datos

```bash
docker-compose exec postgres psql -U tienda_user -d mi_tienda_db
```

### Acceder al contenedor del backend

```bash
docker-compose exec backend sh
```

### Reconstruir las imágenes

```bash
docker-compose build
```

### Forzar la recreación de los contenedores

```bash
docker-compose up --force-recreate