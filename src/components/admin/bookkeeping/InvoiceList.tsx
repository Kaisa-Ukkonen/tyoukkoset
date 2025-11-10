"use client";

import { useEffect, useState } from "react";
import React from "react";
import ConfirmModal from "@/components/common/ConfirmModal";

import { Trash2 } from "lucide-react";

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
  searchTerm = "", // lisää oletusarvo
}: {
  refreshKey: number;
  searchTerm?: string;
}) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<number | null>(
    null
  );

  const toggleExpand = (id: number) => {
    setExpandedInvoiceId(expandedInvoiceId === id ? null : id);
  };

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
          </tr>
        </thead>

        <tbody>
          {filtered.length > 0 ? (
            filtered.map((invoice) => (
              <React.Fragment key={invoice.id}>
                {/* 🔹 Laskun perusrivi */}
                <tr
                  onClick={() => toggleExpand(invoice.id)}
                  className={`border-t border-yellow-700/10 hover:bg-yellow-700/10 transition-colors cursor-pointer ${
                    expandedInvoiceId === invoice.id ? "bg-yellow-700/20" : ""
                  }`}
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
                      {invoice.status === "DRAFT"
                        ? "Luonnos"
                        : invoice.status === "SENT"
                        ? "Lähetetty"
                        : invoice.status === "PAID"
                        ? "Maksettu"
                        : invoice.status}
                    </span>
                  </td>
                </tr>

                {/* 🔽 Laajennettava näkymä (avautuu klikatessa) */}
                {expandedInvoiceId === invoice.id && (
                  <tr>
                    <td
                      colSpan={6}
                      className="bg-black/50 border-t border-yellow-700/40 p-4"
                    >
                      <div className="text-gray-300 text-sm space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p>
                              <span className="text-yellow-400">
                                Laskun numero:
                              </span>{" "}
                              {invoice.invoiceNumber}
                            </p>
                            <p>
                              <span className="text-yellow-400">Asiakas:</span>{" "}
                              {invoice.customCustomer ||
                                invoice.customer?.name ||
                                "—"}
                            </p>
                            <p>
                              <span className="text-yellow-400">
                                Laskun päivä:
                              </span>{" "}
                              {new Date(invoice.date).toLocaleDateString(
                                "fi-FI"
                              )}
                            </p>
                            <p>
                              <span className="text-yellow-400">Eräpäivä:</span>{" "}
                              {new Date(invoice.dueDate).toLocaleDateString(
                                "fi-FI"
                              )}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedInvoiceId(null);
                            }}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Sulje ×
                          </button>
                        </div>

                        <hr className="border-yellow-700/40 my-3" />

                        <div className="flex justify-between">
                          <span className="text-gray-400">
                            Summa (sis. ALV):
                          </span>
                          <span className="text-yellow-300 font-semibold">
                            {invoice.totalAmount.toFixed(2)} €
                          </span>
                        </div>
                        {/* 🔹 Näytä PDF-lasku */}
                        <a
                          href={`/api/bookkeeping/invoices/${invoice.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          📄 Näytä PDF-lasku
                        </a>

                        {/* 🔹 Painikkeet */}
                        {invoice.status === "DRAFT" && (
                          <div className="pt-4 flex justify-end gap-4">
                            {/* 🟡 Hyväksy lasku */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(
                                  "Tässä voisi olla 'Hyväksy lasku' -toiminto"
                                );
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-md text-black font-semibold transition"
                            >
                              ✅ Hyväksy lasku
                            </button>

                            {/* 🔴 Poista lasku */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDelete(invoice.id);
                              }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td
                colSpan={6}
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
