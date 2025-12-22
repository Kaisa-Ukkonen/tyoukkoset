"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { name: "Etusivu", path: "/admin" },
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

    // Nämä eivät ole vielä valmiit → piilotetaan nyt:
    // { label: "Tilikaudet", href: "/admin/bookkeeping/financial-years" },
    // { label: "ALV-kaudet", href: "/admin/bookkeeping/vat-periods" },

    { label: "Raportit", href: "/admin/bookkeeping/reports" },
  ];
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/admin/login");
  };
  const sideWidth = "w-32";
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
      <header className="relative z-40 bg-black/40 backdrop-blur-md border-b border-yellow-600/30 px-4 py-3 flex items-center shadow-[0_2px_15px_rgba(0,0,0,0.5)] transition-all duration-500">
        {/* 🔹 VASEN (hamburger / tyhjä) */}
        <div className={`${sideWidth} flex items-center`}>
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-yellow-400"
            aria-label="Avaa valikko"
          >
            <Menu size={26} />
          </button>
        </div>

        {/* 🖥️ Desktop: keskitetty navigaatio */}
        <nav className="flex-1 flex justify-center">
          <div className="hidden md:flex items-center gap-6 text-sm sm:text-base font-semibold uppercase tracking-wide">
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

            {/* Kirjanpito dropdown (vain desktop) */}
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
                Kirjanpito
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
                          onClick={() => setOpenDropdown(false)}
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
          </div>
        </nav>

        {/* 🖥️ Desktop: logout */}
        <div className={`${sideWidth} hidden md:flex justify-end`}>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-yellow-300 border border-yellow-700/40 px-3 py-1 rounded transition"
          >
            Kirjaudu ulos
          </button>
        </div>
      </header>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              className="p-6 space-y-4 text-gray-200"
            >
              {/* Sulje */}
              <button
                onClick={() => setMobileOpen(false)}
                className="text-yellow-400 mb-4"
                aria-label="Sulje valikko"
              >
                <X size={28} />
              </button>

              {/* Päälinkit */}
              {links.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="block text-lg text-yellow-400"
                >
                  {link.name}
                </Link>
              ))}

              {/* Kirjanpito */}
              <div className="border-t border-yellow-700/30 pt-4">
                {bookkeepingLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-1 text-gray-300 hover:text-yellow-400"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="mt-6 text-red-400 border border-red-500 px-4 py-2 rounded"
              >
                Kirjaudu ulos
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
