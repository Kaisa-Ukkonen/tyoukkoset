"use client";
import { useEffect, useState } from "react";
import ConfirmModal from "@/components/common/ConfirmModal";
import { MoreVertical } from "lucide-react";
import React from "react";

type Product = {
  id: number;
  name: string;
  code?: string;
  category: string; // "Palvelu" tai "Tuote"
  hours?: number;
  minutes?: number;
  price: number;
  vatRate: number;
  vatIncluded: boolean;
  description?: string;
  quantity?: number; // 🔹 Varastosaldo (vain tuotteille)
};

export default function ProductList({
  refreshKey,
  searchTerm = "",
}: {
  refreshKey: number;
  searchTerm?: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // 🔹 Hae tuotteet
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/bookkeeping/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Virhe tuotteiden haussa:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/bookkeeping/products");
        const data = await res.json();
        if (isMounted) setProducts(data);
      } catch (err) {
        console.error("Virhe tuotteiden haussa:", err);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  // 🔹 Poista tuote
  const confirmDelete = async () => {
    if (deleteId === null) return;
    const res = await fetch("/api/bookkeeping/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    });
    if (res.ok) {
      setDeleteId(null);
      fetchProducts();
    }
  };

  // 🔹 Avaa muokkaus
  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm(product);
  };

  // 🔹 Tallenna muokattu tuote
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/bookkeeping/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    if (res.ok) {
      setEditingId(null);
      fetchProducts();
    }
  };

  // 🔍 Suodata tuotteet hakusanan perusteella
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔹 Jaotellaan kahteen kategoriaan
  const services = filteredProducts.filter((p) => p.category === "Palvelu");
  const items = filteredProducts.filter((p) => p.category === "Tuote");

  // 🔹 Apufunktio joka piirtää yhden listan (palvelut/tuotteet)
  // 🔹 Apufunktio joka piirtää yhden listan (palvelut/tuotteet)
  const renderTable = (list: Product[], showStock: boolean) => (
    <table className="w-full text-sm text-gray-300 border-collapse mb-8">
      <thead>
        <tr className="border-b border-yellow-700/40 text-yellow-400 text-left">
          <th className="py-2 px-3">Nimi</th>
          <th className="py-2 px-3">Tuotekoodi</th>
          {/* Näytetään kesto vain palveluissa */}
          {!showStock && <th className="py-2 px-3">Kesto</th>}
          {showStock && <th className="py-2 px-3 text-right">Varasto (kpl)</th>}
          <th className="py-2 px-3 text-right">
            Kokonaishinta <br />
            <span className="text-xs text-gray-400">(sis.ALV)</span>
          </th>
          <th className="py-2 px-3 text-right">Veroton hinta (€)</th>
          <th className="py-2 px-3 text-right">ALV-osuus (€)</th>
          <th className="py-2 px-3 text-right">ALV-kanta (%)</th>
          <th className="py-2 px-3">Kuvaus</th>
          <th className="py-2 px-3 text-center">Toiminnot</th>
        </tr>
      </thead>

      <tbody>
        {list.map((p) => {
          const veroton = p.vatIncluded
            ? p.price / (1 + p.vatRate / 100)
            : p.price;
          const vero = p.vatIncluded
            ? p.price - veroton
            : veroton * (p.vatRate / 100);
          const kokonaishinta = p.vatIncluded ? p.price : veroton + vero;

          return (
            <React.Fragment key={p.id}>
              <tr className="border-b border-gray-800 hover:bg-yellow-700/10 transition">
                <td className="py-2 px-3 text-yellow-300 font-medium">
                  {p.name}
                </td>
                <td className="py-2 px-3 text-gray-300">{p.code}</td>

                {/* Näytetään kesto vain palveluissa */}
                {!showStock && (
                  <td className="py-2 px-3 text-gray-300">
                    {p.hours ? `${p.hours}h` : ""}
                    {p.minutes ? ` ${p.minutes}min` : ""}
                  </td>
                )}

                {/* Varasto vain tuotteille */}
                {showStock && (
                  <td className="py-2 px-3 text-right text-gray-300">
                    {p.quantity ?? 0}
                  </td>
                )}

                {/* Hinnat */}
                <td className="py-2 px-3 text-right">
                  {kokonaishinta.toFixed(2)} €
                </td>
                <td className="py-2 px-3 text-right text-gray-300">
                  {veroton.toFixed(3)} €
                </td>
                <td className="py-2 px-3 text-right text-gray-300">
                  {vero.toFixed(3)} €
                </td>
                <td className="py-2 px-3 text-right">{p.vatRate} %</td>
                <td className="py-2 px-3 text-gray-400">
                  {p.description || "-"}
                </td>

                {/* Kolmen pisteen valikko */}
                <td className="py-2 px-3 text-center relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === p.id ? null : p.id);
                    }}
                    className="text-yellow-400 hover:text-yellow-200 transition"
                  >
                    <MoreVertical className="inline w-5 h-5" />
                  </button>

                  {openMenuId === p.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 mt-2 bg-black border border-yellow-700/40 rounded-md shadow-lg z-10 w-28"
                    >
                      <button
                        onClick={() => {
                          handleEdit(p);
                          setOpenMenuId(null);
                        }}
                        className="block w-full text-left px-3 py-1 text-sm text-yellow-300 hover:bg-yellow-700/20"
                      >
                        Muokkaa
                      </button>
                      <button
                        onClick={() => {
                          setDeleteId(p.id);
                          setOpenMenuId(null);
                        }}
                        className="block w-full text-left px-3 py-1 text-sm text-red-400 hover:bg-red-700/20"
                      >
                        Poista
                      </button>
                    </div>
                  )}
                </td>
              </tr>

              {/* 🔹 Muokkauslomake rivin alla */}
              {editingId === p.id && (
                <tr
                  key={`${p.id}-edit`}
                  className="bg-black/60 border-t border-yellow-800/30"
                >
                  <td colSpan={showStock ? 10 : 9} className="p-4">
                    <form
                      onSubmit={handleUpdate}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm"
                    >
                      <input
                        type="text"
                        value={editForm.name || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        placeholder="Nimi"
                        className="bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white"
                      />

                      <input
                        type="text"
                        value={editForm.code || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, code: e.target.value })
                        }
                        placeholder="Tuotekoodi"
                        className="bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white"
                      />

                      {/* Näytetään tunti/minuuttikentät vain palveluilla */}
                      {!showStock && (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={editForm.hours?.toString() || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                hours: parseInt(e.target.value) || 0,
                              })
                            }
                            placeholder="h"
                            className="w-16 bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white"
                          />
                          <input
                            type="number"
                            value={editForm.minutes?.toString() || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                minutes: parseInt(e.target.value) || 0,
                              })
                            }
                            placeholder="min"
                            className="w-16 bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white"
                          />
                        </div>
                      )}

                      {/* Varasto vain tuotteilla */}
                      {showStock && (
                        <input
                          type="number"
                          value={editForm.quantity?.toString() || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              quantity: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="Varasto (kpl)"
                          className="bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white"
                        />
                      )}

                      <input
                        type="number"
                        value={editForm.price?.toString() || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            price: parseFloat(e.target.value),
                          })
                        }
                        placeholder="Hinta (€)"
                        className="bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white"
                      />

                      <input
                        type="number"
                        value={editForm.vatRate?.toString() || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            vatRate: parseFloat(e.target.value),
                          })
                        }
                        placeholder="ALV (%)"
                        className="bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white"
                      />

                      <input
                        type="text"
                        value={editForm.description || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Kuvaus"
                        className="col-span-full bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white"
                      />

                      <div className="col-span-full flex gap-3">
                        <button
                          type="submit"
                          className="bg-yellow-600 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-md transition"
                        >
                          Tallenna
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-md transition"
                        >
                          Peruuta
                        </button>
                      </div>
                    </form>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );

  // 🔹 Varsinainen renderöinti
  return (
    <div className="max-w-6xl mx-auto mt-10 bg-black/40 border border-yellow-700/40 rounded-xl p-6 shadow-[0_0_15px_rgba(0,0,0,0.4)] overflow-x-auto">
      <h3 className="text-xl font-semibold text-yellow-400 mb-4 text-center">
        Tallennetut tuotteet
      </h3>

      {/* PALVELUT */}
      <h3 className="text-yellow-400 text-lg mt-6 mb-2">Palvelut</h3>
      {services.length === 0 ? (
        <p className="text-gray-500 italic mb-6">Ei palveluja lisätty.</p>
      ) : (
        renderTable(services, false)
      )}

      {/* TUOTTEET */}
      <h3 className="text-yellow-400 text-lg mt-8 mb-2">Tuotteet</h3>
      {items.length === 0 ? (
        <p className="text-gray-500 italic">Ei tuotteita lisätty.</p>
      ) : (
        renderTable(items, true)
      )}

      <ConfirmModal
        show={deleteId !== null}
        message="Haluatko varmasti poistaa tämän tuotteen?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
