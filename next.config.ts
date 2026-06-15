import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Ensure Next.js loads .env from this project, not a parent folder
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
