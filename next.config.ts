import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from the POS device for HMR & Hydration
  // Use a catch-all pattern or the specific IP of the mobile device
  experimental: {
    // some versions of Next.js expect this under experimental
  },
  // In Next 15+ it's a top-level config
  // @ts-ignore
  allowedDevOrigins: ['192.168.1.38', '192.168.1.55', 'localhost'],
};

export default nextConfig;
