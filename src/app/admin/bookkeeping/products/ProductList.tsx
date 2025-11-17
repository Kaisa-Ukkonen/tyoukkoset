"use client";
import { useEffect, useState } from "react";
import ConfirmModal from "@/components/common/ConfirmModal";
import CustomSelect from "@/components/common/CustomSelect";
import CustomInputField from "@/components/common/CustomInputField";
import { MoreVertical } from "lucide-react";
import React from "react";

export type Product = {
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
  quantity?: number;
  vatHandling: string; // 🔹 Varastosaldo (vain tuotteille)
};

export default function ProductList({
  refreshKey,
  searchTerm = "",
  setShowForm,
  setEditingProduct,
}: {
  refreshKey: number;
  searchTerm?: string;
  setShowForm?: (v: boolean) => void;
  setEditingProduct?: (product: Product | null) => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  type EditableProduct = Omit<Product, "price"> & { price: string | number };
  const [editForm, setEditForm] = useState<Partial<EditableProduct>>({});
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

    const payload = {
      ...editForm,
      price: editForm.price === "" ? 0 : parseFloat(editForm.price as string),
      quantity: Number(editForm.quantity),
      vatRate: Number(editForm.vatRate),
      hours: Number(editForm.hours),
      minutes: Number(editForm.minutes),
    };

    const res = await fetch("/api/bookkeeping/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

        <table className="w-full text-sm text-gray-300 border-collapse">
      <thead>
        {showStock ? (
          // 🔸 TUOTTEET (varastotiedot)
          <tr className="border-b border-yellow-700/40 text-yellow-400 text-left">
            <th className="py-2 px-3">Nimi</th>
            <th className="py-2 px-3">Tuotekoodi</th>
            <th className="py-2 px-3 text-right">Saldo</th>
            <th className="py-2 px-3 text-right">
              Kappalehinta <br />
              <span className="text-xs ">(sis. ALV)</span>
            </th>
            <th className="py-2 px-3 text-right">Veroton hinta</th>
            <th className="py-2 px-3 text-right">ALV-osuus</th>
            <th className="py-2 px-3">ALV-käsittely</th>
            <th className="py-2 px-3 text-right">ALV-kanta</th>
            <th className="py-2 px-3 text-right text-yellow-400">
              Varaston arvo
            </th>
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
            <th className="py-2 px-3 text-right">Veroton hinta</th>
            <th className="py-2 px-3 text-right">ALV-osuus</th>
            <th className="py-2 px-3">ALV-käsittely</th>
            <th className="py-2 px-3 text-right">ALV-kanta</th>
            <th className="py-2 px-3">Kuvaus</th>
          </tr>
        )}
      </thead>

      <tbody>
        {list.map((p) => {
          const isVerollinen = p.vatHandling === "Kotimaan verollinen myynti";

          const veroton = isVerollinen
            ? p.price / (1 + p.vatRate / 100)
            : p.price;

          const vero = isVerollinen ? p.price - veroton : 0;
          const kokonaishinta = p.vatIncluded ? p.price : veroton + vero;
          const varastonArvo = showStock ? (p.quantity || 0) * p.price : 0;

          return (
            <React.Fragment key={p.id}>
              <tr className="border-b border-gray-800 hover:bg-yellow-700/10 transition">
                {/* --- Nimi --- */}
                <td className="py-2 px-3 text-yellow-300 font-medium">
                  {p.name}
                </td>

                {/* --- Tuotekoodi --- */}
                <td className="py-2 px-3 text-gray-300">{p.code}</td>

                {/* --- Palvelun kesto (vain palvelut) --- */}
                {!showStock && (
                  <td className="py-2 px-3 text-gray-300">
                    {p.hours ? `${p.hours}h` : ""}
                    {p.minutes ? ` ${p.minutes}min` : ""}
                  </td>
                )}

                {/* --- Tuotteen saldo (vain tuotteet) --- */}
                {showStock && (
                  <td className="py-2 px-3 text-right text-gray-300">
                    {p.quantity ?? 0}{" "}
                    <span className="text-gray-400 text-sm">kpl</span>
                  </td>
                )}

                {/* --- Kappalehinta / Kokonaishinta --- */}
                <td className="py-2 px-3 text-right">
                  {kokonaishinta.toFixed(2)} €
                </td>

                {/* --- Veroton hinta --- */}
                <td className="py-2 px-3 text-right text-gray-300">
                  {veroton.toFixed(3)} €
                </td>

                {/* --- ALV-osuus --- */}
                <td className="py-2 px-3 text-right text-gray-300">
                  {vero.toFixed(3)} €
                </td>

                {/* --- ALV-käsittely --- */}
                <td className="py-2 px-3 text-gray-300">{p.vatHandling}</td>

                {/* --- ALV-kanta (%) --- */}
                <td className="py-2 px-3 text-right text-gray-300">
                  {p.vatRate} %
                </td>

                {/* --- Varaston arvo (vain tuotteet) --- */}
                {showStock && (
                  <td className="py-2 px-3 text-right text-yellow-400 font-semibold">
                    {varastonArvo.toFixed(2)} €
                  </td>
                )}

                {/* --- Kuvaus (vain palvelut) --- */}
                {!showStock && (
                  <td className="py-2 px-3 text-gray-400">
                    {p.description || "-"}
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
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdate(e);
                      }}
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm"
                    >
                      {/* ---------------- Otsikko ---------------- */}
                      <div className="col-span-full border-b border-yellow-700/30 pb-2 mb-2">
                        <h4 className="text-yellow-400 font-semibold text-center">
                          {showStock ? "Muokkaa tuotetta" : "Muokkaa palvelua"}
                        </h4>
                      </div>

                      {/* ---------------- Nimi ---------------- */}
                      <CustomInputField
                        id="edit-name"
                        label="Nimi"
                        value={editForm.name || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                      />

                      {/* ---------------- Tuotekoodi ---------------- */}
                      <CustomInputField
                        id="edit-code"
                        label="Tuotekoodi"
                        value={editForm.code || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, code: e.target.value })
                        }
                      />

                      {/* ---------------- Palvelu: Kesto ---------------- */}
                      {!showStock && (
                        <div className="col-span-full flex gap-3">
                          <CustomInputField
                            id="edit-hours"
                            type="number"
                            label="Tunnit"
                            value={editForm.hours?.toString() || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                hours: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                          <CustomInputField
                            id="edit-minutes"
                            type="number"
                            label="Minuutit"
                            value={editForm.minutes?.toString() || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                minutes: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      )}

                      {/* ---------------- Tuote: Varasto ---------------- */}
                      {showStock && (
                        <CustomInputField
                          id="edit-quantity"
                          type="number"
                          label="Varastosaldo (kpl)"
                          value={editForm.quantity?.toString() || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              quantity: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      )}

                      {/* ---------------- Hinta (2 desimaalia, pilkku sallittu) ---------------- */}
                      <CustomInputField
                        id="edit-price"
                        label="Kokonaishinta (€)"
                        type="text"
                        value={String(editForm.price ?? "")}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "")
                            return setEditForm({ ...editForm, price: "" });

                          if (/^\d*([.,]\d{0,2})?$/.test(val)) {
                            setEditForm({
                              ...editForm,
                              price: val.replace(",", "."),
                            });
                          }
                        }}
                      />

                      {/* ---------------- ALV-käsittely ---------------- */}
                      <CustomSelect
                        label="ALV-käsittely"
                        value={
                          editForm.vatHandling || "Kotimaan verollinen myynti"
                        }
                        onChange={(value) =>
                          setEditForm({ ...editForm, vatHandling: value })
                        }
                        options={[
                          {
                            value: "Kotimaan verollinen myynti",
                            label: "Kotimaan verollinen myynti",
                          },
                          { value: "Veroton", label: "Veroton" },
                          {
                            value: "Nollaverokannan myynti",
                            label: "Nollaverokannan myynti",
                          },
                        ]}
                      />

                      {/* ---------------- ALV-kanta (%) ---------------- */}
                      <CustomInputField
                        id="edit-vatRate"
                        type="number"
                        label="ALV-kanta (%)"
                        value={editForm.vatRate?.toString() || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            vatRate: parseFloat(e.target.value) || 0,
                          })
                        }
                      />

                      {/* ---------------- Kuvaus (vain palvelu) ---------------- */}
                      {!showStock && (
                        <div className="col-span-full">
                          <CustomInputField
                            id="edit-description"
                            label="Kuvaus"
                            value={editForm.description || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}

                      {/* ---------------- Napit ---------------- */}
                      <div className="col-span-full flex justify-end gap-3 mt-3">
                        <button
                          type="submit"
                          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2 rounded-md transition"
                        >
                          Tallenna
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditingCategory(null);
                          }}
                          className="bg-black/40 hover:bg-yellow-700/20 text-yellow-400 
                     border border-yellow-700/40 font-semibold 
                     px-6 py-2 rounded-md transition"
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
            {/* Teksti vasemmalle – vie kaikki muut sarakkeet paitsi viimeisen */}
            <td
              colSpan={8}
              className="py-3 px-4 text-right text-gray-300 font-semibold"
            >
              Varaston kokonaisarvo:
            </td>

            {/* Summa viimeiseen sarakkeeseen */}
            <td className="py-3 px-4 text-right text-yellow-400 font-bold">
              {list
                .reduce((sum, p) => sum + p.price * (p.quantity || 0), 0)
                .toFixed(2)}{" "}
              €
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
  // 🔹 Varsinainen renderöinti
  return (
    <>
      {/* 🔹 MOBIILI — kortit, ei taulukoita, ei kehystä */}
      <div className="block lg:hidden space-y-6 mt-6">
        {/* PALVELUT – mobiilikortit */}
        <h3 className="text-yellow-400 text-lg mt-6 mb-2">Palvelut</h3>
        {services.length === 0 ? (
          <p className="text-gray-500 italic mb-6">Ei palveluja lisätty.</p>
        ) : (
          <div className="space-y-4 mb-6">
            {services.map((p) => (
              <div
                key={p.id}
                className="bg-black/60 border border-yellow-700/30 
                         rounded-xl p-4 shadow-md transition relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-yellow-400 font-semibold text-base">
                    {p.name}
                  </p>

                  {/* 🔹 FIX: stopPropagation lisätty */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === p.id ? null : p.id);
                    }}
                  >
                    <MoreVertical className="text-gray-400 hover:text-yellow-400" />
                  </button>

                  {openMenuId === p.id && (
                    <div
                      onClick={(e) => e.stopPropagation()} // 🔹 FIX
                      className="absolute right-2 top-8 bg-black/90 border border-yellow-700/40 rounded-md shadow-lg z-20"
                    >
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-yellow-700/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProduct?.(p); // ⭐ Vie muokattava tuote ProductsPagelle
                          setShowForm?.(true); // ⭐ Avaa popup-lomake
                          setOpenMenuId(null); // Sulje valikko
                        }}
                      >
                        Muokkaa
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-700/20"
                        onClick={() => setDeleteId(p.id)}
                      >
                        Poista
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-300 space-y-1">
                  <p>Tuotekoodi: {p.code || "-"}</p>
                  <p>
                    Kesto: {p.hours ? `${p.hours}h` : ""}
                    {p.minutes ? ` ${p.minutes}min` : ""}
                  </p>
                  <p>Kokonaishinta: {p.price.toFixed(2)} €</p>
                  <p>ALV: {p.vatRate} %</p>
                  <p>Kuvaus: {p.description || "-"}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TUOTTEET – mobiilikortit */}
        <h3 className="text-yellow-400 text-lg mt-8 mb-2">Tuotteet</h3>
        {items.length === 0 ? (
          <p className="text-gray-500 italic mb-6">Ei tuotteita lisätty.</p>
        ) : (
          <div className="space-y-4 mb-6">
            {items.map((p) => (
              <div
                key={p.id}
                className="bg-black/60 border border-yellow-700/30 
                         rounded-xl p-4 shadow-md transition relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-yellow-400 font-semibold text-base">
                    {p.name}
                  </p>

                  {/* 🔹 FIX: stopPropagation lisätty */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === p.id ? null : p.id);
                    }}
                  >
                    <MoreVertical className="text-gray-400 hover:text-yellow-400" />
                  </button>

                  {openMenuId === p.id && (
                    <div
                      onClick={(e) => e.stopPropagation()} // 🔹 FIX
                      className="absolute right-2 top-8 bg-black/90 border border-yellow-700/40 rounded-md shadow-lg z-20"
                    >
                      <button
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-yellow-700/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProduct?.(p); // ⭐ Vie muokattava tuote ProductsPagelle
                          setShowForm?.(true); // ⭐ Avaa popup-lomake
                          setOpenMenuId(null); // Sulje valikko
                        }}
                      >
                        Muokkaa
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-700/20"
                        onClick={() => setDeleteId(p.id)}
                      >
                        Poista
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-300 space-y-1">
                  <p>Tuotekoodi: {p.code || "-"}</p>
                  <p>Saldo: {p.quantity ?? 0} kpl</p>
                  <p>Kappalehinta: {p.price.toFixed(2)} €</p>
                  <p>ALV: {p.vatRate} %</p>
                  <p>ALV-käsittely: {p.vatHandling}</p>
                  <p>Varaston arvo: {(p.quantity || 0) * p.price} €</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔹 DESKTOP */}
      <div
        className="
      hidden sm:block
      max-w-4xl mx-auto mt-6 
      bg-black/40 border border-yellow-700/40 rounded-xl p-6 
      shadow-[0_0_15px_rgba(0,0,0,0.4)] overflow-x-auto
    "
      >
        <h3 className="text-yellow-400 text-lg mt-6 mb-2">Palvelut</h3>
        {services.length === 0 ? (
          <p className="text-gray-500 italic mb-6">Ei palveluja lisätty.</p>
        ) : (
          renderTable(services, false)
        )}

        <h3 className="text-yellow-400 text-lg mt-8 mb-2">Tuotteet</h3>
        {items.length === 0 ? (
          <p className="text-gray-500 italic">Ei tuotteita lisätty.</p>
        ) : (
          renderTable(items, true)
        )}
      </div>

      <ConfirmModal
        show={deleteId !== null}
        message="Haluatko varmasti poistaa tämän tuotteen?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
