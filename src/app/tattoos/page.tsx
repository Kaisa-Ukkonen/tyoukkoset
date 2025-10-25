"use client";
type Tattoo = {
  id: string;
  title: string;
  imageUrl: string;
  style?: string;
  description?: string;
  isPublic: boolean;
};

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Tattoos() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("up");

   const [tattoos, setTattoos] = useState<Tattoo[]>([]);

  // 🔹 Hae tatuoinnit tietokannasta Prisma API:n kautta
 useEffect(() => {
  const fetchTattoos = async () => {
    try {
      const res = await fetch("/api/tattoos");
      const data = await res.json();
      setTattoos(data);
    } catch (err) {
      console.error("Virhe tatuointien haussa:", err);
    }
  };
  fetchTattoos();
}, []);
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
        className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center 
          px-6 sm:px-8 py-6 transition-all duration-500
          ${
            scrollDirection === "down"
              ? "h-20 sm:h-28 bg-black/80 shadow-lg"
              : "h-28 sm:h-36 bg-black/60"
          } 
          backdrop-blur-sm border-b border-yellow-600/30`}
      >
        {/* Logo */}
        <div
          className="flex items-center z-20 cursor-pointer"
          onClick={() => router.push("/")}
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
        </div>

        {/* Desktop-navigaatio */}
        <nav className="hidden md:flex gap-6 text-sm sm:text-base font-semibold uppercase tracking-wide z-10">
          {["Etusivu", "Galleria", "Info", "Yhteystiedot"].map((item) => (
            <button
              key={item}
              onClick={() => {
                if (item === "Etusivu") router.push("/");
                else if (item === "Galleria")
                  document
                    .getElementById("gallery")
                    ?.scrollIntoView({ behavior: "smooth" });
                else if (item === "Info")
                  document
                    .getElementById("info")
                    ?.scrollIntoView({ behavior: "smooth" });
                else if (item === "Yhteystiedot")
                  document
                    .getElementById("footer")
                    ?.scrollIntoView({ behavior: "smooth" });
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
              {["Etusivu", "Galleria", "Info", "Yhteystiedot"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    if (item === "Etusivu") router.push("/");
                    else if (item === "Galleria")
                      document
                        .getElementById("gallery")
                        ?.scrollIntoView({ behavior: "smooth" });
                    else if (item === "Info")
                      document
                        .getElementById("info")
                        ?.scrollIntoView({ behavior: "smooth" });
                    else if (item === "Yhteystiedot")
                      document
                        .getElementById("footer")
                        ?.scrollIntoView({ behavior: "smooth" });
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
        {/* Artist Section */}
        <section
          id="artist"
          className="relative w-full max-w-5xl mx-auto mt-20 px-6 py-12 flex flex-col md:flex-row items-center gap-10 border-b border-yellow-700/40"
        >
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">
              Jesse Ukkonen
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Jesse on Siilinjärveläinen tatuointiartisti ja stand up -koomikko,
              joka yhdistää luovan ilmaisun ja rennon asenteen ainutlaatuisella
              tavalla. Hänen tatuointityylinsä painottuu tarkkaan viivatyöhön,
              kontrasteihin ja tarinallisuuteen – jokaisella tatuoinnilla on oma
              merkityksensä.
            </p>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <Image
              src="/tattoo-icon.png"
              alt="Jesse Ukkonen Tattoo Artist"
              width={400}
              height={400}
              className="rounded-2xl shadow-[0_0_25px_rgba(255,215,0,0.3)] object-cover"
            />
          </div>
        </section>

        {/* Galleria Section */}
        <section id="gallery" className="w-full max-w-6xl mx-auto py-20 px-6">
          <h2 className="text-3xl font-bold text-yellow-400 mb-10 text-center">
            Galleria
          </h2>

          {tattoos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {tattoos.map((tattoo) => (
                <div
                  key={tattoo.id}
                  className="relative overflow-hidden rounded-xl group"
                >
                  <Image
                    src={tattoo.imageUrl}
                    alt={tattoo.title}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end justify-center text-yellow-300 font-semibold">
                    <p className="mb-3">{tattoo.title}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic text-center">
              Ei vielä tatuointikuvia tietokannassa.
            </p>
          )}
        </section>

        {/* Info Section */}
        <section
          id="info"
          className="w-full max-w-4xl mx-auto py-16 px-6 border-t border-yellow-700/40"
        >
          <h2 className="text-2xl font-semibold text-yellow-400 mb-6 text-center">
            Tatuoinnin hoito-ohjeet
          </h2>
          <ul className="text-gray-300 leading-relaxed list-disc list-inside space-y-3 text-left">
            <li>Pidä tuore tatuointi puhtaana ja kuivana ensimmäiset päivät.</li>
            <li>Poista suojakalvo tatuoijan ohjeiden mukaisesti.</li>
            <li>Levitä ohut kerros hoitovoidetta 2–3 kertaa päivässä.</li>
            <li>Vältä saunaa, uimista ja aurinkoa 2 viikon ajan.</li>
            <li>Älä raavi tai koske tatuointiin likaisin käsin.</li>
          </ul>
          <p className="text-sm text-gray-500 mt-6 italic text-center">
            Hoito-ohjeiden noudattaminen varmistaa parhaan lopputuloksen ja
            värien säilyvyyden.
          </p>
        </section>
      </main>

      {/* FOOTER */}
      <footer
        id="footer"
        className="relative z-10 bg-black/80 text-white p-6 text-center border-t border-yellow-600/40"
      >
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} TyöUkkoset – Jesse Ukkonen
        </p>
      </footer>
    </div>
  );
}
