/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: false, // disable in prod — saves a double-render
  compress: true,
  trailingSlash: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
