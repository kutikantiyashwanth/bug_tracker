/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  compress: true,
  trailingSlash: true,

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
