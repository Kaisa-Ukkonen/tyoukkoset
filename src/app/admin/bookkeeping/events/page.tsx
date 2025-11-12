"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BookkeepingForm from "@/components/admin/bookkeeping/BookkeepingForm";
import BookkeepingList from "@/components/admin/bookkeeping/BookkeepingList";

type Entry = {
  id: number;
  date: string;
  description: string | null;
  type: string;
  amount: number;
  vatRate: number;
  paymentMethod: string | null;
  account: { name: string };
};

export default function BookkeepingEventsPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  // 🔹 Hakee tapahtumat tietokannasta
  const fetchEntries = async () => {
    try {
      const res = await fetch("/api/bookkeeping");
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error("Virhe tapahtumien haussa:", err);
    }
  };

  useEffect(() => {
    const loadEntries = async () => {
      try {
        await fetchEntries(); // tämä tekee setEntries turvallisesti
      } catch (err) {
        console.error("Virhe tapahtumien haussa:", err);
      }
    };

    // Käynnistetään erikseen asynkronisesti
    loadEntries();
  }, []);

  // 🔹 Päivitä listaa uuden tapahtuman lisäyksessä
  const handleNewEntry = (newEntry: Entry) => {
    setEntries((prev) =>
      [...prev, newEntry].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  };

  // 🔹 Suodatus hakusanan mukaan
  const filteredEntries = entries.filter(
    (e) =>
      e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.account?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="p-6 text-gray-200">
      <div className="mx-auto max-w-4xl">
        <div
          className={`transition-all duration-500 ${
            showForm ? "ml-28 sm:ml-28" : "ml-0"
          }`}
        >
          {/* 🔹 Otsikko + Haku + Nappi samalle riville (Laskut-tyyli) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h1 className="text-2xl font-semibold text-yellow-400 tracking-wide">
              Tapahtumat
            </h1>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Hae tapahtumia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/40 border border-yellow-700/40 rounded-md px-3 py-2 text-sm text-white w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-yellow-600 placeholder-gray-500"
                disabled={showForm}
              />
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-1.5 rounded-md font-semibold"
              >
                <span className="text-lg">＋</span>
                Lisää tapahtuma
              </button>
            </div>
          </div>
        </div>

        {/* 🔹 Näytetään vain toinen kerrallaan */}
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="bookkeeping-form"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BookkeepingForm
                onSuccess={(newEntry) => {
                  handleNewEntry(newEntry);
                  setShowForm(false);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="bookkeeping-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <BookkeepingList entries={filteredEntries} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
