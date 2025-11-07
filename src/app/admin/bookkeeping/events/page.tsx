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
    <main className="text-white p-8">
      <h1 className="text-3xl font-bold text-yellow-400 mb-8 text-center">
        Kirjanpidon tapahtumat
      </h1>

      {/* 🔍 Hakukenttä ja lisää-nappi */}
      <div className="flex justify-center mb-6">
        <div className="flex w-[700px] max-w-full">
          <input
            type="text"
            placeholder="🔍 Hae tapahtumia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-black/40 border border-yellow-700/40 rounded-l-md px-4 py-2 text-yellow-100 focus:border-yellow-400 outline-none"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 rounded-r-md transition-all"
          >
            {showForm ? "Sulje lomake" : "+ Lisää tapahtuma"}
          </button>
        </div>
      </div>

      {/* 🧾 Lomake avautuu vain tarvittaessa */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <BookkeepingForm
              onSuccess={(newEntry) => {
                handleNewEntry(newEntry);
                setShowForm(false); // 🔹 suljetaan lomake
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📋 Lista */}
      <div className="mt-10">
        <BookkeepingList entries={filteredEntries} />
      </div>
    </main>
  );
}
