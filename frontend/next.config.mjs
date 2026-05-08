/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  compress: true,
  trailingSlash: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
