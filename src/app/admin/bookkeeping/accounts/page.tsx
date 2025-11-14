"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AccountList from "./AccountList";
import AccountForm from "./AccountForm";

export default function AccountsPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [formAccountId, setFormAccountId] = useState<number | null>(null);

  const handleSuccess = () => {
    setShowForm(false);
    setFormAccountId(null);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="p-6 text-gray-200">
      <div className="mx-auto max-w-4xl">
        {/* 🔹 Otsikko + hakukenttä + nappi */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h1
            className={`text-2xl font-semibold text-yellow-400 tracking-wide ${showForm ? "ml-6" : ""}`}
          >
            Tililuettelo
          </h1>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Hakukenttä */}
            <input
              type="text"
              placeholder="Haku..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/40 border border-yellow-700/40 rounded-md px-3 py-2 text-sm text-white w-full sm:w-64"
              disabled={showForm}
            />

            {/* Lisää uusi tili */}
            <button
              onClick={() => {
                setFormAccountId(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-1.5 rounded-md font-semibold"
            >
              <span className="text-lg">＋</span>
              Uusi tili
            </button>
          </div>
        </div>

        {/* 🔹 Lomake tai lista */}
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="account-form"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AccountForm
                accountId={formAccountId}
                onClose={() => {
                  setShowForm(false);
                  setFormAccountId(null);
                }}
                onSaved={handleSuccess}
              />
            </motion.div>
          ) : (
            <motion.div
              key="account-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <AccountList
                refreshKey={refreshKey}
                searchTerm={searchTerm}
                setShowForm={setShowForm}
                setFormAccountId={setFormAccountId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
