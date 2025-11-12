"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductForm from "@/components/admin/bookkeeping/ProductForm";
import ProductList from "@/components/admin/bookkeeping/ProductList";

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSuccess = () => {
    setShowForm(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="p-6 text-gray-200">
      <div className="mx-auto max-w-4xl">
        {/* 🔹 Otsikko + Haku + Nappi samalle riville (Laskut-tyyli) */}
        <div
          className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 transition-all duration-500 ${
            showForm ? "ml-28 sm:ml-28" : "ml-0"
          }`}
        >
          <h1 className="text-2xl font-semibold text-yellow-400 tracking-wide">
            Tuotteet ja palvelut
          </h1>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="🔍 Hae tuotteita..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/40 border border-yellow-700/40 rounded-md px-3 py-2 text-sm text-white w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-yellow-600 placeholder-gray-500"
              disabled={showForm}
            />

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-black px-3 py-1.5 rounded-md font-semibold transition-all duration-200 shadow-[0_0_10px_rgba(255,255,0,0.2)]"
            >
              <span className="text-lg">＋</span>
              Lisää tuote
            </button>
          </div>
        </div>

        {/* 🔹 Näytetään vain toinen kerrallaan */}
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="product-form"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProductForm onSuccess={handleSuccess} />
            </motion.div>
          ) : (
            <motion.div
              key="product-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ProductList refreshKey={refreshKey} searchTerm={searchTerm} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
