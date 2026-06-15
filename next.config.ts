import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: [],
  experimental: {
    typedEnv: true,
  },
  images: {
    qualities: [100, 80],
  },
};

export default nextConfig;
