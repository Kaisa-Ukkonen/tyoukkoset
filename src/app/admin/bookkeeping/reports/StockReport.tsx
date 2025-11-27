"use client";

import { useEffect, useState } from "react";

type Row = {
  id: number;
  name: string;
  qty: number;
  gross: number;
  vat: number;
  net: number;
  vatPart: number;
  grossValue: number;
  netValue: number;
};

type Report = {
  rows: Row[];
  totalNet: number;
  totalGross: number;
};

export default function StockReport() {
  const [data, setData] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const r = await fetch("/api/bookkeeping/reports/stock");
      const json = await r.json();
      setData(json);
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !data) return <p className="text-gray-400">Ladataan...</p>;

  return (
    <div className="max-w-5xl mx-auto mt-8 text-gray-200">
      <h2 className="text-xl font-bold text-yellow-400 mb-4">
        Varastosaldoraportti
      </h2>

      {/* YHTEENVETO */}
      <div className="bg-black/30 border border-yellow-700/40 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-4">
          Yhteenveto
        </h3>

        {/* Bruttoarvo */}
        <div className="flex justify-between py-1">
          <span className="text-gray-200 font-medium">
            Varaston kokonaisarvo (brutto, ALV sis.):
          </span>
          <span className="text-yellow-400 font-bold">
            {data.totalGross.toFixed(2)} €
          </span>
        </div>

        {/* Nettoarvo */}
        <div className="flex justify-between py-1">
          <span className="text-gray-200 font-medium">
            Varaston arvo (veroton):
          </span>
          <span className="text-yellow-400 font-bold">
            {data.totalNet.toFixed(2)} €
          </span>
        </div>

        {/* PDF-lataus */}
        <button
          onClick={() =>
            window.open("/api/bookkeeping/reports/stock/pdf", "_blank")
          }
          className="mt-6 bg-yellow-600 hover:bg-yellow-500 text-black px-5 py-2 rounded-md font-semibold"
        >
          Lataa PDF
        </button>
      </div>

      {/* TAULUKKO */}
      <div className="hidden sm:block">
        <table className="w-full min-w-[900px] text-sm text-left">
          <thead>
            <tr className="text-yellow-400 border-b border-yellow-700/30 text-xs">
              <th className="py-1 px-2 whitespace-nowrap">Tuote</th>
              <th className="py-1 px-2 text-right whitespace-nowrap">Saldo</th>
              <th className="py-1 px-2 text-right whitespace-nowrap">
                Hinta (ALV)
              </th>
              <th className="py-1 px-2 text-right whitespace-nowrap">ALV %</th>
              <th className="py-1 px-2 text-right whitespace-nowrap">Netto</th>
              <th className="py-1 px-2 text-right whitespace-nowrap">ALV €</th>
              <th className="py-1 px-2 text-right whitespace-nowrap">
                Varaston arvo
              </th>
            </tr>
          </thead>

          <tbody>
            {data.rows.map((p) => (
              <tr key={p.id} className="border-b border-yellow-700/20">
                <td className="py-1 px-2">{p.name}</td>
                <td className="py-1 px-2 text-right">{p.qty}</td>
                <td className="py-1 px-2 text-right">{p.gross.toFixed(2)} €</td>
                <td className="py-1 px-2 text-right">{p.vat} %</td>
                <td className="py-1 px-2 text-right">{p.net.toFixed(3)} €</td>
                <td className="py-1 px-2 text-right">
                  {p.vatPart.toFixed(3)} €
                </td>
                <td className="py-1 px-2 text-right text-yellow-300 font-semibold">
                  {p.grossValue.toFixed(2)} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBIILI */}
      <div className="sm:hidden space-y-4">
        {data.rows.map((p) => (
          <div
            key={p.id}
            className="border border-yellow-700/30 bg-black/20 p-4 rounded-lg"
          >
            <p className="text-yellow-400 font-semibold mb-1">{p.name}</p>
            <p>Saldo: {p.qty}</p>
            <p>Kpl-hinta (ALV sis.): {p.gross.toFixed(2)} €</p>
            <p>ALV %: {p.vat}</p>
            <p>Veroton / kpl: {p.net.toFixed(3)} €</p>
            <p>ALV-osuus / kpl: {p.vatPart.toFixed(3)} €</p>
            <p>Varaston arvo: {p.grossValue.toFixed(2)} €</p>
          </div>
        ))}
      </div>
    </div>
  );
}
