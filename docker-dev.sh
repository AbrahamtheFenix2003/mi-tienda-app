#!/bin/bash

# ============================================
# Script de ayuda para desarrollo con Docker
# Mi Tienda App
# ============================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}\n"
}

# Verificar que Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado. Por favor instala Docker Desktop."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker no está corriendo. Por favor inicia Docker Desktop."
        exit 1
    fi

    print_success "Docker está instalado y corriendo"
}

# Función: Iniciar todo
start_all() {
    print_header "Iniciando todos los servicios"
    check_docker

    print_info "Construyendo imágenes y levantando contenedores..."
    docker compose up -d --build

    print_success "Todos los servicios están iniciando"
    print_info "Espera unos segundos y ejecuta './docker-dev.sh status' para ver el estado"
    print_info ""
    print_info "Accede a la aplicación en:"
    print_info "  - Frontend: http://localhost:3000"
    print_info "  - Backend:  http://localhost:8080"
}

# Función: Detener todo
stop_all() {
    print_header "Deteniendo todos los servicios"
    docker compose stop
    print_success "Todos los servicios detenidos"
}

# Función: Ver estado
status() {
    print_header "Estado de los servicios"
    docker compose ps

    echo ""
    print_info "Para ver logs en tiempo real:"
    print_info "  ./docker-dev.sh logs [servicio]"
}

# Función: Ver logs
logs() {
    local service=$1

    if [ -z "$service" ]; then
        print_header "Logs de todos los servicios"
        print_info "Presiona Ctrl+C para salir"
        docker compose logs -f
    else
        print_header "Logs de $service"
        print_info "Presiona Ctrl+C para salir"
        docker compose logs -f "$service"
    fi
}

# Función: Rebuild
rebuild() {
    local service=$1

    if [ -z "$service" ]; then
        print_header "Rebuilding todos los servicios"
        docker compose build --no-cache
        docker compose up -d
        print_success "Todos los servicios reconstruidos"
    else
        print_header "Rebuilding $service"
        docker compose build --no-cache "$service"
        docker compose up -d "$service"
        print_success "$service reconstruido"
    fi
}

# Función: Limpiar
clean() {
    print_header "Limpieza de Docker"
    print_warning "Esta acción detendrá y eliminará todos los contenedores"
    read -p "¿Continuar? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker compose down
        print_success "Contenedores eliminados"

        read -p "¿Eliminar también los volúmenes (base de datos)? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker compose down -v
            print_warning "Volúmenes eliminados (base de datos borrada)"
        fi
    else
        print_info "Operación cancelada"
    fi
}

# Función: Shell
shell() {
    local service=$1

    if [ -z "$service" ]; then
        print_error "Debes especificar un servicio: backend, frontend, o postgres"
        exit 1
    fi

    print_header "Abriendo shell en $service"

    if [ "$service" == "postgres" ]; then
        docker compose exec postgres psql -U tienda_user -d mi_tienda_db
    else
        docker compose exec "$service" sh
    fi
}

# Función: Migrations
migrate() {
    print_header "Ejecutando migraciones de Prisma"
    docker compose exec backend npx prisma migrate deploy
    print_success "Migraciones completadas"
}

# Función: Seed
seed() {
    print_header "Ejecutando seed de base de datos"
    docker compose exec backend npm run seed
    print_success "Seed completado"
}

# Función: Help
show_help() {
    cat << EOF
${BLUE}Mi Tienda App - Docker Helper${NC}

${GREEN}Uso:${NC}
  ./docker-dev.sh [comando] [argumentos]

${GREEN}Comandos disponibles:${NC}

  ${YELLOW}start${NC}              Inicia todos los servicios (build + up)
  ${YELLOW}stop${NC}               Detiene todos los servicios
  ${YELLOW}restart${NC}            Reinicia todos los servicios
  ${YELLOW}status${NC}             Muestra el estado de los servicios

  ${YELLOW}logs [servicio]${NC}    Ver logs en tiempo real
                       Servicios: frontend, backend, postgres
                       Sin argumentos: muestra todos los logs

  ${YELLOW}rebuild [servicio]${NC} Reconstruye las imágenes desde cero
                       Sin argumentos: reconstruye todo

  ${YELLOW}shell <servicio>${NC}   Abre una shell en el contenedor
                       Servicios: backend, frontend
                       postgres: abre psql

  ${YELLOW}migrate${NC}            Ejecuta migraciones de Prisma
  ${YELLOW}seed${NC}               Ejecuta seed de la base de datos

  ${YELLOW}clean${NC}              Elimina contenedores y opcionalmente volúmenes
  ${YELLOW}help${NC}               Muestra esta ayuda

${GREEN}Ejemplos:${NC}

  # Iniciar todo
  ./docker-dev.sh start

  # Ver logs del backend
  ./docker-dev.sh logs backend

  # Rebuild solo el frontend
  ./docker-dev.sh rebuild frontend

  # Abrir shell en el backend
  ./docker-dev.sh shell backend

  # Conectarse a PostgreSQL
  ./docker-dev.sh shell postgres

  # Ejecutar migraciones
  ./docker-dev.sh migrate

${GREEN}URLs:${NC}
  Frontend: ${BLUE}http://localhost:3000${NC}
  Backend:  ${BLUE}http://localhost:8080${NC}

${GREEN}Documentación completa:${NC}
  Ver ${BLUE}DOCKER.md${NC} para más información

EOF
}

# Main
case "$1" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        stop_all
        start_all
        ;;
    status)
        status
        ;;
    logs)
        logs "$2"
        ;;
    rebuild)
        rebuild "$2"
        ;;
    shell)
        shell "$2"
        ;;
    migrate)
        migrate
        ;;
    seed)
        seed
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Comando desconocido: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
