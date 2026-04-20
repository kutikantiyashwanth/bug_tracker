/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ── Completely skip TypeScript and ESLint during build ──
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  devIndicators: false,
  compress: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
