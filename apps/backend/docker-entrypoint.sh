#!/bin/sh
set -e

echo "🚀 Iniciando backend..."

# Ejecutar migraciones de Prisma
echo "📦 Ejecutando migraciones de Prisma..."
npx prisma migrate deploy

# Verificar estado de las migraciones
echo "✅ Migraciones completadas"

# Ejecutar seed (crear usuario admin si no existe)
echo "🌱 Ejecutando seed de base de datos..."
npm run seed

echo "✅ Seed completado"

# Iniciar la aplicación
echo "🎯 Iniciando servidor..."
exec "$@"
