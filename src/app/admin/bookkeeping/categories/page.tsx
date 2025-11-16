"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CategoryList from "./CategoryList";
import CategoryForm from "./CategoryForm";

export default function CategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<number | null>(null);

  const handleSuccess = () => {
    setShowForm(false);
    setFormCategoryId(null);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="w-full text-gray-200 px-2 sm:px-4 lg:px-8">
      <div className="w-full max-w-4xl mx-auto mb-6">
        <h1 className="text-2xl font-semibold text-yellow-400 mb-4">Kategoriat</h1>

        <div className="flex w-full justify-end mb-4">
          <div className="flex w-full sm:w-auto items-center gap-2">
            <input
              type="text"
              placeholder="Haku..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/40 border border-yellow-700/40 rounded-md px-3 py-2 text-sm text-white w-full sm:w-64"
              disabled={showForm}
            />

            <button
              onClick={() => {
                setFormCategoryId(null);
                setShowForm(true);
              }}
              className="hidden sm:flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-1 rounded-md font-semibold"
            >
              <span className="text-lg">＋</span>
              Uusi kategoria
            </button>

            <button
              onClick={() => {
                setFormCategoryId(null);
                setShowForm(true);
              }}
              className="sm:hidden bg-yellow-600 text-black w-10 h-10 rounded-md flex items-center justify-center hover:bg-yellow-500 transition"
            >
              +
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-0 top-[72px] bottom-0 z-40 bg-black/60 backdrop-blur-sm flex justify-center items-start pt-24 pb-4 overflow-y-auto"
            >
              <motion.div
                key="form"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-black/90 border border-yellow-700/40 rounded-xl w-full max-w-lg p-6 shadow-xl"
              >
                <CategoryForm
                  categoryId={formCategoryId}
                  onClose={() => {
                    setShowForm(false);
                    setFormCategoryId(null);
                  }}
                  onSaved={handleSuccess}
                />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <CategoryList
                refreshKey={refreshKey}
                searchTerm={searchTerm}
                setShowForm={setShowForm}
                setFormCategoryId={setFormCategoryId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
