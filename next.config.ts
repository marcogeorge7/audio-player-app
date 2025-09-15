import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration for GitHub Pages static export
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Base path for GitHub Pages (will be set by environment variable)
  basePath: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_PATH || '' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_PATH || '' : '',
};

export default nextConfig;
