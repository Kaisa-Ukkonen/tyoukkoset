"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";


type DashboardTotals = {
  inventoryCount: number;
  inventoryValue: number;
  monthlySales: number;
  tattoosThisYear: number;
  standupGigsThisYear: number;
};

type SalesByMonth = {
  month: string;
  total: number;
};

type TopProduct = {
  name: string;
  quantity: number;
};

type DashboardCharts = {
  salesByMonth: SalesByMonth[];
  topProducts: TopProduct[];
};

type DashboardResponse = {
  totals: DashboardTotals;
  charts: DashboardCharts;
};

const CustomTooltip = (props: unknown) => {
  const { active, payload, label } = props as {
    active?: boolean;
    label?: string | number;
    payload?: Array<{
      dataKey: string;
      value: number;
    }>;
  };

  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0];

  return (
    <div
      style={{
        backgroundColor: "rgba(0,0,0,0.8)",
        border: "1px solid #facc15",
        borderRadius: 6,
        padding: "8px 12px",
        color: "#facc15",
      }}
    >
      <p style={{ margin: 0, fontWeight: "bold", color: "#fff" }}>{label}</p>

      <p style={{ margin: 0 }}>
        {item.dataKey === "total"
          ? `Myynti: ${item.value.toFixed(2)} €`
          : `Varastosaldo: ${item.value} kpl`}
      </p>
    </div>
  );
};

export default function BookkeepingDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const res = await fetch("/api/bookkeeping/dashboard");
      const json = await res.json();
      setData(json);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading || !data) {
    return <div className="text-center text-gray-300 mt-20">Ladataan...</div>;
  }

  const { totals, charts } = data;

  return (
    <main className="text-white p-6 max-w-4xl mx-auto">
      {/* Otsikko */}
      <h1 className="text-3xl font-bold text-yellow-400 mb-2 text-center">
        Kirjanpidon dashboard
      </h1>
      <p className="text-gray-400 mb-10 text-center">
        Yleiskatsaus yrityksen tilanteeseen yhdellä silmäyksellä.
      </p>

      {/* Kortit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {/* Varaston yhteismäärä */}
        <div className="bg-black/40 border border-yellow-700/40 p-5 rounded-xl shadow-lg">
          <p className="text-gray-400 text-sm">Varaston tuotteet</p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">
            {totals.inventoryCount} kpl
          </p>
        </div>

        {/* Varaston arvo */}
        <div className="bg-black/40 border border-yellow-700/40 p-5 rounded-xl shadow-lg">
          <p className="text-gray-400 text-sm">Varaston arvo</p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">
            {totals.inventoryValue.toFixed(2)} €
          </p>
        </div>

        {/* Tämän kuukauden myynti */}
        <div className="bg-black/40 border border-yellow-700/40 p-5 rounded-xl shadow-lg">
          <p className="text-gray-400 text-sm">Myynti (tässä kuussa)</p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">
            {totals.monthlySales.toFixed(2)} €
          </p>
        </div>

        {/* Tatuoinnit & Keikat */}
        <div className="bg-black/40 border border-yellow-700/40 p-5 rounded-xl shadow-lg">
          <p className="text-gray-400 text-sm">Tatuoinnit & Keikat (vuosi)</p>
          <p className="text-xl font-bold text-yellow-400 mt-2">
            ✒️ {totals.tattoosThisYear} tatuointia
          </p>
          <p className="text-xl font-bold text-yellow-400">
            🎤 {totals.standupGigsThisYear} keikkaa
          </p>
        </div>
      </div>

      {/* Myyntikaavio */}
      <div className="bg-black/40 border border-yellow-700/40 p-5 rounded-xl shadow-lg mb-10">
        <h2 className="text-xl font-semibold text-yellow-400 mb-4">
          Myynti viimeisen 12 kuukauden aikana
        </h2>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={charts.salesByMonth}>
            <XAxis dataKey="month" stroke="#aaa" />
            <YAxis stroke="#aaa" />
           <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#facc15"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Varaston Top 5 */}
      <div className="bg-black/40 border border-yellow-700/40 p-5 rounded-xl shadow-lg mb-10">
        <h2 className="text-xl font-semibold text-yellow-400 mb-4">
          Varaston Top 5 tuotteet
        </h2>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={charts.topProducts}>
            <XAxis dataKey="name" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip
  content={<CustomTooltip />}
  cursor={{ fill: "rgba(0,0,0,0.25)" }}   // tumma hover
/>
<Bar dataKey="Varastosaldo" fill="#facc15" radius={[8,8,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
