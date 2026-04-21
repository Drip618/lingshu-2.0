import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['undici', 'http', 'https'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
