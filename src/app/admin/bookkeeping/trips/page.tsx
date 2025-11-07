"use client";
import { useState } from "react";
import TripForm from "@/components/admin/bookkeeping/TripForm";
import TripList from "@/components/admin/bookkeeping/TripList";
import { motion, AnimatePresence } from "framer-motion";

export default function TripsPage() {
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
        Keikkamatkat
      </h1>

      {/* 🔹 Yläpalkki: haku ja uusi matka */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Hae matkoja..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-black/40 border border-yellow-700/40 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:border-yellow-400 outline-none"
        />
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-5 py-2 rounded-md transition-all"
        >
          {showForm ? "Sulje lomake" : "+ Keikkamatka"}
        </button>
      </div>

      {/* 🔹 Näytetään lomake */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="trip-form"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TripForm onSuccess={handleSuccess} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔹 Matkalista */}
      <TripList refreshKey={refreshKey} searchTerm={searchTerm} />
    </div>
  );
}
