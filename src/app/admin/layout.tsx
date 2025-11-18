"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState(false);

  const links = [
    { name: "Dashboard", path: "/admin" },
    { name: "Tatuoinnit", path: "/admin/tattoos" },
    { name: "Stand Up", path: "/admin/standup" },
  ];

  const bookkeepingLinks = [
    { label: "Etusivu", href: "/admin/bookkeeping" },
    { label: "Tapahtumat", href: "/admin/bookkeeping/events" },
    { label: "Kategoriat", href: "/admin/bookkeeping/categories" },
    { label: "Laskut", href: "/admin/bookkeeping/invoices" },
    { label: "Kontaktit", href: "/admin/bookkeeping/contacts" },
    { label: "Tuotteet", href: "/admin/bookkeeping/products" },
    { label: "Keikkamatkat", href: "/admin/bookkeeping/trips" },
    { label: "Tilikaudet", href: "/admin/bookkeeping/financial-years" },
    { label: "ALV-kaudet", href: "/admin/bookkeeping/vat-periods" },
    { label: "Raportit", href: "/admin/bookkeeping/reports" },
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
      <div className="absolute inset-0 bg-black/40" />

      {/* --- HEADER --- */}
      <header className="relative z-40 bg-black/40 backdrop-blur-md border-b border-yellow-600/30 px-6 py-4 flex flex-wrap justify-center gap-6 text-sm sm:text-base font-semibold uppercase tracking-wide shadow-[0_2px_15px_rgba(0,0,0,0.5)] transition-all duration-500">
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

        {/* 🔽 Kirjanpito dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setOpenDropdown(true)}
          onMouseLeave={() => setOpenDropdown(false)}
        >
          <button
            className={`flex items-center gap-1 transition ${
              pathname.startsWith("/admin/bookkeeping")
                ? "text-yellow-400 border-b-2 border-yellow-400 pb-1"
                : "text-gray-400 hover:text-yellow-300"
            }`}
          >
            KIRJANPITO
            <motion.span
              animate={{ rotate: openDropdown ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.span>
          </button>

          <AnimatePresence>
            {openDropdown && (
              <motion.ul
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 mt-2 bg-black/90 border border-yellow-700/40 rounded-lg shadow-lg py-2 min-w-[220px] z-50"
              >
                {bookkeepingLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpenDropdown(false)} // 🔥 sulkee dropdownin aina
                      className={`block px-4 py-2 text-sm transition ${
                        pathname === item.href
                          ? "bg-yellow-700/30 text-yellow-400"
                          : "text-gray-300 hover:bg-yellow-700/20 hover:text-yellow-400"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* --- SISÄLTÖ --- */}
<main className="relative z-10 flex-1 px-2 py-4 sm:px-6 sm:py-6 lg:p-8 pb-20">
        {children}
      </main>
      {/* --- FOOTER --- */}
      <footer className="relative z-10 text-center text-gray-500 py-4 border-t border-yellow-700/30 text-sm">
        © {new Date().getFullYear()} TyöUkkoset – Admin Panel
      </footer>
    </div>
  );
}
