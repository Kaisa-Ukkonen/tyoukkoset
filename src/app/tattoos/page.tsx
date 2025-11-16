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

  // 🔹 Hae tatuoinnit tietokannasta
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

  // 🔹 Headerin kutistuminen
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
      ? "h-20 sm:h-28 bg-black/45 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
      : "h-28 sm:h-36 bg-black/25 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
  } 
  backdrop-blur-md border-b border-yellow-600/10`}
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
          {["Etusivu", "Galleria", "Info", "Yhteystiedot", "Ota yhteyttä"].map(
            (item) => (
              <button
                key={item}
                onClick={() => {
                  if (item === "Etusivu") router.push("/");
                  else if (item === "Galleria") router.push("/tattoos#gallery");
                  else if (item === "Info") router.push("/tattoos#info");
                  else if (item === "Yhteystiedot")
                    router.push("/#yhteystiedot");
                  else if (item === "Ota yhteyttä")
                    router.push("/#yhteydenotto");
                }}
                className="relative text-gray-200 hover:text-white transition-colors duration-200 group"
              >
                {item}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
            )
          )}
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
                "Info",
                "Yhteystiedot",
                "Ota yhteyttä",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    if (item === "Etusivu") router.push("/");
                    else if (item === "Galleria")
                      router.push("/tattoos#gallery");
                    else if (item === "Info") router.push("/tattoos#info");
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
      <main
        className="relative w-full pt-20 sm:pt-28 z-10 
                 bg-[url('/savutausta.webp')] bg-cover bg-center 
                 bg-scroll md:bg-fixed overflow-hidden"
      >
        {/* Tumma kerros taustan päällä, ettei tekstit huku */}
        <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>

        {/* Sivun sisältö alkaa tästä */}
        <div className="relative z-10 w-full">
          {/* ARTISTI */}
          <motion.section
            id="artist"
            className="relative w-full max-w-5xl mx-auto mt-8 px-6 py-12 flex flex-col md:flex-row items-center gap-10 border-b border-yellow-700/40"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="w-full md:w-1/2 text-center md:text-left"
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-yellow-400 mb-4">
                Jesse Ukkonen
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Jesse on Siilinjärveläinen tatuointiartisti ja stand up
                -koomikko, joka yhdistää luovan ilmaisun ja rennon asenteen
                ainutlaatuisella tavalla. Hänen tatuointityylinsä painottuu
                tarkkaan viivatyöhön, kontrasteihin ja tarinallisuuteen –
                jokaisella tatuoinnilla on oma merkityksensä.
              </p>
            </motion.div>

            <motion.div
              className="w-full md:w-1/2 flex justify-center"
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Image
  src="/tattoo-icon.png"        // tai dynaaminen kuva, jonka siihen laitoit
  alt="Jesse Ukkonen Tattoo Artist"
  width={350}
  height={350}
  priority          // ⭐ pakollinen
  loading="eager"   // ⭐ pakollinen
  className="rounded-2xl shadow-[0_0_25px_rgba(255,215,0,0.3)] object-cover"
/>
            </motion.div>
          </motion.section>

          {/* GALLERIA */}
          <motion.section
            id="gallery"
            className="w-full max-w-6xl mx-auto py-20 px-6"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* --- OTSIKKO JA INSTAGRAM-LINKKI --- */}
            <div className="flex items-center justify-center gap-6 mb-10">
              <h2 className="text-3xl font-bold text-yellow-400">Galleria</h2>

              <a
                href="https://www.instagram.com/tattoos_by_ukkone?igsh=MTQwMmE4M3dubmZl"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Avaa Instagram-profiili"
                className="hover:scale-110 transition-transform duration-300"
              >
                <Image
                  src="/instagramLogo.png"
                  alt="Instagram"
                  width={30}
                  height={30}
                  className="rounded-md drop-shadow-[0_0_6px_rgba(255,200,0,0.4)] hover:drop-shadow-[0_0_8px_rgba(255,200,0,0.8)]"
                  loading="lazy"
                />
              </a>
            </div>

            {/* --- GALLERIA KUVA GRID --- */}
            {tattoos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {tattoos.map((tattoo, index) => (
                  <motion.div
                    key={tattoo.id}
                    className="relative overflow-hidden rounded-xl aspect-3/4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <Image
                      src={tattoo.imageUrl}
                      alt={tattoo.title || "Tatuointi"}
                      fill
                      sizes="(max-width: 640px) 50vw,
         (max-width: 1024px) 33vw,
         25vw"
                      priority={index === 0}
                      loading={index === 0 ? "eager" : "lazy"}
                      className="object-cover object-center rounded-lg"
                    />

                    {tattoo.title && (
                      <div className="absolute bottom-3 w-full text-center text-yellow-300 font-semibold bg-black/40 py-1">
                        {tattoo.title}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic text-center">
                Ei vielä tatuointikuvia tietokannassa.
              </p>
            )}
          </motion.section>

          {/* INFO */}
          <motion.section
            id="info"
            className="w-full max-w-4xl mx-auto py-16 px-6 border-t border-yellow-700/40 text-gray-300"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <h2 className="text-3xl font-semibold text-yellow-400 mb-8 text-center">
              Uuden tatuoinnin hoito
            </h2>

            <div className="space-y-10">
              {/* Ensimmäinen päivä */}
              <div>
                <h3 className="text-xl font-semibold text-yellow-300 mb-3">
                  Ensimmäinen päivä
                </h3>
                <p className="leading-relaxed">
                  Kun tatuointi on valmis, se peitetään suojakalvolla tai
                  siteellä, joka pidetään paikallaan muutaman tunnin ajan. Tämän
                  jälkeen tatuointi pestään varovasti haalealla vedellä ja
                  miedolla, hajusteettomalla saippualla, jotta ylimääräinen
                  muste, veri ja plasma poistuvat. Kuivaa iho kevyesti
                  taputtelemalla ja levitä ohut kerros tatuoinnin hoitovoidetta.
                  Vältä liiallista rasvan määrää, jotta iho pääsee hengittämään.
                </p>
              </div>

              {/* Ensimmäiset viikot */}
              <div>
                <h3 className="text-xl font-semibold text-yellow-300 mb-3">
                  Ensimmäiset viikot
                </h3>
                <p className="leading-relaxed">
                  Tuore tatuointi voi olla arka, punoittava tai turvonnut.
                  Puhdista tatuointi 1–2 kertaa päivässä ja käytä hoitovoidetta
                  aina pesun jälkeen vähintään kahden viikon ajan. Voit rasvata
                  useammin, jos iho tuntuu kuivalta tai kiristävältä. Jatka
                  kosteutusta säännöllisesti koko ensimmäisen kuukauden ajan.
                  Kelmua voi käyttää tarvittaessa, jos vaatteet hankaavat ihoa,
                  mutta muista puhdistaa ja rasvata iho aina ennen sen
                  laittamista.
                </p>
              </div>

              {/* Vältä nämä */}
              <div>
                <h3 className="text-xl font-semibold text-yellow-300 mb-3">
                  Vältä nämä
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Älä koskettele tai raavi tatuointia likaisin käsin.</li>
                  <li>Älä repi rupia — ne voivat viedä väriä mukanaan.</li>
                  <li>
                    Vältä saunomista, uimista ja auringonottoa vähintään 2
                    viikkoa.
                  </li>
                  <li>Vältä myös auringonottoa ensimmäisen kuukauden ajan.</li>
                </ul>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-10 italic text-center">
              Huolellinen jälkihoito varmistaa parhaan lopputuloksen ja värien
              pysyvyyden.
            </p>
          </motion.section>
        </div>
      </main>

      {/* FOOTER */}
      <footer
        id="footer"
        className="relative z-10 
             bg-zinc-800/25 backdrop-blur-sm 
             text-white p-6 text-center 
             border-t border-yellow-600/20 
             shadow-[0_-2px_15px_rgba(0,0,0,0.4)]"
      >
        <div className="flex justify-center items-center gap-3">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} TyöUkkoset – Jesse Ukkonen
          </p>
          <a
            href="https://www.instagram.com/tattoos_by_ukkone?igsh=MTQwMmE4M3dubmZl"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Avaa Instagram-profiili"
          >
            <Image
              src="/instagramLogo.png"
              alt="Instagram"
              width={25}
              height={25}
              className="rounded-md hover:scale-110 hover:drop-shadow-[0_0_6px_rgba(255,200,0,0.6)] transition-all duration-300"
              loading="lazy"
            />
          </a>
        </div>
      </footer>
    </div>
  );
}
