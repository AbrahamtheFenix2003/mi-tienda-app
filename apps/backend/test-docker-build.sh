#!/bin/bash

# Script para verificar que la imagen Docker del backend se construye correctamente

echo "Verificando la construcción de la imagen Docker para el backend..."

# Verificar que existen los archivos necesarios
if [ ! -f "Dockerfile" ]; then
  echo "Error: No se encuentra el archivo Dockerfile"
  exit 1
fi

if [ ! -f "package.json" ]; then
  echo "Error: No se encuentra el archivo package.json"
  exit 1
fi

if [ ! -f ".dockerignore" ]; then
  echo "Error: No se encuentra el archivo .dockerignore"
  exit 1
fi

echo "Todos los archivos necesarios están presentes."

# Intentar construir la imagen Docker
echo "Construyendo la imagen Docker..."
docker build -t mi-tienda-backend:test .

if [ $? -eq 0 ]; then
  echo "¡La imagen Docker se construyó correctamente!"
  echo "Puedes ejecutarla con: docker run -p 8080:8080 mi-tienda-backend:test"
else
  echo "Error: La construcción de la imagen Docker falló."
  exit 1
fi