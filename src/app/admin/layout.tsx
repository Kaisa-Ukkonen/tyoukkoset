"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", path: "/admin" },
    { name: "Tatuoinnit", path: "/admin/tattoos" },
    { name: "Stand Up", path: "/admin/standup" },
    { name: "Kirjanpito", path: "/admin/bookkeeping" },
  ];

  return (
    <div className="relative min-h-screen text-gray-200 flex flex-col overflow-hidden">
      {/* --- 🔹 Taustakuva savuefektillä --- */}
      <motion.div
        style={{
          backgroundImage: "url('/savutausta.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.05 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
      {/* Tumma suodatin pehmentämään taustaa */}
      <div className="absolute inset-0 bg-black/40" />

      {/* --- HEADER --- */}
      <header className="bg-black/40 backdrop-blur-md border-b border-yellow-600/30 px-6 py-4 flex flex-wrap justify-center gap-6 text-sm sm:text-base font-semibold uppercase tracking-wide shadow-[0_2px_15px_rgba(0,0,0,0.5)] transition-all duration-500">
        {links.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            className={`transition-all duration-200 ${
              pathname === link.path
                ? "text-yellow-400 border-b-2 border-yellow-400 pb-1"
                : "text-gray-400 hover:text-yellow-300"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </header>

      {/* --- SISÄLTÖ --- */}
      <main className="relative z-10 flex-1 p-8">{children}</main>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 text-center text-gray-500 py-4 border-t border-yellow-700/30 text-sm">
        © {new Date().getFullYear()} TyöUkkoset – Admin Panel
      </footer>
    </div>
  );
}
