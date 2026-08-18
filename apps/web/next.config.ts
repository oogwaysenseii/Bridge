import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace packages are consumed as source/ESM; let Next transpile them.
  transpilePackages: ["@bridge/shared"],
};

export default nextConfig;
