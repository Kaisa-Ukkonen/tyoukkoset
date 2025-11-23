"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TripForm from "@/app/admin/bookkeeping/trips/TripForm";
import TripList from "@/app/admin/bookkeeping/trips/TripList";

export default function TripsPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const handleSuccess = () => {
    setShowForm(false);
    setEditingTrip(null); // ⭐ Tyhjennetään muokkaustila
    setRefreshKey((prev) => prev + 1);
  };
  type Trip = {
    id: number;
    date: string;
    startAddress: string;
    endAddress: string;
    kilometers: number;
    allowance: string;
    notes?: string;
  };
  return (
    <main className="w-full text-gray-200 px-2 sm:px-4 lg:px-8">
      <div className="w-full max-w-4xl mx-auto mb-6">
        {/* 🔹 Otsikko */}
        <h1 className="text-2xl font-semibold text-yellow-400 mb-4">
          Keikkamatkat
        </h1>

        {/* 🔹 Haku + napit */}
        <div className="flex w-full justify-end mb-4">
          <div className="flex w-full sm:w-auto items-center gap-2">
            {/* Hakukenttä */}
            <input
              type="text"
              placeholder="Hae matkoja..."
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
              Lisää matka
            </button>
          </div>
        </div>

        {/* 🔹 Lista tai lomake popupilla */}
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="
    fixed inset-0 z-40
    bg-black/60 backdrop-blur-sm
    flex justify-center items-start
    overflow-y-auto
    px-4 pt-24 pb-4
  "
            >
              <motion.div
                key="trip-form"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="
          bg-black/90 border border-yellow-700/40 rounded-xl
          w-full max-w-lg max-h-[80vh] overflow-y-auto
          p-6 shadow-xl mt-4
        "
              >
                <TripForm onSuccess={handleSuccess} editingTrip={editingTrip} />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="trip-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TripList
                refreshKey={refreshKey}
                searchTerm={searchTerm}
                setEditingTrip={setEditingTrip}
                setShowForm={setShowForm}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
