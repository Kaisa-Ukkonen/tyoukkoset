"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function StandUpPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("up");

  // Sama scroll shrink -logiikka kuin etusivulla
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const updateScrollDir = () => {
      const scrollY = window.scrollY;
      if (scrollY > lastScrollY && scrollY > 50) {
        setScrollDirection("down");
      } else if (scrollY < lastScrollY) {
        setScrollDirection("up");
      }
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };
    window.addEventListener("scroll", updateScrollDir);
    return () => window.removeEventListener("scroll", updateScrollDir);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white flex flex-col overflow-x-hidden">
      {/* Taustaefekti */}
      <div
        className="absolute inset-0 
          bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07)_0%,rgba(0,0,0,1)_80%)] 
          pointer-events-none"
      ></div>

      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 sm:px-8 transition-all duration-500
        ${
          scrollDirection === "down"
            ? "h-20 sm:h-28 bg-black/80 shadow-lg"
            : "h-28 sm:h-36 bg-black/60"
        }
        backdrop-blur-sm border-b border-yellow-600/30`}
      >
        {/* Logo */}
        <div className="flex items-center z-20 cursor-pointer" onClick={() => router.push("/")}>
          <Image
            src="/keltainenlogo.png"
            alt="TyöUkkoset logo"
            width={0}
            height={0}
            sizes="100vw"
            className="object-contain w-44 sm:w-52 md:w-60 lg:w-80 max-w-[80%] ml-2 transition-all duration-500"
            priority
          />
        </div>

        {/* Desktop-navigaatio */}
        <nav className="hidden md:flex gap-6 text-sm sm:text-base font-semibold uppercase tracking-wide z-10">
          {["Etusivu", "Galleria", "Kalenteri", "Yhteystiedot"].map((item) => (
            <button
              key={item}
              onClick={() => {
                if (item === "Etusivu") router.push("/");
                else if (item === "Galleria")
                  document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" });
                else if (item === "Kalenteri")
                  document.getElementById("calendar")?.scrollIntoView({ behavior: "smooth" });
                else if (item === "Yhteystiedot")
                  document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="relative text-gray-200 hover:text-white transition-colors duration-200 group"
            >
              {item}
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
            </button>
          ))}
        </nav>

        {/* Hamburger (mobiili) */}
        <button
          className="md:hidden relative z-20 text-white text-3xl border border-yellow-500/40 rounded-lg px-3 py-1 hover:border-yellow-400 transition"
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
              className="absolute top-full left-0 w-full bg-black/90 backdrop-blur-md flex flex-col items-center gap-6 py-6 md:hidden z-10 border-t border-yellow-600/30"
            >
              {["Etusivu", "Galleria", "Kalenteri", "Yhteystiedot"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    if (item === "Etusivu") router.push("/");
                    else if (item === "Galleria")
                      document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" });
                    else if (item === "Kalenteri")
                      document.getElementById("calendar")?.scrollIntoView({ behavior: "smooth" });
                    else if (item === "Yhteystiedot")
                      document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });
                    setMenuOpen(false);
                  }}
                  className="text-lg font-semibold uppercase text-gray-200 hover:text-yellow-400 transition"
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
        <h1 className="text-4xl font-bold text-yellow-400 mb-4">Stand Up</h1>
        <p className="text-gray-400 mb-10">
          Tähän tulee keikkakalenteri ja videot.
        </p>

        {/* Galleria-osio */}
        <section id="gallery" className="w-full max-w-3xl py-10">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Galleria</h2>
          <p className="text-gray-400 italic">
            Stand up -kuvia ja tunnelmia keikoilta tulee tähän.
          </p>
        </section>

        {/* Kalenteri-osio */}
        <section
          id="calendar"
          className="w-full max-w-3xl py-10 border-t border-yellow-700 mt-10"
        >
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Kalenteri</h2>
          <p className="text-gray-400 italic">
            Tähän lisätään tulevat keikat ja tapahtumat.
          </p>
        </section>
      </main>

      {/* FOOTER */}
      <footer
        id="footer"
        className="relative z-10 bg-black/80 text-white p-6 text-center border-t border-yellow-700"
      >
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} TyöUkkoset – Jesse Ukkonen
        </p>
      </footer>
    </div>
  );
}
