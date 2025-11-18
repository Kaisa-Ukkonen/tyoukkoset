"use client";

import { useEffect, useState } from "react";

type StockRow = {
  id: number;
  name: string;
  code: string;
  quantity: number;
  unitPrice: number;
  stockValue: number;
};

type StockReportData = {
  products: StockRow[];
  totalValue: number;
};

export default function StockReport() {
  const [data, setData] = useState<StockReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStock = async () => {
    setLoading(true);
    const res = await fetch("/api/bookkeeping/reports/stock");
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

useEffect(() => {
  const timer = setTimeout(() => {
    fetchStock();
  }, 0);

  return () => clearTimeout(timer);
}, []);

  return (
    <div className="text-gray-200">
      <h2 className="text-xl font-bold text-yellow-400 mb-4">Varastosaldoraportti</h2>

      {loading && <p className="italic">Ladataan...</p>}

      {data && (
        <>
          {/* YHTEENVETO */}
          <div className="bg-black/30 border border-yellow-700/40 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">
              Varaston kokonaisarvo
            </h3>

            <p className="text-xl font-bold text-yellow-300">
              {data.totalValue.toFixed(2)} €
            </p>
          </div>

          {/* DESKTOP */}
          <div className="hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-yellow-400 border-b border-yellow-700/30">
                  <th className="py-2 text-left">Nimi</th>
                  <th className="py-2 text-left">Tuotekoodi</th>
                  <th className="py-2 text-right">Saldo</th>
                  <th className="py-2 text-right">Kpl-hinta</th>
                  <th className="py-2 text-right">Varaston arvo</th>
                </tr>
              </thead>

              <tbody>
                {data.products.map((p) => (
                  <tr key={p.id} className="border-b border-yellow-700/20">
                    <td className="py-2">{p.name}</td>
                    <td>{p.code}</td>
                    <td className="text-right">{p.quantity} kpl</td>
                    <td className="text-right">{p.unitPrice.toFixed(2)} €</td>
                    <td className="text-right">{p.stockValue.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE */}
          <div className="sm:hidden space-y-4">
            {data.products.map((p) => (
              <div
                key={p.id}
                className="border border-yellow-700/30 bg-black/20 p-4 rounded-lg"
              >
                <p className="text-yellow-400 font-semibold mb-1">
                  {p.name}
                </p>

                <p><strong>Koodi:</strong> {p.code}</p>
                <p><strong>Saldo:</strong> {p.quantity} kpl</p>
                <p><strong>Kpl-hinta:</strong> {p.unitPrice.toFixed(2)} €</p>

                <p className="mt-2 font-semibold text-yellow-300">
                  Arvo: {p.stockValue.toFixed(2)} €
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
