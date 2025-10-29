"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function StandUpPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("up");

  // Header shrink scroll
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const updateScrollDir = () => {
      const scrollY = window.scrollY;
      if (scrollY > lastScrollY && scrollY > 50) setScrollDirection("down");
      else if (scrollY < lastScrollY) setScrollDirection("up");
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };
    window.addEventListener("scroll", updateScrollDir);
    return () => window.removeEventListener("scroll", updateScrollDir);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white flex flex-col overflow-x-hidden">
      {/* Tausta */}
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
        {/* Logo (animoitu scrollatessa) */}
        <motion.div
          className="flex items-center z-20 cursor-pointer"
          onClick={() => router.push("/")}
          initial={{ scale: 1 }}
          animate={{ scale: scrollDirection === "down" ? 0.8 : 1 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <Image
            src="/keltainenlogo.png"
            alt="TyöUkkoset logo"
            width={0}
            height={0}
            sizes="100vw"
            className="object-contain w-44 sm:w-52 md:w-60 lg:w-80 max-w-[80%] ml-2 transition-all duration-500"
            priority
          />
        </motion.div>

        {/* Desktop-navigaatio */}
        <nav className="hidden md:flex gap-6 text-sm sm:text-base font-semibold uppercase tracking-wide z-10">
          {[
            "Etusivu",
            "Galleria",
            "Keikat",
            "Yhteystiedot",
            "Ota yhteyttä",
          ].map((item) => (
            <button
              key={item}
              onClick={() => {
                if (item === "Etusivu") router.push("/");
                else if (item === "Galleria") router.push("/standup#gallery");
                else if (item === "Keikat") router.push("/standup#calendar");
                else if (item === "Yhteystiedot") router.push("/#yhteystiedot");
                else if (item === "Ota yhteyttä") router.push("/#yhteydenotto");
              }}
              className="relative text-gray-200 hover:text-white transition-colors duration-200 group"
            >
              {item}
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
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

        {/* Mobiilivalikko */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="absolute top-full left-0 w-full bg-black/90 backdrop-blur-md flex flex-col items-center gap-6 py-6 md:hidden z-10 border-t border-yellow-600/30"
            >
              {[
                "Etusivu",
                "Galleria",
                "Keikat",
                "Yhteystiedot",
                "Ota yhteyttä",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    if (item === "Etusivu") router.push("/");
                    else if (item === "Galleria")
                      router.push("/standup#gallery");
                    else if (item === "Keikat")
                      router.push("/standup#calendar");
                    else if (item === "Yhteystiedot")
                      router.push("/#yhteystiedot");
                    else if (item === "Ota yhteyttä")
                      router.push("/#yhteydenotto");
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
      <main className="relative flex flex-col justify-center items-center flex-1 text-center mt-44 sm:mt-52 z-10 px-4">
        {/* Koomikkoesittely */}
        <motion.section
          className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8 text-gray-300 mb-16"
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <div className="md:w-1/2 text-center md:text-left leading-relaxed">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-4">
              Koomikko Jesse Ukkonen
            </h2>
            <p className="mb-4">
              Jesse on arjen kommelluksista tarinoitaan ammentava suorasanainen
              ja aavistuksen yksinkertainen savolaiskoomikko, jonka huumori
              iskee varmasti niin sohvan pohjalla laiskottelevaan
              työnvieroksujaan kuin yrittäjähenkiseen ylisuorittajaan.
            </p>
            <p className="mb-4">
              Teini-isyyden kokeneena, monialayrittäjänä ja itsepäisenä oman
              tiensä kulkijana Jesse tietää, ettei elämä mene aina
              käsikirjoituksen mukaan – ja juuri siitä ne parhaat tarinat
              syntyvät.
            </p>
            <p className="italic text-yellow-400 mb-4">
              Elämän mottona: Muut tekkee mitä osaa. Mää teen mitä kehtoon.
            </p>
            <p>
              Jessen tyyli on rento, rehellinen ja sopivasti itseironinen.
              Täydellinen kattaus niille, jotka tunnistavat itsensä arkisista
              mokista ja elämän pienistä yllätyksistä.
            </p>
          </div>

          <motion.div
            className="md:w-1/2 flex justify-center"
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Image
              src="/kolmoset-9.webp"
              alt="Koomikko Jesse Ukkonen"
              width={350}
              height={350}
              className="rounded-2xl shadow-lg shadow-yellow-700/40 hover:scale-105 transition-transform duration-500"
            />
          </motion.div>
        </motion.section>

        {/* Kolmoset-esittely */}
        <motion.section
          className="w-full max-w-5xl flex flex-col md:flex-row-reverse items-center justify-center gap-8 text-gray-300 mb-16"
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="md:w-1/2 flex justify-center"
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Image
              src="/kolmoset-33.webp"
              alt="Kolmoset stand up -ryhmä"
              width={400}
              height={400}
              className="rounded-2xl shadow-lg shadow-yellow-700/40 hover:scale-105 transition-transform duration-500"
            />
          </motion.div>

          <div className="md:w-1/2 text-center md:text-left leading-relaxed">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-4">
              Kolmoset
            </h2>
            <p className="mb-4">
              Mitä saadaan, kun Savonlinnan poika lyöttäytyy yhteen Siilinjärven
              kasvattien kanssa? Ainakin roppakaupalla itseironialla höystettyä
              huumoria, elämän kipupisteitä ja arkisia oivalluksia, jotka osuvat
              suoraan nauruhermoon!
            </p>
            <p className="mb-4">
              Kolmoset on kolmen koomikon muodostama stand up -ryhmä, jossa
              Oliver, Jesse ja Miro käyvät läpi elämänsä kompastuksia aina
              työttömyydestä teini-isyyteen ja opiskelun ihanuuksista
              kolmenkympin kriisiin.
            </p>
            <p>
              Tämä on show, jossa ei säästellä puujalkoja — nauretaan ennen
              kaikkea itsellemme.{" "}
              <span className="italic text-yellow-400">
                Rehellinen, samaistuttava ja juuri sopivan sekaisin.
              </span>
            </p>
          </div>
        </motion.section>

        {/* Galleria */}
        <motion.section
          id="gallery"
          className="w-full max-w-3xl py-10"
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">
            Galleria
          </h2>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg shadow-yellow-700/30">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/Ue3obS6zFG4"
              title="Stand Up -video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
          <a
            href="https://youtube.com/shorts/Ue3obS6zFG4?si=ipD2exaHBIatwkzJ"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 px-6 py-3 bg-yellow-500/10 border border-yellow-500 text-yellow-400 rounded-full font-semibold hover:bg-yellow-500/20 transition-all duration-300"
          >
            Katso YouTubessa
          </a>
        </motion.section>

        {/* Keikat */}
        <motion.section
          id="calendar"
          className="w-full max-w-3xl py-10 border-t border-yellow-700 mt-10 text-left"
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-semibold text-yellow-400 mb-6 text-center">
            Keikat
          </h2>
          <h3 className="text-xl font-semibold text-yellow-300 mb-4 text-center">
            Marraskuu
          </h3>
          <ul className="space-y-3 text-gray-300 text-center">
            <li>
              <span className="text-yellow-400 font-bold">8.11.</span> –
              Hankasalmi, Timpan baari
            </li>
            <li>
              <span className="text-yellow-400 font-bold">12.11.</span> – Oulu,
              Remakka
            </li>
            <li>
              <span className="text-yellow-400 font-bold">20.11.</span> –
              Kuopio, Haaska
            </li>
            <li>
              <span className="text-yellow-400 font-bold">28.11.</span> –
              Vantaa, Hupisipuli
            </li>
          </ul>
        </motion.section>
      </main>

      {/* FOOTER */}
      <footer
        id="footer"
        className="relative z-10 bg-black/80 text-white p-6 text-center border-t border-yellow-700"
      >
        <div className="flex justify-center items-center gap-3">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} TyöUkkoset – Jesse Ukkonen
          </p>
          <a
            href="https://www.instagram.com/jesseukkonen?igsh=MXg2b2U4bWlkM3h0dA=="
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/instagramLogo.png"
              alt="Instagram"
              width={25}
              height={25}
              className="rounded-md hover:scale-110 hover:drop-shadow-[0_0_6px_rgba(255,200,0,0.6)] transition-all duration-300"
            />
          </a>
          <a
            href="https://www.youtube.com/@koomikkoukkonen"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/youtubeLogo.png"
              alt="YouTube"
              width={32}
              height={32}
              className="rounded-md hover:scale-110 hover:drop-shadow-[0_0_6px_rgba(255,200,0,0.6)] transition-all duration-300"
            />
          </a>
          <a
            href="https://www.tiktok.com/@koomikkoukkonen?_t=ZN-90vA5YvDm0k&_r=1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/tiktokLogo.png"
              alt="TikTok"
              width={28}
              height={28}
              className="rounded-md hover:scale-110 hover:drop-shadow-[0_0_6px_rgba(255,200,0,0.6)] transition-all duration-300"
            />
          </a>
        </div>
      </footer>
    </div>
  );
}
