import type { NextConfig } from "next";

const isPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: isPages ? "export" : undefined,
  basePath: isPages ? "/jackalope" : undefined,
  assetPrefix: isPages ? "/jackalope/" : undefined,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
