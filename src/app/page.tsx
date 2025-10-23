"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Yläreunan logo ja menu */}
      <header className="relative flex justify-between items-center px-6 py-4 bg-[url('/tausta.png')] bg-repeat-x bg-top bg-black text-white">
        {/* Tummennuskerros */}
        <div className="absolute inset-0 bg-black/60 z-0"></div>

        {/* Logo */}
        <div className="relative z-10 flex items-center">
          <Image
            src="/logo.jpg"
            alt="TyöUkkoset logo"
            width={180}
            height={80}
            className="object-contain w-32 sm:w-40 md:w-48"
            priority
          />
        </div>

        {/* Menu-nappi */}
        <button
          className="relative z-10 text-white text-3xl border border-white/50 rounded-lg px-3 py-1 hover:border-red-600 transition"
          aria-label="Avaa valikko"
        >
          ☰
        </button>
      </header>

      {/* Keskiosa */}
      <main className="flex flex-1 flex-col items-center justify-center gap-10 text-center">
        <motion.h2
          className="text-3xl font-semibold text-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        ></motion.h2>

        {/* Pyöreät napit */}
        <motion.div
          className="flex flex-col md:flex-row gap-10 items-center justify-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {/* Tattoos */}
          <motion.div
            onClick={() => router.push("/tattoos")}
            className="relative flex flex-col items-center justify-end 
                       w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-48 lg:h-48
                       bg-red-700 hover:bg-red-600 rounded-full 
                       shadow-[0_0_15px_rgba(255,0,0,0.4)]
                       cursor-pointer overflow-hidden 
                       transition-transform hover:scale-110"
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
                       w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-48 lg:h-48
                       bg-red-700 hover:bg-red-600 rounded-full 
                       shadow-[0_0_15px_rgba(255,0,0,0.4)]
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

      {/* Footer */}
      <footer className="p-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} TyöUkkoset – Jesse Ukkonen
      </footer>
    </div>
  );
}
