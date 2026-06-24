import type { NextConfig } from "next";
import { MAX_SERVER_BODY_SIZE_MB } from "./constants/keys";

const nextConfig: NextConfig = {
  typedRoutes: true,
  experimental: {
    typedEnv: true,
    proxyClientMaxBodySize: MAX_SERVER_BODY_SIZE_MB,
    serverActions: {
      bodySizeLimit: MAX_SERVER_BODY_SIZE_MB,
    },
  },
  images: {
    qualities: [100, 70],
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: `/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/**`,
      },
    ],
  },
};

export default nextConfig;
