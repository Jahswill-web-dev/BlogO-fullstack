import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://pbs.twimg.com/**"),
      new URL("https://lh3.googleusercontent.com/**"),
    ],
  },
};

export default nextConfig;
