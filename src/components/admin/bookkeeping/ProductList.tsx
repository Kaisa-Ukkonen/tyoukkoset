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
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
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
    setEditingCategory(product.category);
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
  const renderTable = (list: Product[], showStock: boolean) => (
    <table className="w-full text-sm text-gray-300 border-collapse mb-8">
      <thead>
        {showStock ? (
          // 🔸 TUOTTEET (varastotiedot)
          <tr className="border-b border-yellow-700/40 text-yellow-400 text-left">
            <th className="py-2 px-3">Nimi</th>
            <th className="py-2 px-3">Tuotekoodi</th>
            <th className="py-2 px-3 text-right">Varastosaldo</th>
            <th className="py-2 px-3 text-right">
              Kappalehinta <br />
              <span className="text-xs ">(sis. ALV)</span>
            </th>
            <th className="py-2 px-3 text-right">Veroton hinta</th>
            <th className="py-2 px-3 text-right">ALV-osuus (25.5%)</th>
            <th className="py-2 px-3 text-right text-yellow-400">
              Varaston arvo (€)
            </th>
            <th className="py-2 px-3 text-center">Toiminnot</th>
          </tr>
        ) : (
          // 🔸 PALVELUT (vanha näkymä säilyy)
          <tr className="border-b border-yellow-700/40 text-yellow-400 text-left">
            <th className="py-2 px-3">Nimi</th>
            <th className="py-2 px-3">Tuotekoodi</th>
            <th className="py-2 px-3">Kesto</th>
            <th className="py-2 px-3 text-right">
              Kokonaishinta <br />
              <span className="text-xs">(sis. ALV)</span>
            </th>
            <th className="py-2 px-3 text-right">Veroton hinta (€)</th>
            <th className="py-2 px-3 text-right">ALV-osuus (€)</th>
            <th className="py-2 px-3 text-right">ALV-kanta (%)</th>
            <th className="py-2 px-3">Kuvaus</th>
            <th className="py-2 px-3 text-center">Toiminnot</th>
          </tr>
        )}
      </thead>

      <tbody>
        {list.map((p) => {
          // 🔹 Lasketaan yhteiset arvot
          const veroton = p.vatIncluded
            ? p.price / (1 + p.vatRate / 100)
            : p.price;
          const vero = p.vatIncluded
            ? p.price - veroton
            : veroton * (p.vatRate / 100);
          const kokonaishinta = p.vatIncluded ? p.price : veroton + vero;
          const varastonArvo = showStock ? (p.quantity || 0) * p.price : 0;

          return (
            <React.Fragment key={p.id}>
              <tr className="border-b border-gray-800 hover:bg-yellow-700/10 transition">
                {/* --- Nimi ja tuotekoodi --- */}
                <td className="py-2 px-3 text-yellow-300 font-medium">
                  {p.name}
                </td>
                <td className="py-2 px-3 text-gray-300">{p.code}</td>

                {/* --- Palvelu: kesto --- */}
                {!showStock && (
                  <td className="py-2 px-3 text-gray-300">
                    {p.hours ? `${p.hours}h` : ""}
                    {p.minutes ? ` ${p.minutes}min` : ""}
                  </td>
                )}

                {/* --- Tuote: varastosaldo --- */}
                {showStock && (
                  <td className="py-2 px-3 text-right text-gray-300">
                    {p.quantity ?? 0}{" "}
                    <span className="text-gray-400 text-sm">kpl</span>
                  </td>
                )}

                {/* --- Hinnat --- */}
                <td className="py-2 px-3 text-right">
                  {kokonaishinta.toFixed(2)} €
                </td>
                <td className="py-2 px-3 text-right text-gray-300">
                  {veroton.toFixed(3)} €
                </td>
                <td className="py-2 px-3 text-right text-gray-300">
                  {vero.toFixed(3)} €
                </td>

                {/* --- Palvelu: ALV-kanta ja kuvaus --- */}
                {!showStock && (
                  <>
                    <td className="py-2 px-3 text-right">{p.vatRate} %</td>
                    <td className="py-2 px-3 text-gray-400">
                      {p.description || "-"}
                    </td>
                  </>
                )}

                {/* --- Tuote: Varaston arvo --- */}
                {showStock && (
                  <td className="py-2 px-3 text-right text-yellow-400 font-semibold">
                    {varastonArvo.toFixed(2)} €
                  </td>
                )}

                {/* --- Toiminnot (kolmen pisteen valikko) --- */}
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
              {editingId === p.id && editingCategory === p.category && (
                <tr className="bg-black/60 border-t border-yellow-800/30">
                  <td colSpan={showStock ? 9 : 8} className="p-4">
                    <form
                      onSubmit={handleUpdate}
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm"
                    >
                      {/* 🔹 Otsikko */}
                      <div className="col-span-full border-b border-yellow-700/30 pb-2 mb-2">
                        <h4 className="text-yellow-400 font-semibold text-center">
                          {showStock ? "Muokkaa tuotetta" : "Muokkaa palvelua"}
                        </h4>
                      </div>

                      {/* 🔸 Nimi */}
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">
                          Nimi
                        </label>
                        <input
                          type="text"
                          value={editForm.name || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          placeholder="Tuotteen tai palvelun nimi"
                          className="w-full bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                        />
                      </div>

                      {/* 🔸 Tuotekoodi */}
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">
                          Tuotekoodi
                        </label>
                        <input
                          type="text"
                          value={editForm.code || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, code: e.target.value })
                          }
                          placeholder="Koodi"
                          className="w-full bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                        />
                      </div>

                      {/* 🔸 Palvelu: kesto (tunnit/minuutit) */}
                      {!showStock && (
                        <div className="flex gap-2 col-span-full">
                          <div className="w-1/2">
                            <label className="block text-gray-400 text-xs mb-1">
                              Tunnit
                            </label>
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
                              className="w-full bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white focus:border-yellow-400"
                            />
                          </div>
                          <div className="w-1/2">
                            <label className="block text-gray-400 text-xs mb-1">
                              Minuutit
                            </label>
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
                              className="w-full bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white focus:border-yellow-400"
                            />
                          </div>
                        </div>
                      )}

                      {/* 🔸 Tuote: varasto */}
                      {showStock && (
                        <div>
                          <label className="block text-gray-400 text-xs mb-1">
                            Varastosaldo (kpl)
                          </label>
                          <input
                            type="number"
                            value={editForm.quantity?.toString() || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                quantity: parseInt(e.target.value) || 0,
                              })
                            }
                            placeholder="Varasto"
                            className="w-full bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white focus:border-yellow-400"
                          />
                        </div>
                      )}

                      {/* 🔸 Hinta */}
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">
                          Kokonaishinta sis. ALV (€)
                        </label>
                        <input
                          type="number"
                          value={editForm.price?.toString() || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="Hinta"
                          className="w-full bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white focus:border-yellow-400"
                        />
                      </div>

                      {/* 🔸 ALV */}
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">
                          ALV-kanta (%)
                        </label>
                        <input
                          type="number"
                          value={editForm.vatRate?.toString() || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              vatRate: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="25.5"
                          className="w-full bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white focus:border-yellow-400"
                        />
                      </div>

                      {/* 🔸 Kuvaus vain palveluille */}
                      {!showStock && (
                        <div className="col-span-full">
                          <label className="block text-gray-400 text-xs mb-1">
                            Kuvaus
                          </label>
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
                            className="w-full bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white focus:border-yellow-400"
                          />
                        </div>
                      )}

                      {/* 🔹 Napit */}
                      <div className="col-span-full flex justify-center gap-3 mt-3">
                        <button
                          type="submit"
                          className="bg-yellow-600 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-md transition"
                        >
                          Tallenna
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditingCategory(null);
                          }}
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

      {/* 🔹 Varaston kokonaisarvo yhteenveto */}
      {showStock && list.length > 0 && (
        <tfoot>
          <tr className="border-t border-yellow-700/40 bg-black/50">
            <td
              colSpan={6}
              className="py-3 px-4 text-right text-gray-300 font-semibold"
            >
              Varaston kokonaisarvo:
            </td>
            <td className="py-3 px-4 text-right text-yellow-400 font-bold">
              {list
                .reduce((sum, p) => sum + p.price * (p.quantity || 0), 0)
                .toFixed(2)}{" "}
              €
            </td>
            <td></td>
          </tr>
        </tfoot>
      )}
    </table>
  );

  // 🔹 Varsinainen renderöinti
  return (
    <div className="max-w-4xl mx-auto mt-6 bg-black/40 border border-yellow-700/40 rounded-xl p-6 shadow-[0_0_15px_rgba(0,0,0,0.4)] overflow-x-auto">


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
