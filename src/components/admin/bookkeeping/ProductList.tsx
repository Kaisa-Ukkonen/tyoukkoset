"use client";
import { useEffect, useState } from "react";
import ConfirmModal from "@/components/common/ConfirmModal";
import { MoreVertical } from "lucide-react";

type Product = {
  id: number;
  name: string;
  code?: string;
  category: string;
  hours?: number;
  minutes?: number;
  price: number;
  vatRate: number;
  vatIncluded: boolean;
  description?: string;
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

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-black/40 border border-yellow-700/40 rounded-xl p-6 shadow-[0_0_15px_rgba(0,0,0,0.4)] overflow-x-auto">
      <h3 className="text-xl font-semibold text-yellow-400 mb-4 text-center">
        Tallennetut tuotteet
      </h3>

      {/* 🔹 Näytetään ilmoitus jos hakutuloksia ei löytynyt */}
      {filteredProducts.length === 0 ? (
        // 🔸 Näytetään vain viesti jos ei löytynyt mitään
        <p className="text-center text-gray-400 py-6">
          Ei tuotteita haulla {searchTerm}
        </p>
      ) : (
        // 🔸 Muussa tapauksessa näytetään taulukko
        <table className="w-full text-sm text-gray-300 border-collapse">
          <thead>
            <tr className="border-b border-yellow-700/40 text-yellow-400 text-left">
              <th className="py-2 px-3">Nimi</th>
              <th className="py-2 px-3">Tuotekoodi</th>
              <th className="py-2 px-3">Kategoria</th>
              <th className="py-2 px-3">Kesto</th>
              <th className="py-2 px-3 text-right">
                Kokonaishinta (sis.ALV) (€)
              </th>
              <th className="py-2 px-3 text-right">Veroton hinta (€)</th>
              <th className="py-2 px-3 text-right">ALV-osuus (€)</th>
              <th className="py-2 px-3 text-right">ALV-kanta (%)</th>
              <th className="py-2 px-3">Kuvaus</th>
              <th className="py-2 px-3 text-center">Toiminnot</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((p) => (
              <tr
                key={p.id}
                className="border-b border-gray-800 hover:bg-yellow-700/10 transition"
              >
                {editingId === p.id ? (
                  <>
                    {/* Muokkaustila */}
                    <td className="py-2 px-3">
                      <input
                        value={editForm.name || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="bg-transparent border border-yellow-700/40 rounded-md px-2 py-1 w-full text-white"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        value={editForm.code || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, code: e.target.value })
                        }
                        className="bg-transparent border border-yellow-700/40 rounded-md px-2 py-1 w-full text-white"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={editForm.category || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, category: e.target.value })
                        }
                        className="bg-transparent border border-yellow-700/40 rounded-md px-2 py-1 text-white w-full"
                      >
                        <option value="Tatuointi">Tatuointi</option>
                        <option value="Stand Up">Stand Up</option>
                        <option value="Huoltotyö">Huoltotyö</option>
                      </select>
                    </td>

                    <td className="py-2 px-3">
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
                          className="w-14 bg-transparent border border-yellow-700/40 rounded-md px-2 py-1 text-white"
                          placeholder="h"
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
                          className="w-14 bg-transparent border border-yellow-700/40 rounded-md px-2 py-1 text-white"
                          placeholder="min"
                        />
                      </div>
                    </td>

                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        value={editForm.price?.toString() || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            price: parseFloat(e.target.value),
                          })
                        }
                        className="bg-transparent border border-yellow-700/40 rounded-md px-2 py-1 w-24 text-white text-right"
                      />
                    </td>

                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        value={editForm.vatRate?.toString() || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            vatRate: parseFloat(e.target.value),
                          })
                        }
                        className="bg-transparent border border-yellow-700/40 rounded-md px-2 py-1 w-16 text-white text-right"
                      />
                    </td>

                    <td className="py-2 px-3">
                      <input
                        value={editForm.description || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                        className="bg-transparent border border-yellow-700/40 rounded-md px-2 py-1 w-full text-white"
                      />
                    </td>

                    <td className="py-2 px-3 text-center space-x-2">
                      <button
                        onClick={handleUpdate}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-3 py-1 rounded-md transition"
                      >
                        Tallenna
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md transition"
                      >
                        Peruuta
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    {/* Normaalitila */}
                    <td className="py-2 px-3 text-yellow-300 font-medium">
                      {p.name}
                    </td>
                    <td className="py-2 px-3 text-gray-300">{p.code}</td>
                    <td className="py-2 px-3">{p.category}</td>
                    <td className="py-2 px-3 text-gray-300">
                      {p.hours ? `${p.hours}h` : ""}
                      {p.minutes ? ` ${p.minutes}min` : ""}
                    </td>
                    {/* 🔹 Lasketaan hinnat */}
                    {(() => {
                      // 🔹 Lasketaan veroton, vero ja kokonaishinta loogisesti riippuen ALV:n sisältymisestä
                      const veroton = p.vatIncluded
                        ? p.price / (1 + p.vatRate / 100) // jos hinta sisältää ALV:n
                        : p.price; // jos ei sisällä

                      const vero = p.vatIncluded
                        ? p.price - veroton
                        : veroton * (p.vatRate / 100);

                      const kokonaishinta = p.vatIncluded
                        ? p.price // jos hinta sisältää ALV:n
                        : veroton + vero; // jos ei sisällä

                      return (
                        <>
                          <td className="py-2 px-3 text-right">
                            {kokonaishinta.toFixed(2)} €
                          </td>
                          <td className="py-2 px-3 text-right text-gray-300">
                            {veroton.toFixed(3)} €
                          </td>
                          <td className="py-2 px-3 text-right text-gray-300">
                            {vero.toFixed(3)} €
                          </td>
                          <td className="py-2 px-3 text-right">
                            {p.vatRate} %
                          </td>
                        </>
                      );
                    })()}
                    <td className="py-2 px-3 text-gray-400">
                      {p.description || "-"}
                    </td>
                    <td className="py-2 px-3 text-center relative">
  {/* Kolmen pisteen nappi */}
  <button
    onClick={(e) => {
      e.stopPropagation(); // estää valikon sulkeutumisen
      setOpenMenuId(openMenuId === p.id ? null : p.id);
    }}
    className="text-yellow-400 hover:text-yellow-200 transition"
  >
    <MoreVertical className="inline w-5 h-5" />
  </button>

  {/* Pieni valikko */}
  {openMenuId === p.id && (
    <div
      onClick={(e) => e.stopPropagation()} // estää sulkeutumisen kun klikataan valikkoa
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
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
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
