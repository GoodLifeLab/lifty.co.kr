import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel 배포용 설정 (정적 내보내기 제거)

  // 이미지 최적화 설정
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // 환경 변수 설정
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 리다이렉트 설정
  async redirects() {
    return [
      {
        source: "/old-page",
        destination: "/new-page",
        permanent: true,
      },
    ];
  },

  // 헤더 설정
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // 실험적 기능
  experimental: {
    // 서버 액션 활성화
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // 웹팩 설정
  webpack: (config, { isServer }) => {
    // 클라이언트 사이드에서만 적용되는 설정
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // TypeScript 설정
  typescript: {
    // 빌드 시 TypeScript 오류 무시 (선택사항)
    ignoreBuildErrors: false,
  },

  // ESLint 설정
  eslint: {
    // 빌드 시 ESLint 오류 무시 (선택사항)
    ignoreDuringBuilds: false,
  },

  // 압축 설정
  compress: true,

  // 파워드 바이 설정
  poweredByHeader: false,

  // 리액트 스트릭트 모드
  reactStrictMode: true,

  // Turbopack 호환성을 위한 설정
  transpilePackages: ["@supabase/supabase-js"],
};

export default nextConfig;
