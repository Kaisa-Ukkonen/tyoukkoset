"use client";

import { useState, useEffect } from "react";
import InvoiceList from "@/app/admin/bookkeeping/invoices/InvoiceList";
import InvoiceForm from "@/app/admin/bookkeeping/invoices/InvoiceForm";
import { useSearchParams } from "next/navigation";


export default function InvoicesPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
const invoiceParam = searchParams.get("invoice");

useEffect(() => {
  if (invoiceParam) {
    // pienen viiveen jälkeen vieritetään näkyviin tai laajennetaan
    setTimeout(() => {
      const row = document.getElementById(`invoice-${invoiceParam}`);
      if (row) row.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  }
}, [invoiceParam]);

  const handleSaved = () => {
    setShowForm(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="p-6 text-gray-200">
      {/* 🔹 Keskitetään otsikko + haku + nappi saman leveyden sisään */}
      <div className="mx-auto max-w-4xl">
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
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-1.5 rounded-md font-semibold"
            >
              <span className="text-lg">＋</span>
              
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
      </div>
    </main>
  );
}
