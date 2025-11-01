# Usar la imagen oficial de Node.js como imagen base
FROM node:18-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de configuración de npm
COPY package*.json ./

# Copiar los archivos de configuración del monorepo
COPY ../../package*.json ../../*.json ./

# Instalar las dependencias
RUN npm install --omit=dev --no-audit --prefer-offline

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