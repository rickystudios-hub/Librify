import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["yt-search", "cheerio"],
};

export default nextConfig;
