"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductForm from "@/app/admin/bookkeeping/products/ProductForm";
import ProductList from "@/app/admin/bookkeeping/products/ProductList";

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSuccess = () => {
    setShowForm(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="w-full text-gray-200 px-2 sm:px-4 lg:px-8">
      <div className="w-full max-w-4xl mx-auto mb-6">

        {/* 🔹 Otsikko */}
        <h1 className="text-2xl font-semibold text-yellow-400 mb-4">
          Tuotteet ja palvelut
        </h1>

        {/* 🔹 Haku + napit */}
        <div className="flex w-full justify-end mb-4">
          <div className="flex w-full sm:w-auto items-center gap-2">

            {/* Hakukenttä */}
            <input
              type="text"
              placeholder="Hae tuotteita..."
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
              Lisää tuote
            </button>

          </div>
        </div>

        {/* 🔹 Lista tai lomake */}
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
              <ProductList 
                refreshKey={refreshKey}
                searchTerm={searchTerm}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
