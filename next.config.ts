import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🔧 Pakotetaan käyttämään SWC:tä — ei Turbopackia
  distDir: ".next",
  // Tämä rivi poistaa Turbopackin buildista:
  // (Next.js valitsee automaattisesti SWC:n kun turboa ei ole käytössä)
  experimental: {
    // Estetään Turbopack for server actions, build, dev, everything
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // 🔧 Nämä sinun aiemmat asetukset säilyvät
  serverExternalPackages: ["pdfkit", "jsdom", "svg2img"],
};

export default nextConfig;
