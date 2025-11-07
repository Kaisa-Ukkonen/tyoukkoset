"use client";
import { useState } from "react";
import ContactForm from "@/components/admin/bookkeeping/ContactForm";
import ContactList from "@/components/admin/bookkeeping/ContactList";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactsPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSuccess = () => {
    setShowForm(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="max-w-6xl mx-auto py-10">
      <h1 className="text-3xl font-semibold text-yellow-400 mb-8 text-center">
        Kontaktit
      </h1>

      {/* 🔹 Yläpalkki: haku ja uusi kontakti */}
      <div className="flex justify-center mb-6">
  <div className="flex w-[700px] max-w-full">
        <input
          type="text"
          placeholder="🔍 Hae kontakteja..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-black/40 border border-yellow-700/40 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:border-yellow-400 outline-none"
        />
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-5 py-2 rounded-md transition-all"
        >
          {showForm ? "Sulje lomake" : "+ Uusi kontakti"}
        </button>
      </div>
      </div>

      {/* 🔹 Näytetään lomake kun showForm = true */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="contact-form"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ContactForm onSuccess={handleSuccess} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔹 Kontaktien lista */}
      <ContactList refreshKey={refreshKey} searchTerm={searchTerm} />
    </div>
  );
}
