"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/app/admin/bookkeeping/products/ProductList";
import ProductForm from "@/app/admin/bookkeeping/products/ProductForm";
import ProductList from "@/app/admin/bookkeeping/products/ProductList";
import { Plus } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { Archive } from "lucide-react";

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleSuccess = () => {
    setShowForm(false);
    setEditingProduct(null); // ⭐ Tyhjennetään muokkauksen jälkeen
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

            {/* 📱 Mobiili – pieni nuolivalikko */}
            <div className="sm:hidden relative">
              <button
                onClick={() => setShowMenu((prev) => !prev)}
                className="
      bg-yellow-600 hover:bg-yellow-500
      text-black w-10 h-10
      rounded-md flex items-center justify-center
      text-lg font-bold
    "
              >
                ▾
              </button>

              {showMenu && (
                <div
                  className="
        absolute right-0 mt-2 w-48
        bg-black border border-yellow-700/40 
        rounded-md shadow-lg z-20
      "
                >
                  {!showArchived ? (
                    <>
                      <button
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-yellow-400 hover:bg-yellow-700/20"
                        onClick={() => {
                          setEditingProduct(null);
                          setShowForm(true);
                          setShowMenu(false);
                        }}
                      >
                        <Plus className="w-4 h-4 text-white" />
                        Lisää tuote/palvelu
                      </button>

                      <button
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-yellow-400 hover:bg-yellow-700/20"
                        onClick={() => {
                          setShowArchived(true);
                          setShowMenu(false);
                        }}
                      >
                        <Archive className="w-4 h-4 text-white" />
                        Näytä arkistoidut
                      </button>
                    </>
                  ) : (
                    <button
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-yellow-400 hover:bg-yellow-700/20"
                      onClick={() => {
                        setShowArchived(false);
                        setShowMenu(false);
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 text-white" />
                      Takaisin aktiivisiin
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Desktop dropdown */}
            <div className="hidden sm:block relative">
              <button
                onClick={() => setShowMenu((prev) => !prev)}
                className="
      bg-yellow-600 hover:bg-yellow-500
      text-black px-4 py-1.5 rounded-md font-semibold
      flex items-center gap-2
    "
              >
                Valinnat ▾
              </button>

              {showMenu && (
                <div
                  className="
        absolute right-0 mt-2 w-56
        bg-black border border-yellow-700/40 rounded-md shadow-lg z-20
      "
                >
                  {/* ⭐ Ei arkistotilassa → näytetään nämä */}
                  {!showArchived && (
                    <>
                      <button
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-yellow-400 hover:bg-yellow-700/20"
                        onClick={() => {
                          setEditingProduct(null);
                          setShowForm(true);
                          setShowMenu(false);
                        }}
                      >
                        <Plus className="w-4 h-4 text-white" />
                        Lisää tuote/palvelu
                      </button>

                      <button
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-yellow-400 hover:bg-yellow-700/20"
                        onClick={() => {
                          setShowArchived(true);
                          setShowMenu(false);
                        }}
                      >
                        <Archive className="w-4 h-4 text-white" />
                        Näytä arkistoidut
                      </button>
                    </>
                  )}

                  {showArchived && (
                    <button
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-yellow-400 hover:bg-yellow-700/20"
                      onClick={() => {
                        setShowArchived(false);
                        setShowMenu(false);
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 text-white" />
                      Takaisin aktiivisiin
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🔹 Lista tai popup-lomake */}
        <AnimatePresence mode="wait">
          {showForm ? (
            // ⭐ POPUP MODAALI
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="
        fixed inset-x-0 top-[72px] bottom-0 z-40
        bg-black/60 backdrop-blur-sm
        flex justify-center items-start
        overflow-y-auto
        px-4 pt-4 pb-4
      "
            >
              <motion.div
                key="product-form"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="
          bg-black/90 border border-yellow-700/40 rounded-xl
          w-full max-w-lg
          max-h-[90vh]
          overflow-visible
          p-6 shadow-xl mt-4
        "
              >
                <ProductForm
                  onSuccess={handleSuccess}
                  editingProduct={editingProduct}
                />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="product-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* ⭐ Näytä normaalit tai arkistoidut tuotteet */}
              {!showArchived ? (
                <ProductList
                  refreshKey={refreshKey}
                  searchTerm={searchTerm}
                  setShowForm={setShowForm}
                  setEditingProduct={setEditingProduct}
                  setRefreshKey={setRefreshKey}
                  archived={false} // ⭐ tärkeä!
                />
              ) : (
                <ProductList
                  refreshKey={refreshKey}
                  searchTerm={searchTerm}
                  setShowForm={setShowForm}
                  setEditingProduct={setEditingProduct}
                  setRefreshKey={setRefreshKey} // ⭐ lisää tämä!
                  archived={true}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
