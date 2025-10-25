import "./globals.css";

export const metadata = {
  title: "TyöUkkoset",
  description: "Tatuointia ja Stand Upia asenteella",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}
