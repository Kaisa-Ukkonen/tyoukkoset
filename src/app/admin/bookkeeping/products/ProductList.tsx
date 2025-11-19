//tuottaa tuotteiden ja palveluiden listauksen admin-sivulle – sekä mobiilin korttinäkymän että desktopin taulukkonäkymän – ja hallitsee niihin liittyvät toiminnot (muokkaus, arkistointi, saldon muutos ja modaalit).

"use client";

import { useEffect, useState } from "react";
import { MoreVertical } from "lucide-react";
import React from "react";
import ConfirmModal from "@/components/common/ConfirmModal";
import StockMovementModal from "@/app/admin/bookkeeping/products/StockMovementModal";

export type Product = {
  id: number;
  name: string;
  code?: string;
  category: string; // Palvelu / Tuote
  hours?: number;
  minutes?: number;
  price: number;
  vatRate: number;
  vatIncluded: boolean;
  description?: string;
  quantity?: number;
  vatHandling: string;
  archived: boolean;
};

export default function ProductList({
  refreshKey,
  searchTerm = "",
  setShowForm,
  setEditingProduct,
  archived = false,
  setRefreshKey,
}: {
  refreshKey: number;
  searchTerm?: string;
  setShowForm?: (v: boolean) => void;
  setEditingProduct?: (product: Product | null) => void;
  archived?: boolean;
  setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [archiveId, setArchiveId] = useState<number | null>(null);

  // Varaston muutos
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  } | null>(null);

  // Klikkaus ulos sulkee valikot
  useEffect(() => {
    const close = () => setOpenMenuId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // Hae tuotteet
  // Hae tuotteet
  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const url = archived
          ? "/api/bookkeeping/products?archived=1"
          : "/api/bookkeeping/products";

        const res = await fetch(url);
        const data = await res.json();

        if (active) setProducts(data);
      } catch (err) {
        console.error("Virhe tuotteiden haussa:", err);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [refreshKey, archived]);

  const confirmArchive = async () => {
    if (!archiveId) return;

    await fetch("/api/bookkeeping/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: archiveId }),
    });

    setArchiveId(null);
    window.location.reload(); // päivitä lista
  };

  const unarchiveProduct = async (id: number) => {
    try {
      const res = await fetch(`/api/bookkeeping/products/${id}/unarchive`, {
        method: "PATCH",
      });

      if (res.ok) {
        setRefreshKey((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Virhe palautuksessa:", err);
    }
  };

  // Suodatus
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const services = filteredProducts.filter((p) => p.category === "Palvelu");
  const items = filteredProducts.filter((p) => p.category === "Tuote");

  // TAULUKKO DESKTOPILLE
  const renderTable = (list: Product[], showStock: boolean) => (
    <table className="w-full text-sm text-gray-300 border-collapse">
      <thead>
        {showStock ? (
          <tr className="border-b border-yellow-700/40 text-yellow-400 text-left">
            <th className="py-2 px-3">Nimi</th>
            <th className="py-2 px-3">Tuotekoodi</th>
            <th className="py-2 px-3 text-right">Saldo</th>
            <th className="py-2 px-3 text-right">Kappalehinta <br />
              <span className="text-xs">(sis. ALV)</span>
            </th>
            <th className="py-2 px-3 text-right">Veroton</th>
            <th className="py-2 px-3 text-right">ALV-osuus</th>
            <th className="py-2 px-3">ALV-käsittely</th>
            <th className="py-2 px-3 text-right">ALV-%</th>
            <th className="py-2 px-3 text-right text-yellow-400">Varaston arvo</th>
          </tr>
        ) : (
          <tr className="border-b border-yellow-700/40 text-yellow-400 text-left">
            <th className="py-2 px-3">Nimi</th>
            <th className="py-2 px-3">Tuotekoodi</th>
            <th className="py-2 px-3">Kesto</th>
            <th className="py-2 px-3 text-right">
              Kokonaishinta <br />
              <span className="text-xs">(sis. ALV)</span>
            </th>
            <th className="py-2 px-3 text-right">Veroton</th>
            <th className="py-2 px-3 text-right">ALV-osuus</th>
            <th className="py-2 px-3">ALV-käsittely</th>
            <th className="py-2 px-3 text-right">ALV-%</th>
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
          const varastonArvo = showStock ? (p.quantity ?? 0) * p.price : 0;

          return (
            <React.Fragment key={p.id}>
              <tr className="border-b border-gray-800 hover:bg-yellow-700/10 transition">
                <td className="py-2 px-3 text-yellow-300 font-medium">
                  {p.name}
                </td>
                <td className="py-2 px-3">{p.code}</td>

                {!showStock && (
                  <td className="py-2 px-3">
                    {p.hours ? `${p.hours}h ` : ""}
                    {p.minutes ? `${p.minutes}min` : ""}
                  </td>
                )}

                {showStock && (
                  <td className="py-2 px-3 text-right">
                    {p.quantity ?? 0} kpl
                  </td>
                )}

                <td className="py-2 px-3 text-right">{p.price.toFixed(2)} €</td>
                <td className="py-2 px-3 text-right">{veroton.toFixed(3)} €</td>
                <td className="py-2 px-3 text-right">{vero.toFixed(3)} €</td>

                <td className="py-2 px-3">{p.vatHandling}</td>
                <td className="py-2 px-3 text-right">{p.vatRate} %</td>

                {showStock && (
                  <td className="py-2 px-3 text-right text-yellow-400 font-semibold">
                    {varastonArvo.toFixed(2)} €
                  </td>
                )}

                {!showStock && (
                  <td className="py-2 px-3 text-gray-400">
                    {p.description || "-"}
                  </td>
                )}

                {/* Toiminnot */}
                <td className="py-2 px-3 text-center relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === p.id ? null : p.id);
                    }}
                    className="text-yellow-400 hover:text-yellow-200"
                  >
                    <MoreVertical className="inline w-5 h-5" />
                  </button>

                  {openMenuId === p.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 mt-2 bg-black border border-yellow-700/40 rounded-md shadow-lg z-10 px-2 py-1"
                    >
                      {p.archived ? (
                        /* ⭐ ARKISTOIDUT NÄYTTÄÄ VAIN "PALAUTA" */
                        <button
                          className="block w-full text-left px-3 py-1 text-sm 
                     text-green-400 hover:bg-green-700/20"
                          onClick={() => {
                            unarchiveProduct(p.id);
                            setOpenMenuId(null);
                          }}
                        >
                          Palauta
                        </button>
                      ) : (
                        <>
                          {/* MUOKKAA */}
                          <button
                            className="block w-full text-left px-3 py-1 text-sm 
                       text-yellow-300 hover:bg-yellow-700/20"
                            onClick={() => {
                              setEditingProduct?.(p);
                              setShowForm?.(true);
                              setOpenMenuId(null);
                            }}
                          >
                            Muokkaa
                          </button>

                          {/* MUUTA SALDOA — vain tuotteille */}
                          {showStock && (
                            <button
                              className="block w-full text-left px-3 py-1 text-sm 
                         text-gray-300 hover:bg-yellow-700/10"
                              onClick={() => {
                                setSelectedProduct({
                                  id: p.id,
                                  name: p.name,
                                  quantity: p.quantity ?? 0,
                                  price: p.price,
                                });
                                setShowStockModal(true);
                                setOpenMenuId(null);
                              }}
                            >
                              Muuta saldoa
                            </button>
                          )}

                          {/* ARKISTOI */}
                          <button
                            className="block w-full text-left px-3 py-1 text-sm 
                       text-orange-400 hover:bg-orange-700/20"
                            onClick={() => {
                              setArchiveId(p.id);
                              setOpenMenuId(null);
                            }}
                          >
                            Arkistoi
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            </React.Fragment>
          );
        })}
      </tbody>

      {/* Varaston yhteisarvo */}
      {showStock && list.length > 0 && (
        <tfoot>
          <tr className="border-t border-yellow-700/40 bg-black/50">
            <td
              colSpan={10}
              className="py-6 px-4 text-right text-yellow-400 font-semibold"
            >
              Varaston kokonaisarvo:{" "}
              <span className="text-yellow-300 font-bold">
                {list
                  .reduce((sum, p) => sum + p.price * (p.quantity || 0), 0)
                  .toFixed(2)}{" "}
                €
              </span>
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );

  return (
    <>
      {/* MOBIILI */}
      <div className="block lg:hidden space-y-6 mt-6">
        {/* PALVELUT */}
        <h2 className="text-xl font-semibold text-yellow-400 mb-2">
          {archived ? "Arkistoidut palvelut" : "Palvelut"}
        </h2>

        {services.length === 0 ? (
          <p className="text-gray-500 italic mb-6">Ei palveluja lisätty.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {services.map((p) => (
              <div
                key={p.id}
                className="bg-black/60 border border-yellow-700/30 rounded-xl p-4 shadow-md relative"
              >
                {/* Otsikko + valikko */}
                <div className="flex justify-between items-start mb-2">
                  <p className="text-yellow-400 font-semibold text-base">
                    {p.name}
                  </p>

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
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-2 top-8 bg-black/90 border border-yellow-700/40 rounded-md shadow-lg z-20"
                    >
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-yellow-700/20"
                        onClick={() => {
                          setEditingProduct?.(p);
                          setShowForm?.(true);
                          setOpenMenuId(null);
                        }}
                      >
                        Muokkaa
                      </button>

                      <button
                        className="block w-full text-left px-3 py-1 text-sm text-yellow-300 hover:bg-yellow-700/20"
                        onClick={() => {
                          setArchiveId(p.id);
                          setOpenMenuId(null);
                        }}
                      >
                        Arkistoi
                      </button>
                    </div>
                  )}
                </div>

                {/* Sisältö */}
                <div className="text-sm text-gray-300 space-y-1">
                  <p>Tuotekoodi: {p.code || "-"}</p>
                  <p>
                    Kesto: {p.hours ? `${p.hours}h` : ""}{" "}
                    {p.minutes ? `${p.minutes}min` : ""}
                  </p>
                  <p>Kokonaishinta: {p.price.toFixed(2)} €</p>
                  <p>ALV: {p.vatRate} %</p>
                  <p>Kuvaus: {p.description || "-"}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TUOTTEET */}
        <h2 className="text-xl font-semibold text-yellow-400 mb-2">
          {archived ? "Arkistoidut tuotteet" : "Tuotteet"}
        </h2>

        {items.length === 0 ? (
          <p className="text-gray-500 italic mb-6">Ei tuotteita lisätty.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {items.map((p) => (
              <div
                key={p.id}
                className="bg-black/60 border border-yellow-700/30 rounded-xl p-4 shadow-md relative"
              >
                {/* Otsikko + valikko */}
                <div className="flex justify-between items-start mb-2">
                  <p className="text-yellow-400 font-semibold text-base">
                    {p.name}
                  </p>

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
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-2 top-8 bg-black/90 border border-yellow-700/40 rounded-md shadow-lg z-20"
                    >
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-yellow-300 hover:bg-yellow-700/20"
                        onClick={() => {
                          setEditingProduct?.(p);
                          setShowForm?.(true);
                          setOpenMenuId(null);
                        }}
                      >
                        Muokkaa
                      </button>

                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-yellow-700/10"
                        onClick={() => {
                          setSelectedProduct({
                            id: p.id,
                            name: p.name,
                            quantity: p.quantity ?? 0,
                            price: p.price,
                          });
                          setShowStockModal(true);
                          setOpenMenuId(null);
                        }}
                      >
                        Muuta saldoa
                      </button>
                      <button
                        className="
    block w-full text-left px-3 py-1 text-sm
    text-amber-400 hover:bg-amber-700/20
  "
                        onClick={() => {
                          setArchiveId(p.id);
                          setOpenMenuId(null);
                        }}
                      >
                        Arkistoi
                      </button>
                    </div>
                  )}
                </div>

                {/* Sisältö */}
                <div className="text-sm text-gray-300 space-y-1">
                  <p>Tuotekoodi: {p.code || "-"}</p>
                  <p>Saldo: {p.quantity ?? 0} kpl</p>
                  <p>Kappalehinta: {p.price.toFixed(2)} €</p>
                  <p>ALV: {p.vatRate} %</p>
                  <p>ALV-käsittely: {p.vatHandling}</p>
                  {(() => {
  const qty = p.quantity ?? 0;

  const netPrice = p.vatIncluded
    ? p.price / (1 + p.vatRate / 100)
    : p.price;

  const stockValue = netPrice * qty;

  return (
    <p>
      Varaston arvo: {stockValue.toFixed(2)} €
    </p>
  );
})()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Varaston kokonaisarvo mobiilissa */}
        {items.length > 0 && (
          <div className="mt-4 p-4 bg-black/60 border border-yellow-700/40 rounded-xl shadow-md">
            <p className="text-yellow-400 font-semibold text-right">
              Varaston kokonaisarvo:{" "}
              <span className="text-yellow-300 font-bold">
                {items
                  .reduce((sum, p) => sum + p.price * (p.quantity || 0), 0)
                  .toFixed(2)}{" "}
                €
              </span>
            </p>
          </div>
        )}
      </div>

      {/* DESKTOP */}
      <div
        className="
    hidden lg:block 
    max-w-6xl w-full mx-auto mt-6 
    bg-black/40 border border-yellow-700/40 rounded-xl p-6 
    shadow-[0_0_15px_rgba(0,0,0,0.4)]
    overflow-x-auto
  "
      >
        <h2 className="text-xl font-semibold text-yellow-400 mb-2">
          {archived ? "Arkistoidut palvelut" : "Palvelut"}
        </h2>
        {services.length === 0 ? (
          <p className="text-gray-500 italic mb-6">Ei palveluja lisätty.</p>
        ) : (
          renderTable(services, false)
        )}

        <h2 className="text-xl font-semibold text-yellow-400 mb-2">
          {archived ? "Arkistoidut tuotteet" : "Tuotteet"}
        </h2>
        {items.length === 0 ? (
          <p className="text-gray-500 italic">Ei tuotteita lisätty.</p>
        ) : (
          renderTable(items, true)
        )}
      </div>
      <ConfirmModal
        show={archiveId !== null}
        message="Haluatko arkistoida tämän tuotteen?"
        confirmLabel="Arkistoi"
        confirmColor="orange"
        onConfirm={confirmArchive}
        onCancel={() => setArchiveId(null)}
      />

      {/* Modaalit */}

      {showStockModal && selectedProduct && (
        <StockMovementModal
          product={selectedProduct}
          onClose={() => setShowStockModal(false)}
          onSaved={() => window.location.reload()}
        />
      )}
    </>
  );
}
