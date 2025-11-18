"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import BookkeepingForm from "@/app/admin/bookkeeping/events/BookkeepingForm";
import BookkeepingList from "@/app/admin/bookkeeping/events/BookkeepingList";
import DatePickerField from "@/components/common/DatePickerField";

import type { Entry } from "./types/Entry";

export default function BookkeepingEventsPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

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
    if (showForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showForm]);

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
    const date = new Date(e.date);

    // 🔹 Hakusana
    const matchesSearch =
      e.description?.toLowerCase().includes(term) ||
      e.category?.name?.toLowerCase().includes(term) ||
      e.paymentMethod?.toLowerCase().includes(term) ||
      e.contact?.name?.toLowerCase().includes(term);

    // 🔹 Päivämäärärajaukset
    const matchesStart = startDate ? date >= startDate : true;
    const matchesEnd = endDate ? date <= endDate : true;

    return matchesSearch && matchesStart && matchesEnd;
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
              onClick={() => {
                document.body.style.overflow = "hidden";
                setShowForm(true);
              }}
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
              onClick={() => {
                document.body.style.overflow = "hidden"; // 🔥 LISÄTTIIN
                setShowForm(true);
              }}
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

        {/* 🔹 Päivämäärärajaukset */}
        <div className="w-full flex sm:justify-end mb-6">
          <div className="w-full sm:w-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <p className="text-yellow-400 text-base font-semibold">
              Hae aikavälillä:
            </p>

            {/* 🔸 Mobiili: kaikki yhdessä rivissä */}
            <div className="flex flex-row gap-2 w-full sm:w-auto">
              <div className="flex-1">
                <DatePickerField
                  label="Alkaen"
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                />
              </div>

              <div className="flex items-center justify-center text-yellow-400 font-bold px-1">
                –
              </div>

              <div className="flex-1">
                <DatePickerField
                  label="Päättyen"
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 🔹 Lista */}
        {!showForm && (
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

        {/* 🔹 Modal – lomake */}
        {showForm && (
          <div
            className="
    fixed top-0 left-0 right-0 bottom-0
    h-screen
    bg-black/70 backdrop-blur-sm
    z-9999
    flex justify-center px-4
    items-start sm:items-center            
    pt-28 sm:pt-0                           
    pb-10
    overflow-y-auto
  "
          >
            <div
              className="
        bg-black/40 border border-yellow-700/40 rounded-xl
        p-6 w-full max-w-xl shadow-[0_0_25px_rgba(0,0,0,0.6)]
        max-h-[calc(100vh-180px)]
        overflow-y-auto
      "
            >
              <BookkeepingForm
                onSuccess={(entry) => {
                  handleNewEntry(entry);
                  document.body.style.overflow = "";
                  setShowForm(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
