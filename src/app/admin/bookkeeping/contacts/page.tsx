"use client";

import { useState } from "react";
import { Suspense } from "react";
import ContactForm from "./ContactForm";
import ContactList from "./ContactList";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";


export default function ContactsPage() {
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
        {/* Otsikko */}
        <h1 className="text-2xl font-semibold text-yellow-400 mb-4">
          Kontaktit
        </h1>

        {/* Haku ja nappi */}
        <div className="flex w-full justify-end">
          <div className="flex w-full sm:w-auto items-center gap-2">
            <input
              type="text"
              placeholder="Hae kontakteja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                bg-black/40 border border-yellow-700/40 rounded-md 
                px-3 py-2 text-sm text-white 
                w-full sm:w-64
              "
            />

            {/* Mobiilipainike */}
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
              Uusi kontakti
            </button>
          </div>
        </div>

        {/* Lista */}
    <Suspense fallback={<div>Ladataan...</div>}>
  <ContactList
    refreshKey={refreshKey}
    searchTerm={searchTerm}
  />
</Suspense>
      </div>

      {/* 🔹 Popup-lomake */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/40 border border-yellow-700/40 rounded-xl p-6 w-full max-w-lg shadow-[0_0_20px_rgba(0,0,0,0.6)] overflow-y-auto max-h-[90vh]">
            <ContactForm onSuccess={handleSuccess} />
          </div>
        </div>
      )}
    </main>
  );
}
