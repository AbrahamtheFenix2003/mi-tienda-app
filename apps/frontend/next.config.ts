import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Modo standalone optimizado para Docker
  // Genera una build con solo las dependencias necesarias
  output: 'standalone',

  // Configuración para resolver advertencias de CORS en desarrollo
  // Permite solicitudes desde orígenes específicos en desarrollo Docker
  allowedDevOrigins: [
    '172.26.192.1', // IP específica del error
    '172.16.0.0/12', // Rango de IPs privadas de Docker
    '192.168.0.0/16', // Rango de IPs privadas
    '10.0.0.0/8',     // Rango de IPs privadas
  ],

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/uploads/**',
      },
      {
        // Permitir imágenes del backend en producción/Docker
        protocol: 'http',
        hostname: 'backend',
        port: '8080',
        pathname: '/uploads/**',
      },
      {
        // Permitir IPs de red local para desarrollo Docker
        protocol: 'http',
        hostname: '172.26.192.1',
        port: '8080',
        pathname: '/uploads/**',
      },
    ],
    // Desactivar optimización completamente para evitar problemas de resolución DNS en Docker
    // En Docker, Next.js no puede resolver correctamente los nombres de contenedores a IPs públicas
    unoptimized: true,
  },

  // Configuración de rewrites para manejar imágenes dinámicamente
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/uploads/:path*`,
      },
    ];
  },

  // Configuración de headers para CORS
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
