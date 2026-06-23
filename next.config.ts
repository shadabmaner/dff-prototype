import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "onpointnexus.com",
      },
      {
        protocol: "https",
        hostname: "drbhagyeshkulkarni.com",
      },
    ],
  },
};

export default nextConfig;
