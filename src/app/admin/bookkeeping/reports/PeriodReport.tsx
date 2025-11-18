"use client";

import { useState } from "react";
import DatePickerField from "@/components/common/DatePickerField";

type VatRow = {
  net: number;
  vat: number;
  total: number;
};

type PeriodReportData = {
  income: number;
  expenses: number;
  profit: number;

  salesVat: {
    "0": VatRow;
    "10": VatRow;
    "14": VatRow;
    "25.5": VatRow;
  };

  purchaseVat: {
    "0": VatRow;
    "10": VatRow;
    "14": VatRow;
    "25.5": VatRow;
  };

  payableVat: number;

  entries: {
    id: number;
    date: string;
    contact: string | null;
    category: string | null;
    type: string;
    description: string | null;
    amount: number;
    vatRate: number;
    paymentMethod: string | null;
  }[];
};

export default function PeriodReport() {
  const today = new Date();

  const [start, setStart] = useState<Date | null>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [end, setEnd] = useState<Date | null>(today);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PeriodReportData | null>(null);
  const [error, setError] = useState("");

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fi-FI");
  }

  const fetchReport = async () => {
    if (!start || !end) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/bookkeeping/reports/period?start=${start.toISOString()}&end=${end.toISOString()}`
      );

      const json = await res.json();
      if (json.error) {
        setError(json.error);
        setLoading(false);
        return;
      }

      setData(json);
    } catch (err) {
      console.error(err);
      setError("Raportin hakemisessa tapahtui virhe.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 text-gray-200">
      <h1 className="text-2xl font-bold text-yellow-400 mb-4">
        Aikaväliraportti
      </h1>

      {/* Päivämäärät */}
      <div className="bg-black/30 border border-yellow-700/40 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DatePickerField selected={start} onChange={setStart} label="Alkaen" />

          <DatePickerField selected={end} onChange={setEnd} label="Päättyen" />
        </div>

        <button
          onClick={fetchReport}
          className="mt-4 bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-md font-semibold"
        >
          Hae raportti
        </button>
      </div>

      {loading && <p className="italic text-gray-400">Ladataan...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {data && (
        <>
          {/* ============= YHTEENVETO ============= */}
          <div className="bg-black/30 border border-yellow-700/40 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-yellow-400 mb-4">
              Yhteenveto
            </h2>

            <div className="flex justify-between py-1">
              <span>Tulot yhteensä:</span>
              <span className="text-green-400 font-semibold">
                {data.income.toFixed(2)} €
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span>Menot yhteensä:</span>
              <span className="text-red-400 font-semibold">
                {data.expenses.toFixed(2)} €
              </span>
            </div>

            <div className="flex justify-between py-1 border-t border-yellow-700/20 mt-2 pt-2">
              <span className="font-semibold">Voitto / tappio:</span>
              <span className="font-semibold text-yellow-400">
                {data.profit.toFixed(2)} €
              </span>
            </div>
          </div>

          {/* ============= MYNNIN ALV ============= */}
          <div className="bg-black/30 border border-yellow-700/40 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-yellow-400 mb-4">
              Myynnin ALV (tulot)
            </h2>

            {/* Desktop-taulukko */}
            <div className="hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-yellow-400 border-b border-yellow-700/30">
                    <th className="py-2 text-left">ALV-kanta</th>
                    <th className="py-2 text-right">Veroton</th>
                    <th className="py-2 text-right">ALV</th>
                    <th className="py-2 text-right">Yhteensä</th>
                  </tr>
                </thead>

                <tbody>
                  {Object.entries(data.salesVat).map(([rate, row]) => (
                    <tr key={rate} className="border-b border-yellow-700/20">
                      <td className="py-2">{rate} %</td>
                      <td className="py-2 text-right">{row.net.toFixed(2)} €</td>
                      <td className="py-2 text-right">{row.vat.toFixed(2)} €</td>
                      <td className="py-2 text-right">{row.total.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobiilikortit */}
            <div className="sm:hidden space-y-3">
              {Object.entries(data.salesVat).map(([rate, row]) => (
                <div
                  key={rate}
                  className="border border-yellow-700/30 bg-black/20 p-3 rounded-lg"
                >
                  <p className="text-yellow-400 font-semibold mb-1">
                    {rate} %
                  </p>

                  <p>Veroton: {row.net.toFixed(2)} €</p>
                  <p>ALV: {row.vat.toFixed(2)} €</p>
                  <p>Yhteensä: {row.total.toFixed(2)} €</p>
                </div>
              ))}
            </div>
          </div>

          {/* ============= OSTOJEN ALV ============= */}
          <div className="bg-black/30 border border-yellow-700/40 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-yellow-400 mb-4">
              Ostojen ALV (menot)
            </h2>

            {/* Desktop */}
            <div className="hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-yellow-400 border-b border-yellow-700/30">
                    <th className="py-2 text-left">ALV-kanta</th>
                    <th className="py-2 text-right">Veroton</th>
                    <th className="py-2 text-right">ALV</th>
                    <th className="py-2 text-right">Yhteensä</th>
                  </tr>
                </thead>

                <tbody>
                  {Object.entries(data.purchaseVat).map(([rate, row]) => (
                    <tr key={rate} className="border-b border-yellow-700/20">
                      <td className="py-2">{rate} %</td>
                      <td className="py-2 text-right">{row.net.toFixed(2)} €</td>
                      <td className="py-2 text-right">{row.vat.toFixed(2)} €</td>
                      <td className="py-2 text-right">{row.total.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobiili */}
            <div className="sm:hidden space-y-3">
              {Object.entries(data.purchaseVat).map(([rate, row]) => (
                <div
                  key={rate}
                  className="border border-yellow-700/30 bg-black/20 p-3 rounded-lg"
                >
                  <p className="text-yellow-400 font-semibold mb-1">
                    {rate} %
                  </p>

                  <p>Veroton: {row.net.toFixed(2)} €</p>
                  <p>ALV: {row.vat.toFixed(2)} €</p>
                  <p>Yhteensä: {row.total.toFixed(2)} €</p>
                </div>
              ))}
            </div>
          </div>

          {/* ============= MAKSETTAVA ALV ============= */}
          <div className="bg-black/30 border border-yellow-700/40 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-yellow-400 mb-2">
              Maksettava ALV
            </h2>

            <p className="text-xl font-bold text-yellow-300">
              {data.payableVat.toFixed(2)} €
            </p>
          </div>

          {/* ============= TAPAHTUMAT ============= */}
          <div className="bg-black/30 border border-yellow-700/40 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-yellow-400 mb-4">
              Tapahtumat
            </h2>

            {/* Desktop */}
            <div className="hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-yellow-400 border-b border-yellow-700/30">
                    <th className="py-2 text-left w-32">Päivä</th>
                    <th className="py-2 text-left w-40">Kontakti</th>
                    <th className="py-2 text-left w-40">Kategoria</th>
                    <th className="py-2 text-left w-24">Tyyppi</th>
                    <th className="py-2 text-right w-24">Summa</th>
                    <th className="py-2 text-right w-20">ALV %</th>
                  </tr>
                </thead>

                <tbody>
                  {data.entries.map((e) => (
                    <tr key={e.id} className="border-b border-yellow-700/20">
                      <td className="py-2 text-left">{formatDate(e.date)}</td>
                      <td className="py-2">{e.contact || "-"}</td>
                      <td className="py-2">{e.category || "-"}</td>
                      <td className="py-2">{e.type}</td>
                      <td className="py-2 text-right">
                        {e.amount.toFixed(2)} €
                      </td>
                      <td className="py-2 text-right">{e.vatRate} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobiilikortit */}
            <div className="sm:hidden space-y-4">
              {data.entries.map((e) => (
                <div
                  key={e.id}
                  className="bg-black/20 border border-yellow-700/30 p-4 rounded-lg"
                >
                  <p className="text-yellow-400 font-semibold mb-1">
                    {formatDate(e.date)}
                  </p>

                  <p>
                    <span className="font-semibold">Kontakti:</span>{" "}
                    {e.contact || "-"}
                  </p>

                  <p>
                    <span className="font-semibold">Kategoria:</span>{" "}
                    {e.category || "-"}
                  </p>

                  <p>
                    <span className="font-semibold">Tyyppi:</span> {e.type}
                  </p>

                  <div className="flex justify-between mt-3 text-gray-200">
                    <span>{e.amount.toFixed(2)} €</span>
                    <span>{e.vatRate} %</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
