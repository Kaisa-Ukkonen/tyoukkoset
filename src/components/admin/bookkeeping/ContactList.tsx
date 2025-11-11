"use client";
import { useEffect, useState } from "react";
import React from "react";
import ConfirmModal from "@/components/common/ConfirmModal";

import { Edit, Trash2 } from "lucide-react";
import CustomInputField from "@/components/common/CustomInputField";

type Contact = {
  id: number;
  name: string;
  type: string;
  customerCode?: string;
  enableBilling?: boolean;
  notes?: string;
  altNames?: string;
  email?: string | null;
  address?: string | null;
  zip?: string | null;
  city?: string | null;
};

export default function ContactList({
  refreshKey,
  searchTerm,
}: {
  refreshKey: number;
  searchTerm: string;
}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [tab, setTab] = useState<"info" | "events">("info");
  const [showConfirm, setShowConfirm] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Contact | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch("/api/bookkeeping/contacts");
        const data = await res.json();
        setContacts(data);
      } catch (err) {
        console.error("Virhe kontaktien haussa:", err);
      }
    };
    fetchContacts();
  }, [refreshKey]);

  const filtered = contacts.filter((c) => {
    const term = searchTerm.toLowerCase();

    // 🔹 Ehdot
    const matchesName = c.name.toLowerCase().includes(term);
    const matchesType =
      term === "yritys"
        ? c.type === "Yritys"
        : term === "yksityishenkilö"
        ? c.type === "Yksityishenkilö"
        : c.type.toLowerCase().includes(term);

    // 🔹 Näytä, jos osuu joko nimeen TAI tyyppiin
    return matchesName || matchesType;
  });

  const handleDeleteContact = async () => {
    if (!contactToDelete) return;

    try {
      const res = await fetch(`/api/bookkeeping/contacts`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: contactToDelete }),
      });

      if (res.ok) {
        setContacts((prev) => prev.filter((c) => c.id !== contactToDelete));
        setExpandedId(null);
      } else {
        alert("Virhe poistettaessa kontaktia.");
      }
    } catch (error) {
      console.error(error);
      alert("Virhe yhteydessä palvelimeen.");
    } finally {
      setShowConfirm(false);
      setContactToDelete(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-black/40 border border-yellow-700/40 rounded-xl p-6 shadow-[0_0_15px_rgba(0,0,0,0.4)] overflow-x-auto">
      
      {filtered.length === 0 ? (
        <p className="text-gray-400 italic">Ei kontakteja haulla.</p>
      ) : (
        <table className="w-full text-sm text-gray-300 border-collapse">
          <thead>
            <tr className="border-b border-yellow-700/40 text-yellow-400 text-left">
              <th className="py-2 px-3">Nimi</th>
              <th className="py-2 px-3">Tyyppi</th>
              <th className="py-2 px-3">Asiakastunnus / Y-tunnus</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <React.Fragment key={c.id}>
                <tr
                  className="border-b border-gray-800 hover:bg-yellow-700/10 transition cursor-pointer"
                  onClick={() =>
                    setExpandedId(expandedId === c.id ? null : c.id)
                  }
                >
                  <td className="py-2 px-3 text-yellow-300 hover:text-yellow-400 underline">
                    {c.name}
                  </td>
                  <td className="py-2 px-3">{c.type}</td>
                  <td className="py-2 px-3">{c.customerCode || "-"}</td>
                </tr>

                {/* 🔹 Laajennettu tietonäkymä */}
                {expandedId === c.id && (
                  <tr className="bg-black/60 border-b border-yellow-700/20">
                    <td colSpan={4} className="p-4">
                      <div className="space-y-4">
                        {/* Välilehdet */}
                        <div className="flex space-x-4 border-b border-yellow-700/40 pb-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTab("info");
                            }}
                            className={`px-3 py-1 rounded-t-md ${
                              tab === "info"
                                ? "bg-yellow-600 text-black font-semibold"
                                : "text-yellow-400 hover:text-yellow-200"
                            }`}
                          >
                            Tiedot
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTab("events");
                            }}
                            className={`px-3 py-1 rounded-t-md ${
                              tab === "events"
                                ? "bg-yellow-600 text-black font-semibold"
                                : "text-yellow-400 hover:text-yellow-200"
                            }`}
                          >
                            Tapahtumat
                          </button>

                          <div className="flex items-center ml-auto gap-2">
                            {/* ✏️ Muokkaa */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(c.id);
                                setEditForm(c);
                              }}
                              className="text-yellow-400 hover:text-yellow-300 transition-colors"
                              title="Muokkaa kontaktia"
                            >
                              <Edit size={18} />
                            </button>

                            {/* 🗑️ Poista */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setContactToDelete(c.id);
                                setShowConfirm(true);
                              }}
                              className="text-red-500 hover:text-red-400 transition-colors"
                              title="Poista kontakti"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedId(null);
                            }}
                            className="ml-auto text-gray-400 hover:text-red-400 text-sm"
                          >
                            Sulje ✕
                          </button>
                        </div>

                        {/* Näytettävä sisältö */}
                        {tab === "info" ? (
                          <div className="space-y-1 text-gray-300">
                            {/* 🔹 Näytä kontaktin nimi isommalla otsikkona */}
                            <h3 className="text-yellow-400 text-lg font-semibold mb-2">
                              {c.name}
                            </h3>

                            <p>
                              <span className="text-yellow-400">Tyyppi:</span>{" "}
                              {c.type}
                            </p>
                            <p>
                              <span className="text-yellow-400">
                                {c.type === "Yritys"
                                  ? "Y-tunnus:"
                                  : "Asiakastunnus:"}
                              </span>{" "}
                              {c.customerCode || "-"}
                            </p>

                            {/* ✅ Uudet kentät */}
                            {c.email && (
                              <p>
                                <span className="text-yellow-400">
                                  Sähköposti:
                                </span>{" "}
                                {c.email}
                              </p>
                            )}
                            {c.address && (
                              <p>
                                <span className="text-yellow-400">Osoite:</span>{" "}
                                {c.address}
                              </p>
                            )}
                            {(c.zip || c.city) && (
                              <p>
                                <span className="text-yellow-400">
                                  Postiosoite:
                                </span>{" "}
                                {c.zip || ""} {c.city || ""}
                              </p>
                            )}
                            <p>
                              <span className="text-yellow-400">
                                Muistiinpanot:
                              </span>{" "}
                              {c.notes || "-"}
                            </p>

                            {editingId === c.id && editForm && (
                              <div className="mt-4 bg-black/40 border border-yellow-700/40 rounded-xl p-4 space-y-3">
                                <h3 className="text-yellow-400 font-semibold text-lg text-center">
                                  Muokkaa kontaktia
                                </h3>

                                <CustomInputField
                                  id="name"
                                  label="Nimi"
                                  value={editForm.name}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      name: e.target.value,
                                    })
                                  }
                                />
                                <CustomInputField
                                  id="email"
                                  label="Sähköposti"
                                  value={editForm.email ?? ""}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      email: e.target.value,
                                    })
                                  }
                                />
                                <CustomInputField
                                  id="address"
                                  label="Osoite"
                                  value={editForm.address ?? ""}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      address: e.target.value,
                                    })
                                  }
                                />
                                <CustomInputField
                                  id="zip"
                                  label="Postinumero"
                                  value={editForm.zip ?? ""}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      zip: e.target.value,
                                    })
                                  }
                                />
                                <CustomInputField
                                  id="city"
                                  label="Kaupunki"
                                  value={editForm.city ?? ""}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      city: e.target.value,
                                    })
                                  }
                                />
                                <CustomInputField
                                  id="notes"
                                  label="Muistiinpanot"
                                  value={editForm.notes ?? ""}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      notes: e.target.value,
                                    })
                                  }
                                />

                                <div className="flex justify-center gap-4 mt-4">
                                  <button
                                    onClick={async () => {
                                      const res = await fetch(
                                        `/api/bookkeeping/contacts/${editForm.id}`,
                                        {
                                          method: "PUT",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify(editForm),
                                        }
                                      );
                                      if (res.ok) {
                                        setEditingId(null);
                                        setEditForm(null);
                                        setContacts((prev) =>
                                          prev.map((item) =>
                                            item.id === editForm.id
                                              ? { ...editForm }
                                              : item
                                          )
                                        );
                                      }
                                    }}
                                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2 rounded-md transition"
                                  >
                                    Tallenna muutokset
                                  </button>

                                  <button
                                    onClick={() => {
                                      setEditingId(null);
                                      setEditForm(null);
                                    }}
                                    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-md transition"
                                  >
                                    Peruuta
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400 italic">
                            Ei tapahtumia vielä tälle kontaktille.
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
      {/* 🔹 Siirrä tämä TÄNNE, taulukon ulkopuolelle */}
      <ConfirmModal
        show={showConfirm}
        message="Haluatko varmasti poistaa tämän kontaktin?"
        onConfirm={handleDeleteContact}
        onCancel={() => {
          setShowConfirm(false);
          setContactToDelete(null);
        }}
      />
    </div>
  );
}
