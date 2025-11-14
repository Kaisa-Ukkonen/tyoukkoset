//näyttää laskurivit valmiista laskuista, toimii vain listaus- ja tarkastelunäkymässä, EI vaikuta laskun luontiin

"use client";

import { useEffect, useState } from "react";
import React from "react";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useSearchParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import type { InvoiceLine, Product } from "@prisma/client";

type InvoiceLineExtended = InvoiceLine & {
  vatHandling?: string | null;
  vatCode?: string | null;
  product?: Product | null;
};

type CustomerData = {
  id: number;
  name: string;
  email?: string;
  address?: string;
  zip?: string;
  city?: string;
  customerCode?: string;
  type?: string; // esim. "Yksityishenkilö" tai "Yritys"
};

type Invoice = {
  id: number;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  totalAmount: number;
  status: string;
  lines?: InvoiceLine[];
  customer?: CustomerData | null;
  customCustomer?: string | null;
};

export default function InvoiceList({
  refreshKey,
  searchTerm = "",
  contactId,
}: {
  refreshKey: number;
  searchTerm?: string;
  contactId?: number;
}) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<number | null>(
    null
  );
  const searchParams = useSearchParams();
  const invoiceParam = searchParams.get("invoice");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const toggleExpand = (id: number) => {
    setExpandedInvoiceId(expandedInvoiceId === id ? null : id);
  };

  useEffect(() => {
    if (invoiceParam) {
      const id = Number(invoiceParam);

      // 🔹 Odotetaan hetki ennen kuin avataan ja korostetaan lasku
      setTimeout(() => {
        setExpandedInvoiceId(id);
        const row = document.getElementById(`invoice-${id}`);
        if (row) {
          row.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [invoiceParam]);

  // 🔹 Hae laskut API:sta
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const url = contactId
          ? `/api/bookkeeping/invoices?contactId=${contactId}`
          : "/api/bookkeeping/invoices";

        const res = await fetch(url);
        const data = await res.json();

        if (res.ok && Array.isArray(data)) setInvoices(data);
        else setInvoices([]);
      } catch (err) {
        console.error("Virhe haettaessa laskuja:", err);
      }
    };
    fetchInvoices();
  }, [refreshKey, contactId]);

  // 🔹 Suodata hakusanalla
  const filtered = invoices.filter(
    (inv) =>
      inv.invoiceNumber
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
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
    <div className="mt-6 mx-auto max-w-4xl overflow-x-auto border border-yellow-700/30 rounded-xl bg-black/30 shadow-[0_0_15px_rgba(0,0,0,0.4)]">
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
                  id={`invoice-${invoice.id}`}
                  onClick={() => toggleExpand(invoice.id)}
                  className={`border-t border-yellow-700/10 transition-colors cursor-pointer ${
                    expandedInvoiceId === invoice.id
                      ? "bg-yellow-700/20 hover:bg-yellow-700/20" // 🔹 pysyvä kellertävä tausta
                      : "hover:bg-yellow-700/10"
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
                          : invoice.status === "APPROVED"
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
                        : invoice.status === "APPROVED"
                        ? "Hyväksytty"
                        : invoice.status}
                    </span>
                  </td>
                </tr>

                {/* 🔽 Laajennettava näkymä */}
                {expandedInvoiceId === invoice.id && (
                  <tr>
                    <td
                      colSpan={6}
                      className="bg-black/50 border-t border-yellow-700/40 p-4"
                    >
                      <div className="text-gray-300 text-sm space-y-3">
                        {/* Laskun perustiedot */}
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

                            {invoice.customer?.customerCode && (
                              <p>
                                <span className="text-yellow-400">
                                  {invoice.customer.type &&
                                  invoice.customer.type
                                    .toLowerCase()
                                    .includes("yksityis")
                                    ? "Asiakastunnus"
                                    : "Y-tunnus"}
                                  :
                                </span>{" "}
                                {invoice.customer.customerCode}
                              </p>
                            )}

                            {invoice.customer?.email && (
                              <p>
                                <span className="text-yellow-400">
                                  Sähköposti:
                                </span>{" "}
                                {invoice.customer.email}
                              </p>
                            )}

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
                            className="ml-auto text-gray-400 hover:text-red-400 text-sm"
                          >
                            Sulje ×
                          </button>
                        </div>

                        <hr className="border-yellow-700/40 my-3" />

                        {/* 🔹 Laskurivit */}
                        {invoice.lines && invoice.lines.length > 0 ? (
                          <div className="mt-2">
                            <table className="w-full text-sm text-gray-300 border-collapse">
                              <thead>
                                <tr className="border-b border-yellow-700/40 text-yellow-400 text-left">
                                  <th className="py-1 px-2">Tuote</th>
                                  <th className="py-1 px-2">Määrä</th>
                                  <th className="py-1 px-2">A-hinta</th>
                                  <th className="py-1 px-2">ALV-osuus</th>
                                  <th className="py-1 px-2">ALV-Kanta</th>
                                  <th className="py-1 px-2 text-right">
                                    Yhteensä
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const lines = (invoice.lines ??
                                    []) as InvoiceLineExtended[];

                                  return lines.map((line) => {
                                    const vatAmount =
                                      (line.unitPrice *
                                        line.quantity *
                                        line.vatRate) /
                                      100;
                                    const total =
                                      line.unitPrice *
                                      line.quantity *
                                      (1 + line.vatRate / 100);

                                    return (
                                      <tr
                                        key={line.id}
                                        className="border-b border-yellow-700/20"
                                      >
                                        <td className="py-1 px-2">
                                          {line.product?.name ||
                                            line.description ||
                                            "-"}
                                        </td>

                                        <td className="py-1 px-2">
                                          {line.quantity}
                                        </td>
                                        <td className="py-1 px-2">
                                          {line.unitPrice.toFixed(2)} €
                                        </td>
                                        <td className="py-1 px-2">
                                          {vatAmount.toFixed(2)} €
                                        </td>
                                        <td className="py-1 px-2">
                                          {line.vatRate % 1 === 0
                                            ? `${line.vatRate} %`
                                            : `${line.vatRate.toFixed(1)} %`}
                                        </td>
                                        <td className="py-1 px-2 text-right">
                                          {total.toFixed(2)} €
                                        </td>
                                      </tr>
                                    );
                                  });
                                })()}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-gray-400 italic">
                            Ei laskurivejä.
                          </p>
                        )}
                        {/* 🔹 ALV 0% selite näkyviin */}
                        {invoice?.lines?.some(
                          (l: InvoiceLineExtended) =>
                            l.vatRate === 0 && l.vatHandling
                        ) && (
                          <div className="mt-3 text-sm text-gray-400 italic">
                            ALV 0% syy:{" "}
                            <span className="text-yellow-400 font-semibold">
                              {(() => {
                                const firstLine = invoice
                                  .lines[0] as InvoiceLineExtended;
                                return (
                                  <>
                                    {firstLine?.vatHandling}
                                    {firstLine?.vatCode
                                      ? ` (${firstLine.vatCode})`
                                      : ""}
                                  </>
                                );
                              })()}
                            </span>
                          </div>
                        )}

                        <a
                          href={`/api/bookkeeping/invoices/${invoice.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          📄 Näytä PDF-lasku
                        </a>
                        {/* 🔹 Toimintopainikkeet (vain luonnoksille) */}
                        {invoice.status === "DRAFT" && (
                          <div className="pt-4 flex justify-end gap-4">
                            {/* 🟢 Ilmoitusboksi */}
                            {notification && (
                              <div
                                className={`mb-2 text-center py-2 px-4 rounded-md font-medium transition-all duration-500 ${
                                  notification.type === "success"
                                    ? "bg-yellow-700/40 border border-yellow-600 text-yellow-300"
                                    : "bg-red-700/40 border border-red-600 text-red-300"
                                }`}
                              >
                                {notification.message}
                              </div>
                            )}
                            {/* 🟡 Hyväksy lasku */}
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();

                                try {
                                  const res = await fetch(
                                    `/api/bookkeeping/invoices/${invoice.id}/approve`,
                                    { method: "POST" }
                                  );
                                  const data = await res.json();

                                  if (res.ok) {
                                    setNotification({
                                      type: "success",
                                      message:
                                        "✅ Lasku hyväksytty onnistuneesti!",
                                    });
                                    // Päivitetään näkymä pienen viiveen jälkeen
                                    setTimeout(
                                      () => window.location.reload(),
                                      1500
                                    );
                                  } else {
                                    setNotification({
                                      type: "error",
                                      message: `❌ Virhe: ${
                                        data.error || data.message
                                      }`,
                                    });
                                  }
                                } catch (err) {
                                  console.error(err);
                                  setNotification({
                                    type: "error",
                                    message:
                                      "⚠️ Palvelinvirhe laskun hyväksynnässä.",
                                  });
                                }
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-md text-black font-semibold transition"
                            >
                              Hyväksy lasku
                            </button>

                            {/* 🔴 Poista lasku */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDelete(invoice.id);
                              }}
                              className="text-red-500 hover:text-red-400"
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

      <ConfirmModal
        show={!!confirmDelete}
        message="Haluatko varmasti poistaa tämän laskun?"
        onConfirm={() => handleDelete(confirmDelete!)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
