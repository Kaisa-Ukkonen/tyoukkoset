"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ContactForm from "@/components/admin/bookkeeping/ContactForm";
import ContactList from "@/components/admin/bookkeeping/ContactList";

export default function ContactsPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSuccess = () => {
    setShowForm(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="p-6 text-gray-200">
      <div className="mx-auto max-w-3xl">
        {/* 🔹 Otsikko + Haku + Nappi (Laskut-tyyli, tiiviimpi väli) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
          <h1
            className={`text-2xl font-semibold text-yellow-400 tracking-wide transition-all duration-500 ${
              showForm ? "ml-6 sm:ml-12" : "ml-0"
            }`}
          >
            Kontaktit
          </h1>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Hakukenttä */}
            <input
              type="text"
              placeholder="Haku..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/40 border border-yellow-700/40 rounded-md px-3 py-2 text-sm text-white w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-yellow-600 placeholder-gray-500"
              disabled={showForm} // estää hakua lisäystilan aikana
            />

            {/* Lisää / Sulje lomake */}
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-1.5 rounded-md font-semibold"
            >
              <span className="text-lg">＋</span>
              Uusi kontakti
            </button>
          </div>
        </div>

        {/* 🔹 Näytetään vain toinen kerrallaan */}
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="contact-form"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ContactForm onSuccess={handleSuccess} />
            </motion.div>
          ) : (
            <motion.div
              key="contact-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ContactList refreshKey={refreshKey} searchTerm={searchTerm} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
