"use client";

import type { Entry } from "./types/Entry";

export default function BookkeepingList({
  entries = [],
}: {
  entries: Entry[];
}) {
  if (entries.length === 0) {
    return (
      <p className="text-gray-500 text-center mt-6">
        Ei vielä kirjattuja tapahtumia.
      </p>
    );
  }

  return (
    <div
      className="
  max-w-4xl mx-auto mt-6 
  sm:bg-black/40 
  sm:border sm:border-yellow-700/40 
  sm:rounded-xl sm:p-6 
  sm:shadow-[0_0_15px_rgba(0,0,0,0.4)]
"
    >
      {/* Otsikko */}
      <h3 className="text-xl font-semibold text-yellow-400 mb-4 text-center">
        Kirjatut tapahtumat
      </h3>

      {/* 🔹 DESKTOP - TAULUKKO */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm text-gray-300 border-collapse">
          <thead>
            <tr className="border-b border-yellow-700/40 text-yellow-400 text-left">
              <th className="py-2 px-3">Päivämäärä</th>
              <th className="py-2 px-3">Kategoria</th>
              <th className="py-2 px-3">Tyyppi</th>
              <th className="py-2 px-3">Kuvaus</th>
              <th className="py-2 px-3 text-right">Summa €</th>
              <th className="py-2 px-3 text-right">ALV %</th>
              <th className="py-2 px-3">Maksutapa</th>
              <th className="py-2 px-3">Tosite</th>
            </tr>
          </thead>

          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={entry.id || `temp-${index}`}
                className="border-b border-gray-800 hover:bg-yellow-700/10 transition"
              >
                <td className="py-2 px-3">
                  {entry.date
                    ? new Date(entry.date).toLocaleDateString("fi-FI")
                    : "-"}
                </td>

                <td className="py-2 px-3 text-yellow-300 font-medium">
                  {entry.category?.name || "-"}
                </td>

                <td className="py-2 px-3 text-yellow-300">
                  {entry.type === "tulo" ? "Tulo" : "Meno"}
                </td>

                <td className="py-2 px-3 text-gray-400">
                  {entry.description || "-"}
                </td>

                <td className="py-2 px-3 text-right">
                  {entry.amount ? Number(entry.amount).toFixed(2) : "-"}
                </td>

                <td className="py-2 px-3 text-right">
                  {entry.vatRate != null ? `${entry.vatRate} %` : "-"}
                </td>

                <td className="py-2 px-3 text-gray-400">
                  {entry.paymentMethod || "-"}
                </td>

                <td className="py-2 px-3">
                  {entry.receipt?.fileUrl ? (
                    <a
                      href={entry.receipt.fileUrl}
                      target="_blank"
                      className="text-yellow-300 hover:text-yellow-200 underline"
                    >
                      Avaa
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 MOBIILI - KORTIT */}
      <div className="block sm:hidden space-y-4 mt-6">
        {entries.map((entry, index) => (
          <div
            key={entry.id || `temp-card-${index}`}
            className="
              bg-black/40 border border-yellow-700/40 rounded-xl 
              p-4 shadow-[0_0_15px_rgba(0,0,0,0.4)]
            "
          >
            {/* Ylärivi */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-yellow-300 font-semibold">
                {entry.category?.name || "-"}
              </span>
              <span className="text-yellow-300">
                {entry.type === "tulo" ? "Tulo" : "Meno"}
              </span>
            </div>

            {/* Päivämäärä */}
            <p className="text-gray-300 text-sm">
              {entry.date
                ? new Date(entry.date).toLocaleDateString("fi-FI")
                : "-"}
            </p>

            {/* Kuvaus */}
            {entry.description && (
              <p className="text-gray-400 text-sm mt-1">{entry.description}</p>
            )}

            {/* Summa */}
            <p className="text-gray-300 text-sm mt-2">
              <span className="text-gray-400">Summa: </span>
              {entry.amount ? Number(entry.amount).toFixed(2) + " €" : "-"}
            </p>

            {/* ALV */}
            <p className="text-gray-300 text-sm">
              <span className="text-gray-400">ALV: </span>
              {entry.vatRate != null ? entry.vatRate + " %" : "-"}
            </p>

            {/* Maksutapa */}
            <p className="text-gray-300 text-sm">
              <span className="text-gray-400">Maksutapa: </span>
              {entry.paymentMethod || "-"}
            </p>

            {/* Tosite-linkki */}
            <p className="text-gray-300 text-sm">
              <span className="text-gray-400">Tosite: </span>
              {entry.receipt?.fileUrl ? (
                <a
                  href={entry.receipt.fileUrl}
                  target="_blank"
                  className="text-yellow-300 underline hover:text-yellow-200"
                >
                  Avaa
                </a>
              ) : (
                "-"
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
