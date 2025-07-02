/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverComponentsExternalPackages: ["prisma", "@prisma/client"],
  },
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 365,
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        hostname: "images.unsplash.com",
      },
      {
        hostname: "tailwindui.com",
      },
      {
        hostname: "randomuser.me",
      },
    ],
    unoptimized: true,
    domains: ["localhost"],
  },
  swcMinify: false,
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
