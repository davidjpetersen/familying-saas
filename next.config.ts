import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "img.clerk.com" }],
  },
  transpilePackages: [
    "@familying/feature-registry",
  ],
};

export default nextConfig;
