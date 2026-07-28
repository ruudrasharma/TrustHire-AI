import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8081";

const nextConfig: NextConfig = {
  // Proxy /api/* → Spring Boot backend.
  // In production the backend runs on the same server (localhost:8080).
  // Tailscale Funnel only exposes port 3000; the backend is never publicly exposed directly.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
