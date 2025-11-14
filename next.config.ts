import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit", "jsdom", "svg2img"],
};

export default nextConfig;