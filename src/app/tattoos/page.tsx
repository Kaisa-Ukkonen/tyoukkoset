"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Tattoos() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white flex flex-col overflow-x-hidden">
      {/* Sama taustaefekti kuin etusivulla */}
      <div
        className="absolute inset-0 
          bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07)_0%,rgba(0,0,0,1)_80%)] 
          pointer-events-none"
      ></div>

      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full bg-black/70 backdrop-blur-sm text-white flex justify-between items-center p-4 z-50">
        {/* Logo */}
        <div className="cursor-pointer" onClick={() => router.push("/")}>
          <Image
            src="/logo2.png"
            alt="TyöUkkoset logo"
            width={0}
            height={0}
            sizes="100vw"
            className="object-contain w-44 sm:w-52 md:w-60 lg:w-80 max-w-[80%] ml-2"
            priority
          />
        </div>

        {/* Desktop-navigaatio */}
        <nav className="hidden md:flex space-x-6 text-sm sm:text-base items-center">
          <button
            onClick={() => router.push("/")}
            className="hover:text-red-500 transition-colors"
          >
            Etusivu
          </button>
          <button
            onClick={() =>
              document
                .getElementById("gallery")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="hover:text-red-500 transition-colors"
          >
            Galleria
          </button>
          <button
            onClick={() =>
              document
                .getElementById("footer")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="hover:text-red-500 transition-colors"
          >
            Yhteystiedot
          </button>
        </nav>

        {/* Hamburger-menu (mobiili) */}
        <button
          className="md:hidden relative z-20 text-white text-3xl border border-white/40 rounded-lg px-3 py-1 hover:border-red-600 transition"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Avaa valikko"
        >
          ☰
        </button>

        {/* Mobiilivalikko (overlay) */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="absolute top-full left-0 w-full bg-black/90 backdrop-blur-md flex flex-col items-center gap-6 py-6 md:hidden z-10"
            >
              {["Etusivu", "Galleria", "Yhteystiedot"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    if (item === "Etusivu") router.push("/");
                    else if (item === "Galleria")
                      document
                        .getElementById("gallery")
                        ?.scrollIntoView({ behavior: "smooth" });
                    else if (item === "Yhteystiedot")
                      document
                        .getElementById("footer")
                        ?.scrollIntoView({ behavior: "smooth" });
                    setMenuOpen(false);
                  }}
                  className="text-lg font-semibold uppercase text-gray-200 hover:text-red-500 transition"
                >
                  {item}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* --- SISÄLTÖ --- */}
      <main className="relative flex flex-col justify-center items-center flex-1 text-center mt-32 z-10 px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-red-600 mb-2">
          Tattoos
        </h1>
        <p className="text-gray-400 mb-10">Tähän tulee tatuointien galleria.</p>

        <section id="gallery" className="w-full max-w-3xl py-10">
          <h2 className="text-2xl font-semibold text-red-500 mb-4">Galleria</h2>
          <p className="text-gray-400 italic">Tatuointikuvat tulevat tähän.</p>
        </section>
      </main>

      {/* FOOTER */}
      <footer
        id="footer"
        className="relative z-10 bg-black/80 text-white p-6 text-center border-t border-red-800"
      >
        <p className="text-sm text-gray-400">
        © {new Date().getFullYear()} TyöUkkoset – Jesse Ukkonen
        </p>
      </footer>
    </div>
  );
}
