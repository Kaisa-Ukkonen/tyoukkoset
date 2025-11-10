"use client";

import { useState } from "react";
import InvoiceList from "@/components/admin/bookkeeping/InvoiceList";
import InvoiceForm from "@/components/admin/bookkeeping/InvoiceForm";
import { PlusCircle } from "lucide-react";

export default function InvoicesPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSaved = () => {
    setShowForm(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="p-6 text-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-yellow-400">Laskut</h1>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Haku..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black/40 border border-yellow-700/40 rounded-md px-3 py-2 text-sm text-white w-full sm:w-64"
          />
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-md font-semibold"
          >
            <PlusCircle size={18} />
            Uusi lasku
          </button>
        </div>
      </div>

      {/* 🔹 Näytetään joko lomake tai listaus */}
      {showForm ? (
        <InvoiceForm
          onSaved={handleSaved}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <InvoiceList refreshKey={refreshKey} searchTerm={searchTerm} />
      )}
    </main>
  );
}
