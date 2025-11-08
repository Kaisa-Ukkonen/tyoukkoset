"use client";

import { useEffect, useState } from "react";

import ConfirmModal from "@/components/common/ConfirmModal";
import type { InvoiceSummary } from "@/app/admin/bookkeeping/invoices/page";
import { Edit3, Trash2 } from "lucide-react";

type Invoice = {
  id: number;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  totalAmount: number;
  status: string;
  customer?: { name: string } | null;
  customCustomer?: string | null;
};

export default function InvoiceList({
  refreshKey,
  searchTerm = "",   // lisää oletusarvo
  onEdit,
}: {
  refreshKey: number;
  searchTerm?: string;
  onEdit?: (invoice: InvoiceSummary) => void;
}) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  // 🔹 Hae laskut API:sta
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch("/api/bookkeeping/invoices");
        const data = await res.json();
        setInvoices(data);
      } catch (err) {
        console.error("Virhe haettaessa laskuja:", err);
      }
    };
    fetchInvoices();
  }, [refreshKey]);

  // 🔹 Suodata hakusanalla
  const filtered = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customCustomer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔹 Poista lasku
  const handleDelete = async (id: number) => {
    try {
      await fetch("/api/bookkeeping/invoices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      console.error("Virhe poistettaessa laskua:", err);
    }
  };

  return (
    <div className="mt-6 overflow-x-auto border border-yellow-700/30 rounded-xl bg-black/30">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="bg-yellow-700/10 text-yellow-300 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">Numero</th>
            <th className="px-4 py-3">Asiakas</th>
            <th className="px-4 py-3">Päivämäärä</th>
            <th className="px-4 py-3">Eräpäivä</th>
            <th className="px-4 py-3 text-right">Summa (€)</th>
            <th className="px-4 py-3">Tila</th>
            <th className="px-4 py-3 text-center">Toiminnot</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map((invoice) => (
              <tr
                key={invoice.id}
                className="border-t border-yellow-700/10 hover:bg-yellow-700/10 transition-colors"
              >
                <td className="px-4 py-2">{invoice.invoiceNumber}</td>
                <td className="px-4 py-2">
                  {invoice.customCustomer || invoice.customer?.name || "—"}
                </td>
                <td className="px-4 py-2">
                  {new Date(invoice.date).toLocaleDateString("fi-FI")}
                </td>
                <td className="px-4 py-2">
                  {new Date(invoice.dueDate).toLocaleDateString("fi-FI")}
                </td>
                <td className="px-4 py-2 text-right">
                  {invoice.totalAmount.toFixed(2)} €
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`${
                      invoice.status === "PAID"
                        ? "text-green-400"
                        : invoice.status === "SENT"
                        ? "text-yellow-400"
                        : "text-gray-400"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => onEdit?.(invoice)}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(invoice.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-6 text-center text-gray-400 italic"
              >
                Ei laskuja hakuehdoilla.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 🔹 Poistovahvistus */}
      <ConfirmModal
        show={!!confirmDelete}
        message="Haluatko varmasti poistaa tämän laskun?"
        onConfirm={() => handleDelete(confirmDelete!)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
