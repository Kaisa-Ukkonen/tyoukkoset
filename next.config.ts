import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tämä sallii PDFKitin käyttää omia tiedostojaan (kuten Helvetica.afm)
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;