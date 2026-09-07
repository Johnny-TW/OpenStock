import path from "node:path";
import type { NextConfig } from "next";

const BACKEND_API_URL = (
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_HOST ||
  "http://localhost:3004"
).replace(/\/+$/, "");

// 已由外部反向代理（nginx）處理 /api 時，值不會是絕對網址，此時不再加 rewrite 以免無限迴圈
const shouldProxyApi = /^https?:\/\//.test(BACKEND_API_URL);

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../"),
  async rewrites() {
    if (!shouldProxyApi) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_API_URL}/:path*`,
      },
    ];
  },
  images: {
    dangerouslyAllowSVG: true,
    minimumCacheTTL: 60,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
