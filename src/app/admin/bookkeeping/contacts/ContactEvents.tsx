"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Entry = {
  id: number;
  date: string;
  description: string | null;
  type: string; // Tulo / Meno
  amount: number;
  vatRate: number;
  vatAmount: number;
  paymentMethod: string | null;
  receiptNumber: string | null;

  category: {
    name: string;
  };

  receipt?: {
    fileUrl: string;
  } | null;
};

export default function ContactEvents({ contactId }: { contactId: number }) {
  const [events, setEvents] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(
          `/api/bookkeeping/events?contactId=${contactId}`
        );
        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          setEvents(data);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error("Virhe haettaessa tapahtumia:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [contactId]);

  if (loading)
    return <p className="text-gray-400 italic">Ladataan tapahtumat...</p>;

  if (events.length === 0)
    return (
      <p className="text-gray-400 italic">Ei tapahtumia tälle kontaktille.</p>
    );

  return (
    <>
      {/* DESKTOP TAULUKKO */}
      <div className="hidden sm:block overflow-x-auto border border-yellow-700/40 rounded-lg bg-black/40 shadow-[0_0_15px_rgba(0,0,0,0.4)] mt-2">
        <table className="w-full text-sm text-gray-300 border-collapse">
          <thead className="bg-yellow-700/10 text-yellow-300 uppercase text-xs">
            <tr>
              <th className="px-4 py-2 text-left">Päivämäärä</th>
              <th className="px-4 py-2 text-left">Kategoria</th>
              <th className="px-4 py-2 text-left">Tyyppi</th>
              <th className="px-4 py-2 text-left">Kuvaus</th>
              <th className="px-4 py-2 text-right">Summa (€)</th>
              <th className="px-4 py-2 text-left">ALV %</th>
              <th className="px-4 py-2 text-left">Maksutapa</th>
              <th className="px-4 py-2 text-left">Tosite</th>
            </tr>
          </thead>

          <tbody>
            {events.map((ev, i) => (
              <tr
                key={ev.id}
                className={`border-t border-yellow-700/20 ${
                  i % 2 === 0 ? "bg-black/30" : "bg-black/20"
                }`}
              >
                <td className="px-4 py-2">
                  {new Date(ev.date).toLocaleDateString("fi-FI")}
                </td>

                <td className="px-4 py-2 text-yellow-300">
                  {ev.category?.name || "-"}
                </td>

                <td className="px-4 py-2">
                  {ev.type === "Tulo" || ev.type === "tulo" ? "Tulo" : "Meno"}
                </td>

                <td className="px-4 py-2">{ev.description || "-"}</td>

                <td className="px-4 py-2 text-right">
                  {ev.amount.toFixed(2)} €
                </td>

                <td className="px-4 py-2">{ev.vatRate} %</td>

                <td className="px-4 py-2">{ev.paymentMethod || "-"}</td>

                <td className="px-4 py-2">
                  {ev.receipt?.fileUrl ? (
                    <button
                      onClick={() => window.open(ev.receipt!.fileUrl, "_blank")}
                      className="text-yellow-300 hover:text-yellow-400 underline"
                    >
                      Avaa
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE KORTIT */}
      <div className="sm:hidden space-y-3 mt-2">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="bg-black/40 border border-yellow-700/40 rounded-xl p-4 shadow-[0_0_15px_rgba(0,0,0,0.4)]"
          >
            <div className="flex justify-between text-sm">
              <span className="text-yellow-300 font-semibold">
                {new Date(ev.date).toLocaleDateString("fi-FI")}
              </span>
              <span className="text-yellow-400">{ev.category?.name}</span>
              <span className="text-gray-300">
                {ev.type === "Tulo" || ev.type === "tulo" ? "Tulo" : "Meno"}
              </span>
            </div>

            {ev.description && (
              <p className="mt-2 text-gray-300 text-sm">
                <span className="text-yellow-400">Kuvaus: </span>
                {ev.description}
              </p>
            )}

            <p className="text-sm text-gray-300 mt-2">
              <span className="text-yellow-400">Summa: </span>
              {ev.amount.toFixed(2)} €
            </p>

            <p className="text-sm text-gray-300">
              <span className="text-yellow-400">ALV: </span>
              {ev.vatRate} %
            </p>

            <p className="text-sm text-gray-300">
              <span className="text-yellow-400">Maksutapa: </span>
              {ev.paymentMethod || "-"}
            </p>

            <p className="text-sm text-gray-300 mt-2">
              <span className="text-yellow-400">Tosite: </span>
              {ev.receipt?.fileUrl ? (
                <button
                  onClick={() => window.open(ev.receipt!.fileUrl, "_blank")}
                  className="text-yellow-400 underline hover:text-yellow-300"
                >
                  Avaa
                </button>
              ) : (
                "-"
              )}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
