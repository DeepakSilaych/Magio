import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    "*.run.pinggy-free.link",
    "*.trycloudflare.com",
    "*.ngrok-free.app",
  ],
};

export default nextConfig;
