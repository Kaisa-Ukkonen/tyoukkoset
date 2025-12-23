"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import PrivacyPolicyModal from "@/components/common/PrivacyPolicyModal";

export default function Home() {
  const router = useRouter();
  const [scrollDirection, setScrollDirection] = useState("up");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

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
              {["Etusivu", "Yhteystiedot", "Ota yhteyttä"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    if (item === "Etusivu") {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    } else if (item === "Yhteystiedot") {
                      document
                        .getElementById("yhteystiedot")
                        ?.scrollIntoView({ behavior: "smooth" });
                    } else if (item === "Ota yhteyttä") {
                      document
                        .getElementById("yhteydenotto")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }
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

      {/* MAIN */}
      <main
        className="relative flex flex-col justify-start
                  gap-10 text-white
                  pt-32 sm:pt-40 md:pt-38 lg:pt-42 
                  pb-20 sm:pb-32
                  w-full max-w-full overflow-x-hidden overflow-y-visible
                  bg-[url('/savutausta.webp')] bg-cover bg-center bg-fixed"
      >
        {/* Tumma overlay + hienovarainen gradientti */}
        <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>

        {/* Esittelyteksti */}
        <motion.section
          className="relative z-20 self-stretch w-full 
             bg-[#141414]/10 backdrop-blur-md 
             shadow-[0_0_20px_rgba(0,0,0,0.4)] py-12 transition-all duration-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              TyöUkkoset –{" "}
              <span className="text-yellow-400">Rennolla otteella!</span>
            </h1>

            <p className="text-gray-200 leading-relaxed space-y-2">
              <span className="block">Tervetuloa meidän maailmaan!</span>
              <span className="block">
                Sivuston takana kirjoittelee Jesse Ukkonen, ehkä suomen ainoa
                tatuoiva koomikko.
              </span>
              <span className="block">
                Valitseppa alta haluamasi{" "}
                <span className="text-yellow-400 font-semibold">palvelu</span>{" "}
                ja tutustu lisää.
              </span>
            </p>

            <span className="block mt-4 text-gray-400 text-sm">
              Tatuointistudio Siilinjärvellä • Stand up -koomikko
              Pohjois-Savossa
            </span>
          </div>
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
                     w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 lg:w-75 lg:h-75

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
              sizes="(max-width: 768px) 100vw, 300px"
              loading="lazy"
            />
            <div className="absolute bottom-3 w-full text-center text-sm sm:text-base md:text-lg font-bold bg-black/40 text-white">
              Tattoos
            </div>
          </motion.div>

          {/* Stand Up */}
          <motion.div
            onClick={() => router.push("/standup")}
            className="relative flex flex-col items-center justify-end 
                       w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 lg:w-75 lg:h-75

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
              sizes="(max-width: 768px) 100vw, 300px"
              loading="lazy"
            />
            <div className="absolute bottom-3 w-full text-center text-sm sm:text-base md:text-lg font-bold bg-black/40 text-white">
              Stand Up
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* YHTEYDENOTTOLOMAKE */}
      <section
        id="yhteydenotto"
        className="relative w-full py-20 px-6 text-gray-300 
           bg-[url('/savutausta.webp')] bg-cover bg-center bg-fixed overflow-hidden"
      >
        {/* Tumma overlay */}
        <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>

        {/* Lomakekonteineri */}
        <motion.div
          className="relative z-10 max-w-3xl mx-auto border-t border-yellow-700/40 pt-16"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="text-3xl font-semibold text-yellow-400 mb-8 text-center">
            Ota yhteyttä
          </h2>

          <form
            onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();

              const form = e.currentTarget as HTMLFormElement & {
                firstName: { value: string };
                lastName: { value: string };
                email: { value: string };
                phone: { value: string };
                message: { value: string };
              };

              if (!selectedService) {
                setNotification("Valitse palvelu ennen lähettämistä!");
                setIsError(true);
                setTimeout(() => setNotification(null), 5000);
                return;
              }

              const data = {
                name: `${form.firstName.value} ${form.lastName.value}`,
                email: form.email.value,
                phone: form.phone.value,
                service: selectedService,
                message: form.message.value,
              };

              try {
                const res = await fetch("/api/contact", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                });

                if (res.ok) {
                  setNotification(
                    "Kiitos yhteydenotosta! Otamme sinuun pian yhteyttä."
                  );
                  setIsError(false);
                  form.reset();
                  setSelectedService("");
                } else {
                  setNotification("Virhe lähetyksessä. Yritä uudelleen.");
                  setIsError(true);
                }
              } catch {
                setNotification(
                  "Verkkovirhe – tarkista yhteys ja yritä uudelleen."
                );
                setIsError(true);
              }

              // Piilotetaan ilmoitus 10 sekunnin jälkeen
              setTimeout(() => setNotification(null), 10000);
            }}
            className="flex flex-col gap-5"
          >
            {/* 🔔 Ilmoitusviesti — tämä näkyy lomakkeen yläosassa */}
            {notification && (
              <div
                className={`text-center py-2 mb-4 rounded-md transition-all duration-300 ${
                  isError
                    ? "bg-red-900/60 text-red-300 border border-red-500/40"
                    : "bg-yellow-900/40 text-yellow-300 border border-yellow-500/40"
                }`}
              >
                {notification}
              </div>
            )}

            {/* ✏️ Etunimi ja Sukunimi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="Etunimi *"
                required
                className="bg-[#111]/80 border border-yellow-600/30 text-white rounded-md px-4 py-2
        focus:outline-none focus:border-yellow-400 placeholder-gray-500 focus:bg-[#111]/90 transition duration-200"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Sukunimi *"
                required
                className="bg-[#111]/80 border border-yellow-600/30 text-white rounded-md px-4 py-2
        focus:outline-none focus:border-yellow-400 placeholder-gray-500 focus:bg-[#111]/90 transition duration-200"
              />
            </div>

            {/* Sähköposti ja Puhelin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="email"
                name="email"
                placeholder="Sähköposti *"
                required
                className="bg-[#111]/80 border border-yellow-600/30 text-white rounded-md px-4 py-2
                    focus:outline-none focus:border-yellow-400 placeholder-gray-500 focus:bg-[#111]/90 transition duration-200"
              />
              <input
                type="text"
                name="phone"
                placeholder="Puhelinnumero *"
                required
                className="bg-[#111]/80 border border-yellow-600/30 text-white rounded-md px-4 py-2
                    focus:outline-none focus:border-yellow-400 placeholder-gray-500 focus:bg-[#111]/90 transition duration-200"
              />
            </div>

            {/* Palvelun valinta – mukautettu dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full bg-[#111]/80 border border-[rgba(255,215,0,0.4)] text-white rounded-md px-4 py-2 text-left
               flex justify-between items-center focus:outline-none focus:border-yellow-400
               transition-all duration-200"
                aria-haspopup="listbox"
                aria-expanded={dropdownOpen}
              >
                {selectedService || "Valitse palvelu *"}
                <svg
                  className={`w-5 h-5 text-yellow-400 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {dropdownOpen && (
                <ul
                  className="absolute z-20 mt-1 w-full bg-[#1a1a1a] border border-[rgba(255,215,0,0.4)] rounded-md shadow-lg overflow-hidden"
                  role="listbox"
                >
                  {["Tatuoinnit", "Stand Up"].map((option) => (
                    <li
                      key={option}
                      onClick={() => {
                        setSelectedService(option);
                        setDropdownOpen(false);
                      }}
                      className="px-4 py-2 cursor-pointer text-white hover:bg-[#2a2a2a] hover:drop-shadow-[0_0_6px_rgba(255,215,0,0.3)] transition-all duration-150"
                      role="option"
                      aria-selected={selectedService === option}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}

              {/* Tämä hidden input tekee tempun 👇 */}
              <input
                type="text"
                name="service"
                value={selectedService}
                onChange={() => {}}
                required
                className="sr-only"
              />
            </div>

            {/* Viesti */}
            <textarea
              name="message"
              placeholder="Mitä mielessä? *"
              required
              rows={5}
              className="bg-white/5 border border-yellow-600/30 text-white rounded-md px-4 py-2
                  focus:outline-none focus:border-yellow-400 placeholder-gray-500 focus:bg-[#111]/90 transition duration-200"
            ></textarea>

            {/* Lähetyspainike */}
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 px-4 rounded-md transition-all duration-300"
            >
              Lähetä viesti
            </button>
          </form>
        </motion.div>
      </section>

      {/* INFO-FOOTER */}
      <section
        id="yhteystiedot"
        className="w-full bg-linear-to-b from-[#0a0a0a] via-[#111] to-[#1a1a1a]
                  border-t border-yellow-600/30 py-10 text-gray-300 scroll-mt-32"
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
            © {new Date().getFullYear()} Tmi TyöUkkoset
          </p>

          <span className="text-gray-500">|</span>

          <button
            onClick={() => setShowPrivacy(true)}
            className="
        text-sm text-gray-400
        underline underline-offset-4
        decoration-gray-500/60
        hover:text-yellow-400
        hover:decoration-yellow-400
        transition-colors
      "
          >
            Tietosuojaseloste
          </button>
        </div>
      </footer>

      <PrivacyPolicyModal
        open={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />
    </div>
  );
}
