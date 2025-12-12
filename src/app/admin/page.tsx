"use client";
import { motion } from "framer-motion";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default function AdminDashboard() {
  const sections = [
    { name: "Tatuoinnit", href: "/admin/tattoos", color: "border-yellow-500/40" },
    { name: "Stand Up", href: "/admin/standup", color: "border-yellow-500/40" },
    { name: "Kirjanpito", href: "/admin/bookkeeping", color: "border-yellow-500/40" },
  ];

  return (
    <motion.div
      className="text-center relative z-10"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">
        TyöUkkoset – Hallintapaneeli
      </h1>

      <p className="text-gray-400 max-w-xl mx-auto mb-10">
        Tervetuloa Jesse! Tästä voit hallita tatuointigalleriaa, keikkoja ja
        kirjanpitoa.
      </p>

      {/* 🔹 Kortit / linkit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {sections.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            <Link
              href={s.href}
              className={`block bg-black/10 backdrop-blur-sm border ${s.color} 
                         rounded-xl py-10 text-yellow-300 
                         hover:text-yellow-400 hover:bg-black/60 hover:border-yellow-400 
                         transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.4)]`}
            >
              {s.name}
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
