"use client";

import { useState } from "react";
import DatePickerField from "@/components/common/DatePickerField";

// --------------------
// 🔸 Tyypit
// --------------------
type VatLine = {
  id: number;
  date: string;
  description: string;
  net: number;
  vatRate?: number;
  vat?: number;
};

type VATReportData = {
  period: { from: string; to: string };
  salesVat: number;
  purchasesVat: number;
  zeroVatSales: number;
  payableVat: number;
  salesLines: VatLine[];
  purchaseLines: VatLine[];
  zeroSalesLines: VatLine[];
};

// --------------------
// 🔸 Komponentti
// --------------------
export default function VATReport() {
// Oletuksena: kuluvan kuukauden alku → tänään
const today = new Date();
const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const [from, setFrom] = useState<Date | null>(firstOfMonth);
const [to, setTo] = useState<Date | null>(today);

  const [data, setData] = useState<VATReportData | null>(null);
  const [loading, setLoading] = useState(false);

  // --------------------
  // 🔸 API-haku
  // --------------------
  const fetchReport = async () => {
    if (!from || !to) return;

    setLoading(true);

    try {
      const res = await fetch(
        `/api/bookkeeping/reports/vat?from=${from.toISOString()}&to=${to.toISOString()}`
      );

      const json: VATReportData = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  };

  // --------------------
  // 🔸 Taulukon renderöinti
  // --------------------
  const renderTable = (rows: VatLine[], title: string) => (
    <div className="mt-10">
<h4 className="hidden sm:block text-lg text-yellow-400 font-semibold mb-3">
  {title}
</h4>

      <div className="overflow-x-auto hidden sm:block">
        <table className="w-full text-sm text-gray-300 border-collapse">
          <thead>
            <tr className="border-b border-yellow-700/40 text-yellow-400 text-xs uppercase tracking-wider">
              <th className="py-2 px-3 text-left">Pvm</th>
              <th className="py-2 px-3 text-left">Kuvaus</th>
              <th className="py-2 px-3 text-right">Summa €</th>
              <th className="py-2 px-3 text-right">ALV %</th>
              <th className="py-2 px-3 text-right">ALV €</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-4 text-gray-500 italic"
                >
                  Ei tapahtumia
                </td>
              </tr>
            ) : (
              rows.map((line) => (
                <tr
                  key={line.id}
                  className="border-b border-yellow-700/20 hover:bg-yellow-700/10 transition"
                >
                  <td className="py-2 px-3">
                    {new Date(line.date).toLocaleDateString("fi-FI")}
                  </td>
                  <td className="py-2 px-3">{line.description}</td>
                  <td className="py-2 px-3 text-right">
                    {line.net.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-right">
                    {line.vatRate ?? 0} %
                  </td>
                  <td className="py-2 px-3 text-right">
                    {line.vat ? line.vat.toFixed(2) : "0.00"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  // --------------------
  // 🔸 Mobiilin korttinäkymä
  // --------------------
  const renderMobileCards = (rows: VatLine[], title: string) => (
    <div className="mt-10 sm:hidden">
      <h4 className="text-lg text-yellow-400 font-semibold mb-3">{title}</h4>

      {rows.length === 0 ? (
        <p className="text-gray-500 italic">Ei tapahtumia</p>
      ) : (
        <div className="space-y-4">
          {rows.map((line) => (
            <div
              key={line.id}
              className="bg-black/40 border border-yellow-700/40 rounded-lg p-4"
            >
              <p className="text-sm text-gray-400">
                {new Date(line.date).toLocaleDateString("fi-FI")}
              </p>

              <p className="text-yellow-300 font-semibold">
                {line.description}
              </p>

              <div className="mt-2 space-y-1 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-400">Netto €</span>
                  <span>{line.net.toFixed(2)}</span>
                </p>

                <p className="flex justify-between">
                  <span className="text-gray-400">ALV %</span>
                  <span>{line.vatRate ?? 0} %</span>
                </p>

                <p className="flex justify-between">
                  <span className="text-gray-400">ALV €</span>
                  <span>{line.vat?.toFixed(2) ?? "0.00"}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // --------------------
  // 🔸 Renderöinti
  // --------------------
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-yellow-400">ALV-raportti</h2>

      {/* 🔸 Aikavälin valinta */}
      <div className="bg-black/40 border border-yellow-700/40 rounded-xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
        <h3 className="text-lg font-semibold text-yellow-400 mb-4">
          Aikaväliraportti
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DatePickerField selected={from} onChange={setFrom} label="Alkaen" />
          <DatePickerField selected={to} onChange={setTo} label="Päättyen" />
        </div>

        <button
          onClick={fetchReport}
          className="mt-6 bg-yellow-600 hover:bg-yellow-500 text-black px-5 py-2 rounded-md font-semibold"
        >
          Hae raportti
        </button>
      </div>

      {/* 🔸 Ladataan... */}
      {loading && <p className="text-gray-400 italic">Ladataan...</p>}

      {/* 🔸 Yhteenveto */}
      {data && (
        <div className="bg-black/40 border border-yellow-700/40 rounded-xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
          <h3 className="text-lg font-semibold text-yellow-400 mb-4">
            ALV-yhteenveto
          </h3>

          <p className="text-gray-300">
            <span className="text-yellow-400">Myyntien ALV (25,5 %):</span>
            &nbsp; {data.salesVat.toFixed(2)} €
          </p>

          <p className="text-gray-300">
            <span className="text-yellow-400">Ostojen ALV:</span>
            &nbsp; {data.purchasesVat.toFixed(2)} €
          </p>

          <p className="text-gray-300 font-semibold mt-3">
            <span className="text-yellow-400">Maksettava ALV:</span>
            &nbsp; {data.payableVat.toFixed(2)} €
          </p>

          {/* PDF */}
          <button
            onClick={() =>
              window.open(
                `/api/bookkeeping/reports/vat/pdf?from=${from?.toISOString()}&to=${to?.toISOString()}`
              )
            }
            className="mt-6 bg-yellow-600 hover:bg-yellow-500 text-black px-5 py-2 rounded-md font-semibold"
          >
            Lataa PDF
          </button>
        </div>
      )}

      {/* 🔸 Taulukot */}
      {data && (
        <>
          {/* Desktop-taulukot */}
          {renderTable(
            data.salesLines.filter((l) => l.vatRate && l.vatRate > 0),
            "Myynnit (25,5 %)"
          )}
          {renderTable(data.zeroSalesLines, "Myynnit (0 %)")}
          {renderTable(data.purchaseLines, "Ostot (vähennettävä ALV)")}

          {/* Mobile-kortit */}
          {renderMobileCards(
            data.salesLines.filter((l) => l.vatRate && l.vatRate > 0),
            "Myynnit (25,5 %)"
          )}
          {renderMobileCards(data.zeroSalesLines, "Myynnit (0 %)")}
          {renderMobileCards(data.purchaseLines, "Ostot (vähennettävä ALV)")}
        </>
      )}
    </div>
  );
}
