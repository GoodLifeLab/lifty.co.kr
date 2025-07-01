import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Supabase node-fetch 관련 설정
    config.resolve.alias = {
      ...config.resolve.alias,
      'node-fetch': 'isomorphic-fetch',
    };

    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
  // Turbopack 호환성을 위한 설정
  transpilePackages: ['@supabase/supabase-js'],
};

export default nextConfig;
