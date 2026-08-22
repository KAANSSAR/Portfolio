import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pins the project root explicitly so Turbopack doesn't try to infer it
  // from a stray lockfile elsewhere on disk (e.g. one sitting in $HOME).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
