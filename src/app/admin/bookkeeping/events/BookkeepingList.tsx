"use client";

import type { Entry } from "./types/Entry";
import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import ConfirmModal from "@/components/common/ConfirmModal";
import EditEventModal from "./EditEventModal";

export default function BookkeepingList({
  entries = [],
}: {
  entries: Entry[];
}) {
  // ⛔ HUOM: HOOKIT AINA TÄSSÄ ALUSSA
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  async function handleDelete() {
    if (!deleteId) return;

    const res = await fetch("/api/bookkeeping/events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    });

    if (res.ok) {
      window.location.reload();
    } else {
      alert("Virhe poistettaessa tapahtumaa.");
    }

    setShowDeleteModal(false);
    setDeleteId(null);
  }

  // 🟡 Nyt vasta IF, koska kaikki hookit ovat jo määritelty
  if (entries.length === 0) {
    return (
      <p className="text-gray-500 text-center mt-6">
        Ei vielä kirjattuja tapahtumia.
      </p>
    );
  }

  // 🔹 Ryhmittele tapahtumat kuukausittain
  const groups = entries.reduce((acc, entry) => {
    const d = new Date(entry.date);
    const year = d.getFullYear();
    const month = d.toLocaleString("fi-FI", { month: "long" });
    const key = `${month.toUpperCase()} ${year}`;

    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);

    return acc;
  }, {} as Record<string, Entry[]>);

  return (
    <div
      className="
      max-w-4xl mx-auto mt-6 
      lg:bg-black/40 
      lg:border lg:border-yellow-700/40 
      lg:rounded-xl lg:p-6 
      lg:shadow-[0_0_15px_rgba(0,0,0,0.4)]
    "
    >
      {/* 🔹 DESKTOP - TAULUKKO */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm text-gray-300 border-collapse">
          <tbody>
            {Object.entries(groups).map(([monthName, monthEntries]) => (
              <React.Fragment key={monthName}>
                {/* KUUKAUDEN OTSIKKO */}
                <tr>
                  <td
                    colSpan={8}
                    className="py-4 text-center text-yellow-400 font-semibold text-lg"
                  >
                    {monthName}
                  </td>
                </tr>

                {/* SARAKKEIDEN OTSIKOT */}
                <tr className="border-b border-yellow-700/40 text-yellow-400 text-left">
                  <th className="py-2 px-3">Päivämäärä</th>
                  <th className="py-2 px-3">Kontakti</th>
                  <th className="py-2 px-3">Kategoria</th>
                  <th className="py-2 px-3">Tyyppi</th>
                  <th className="py-2 px-3">Kuvaus</th>
                  <th className="py-2 px-3 text-right">Summa €</th>
                  <th className="py-2 px-3 text-right">ALV %</th>
                  <th className="py-2 px-3">Maksutapa</th>
                  <th className="py-2 px-3">Tosite</th>
                </tr>

                {/* KUUKAUDEN RIVIT */}
                {monthEntries.map((entry, index) => (
                  <tr
                    key={entry.id || `temp-${index}`}
                    className="border-b border-gray-800 hover:bg-yellow-700/10 transition"
                  >
                    {/* Päivämäärä */}
                    <td className="py-2 px-3">
                      {new Date(entry.date).toLocaleDateString("fi-FI")}
                    </td>

                    {/* Kontakti */}
                    <td className="py-2 px-3 text-yellow-300 font-medium">
                      {entry.contact ? (
                        <a
                          href={`/admin/bookkeeping/contacts?open=${entry.contact.id}`}
                          className="text-yellow-300 hover:text-yellow-200 underline"
                        >
                          {entry.contact.name}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Kategoria */}
                    <td className="py-2 px-3 text-yellow-300">
                      {entry.category?.name || "-"}
                    </td>

                    {/* Tyyppi */}
                    <td className="py-2 px-3 text-yellow-300">
                      {entry.type === "tulo" ? "Tulo" : "Meno"}
                    </td>

                    {/* Kuvaus */}
                    <td className="py-2 px-3 text-gray-400">
                      {entry.description || "-"}
                    </td>

                    {/* Summa */}
                    <td className="py-2 px-3 text-right">
                      {entry.amount ? Number(entry.amount).toFixed(2) : "-"}
                    </td>

                    {/* ALV % */}
                    <td className="py-2 px-3 text-right">
                      {entry.vatRate != null ? `${entry.vatRate} %` : "-"}
                    </td>

                    {/* Maksutapa */}
                    <td className="py-2 px-3 text-gray-400">
                      {entry.paymentMethod || "-"}
                    </td>

                    {/* Tosite */}
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

                    <td className="py-2 px-3 text-right relative">
                     <button
  onClick={() => setMenuOpen(menuOpen === entry.id ? null : entry.id)}
  className="p-1 hover:bg-yellow-700/20 rounded-md"
>
  <MoreVertical className="text-yellow-400" size={18} />
</button>

{menuOpen === entry.id && (
  <div className="absolute right-0 mt-1 bg-black border border-yellow-700/40 rounded-md shadow-lg z-20">
    <button
      onClick={() => {
        setEditingEntry(entry);
        setMenuOpen(null);
      }}
      className="block w-full text-left px-4 py-2 hover:bg-yellow-700/20 text-gray-200"
    >
      Muokkaa
    </button>

    <button
      onClick={() => {
        setDeleteId(entry.id);
        setShowDeleteModal(true);
        setMenuOpen(null);
      }}
      className="block w-full text-left px-4 py-2 hover:bg-red-700/20 text-red-400"
    >
      Poista
    </button>
  </div>
)}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 MOBIILI - KORTIT */}
      <div className="block lg:hidden space-y-6 mt-6">
        {Object.entries(groups).map(([monthName, monthEntries]) => (
          <div key={monthName}>
            {/* Kuukauden otsikko */}
            <h3 className="text-center text-yellow-400 text-lg font-semibold mb-2">
              {monthName}
            </h3>

            {/* Kortit */}
            <div className="space-y-4">
              {monthEntries.map((entry, index) => (
                <div
                  key={entry.id || `temp-card-${index}`}
                  className="
              bg-black/40 border border-yellow-700/40 rounded-xl 
              p-4 shadow-[0_0_15px_rgba(0,0,0,0.4)]
            "
                >
                  <div className="flex justify-between mb-1">
                    <span className="text-yellow-300 font-semibold">
                      {entry.category?.name}
                    </span>
                    <span className="text-yellow-300">
                      {entry.type === "tulo" ? "Tulo" : "Meno"}
                    </span>
                  </div>

                  <p className="text-gray-300 text-sm">
                    {new Date(entry.date).toLocaleDateString("fi-FI")}
                  </p>
                  {/* Kontakti */}
                  {entry.contact && (
                    <p className="text-yellow-300 text-sm mb-1">
                      <a
                        href={`/admin/bookkeeping/contacts?open=${entry.contact.id}`}
                        className="text-yellow-300 hover:text-yellow-200 underline"
                      >
                        {entry.contact.name}
                      </a>
                    </p>
                  )}

                  {entry.description && (
                    <p className="text-gray-400 text-sm mt-1">
                      {entry.description}
                    </p>
                  )}

                  <p className="text-gray-300 text-sm mt-2">
                    <span className="text-gray-400">Summa: </span>
                    {entry.amount ? entry.amount + " €" : "-"}
                  </p>

                  <p className="text-gray-300 text-sm">
                    <span className="text-gray-400">ALV: </span>
                    {entry.vatRate} %
                  </p>

                  <p className="text-gray-300 text-sm">
                    <span className="text-gray-400">Maksutapa: </span>
                    {entry.paymentMethod || "-"}
                  </p>

                  <p className="text-gray-300 text-sm">
                    <span className="text-gray-400 ">Tosite: </span>
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

                  <div className="flex justify-end mt-3 relative">
                    <button
                      onClick={() =>
                        setMenuOpen(menuOpen === entry.id ? null : entry.id)
                      }
                      className="text-gray-300 hover:text-yellow-300"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {menuOpen === entry.id && (
                      <div
                        className="
        absolute right-0 mt-2 w-36 
        bg-black border border-yellow-700/40 
        rounded-md shadow-lg z-20
      "
                      >
                        <button
                          onClick={() => {
                            setEditingEntry(entry);
                            setMenuOpen(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-yellow-700/10"
                        >
                          Muokkaa
                        </button>

                        <button
                          onClick={() => {
                            setDeleteId(entry.id);
                            setShowDeleteModal(true);
                            setMenuOpen(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-red-400 hover:bg-yellow-700/10"
                        >
                          Poista
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
       </div>

      {/* 🔥 Poiston vahvistus */}
      <ConfirmModal
        show={showDeleteModal}
        message="Haluatko varmasti poistaa tämän tapahtuman?"
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
        }}
      />

      {/* 🔥 Muokkaus-popup (lisätään myöhemmin) */}
      {editingEntry && (
        <EditEventModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSaved={() => window.location.reload()}
        />
      )}

    </div>
  );
}