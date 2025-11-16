"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import BookkeepingForm from "@/app/admin/bookkeeping/events/BookkeepingForm";
import BookkeepingList from "@/app/admin/bookkeeping/events/BookkeepingList";

import type { Entry } from "./types/Entry";

export default function BookkeepingEventsPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  // 🔹 Hae tietokannasta
  const fetchEntries = async () => {
    try {
      const res = await fetch("/api/bookkeeping/events");
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error("Virhe tapahtumien haussa:", err);
    }
  };

  useEffect(() => {
    const loadEntries = async () => {
      try {
        await fetchEntries();
      } catch (err) {
        console.error("Virhe tapahtumien haussa:", err);
      }
    };
    loadEntries();
  }, []);

  // 🔹 Lisää uusi tapahtuma listaan (oikeaan järjestykseen)
  const handleNewEntry = (newEntry: Entry) => {
    setEntries((prev) =>
      [...prev, newEntry].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  };

  // 🔹 Suodatus hakusanalla
  const filteredEntries = entries.filter((e) => {
    const term = searchTerm.toLowerCase();
    return (
      e.description?.toLowerCase().includes(term) ||
      e.category?.name?.toLowerCase().includes(term) ||
      e.paymentMethod?.toLowerCase().includes(term)
    );
  });

  return (
    <main className="w-full text-gray-200 px-2 sm:px-4 lg:px-8">
      <div className="w-full max-w-4xl mx-auto mb-6">
        {/* 🔹 Otsikko */}
        <h1 className="text-2xl font-semibold text-yellow-400 mb-4">
          Tapahtumat
        </h1>

        {/* 🔹 Haku + napit */}
        <div className="flex w-full justify-end mb-4">
          <div className="flex w-full sm:w-auto items-center gap-2">
            {/* Hakukenttä */}
            <input
              type="text"
              placeholder="Hae tapahtumia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                bg-black/40 border border-yellow-700/40 rounded-md 
                px-3 py-2 text-sm text-white 
                w-full sm:w-64
              "
              disabled={showForm}
            />

            {/* Mobiilin pieni plus */}
            <button
              onClick={() => setShowForm(true)}
              className="
                sm:hidden bg-yellow-600 text-black
                w-10 h-10 rounded-md flex items-center justify-center
                hover:bg-yellow-500 transition
              "
            >
              +
            </button>

            {/* Desktop-nappi */}
            <button
              onClick={() => setShowForm(true)}
              className="
                hidden sm:flex items-center gap-2
                bg-yellow-600 hover:bg-yellow-500
                text-black px-4 py-1 rounded-md font-semibold
              "
            >
              <span className="text-lg">＋</span>
              Lisää tapahtuma
            </button>
          </div>
        </div>

        {/* 🔹 Lomake tai lista */}
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="events-form"
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
              key="events-list"
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
