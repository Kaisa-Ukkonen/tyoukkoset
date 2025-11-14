"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Invoice = {
  id: number;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  totalAmount: number;
  status: string;
};

export default function ContactEvents({ contactId }: { contactId: number }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch(`/api/bookkeeping/invoices?contactId=${contactId}`);
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setInvoices(data);
        } else {
          setInvoices([]);
        }
      } catch (err) {
        console.error("Virhe haettaessa tapahtumia:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [contactId]);

  if (loading)
    return <p className="text-gray-400 italic">Ladataan tapahtumat...</p>;

  if (invoices.length === 0)
    return <p className="text-gray-400 italic">Ei tapahtumia tälle kontaktille.</p>;

  return (
    <div className="overflow-x-auto border border-yellow-700/40 rounded-lg bg-black/40 shadow-[0_0_15px_rgba(0,0,0,0.4)] mt-2">
      <table className="w-full text-sm text-gray-300 border-collapse">
        <thead className="bg-yellow-700/10 text-yellow-300 uppercase text-xs">
          <tr>
            <th className="px-4 py-2 text-left">Numero</th>
            <th className="px-4 py-2 text-left">Päivämäärä</th>
            <th className="px-4 py-2 text-left">Eräpäivä</th>
            <th className="px-4 py-2 text-right">Summa (€)</th>
            <th className="px-4 py-2 text-left">Tila</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv, i) => (
            <tr
              key={inv.id}
              onClick={() => router.push(`/admin/bookkeeping/invoices?invoice=${inv.id}`)}
              className={`border-t border-yellow-700/20 cursor-pointer ${
                i % 2 === 0 ? "bg-black/30" : "bg-black/20"
              } hover:bg-yellow-700/10 transition`}
            >
              <td className="px-4 py-2 text-yellow-300 hover:text-yellow-400">
                {inv.invoiceNumber}
              </td>
              <td className="px-4 py-2">
                {new Date(inv.date).toLocaleDateString("fi-FI")}
              </td>
              <td className="px-4 py-2">
                {new Date(inv.dueDate).toLocaleDateString("fi-FI")}
              </td>
              <td className="px-4 py-2 text-right">
                {inv.totalAmount.toFixed(2)} €
              </td>
              <td className="px-4 py-2">
                {inv.status === "PAID" ? (
                  <span className="text-green-400">Maksettu</span>
                ) : inv.status === "APPROVED" ? (
                  <span className="text-yellow-400">Hyväksytty</span>
                ) : inv.status === "SENT" ? (
                  <span className="text-yellow-300">Lähetetty</span>
                ) : (
                  <span className="text-gray-400">Luonnos</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
