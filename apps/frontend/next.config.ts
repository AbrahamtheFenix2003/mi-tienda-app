import type { NextConfig } from "next";

// Obtener configuración dinámica desde variables de entorno
const getBackendHost = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  try {
    const url = new URL(apiUrl);
    return {
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? '443' : '80'),
    };
  } catch {
    // Fallback si la URL no es válida
    return {
      protocol: 'http' as const,
      hostname: 'localhost',
      port: '8080',
    };
  }
};

const backendConfig = getBackendHost();

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
        // Configuración dinámica basada en variables de entorno
        protocol: backendConfig.protocol,
        hostname: backendConfig.hostname,
        port: backendConfig.port,
        pathname: '/uploads/**',
      },
      // Mantener localhost para desarrollo local
      {
        protocol: 'http',
        hostname: 'localhost',
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
