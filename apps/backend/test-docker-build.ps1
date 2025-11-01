# Script para verificar que la imagen Docker del backend se construye correctamente (PowerShell)

Write-Host "Verificando la construcción de la imagen Docker para el backend..."

# Verificar que existen los archivos necesarios
if (-not (Test-Path "Dockerfile")) {
  Write-Host "Error: No se encuentra el archivo Dockerfile"
  exit 1
}

if (-not (Test-Path "package.json")) {
  Write-Host "Error: No se encuentra el archivo package.json"
  exit 1
}

if (-not (Test-Path ".dockerignore")) {
  Write-Host "Error: No se encuentra el archivo .dockerignore"
  exit 1
}

Write-Host "Todos los archivos necesarios están presentes."

# Intentar construir la imagen Docker
Write-Host "Construyendo la imagen Docker..."
docker build -t mi-tienda-backend:test .

if ($LASTEXITCODE -eq 0) {
  Write-Host "¡La imagen Docker se construyó correctamente!"
  Write-Host "Puedes ejecutarla con: docker run -p 8080:8080 mi-tienda-backend:test"
} else {
  Write-Host "Error: La construcción de la imagen Docker falló."
  exit 1
}