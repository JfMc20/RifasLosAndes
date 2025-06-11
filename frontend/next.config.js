/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Optimización para Docker
  poweredByHeader: false, // Eliminar header X-Powered-By por seguridad
  images: {
    domains: ['localhost', '127.0.0.1'],
    remotePatterns: [
      // Patrones locales para desarrollo
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3001',
        pathname: '/uploads/**',
      },
      // Patrón para el dominio de producción
      {
        protocol: 'https',
        hostname: process.env.DOMAIN_NAME || 'rifalosandes.es',
        port: '',
        pathname: '/uploads/**',
      },
      // Patrón para el dominio www
      {
        protocol: 'https',
        hostname: 'www.rifalosandes.es',
        port: '',
        pathname: '/uploads/**',
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
