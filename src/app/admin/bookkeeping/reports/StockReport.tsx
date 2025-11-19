"use client";

import { useState, useCallback } from "react";
import DatePickerField from "@/components/common/DatePickerField";

type StockRow = {
  id: number;
  name: string;
  archived: boolean;
  initialStock: number;
  added: number;
  used: number;
  finalStock: number;
  unitNet: number;
  unitVat: number;
  unitGross: number;
  netValue: number;
  grossValue: number;
};

type StockReportData = {
  startDate: string;
  endDate: string;
  totalNet: number;
  totalGross: number;
  rows: StockRow[];
  events: {
    date: string;
    product: string;
    quantity: number;
    type: string;
    source: string;
  }[];
};

export default function StockReport() {
  // Oletusarvot viimeinen kuukausi
  const d = new Date();
  const [start, setStart] = useState(() => {
    const tmp = new Date();
    tmp.setMonth(tmp.getMonth() - 1);
    return tmp.toISOString().slice(0, 10);
  });

  const [end, setEnd] = useState(() => d.toISOString().slice(0, 10));

  const [data, setData] = useState<StockReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStock = useCallback(async () => {
    setLoading(true);

    const res = await fetch(
      `/api/bookkeeping/reports/stock?start=${start}&end=${end}&includeArchived=1`
    );
    const json = await res.json();

    setData(json);
    setLoading(false);
  }, [start, end]);

  return (
    <div className="max-w-4xl mx-auto mt-8 text-gray-200">
      <h2 className="text-xl font-bold text-yellow-400 mb-4">
        Varastosaldoraportti
      </h2>

      {/* 🔶 AIKAVÄLI (näkyy aina) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DatePickerField
          label="Alkaen"
          selected={start ? new Date(start) : null}
          onChange={(date) => {
            if (date) setStart(date.toISOString().slice(0, 10));
          }}
        />

        <DatePickerField
          label="Päättyen"
          selected={end ? new Date(end) : null}
          onChange={(date) => {
            if (date) setEnd(date.toISOString().slice(0, 10));
          }}
        />
      </div>

      <button
        onClick={fetchStock}
        className="mt-4 bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-md font-semibold"
      >
        Hae raportti
      </button>

      {loading && <p className="italic">Ladataan...</p>}

      {/* 🔶 NÄYTÄ RAPORTTI VAIN JOS DATA ON HAETTU */}
      {data && !loading && (
        <>
          {/* 🔸 YHTEENVETO */}
          <div className="bg-black/30 border border-yellow-700/40 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-1">
              Varaston kokonaisarvo (brutto, ALV sis.)
            </h3>
            <p className="text-xl font-bold text-yellow-300">
              {data.totalGross.toFixed(2)} €
            </p>

            <h3 className="text-lg font-semibold text-yellow-400 mt-3 mb-1">
              Varaston arvo (veroton)
            </h3>
            <p className="text-xl font-bold text-yellow-300">
              {data.totalNet.toFixed(2)} €
            </p>
          </div>

          {/* 🔸 Desktop-taulukko */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead>
                <tr className="text-yellow-400 border-b border-yellow-700/30">
                  <th className="py-2 text-left">Tuote</th>
                  <th className="py-2 text-right">Alkusaldo</th>
                  <th className="py-2 text-right">Lisäys</th>
                  <th className="py-2 text-right">Käyttö</th>
                  <th className="py-2 text-right">Loppusaldo</th>
                  <th className="py-2 text-right">Netto/kpl</th>
                  <th className="py-2 text-right">ALV/kpl</th>
                  <th className="py-2 text-right">Brutto/kpl</th>
                  <th className="py-2 text-right">Varaston arvo (brutto)</th>
                </tr>
              </thead>

              <tbody>
                {data.rows.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-b border-yellow-700/20 ${
                      p.archived ? "opacity-50" : ""
                    }`}
                  >
                    <td className="py-2">{p.name}</td>
                    <td className="text-right">{p.initialStock}</td>
                    <td className="text-right">{p.added}</td>
                    <td className="text-right">-{p.used}</td>
                    <td className="text-right">{p.finalStock}</td>
                    <td className="text-right">{p.unitNet.toFixed(2)} €</td>
                    <td className="text-right">{p.unitVat.toFixed(2)} €</td>
                    <td className="text-right">{p.unitGross.toFixed(2)} €</td>
                    <td className="text-right font-semibold text-yellow-300">
                      {p.grossValue.toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🔸 Mobile-kortit */}
          <div className="sm:hidden space-y-4">
            {data.rows.map((p) => (
              <div
                key={p.id}
                className={`border border-yellow-700/30 bg-black/20 p-4 rounded-lg ${
                  p.archived ? "opacity-50" : ""
                }`}
              >
                <p className="text-yellow-400 font-semibold mb-1">{p.name}</p>

                <p>Alkusaldo: {p.initialStock}</p>
                <p>Lisäys: {p.added}</p>
                <p>Käyttö: -{p.used}</p>
                <p>Loppusaldo: {p.finalStock}</p>

                <p>Netto/kpl: {p.unitNet.toFixed(2)} €</p>
                <p>ALV/kpl: {p.unitVat.toFixed(2)} €</p>
                <p>Brutto/kpl: {p.unitGross.toFixed(2)} €</p>

                <p className="mt-2 font-semibold text-yellow-300">
                  Arvo (brutto): {p.grossValue.toFixed(2)} €
                </p>
              </div>
            ))}
          </div>

          {/* 🔶 VARASTOTAPAHTUMAT */}
          <div className="bg-black/30 border border-yellow-700/40 p-4 rounded-lg mt-10">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">
              Varastotapahtumat (aikavälillä)
            </h3>

            {/* Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[850px] text-sm">
                <thead>
                  <tr className="text-yellow-400 border-b border-yellow-700/30">
                    <th className="py-2 text-left w-32">Päivä</th>
                    <th className="py-2 text-left w-40">Tuote</th>
                    <th className="py-2 text-left w-40">Tyyppi</th>
                    <th className="py-2 text-right w-20">Määrä</th>
                    <th className="py-2 text-left w-40">Lähde</th>
                  </tr>
                </thead>

                <tbody>
                  {data.events.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-4 text-gray-400 italic text-center"
                      >
                        Ei tapahtumia valitulla aikavälillä.
                      </td>
                    </tr>
                  )}

                  {data.events.map((e, i) => (
                    <tr key={i} className="border-b border-yellow-700/20">
                      <td className="py-2">
                        {new Date(e.date).toLocaleDateString("fi-FI")}
                      </td>

                      <td>{e.product}</td>
                      <td>{e.type}</td>

                      <td
                        className={
                          "text-right font-semibold " +
                          (e.quantity > 0
                            ? "text-green-400"
                            : e.quantity < 0
                            ? "text-red-400"
                            : "text-gray-300")
                        }
                      >
                        {e.quantity > 0 ? `+${e.quantity}` : e.quantity}
                      </td>

                      <td className="pl-4">{e.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobiili */}
            <div className="sm:hidden space-y-4">
              {data.events.length === 0 && (
                <p className="text-gray-400 italic">
                  Ei tapahtumia valitulla aikavälillä.
                </p>
              )}

              {data.events.map((e, i) => (
                <div
                  key={i}
                  className="bg-black/20 border border-yellow-700/30 p-4 rounded-lg"
                >
                  <p className="text-yellow-400 font-semibold mb-1">
                    {new Date(e.date).toLocaleDateString("fi-FI")}
                  </p>

                  <p>
                    <strong>Tuote:</strong> {e.product}
                  </p>
                  <p>
                    <strong>Tyyppi:</strong> {e.type}
                  </p>
                  <p>
                    <strong>Määrä:</strong>{" "}
                    {e.quantity > 0 ? `+${e.quantity}` : e.quantity}
                  </p>
                  <p>
                    <strong>Lähde:</strong> {e.source}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
