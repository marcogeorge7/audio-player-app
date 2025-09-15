import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration for GitHub Pages static export
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Base path for GitHub Pages repository deployment
  basePath: process.env.NODE_ENV === 'production' ? '/audio-player-app' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/audio-player-app' : '',
};

export default nextConfig;
