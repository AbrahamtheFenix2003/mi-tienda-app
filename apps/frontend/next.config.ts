import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Modo standalone optimizado para Docker
  // Genera una build con solo las dependencias necesarias
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/uploads/**',
      },
      {
        // Permitir imágenes del backend en producción
        protocol: 'http',
        hostname: 'backend',
        port: '8080',
        pathname: '/uploads/**',
      },
    ],
    // Desactivar optimización en desarrollo para localhost
    // Next.js Image optimizer tiene problemas con localhost en desarrollo
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
