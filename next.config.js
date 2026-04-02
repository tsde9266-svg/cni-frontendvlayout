/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy /api/* → Laravel backend (avoids CORS in dev)
  async rewrites() {
    return [
      {
        source:      '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/:path*`,
      },
    ];
  },

  // Image optimisation — allow all sources used in dev and prod
  images: {
    // Cache optimised images for 1 week
    minimumCacheTTL: 604800,
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.cloudfront.net' },
      { protocol: 'https', hostname: 'cdn.cni.co.uk' },
      { protocol: 'http',  hostname: 'localhost', port: '8000' },
      { protocol: 'http',  hostname: '127.0.0.1', port: '8000' },
      // Allow any https host for external images (press agency CDNs etc)
      { protocol: 'https', hostname: '**' },
    ],
  },

  // Strict mode catches hydration bugs in dev
  reactStrictMode: true,

  // Compress responses
  compress: true,

  // Reduce bundle size
  experimental: {
    optimizePackageImports: ['date-fns', 'clsx'],
  },
};

module.exports = nextConfig;
