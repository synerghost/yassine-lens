import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder photos are served pre-sized from Unsplash; bypass the
    // optimizer so there are no remote-pattern / quota constraints.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
