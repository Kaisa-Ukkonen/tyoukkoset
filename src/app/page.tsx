"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [scrollDirection, setScrollDirection] = useState("up");
  const [menuOpen, setMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-black text-white flex flex-col overflow-x-hidden">
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
          {["Etusivu", "Yhteystiedot", "Ota yhteyttä"].map((item) => (
            <button
              key={item}
              onClick={() => {
                if (item === "Etusivu") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else if (item === "Yhteystiedot") {
                  const section = document.getElementById("yhteystiedot");
                  section?.scrollIntoView({ behavior: "smooth" });
                } else if (item === "Ota yhteyttä") {
                  const section = document.getElementById("yhteydenotto");
                  section?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="relative text-gray-200 hover:text-white transition-colors duration-200 group"
            >
              {item}
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
            </button>
          ))}
        </nav>

        {/* Hamburger button */}
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
              {["Etusivu", "Yhteystiedot"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    if (item === "Etusivu") {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    } else if (item === "Yhteystiedot") {
                      const section = document.getElementById("yhteystiedot");
                      section?.scrollIntoView({ behavior: "smooth" });
                    }
                    setMenuOpen(false);
                  }}
                  className="text-lg font-semibold uppercase text-gray-200 hover:text-white transition"
                >
                  {item}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MAIN */}
      <main
        className="relative flex flex-1 flex-col items-center justify-start 
             gap-10 text-center bg-[#0a0a0a] text-white 
             pt-32 sm:pt-40 md:pt-38 lg:pt-42 
             px-4 sm:px-6 pb-20 sm:pb-32
             w-full max-w-full overflow-x-hidden overflow-y-visible"
      >
        {/* Hienovarainen tausta */}
        <div
          className="absolute inset-0 
               bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07)_0%,rgba(0,0,0,1)_80%)] 
               pointer-events-none"
        ></div>

        {/* Esittelyteksti */}
        <motion.section
          className="relative z-10 w-full px-4 sm:px-8 py-10 mb-8
           bg-[#141414]/95 
           flex flex-col items-center justify-center text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
            TyöUkkoset –{" "}
            <span className="text-yellow-400">
              Tatuointia ja Stand Upia asenteella
            </span>
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
            Tervetuloa TyöUkkosten maailmaan. Jesse Ukkonen yhdistää luovan
            tatuointitaiteen ja stand up -komiikan samaan intensiiviseen
            pakettiin.
            <br className="hidden sm:block" />
            Valitse alta polkusi:{" "}
            <span className="text-yellow-400 font-semibold">
              Tatuoinnit
            </span>{" "}
            vai <span className="text-yellow-400 font-semibold">Naurut</span> ja
            astu sisään.
          </p>
        </motion.section>

        {/* Pyöreät napit */}
        <motion.div
  className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 relative z-10 mt-4 md:mt-24 mb-10 md:mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {/* Tattoos */}
          <motion.div
            onClick={() => router.push("/tattoos")}
            className="relative flex flex-col items-center justify-end 
                      w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56
                      bg-yellow-500 hover:bg-yellow-400 rounded-full 
                      shadow-[0_0_25px_rgba(255,215,50,0.6)]
                      cursor-pointer overflow-hidden 
                      transition-transform hover:scale-110 animate-pulseGlow"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src="/tattoo-icon.png"
              alt="Tattoos"
              fill
              className="object-cover"
            />
            <div className="absolute bottom-3 w-full text-center text-sm sm:text-base md:text-lg font-bold bg-black/40 text-white">
              Tattoos
            </div>
          </motion.div>

          {/* Stand Up */}
          <motion.div
            onClick={() => router.push("/standup")}
            className="relative flex flex-col items-center justify-end 
                       w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56
                       bg-yellow-500 hover:bg-yellow-400 rounded-full 
                       shadow-[0_0_25px_rgba(255,215,50,0.6)]
                       cursor-pointer overflow-hidden 
                       transition-transform hover:scale-110 animate-pulseGlow"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src="/mic-icon.png"
              alt="Stand Up"
              fill
              className="object-cover object-top"
            />
            <div className="absolute bottom-3 w-full text-center text-sm sm:text-base md:text-lg font-bold bg-black/40 text-white">
              Stand Up
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* INFO-FOOTER */}
      <section
        id="yhteystiedot"
        className="w-full bg-linear-to-b from-[#0a0a0a] via-[#111] to-[#1a1a1a] border-t border-yellow-600/30 py-10 text-gray-300"
      >
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 justify-center text-center md:text-left">
          {/* YHTEYSTIEDOT */}
          <div className="md:justify-self-end">
            <h3 className="text-yellow-400 font-bold uppercase mb-3">
              Yhteystiedot
            </h3>
            <p className="text-sm leading-relaxed">
              Siilinjärvi <br />
              Tmi TyöUkkoset <br />
              Sähköposti:{" "}
              <a
                href="mailto:tyoukkoset@gmail.com"
                className="text-yellow-400 hover:text-yellow-300 underline"
              >
                tyoukkoset@gmail.com
              </a>{" "}
              <br />
              Puh: 044 218 6506 <br />
              Y-tunnus: 3518481-5
            </p>
          </div>

          {/* SÄÄNNÖT JA TIEDOT */}
          <div className="md:justify-self-start">
            <h3 className="text-yellow-400 font-bold uppercase mb-3">
              Säännöt ja tiedot
            </h3>
            <p className="text-sm leading-relaxed">
              Ikäraja tatuointeihin on <strong>18 vuotta</strong> <br />
              Pidä henkilöllisyystodistus mukana. <br />
              Maksutavat: käteinen ja kortti.
            </p>
          </div>
        </div>
      </section>

      {/* YHTEYDENOTTOLOMAKE */}
      <section
        id="yhteydenotto"
        className="w-full max-w-3xl mx-auto py-16 px-6 border-t border-yellow-700/40 text-gray-300"
      >
        <h2 className="text-3xl font-semibold text-yellow-400 mb-8 text-center">
          Ota yhteyttä
        </h2>
        <form
          onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement & {
              name: { value: string };
              email: { value: string };
              phone: { value: string };
              service: { value: string };
              message: { value: string };
            };

            const data = {
              name: form.name.value,
              email: form.email.value,
              phone: form.phone.value,
              service: form.service.value,
              message: form.message.value,
            };

            const res = await fetch("/api/contact", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });

            if (res.ok) {
              alert("Kiitos yhteydenotosta! Otamme sinuun pian yhteyttä.");
              form.reset();
            } else {
              alert("Virhe lähetyksessä. Yritä uudelleen.");
            }
          }}
          className="flex flex-col gap-5"
        >
          {/* Nimi ja sähköposti */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Nimi"
              required
              className="bg-[#111]/80 border border-yellow-600/30 text-white rounded-md px-4 py-2
              focus:outline-none focus:border-yellow-400 placeholder-gray-500 focus:bg-[#111]/90 transition duration-200"
            />
            <input
              type="email"
              name="email"
              placeholder="Sähköposti"
              required
              className="appearance-none bg-[#111]/80 border border-yellow-600/30 text-white rounded-md px-4 py-2
              focus:outline-none focus:border-yellow-400 placeholder-gray-500 focus:bg-[#111]/90 transition duration-200"
            />
          </div>

          {/* Puhelin ja valinta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="phone"
              placeholder="Puhelinnumero"
              className="appearance-none bg-[#111]/80 border border-yellow-600/30 text-white rounded-md px-4 py-2
              focus:outline-none focus:border-yellow-400 placeholder-gray-500 focus:bg-[#111]/90 transition duration-200"
            />
            <select
              name="service"
              required
              className="appearance-none bg-[#111]/80 border border-yellow-600/30 text-white rounded-md px-4 py-2
              focus:outline-none focus:border-yellow-400 placeholder-gray-500 focus:bg-[#111]/90 transition duration-200"
            >
              <option value="" className="bg-[#0a0a0a] text-gray-400">
                Valitse palvelu
              </option>
              <option value="Tatuoinnit" className="bg-[#0a0a0a] text-white">
                Tatuoinnit
              </option>
              <option value="Stand Up" className="bg-[#0a0a0a] text-white">
                Stand Up
              </option>
            </select>
          </div>

          {/* Viesti */}
          <textarea
            name="message"
            placeholder="Kerro mitä haluaisit..."
            required
            rows={5}
            className="bg-white/5 border border-yellow-600/30 text-white rounded-md px-4 py-2 focus:outline-none focus:border-yellow-400 placeholder-gray-500"
          ></textarea>

          {/* Lähetyspainike */}
          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 px-4 rounded-md transition-all duration-300"
          >
            Lähetä viesti
          </button>
        </form>
      </section>

      {/* FOOTER */}
      <footer
        id="footer"
        className="relative z-10 bg-black/80 text-white p-6 text-center border-t border-yellow-600/30"
      >
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} TyöUkkoset – Jesse Ukkonen
        </p>
      </footer>
    </div>
  );
}
