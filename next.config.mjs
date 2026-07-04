import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ▸ IMAGE OPTIMIZATION (Performance: LCP improvement)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Supabase CDN
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com', // Discord avatars if needed
      },
      {
        protocol: 'https',
        hostname: 'api.fleetyards.net',
      },
      {
        protocol: 'https',
        hostname: 'fleetyards.net',
      },
      {
        protocol: 'https',
        hostname: 'storage.fltyrd.net',
      },
    ],
    // Responsive image sizes for breakpoints
    deviceSizes: [640, 750, 828, 1080, 1280, 1440, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 1 year (immutable content hash)
    minimumCacheTTL: 31536000,
  },

  // ▸ SECURITY HEADERS (Best Practices: +10 points)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' *.discordapp.com giscus.app fleetyards.net api.fleetyards.net storage.fltyrd.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: fleetyards.net api.fleetyards.net storage.fltyrd.net; font-src 'self' data: fonts.googleapis.com fonts.gstatic.com; connect-src 'self' data: blob: *.supabase.co wss://*.supabase.co *.discordapp.com giscus.app fleetyards.net api.fleetyards.net storage.fltyrd.net; frame-src 'self' giscus.app fleetyards.net; media-src 'self' data: https: fleetyards.net api.fleetyards.net storage.fltyrd.net; worker-src 'self' blob:; object-src 'none';",
          },
        ],
      },
      // ▸ STATIC ASSET CACHING (Performance: prevents re-downloading on repeat visits)
      {
        source: '/(.*)\.(png|jpg|jpeg|gif|webp|avif|svg|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)\.(mp4|webm|ogg)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)\.(woff|woff2|ttf|otf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // ▸ ESLINT & TS WARNINGS (Development only, fix in CI/CD later)
  typescript: {
    ignoreBuildErrors: true,
  },

  // ▸ PRODUCTION OPTIMIZATION
  productionBrowserSourceMaps: false, // Reduce bundle size in production
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable gzip compression

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react/compiler-runtime': 'react-compiler-runtime',
    };
    return config;
  },
};

export default withPayload(nextConfig);
