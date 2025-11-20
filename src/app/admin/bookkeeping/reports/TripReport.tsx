"use client";

import { useState } from "react";
import DatePickerField from "@/components/common/DatePickerField";

type TripRow = {
  id: number;
  date: string;
  startAddress: string;
  endAddress: string;
  kilometers: number;
  allowance: number;
  notes: string;
};

type TripReportData = {
  totalKm: number;
  totalAllowance: number;
  totalCost: number;
  trips: TripRow[];
};

export default function TripReport() {
  const today = new Date();

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fi-FI"); // pp.kk.vvvv
  }

  const [start, setStart] = useState<Date | null>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [end, setEnd] = useState<Date | null>(today);

  const [data, setData] = useState<TripReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!start || !end) return;

    setLoading(true);

    const res = await fetch(
      `/api/bookkeeping/reports/trips?start=${start.toISOString()}&end=${end.toISOString()}`
    );

    const json = await res.json();
    setData(json);

    setLoading(false);
  };

  return (
    <div className="text-gray-200">
      <h2 className="text-xl font-bold text-yellow-400 mb-4">Matkaraportti</h2>

      {/* Päivämäärät */}
      <div className="bg-black/30 border border-yellow-700/40 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DatePickerField
            selected={start}
            onChange={setStart}
            label="Alkaen"
          />

          <DatePickerField selected={end} onChange={setEnd} label="Päättyen" />
        </div>

        <button
          onClick={fetchReport}
          className="mt-4 bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-md font-semibold"
        >
          Hae matkaraportti
        </button>
      </div>

      {loading && <p className="italic">Ladataan...</p>}

      {/* Yhteenveto */}
      {data && (
        <>
          <div className="bg-black/30 border border-yellow-700/40 p-4 rounded-lg mb-6">
            <h3 className="text-lg text-yellow-400 font-semibold mb-4">
              Yhteenveto
            </h3>

            <div className="flex justify-between py-1">
              <span>Kilometrit yhteensä:</span>
              <span className="text-yellow-400">{data.totalKm} km</span>
            </div>

            <div className="flex justify-between py-1">
              <span>Päivärahat yhteensä:</span>
              <span className="text-yellow-400">
                {data.totalAllowance.toFixed(2)} €
              </span>
            </div>

            {/* Lataa PDF -nappi */}
<div className="mt-4">
  <button
    onClick={async () => {
      if (!start || !end) return;
      const url = `/api/bookkeeping/reports/trips/pdf?start=${start.toISOString()}&end=${end.toISOString()}`;
      window.open(url, "_blank");
    }}
    className="bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-md font-semibold"
  >
    Lataa PDF
  </button>
</div>
          </div>

          {/* Matkat */}
          <div className="bg-black/30 border border-yellow-700/40 p-4 rounded-lg">
            <h3 className="text-lg text-yellow-400 font-semibold mb-4">
              Matkat
            </h3>

            {/* DESKTOP-TAULUKKO */}
            <div className="hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-yellow-400 border-b border-yellow-700/30">
                    <th className="py-2 text-left w-28">Päivä</th>
                    <th className="py-2 text-left w-64">Lähtö → Määränpää</th>
                    <th className="py-2 text-left w-48">Selite</th>
                    <th className="py-2 text-right w-24">Km</th>
                    <th className="py-2 text-right w-24">Päiväraha</th>
                  </tr>
                </thead>

                <tbody>
                  {data.trips.map((t) => (
                    <tr key={t.id} className="border-b border-yellow-700/20">
                      <td className="py-2">{formatDate(t.date)}</td>

                      <td>
                        {t.startAddress} → {t.endAddress}
                      </td>
                      <td className="py-2">{t.notes || "-"}</td>
                      <td className="text-right">{t.kilometers} km</td>
                      <td className="text-right">{t.allowance.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBIILIKORTIT */}
            <div className="sm:hidden space-y-4">
              {data.trips.map((t) => (
                <div
                  key={t.id}
                  className="bg-black/20 border border-yellow-700/30 rounded-lg p-4"
                >
                  <p className="text-yellow-400 font-semibold mb-1">
                    {formatDate(t.date)}
                  </p>

                  <p className="text-gray-300">
                    <span className="font-semibold">Reitti:</span>{" "}
                    {t.startAddress} → {t.endAddress}
                  </p>

                  <p className="text-gray-300">
                    <span className="font-semibold">Selite:</span>{" "}
                    {t.notes || "-"}
                  </p>

                  <div className="flex justify-between mt-3 text-gray-200">
                    <span>{t.kilometers} km</span>
                    <span>{t.allowance.toFixed(2)} €</span>
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
