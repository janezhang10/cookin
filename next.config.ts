import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import path from "node:path";

process.env.XDG_CONFIG_HOME ??= path.join(
  process.cwd(),
  ".wrangler",
  "config",
);

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
