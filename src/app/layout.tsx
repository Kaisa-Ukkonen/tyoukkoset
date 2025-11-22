import "./globals.css";

export const metadata = {
  title: "TyöUkkoset – Tatuoinnit ja Stand Up | Jesse Ukkonen",
  description:
    "TyöUkkoset – Siilinjärveläinen tatuointitaiteilija ja stand up -koomikko Jesse Ukkonen. Tutustu tatuointeihin, varaa aika ja nauti stand up -esityksistä.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}
