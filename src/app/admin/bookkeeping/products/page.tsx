"use client";

import { useState } from "react";
import ProductForm from "@/components/admin/bookkeeping/ProductForm";
import ProductList from "@/components/admin/bookkeeping/ProductList";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductsPage() {
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
        Tuotteet ja palvelut
      </h1>

      {/* 🔹 Yläpalkki: haku ja uusi tuote */}
      <div className="flex justify-center mb-6">
  <div className="flex w-[700px] max-w-full">
    <input
      type="text"
      placeholder="🔍 Hae tuotteita..."
      className="flex-1 bg-black/40 border border-yellow-700/40 rounded-l-md px-4 py-2 text-yellow-100 focus:border-yellow-400 outline-none"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <button
      onClick={() => setShowForm(!showForm)}
      className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 rounded-r-md transition-all"
    >
      {showForm ? "Sulje lomake" : "Lisää tuote"}
    </button>
  </div>
</div>

      {/* 🔹 Näytetään lomake kun showForm = true */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="product-form"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ProductForm onSuccess={handleSuccess} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔹 Tuotelista, jossa hakusuodatus */}
      <ProductList refreshKey={refreshKey} searchTerm={searchTerm} />
    </div>
  );
}
