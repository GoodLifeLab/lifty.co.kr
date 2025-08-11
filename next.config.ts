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
    domains: [
      "localhost",
      "lifty-co-kr.vercel.app",
      "lifty-staging.vercel.app",
    ],
  },
  swcMinify: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  // 성능 최적화 설정
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
