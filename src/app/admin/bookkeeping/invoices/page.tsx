"use client";

import { useState } from "react";
import InvoiceList from "@/components/admin/bookkeeping/InvoiceList";
import InvoiceForm from "@/components/admin/bookkeeping/InvoiceForm";
import { PlusCircle } from "lucide-react";
import type { InvoiceFormData } from "@/components/admin/bookkeeping/InvoiceForm";

type InvoiceLineData = {
  productId?: number | null;
  description: string; // ✅ poista kysymysmerkki
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
};

export type InvoiceSummary = {
  id: number;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  totalAmount: number;
  status: string;
  paymentTerm?: number;
  customerId?: number | null;
  customCustomer?: string | null;
  notes?: string;
  lines?: unknown[];
  netAmount?: number;
  vatAmount?: number;
  vatRate?: number;
};

export default function InvoicesPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [editData, setEditData] = useState<InvoiceFormData | null>(null);

  const handleSaved = () => {
    setShowForm(false);
    setEditData(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleEdit = (invoice: InvoiceSummary) => {
    const formattedInvoice: InvoiceFormData = {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber || "",
      date: new Date(invoice.date),
      dueDate: new Date(invoice.dueDate),
      paymentTerm: invoice.paymentTerm || 14,
      customerId: invoice.customerId || null,
      customCustomer: invoice.customCustomer || "",
      notes: invoice.notes || "",
      // ✅ Tämä rivi on tärkeä korjaus
      lines: (invoice.lines as InvoiceLineData[]) || [],
      netAmount: invoice.netAmount || 0,
      vatAmount: invoice.vatAmount || 0,
      totalAmount: invoice.totalAmount || 0,
      vatRate: invoice.vatRate || 24,
    };

    setEditData(formattedInvoice);
    setShowForm(true);
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
            onClick={() => {
              setShowForm(true);
              setEditData(null);
            }}
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
          editData={editData}
        />
      ) : (
        <InvoiceList
          refreshKey={refreshKey}
          searchTerm={searchTerm}
          onEdit={handleEdit}
        />
      )}
    </main>
  );
}
