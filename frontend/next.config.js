/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Optimización para Docker
  poweredByHeader: false, // Eliminar header X-Powered-By por seguridad
  images: {
    domains: ['localhost', '127.0.0.1', 'rifalosandes.es', 'api.rifalosandes.es', 'www.rifalosandes.es'],
    // Configuración de formatos de imagen - WebP y AVIF son más eficientes
    formats: ['image/webp', 'image/avif'],
    // Calidad de imagen por defecto reducida para mejor rendimiento
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60, // 60 segundos para pruebas, aumentar en producción
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    remotePatterns: [
      // Patrones locales para desarrollo
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3001',
        pathname: '/**',
      },
      // Patrón para el dominio de producción
      {
        protocol: 'https',
        hostname: process.env.DOMAIN_NAME || 'rifalosandes.es',
        port: '',
        pathname: '/**',
      },
      // Patrón para el dominio www
      {
        protocol: 'https',
        hostname: 'www.rifalosandes.es',
        port: '',
        pathname: '/**',
      },
      // Patrón para el API
      {
        protocol: 'https',
        hostname: 'api.rifalosandes.es',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Configuración de proxy para desarrollo
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
