import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: [],
  experimental: {
    typedEnv: true,
    serverActions: {
      bodySizeLimit: "40mb",
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: `/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/**`,
      },
    ],
    unoptimized: true,
    qualities: [100, 80],
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
