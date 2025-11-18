"use client";

import { useState } from "react";

import PeriodReport from "./PeriodReport";
//import YearlyReport from "./YearlyReport";
//import VATReport from "./VATReport";
//import ProductReport from "./ProductReport";
import TripReport from "./TripReport";
import StockReport from "./StockReport";

export default function ReportsPage() {
  // Näytetään oletuksena aikaväliraportti
  const [selected, setSelected] = useState("period");

  return (
    <div className="max-w-4xl mx-auto mt-8">

      <h1 className="text-2xl text-yellow-400 font-bold mb-4">
        Raportit
      </h1>

      {/* Alasvetovalikko */}
      <div className="mb-6">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="bg-black/60 border border-yellow-700/40 text-gray-200 p-2 rounded-md w-full"
        >
          <option value="period">Aikaväliraportti</option>
          <option value="vat">ALV-raportti</option>
          <option value="products">Tuoteraportti</option>
          <option value="trips">Matkaraportti</option>
          <option value="stock">Varastosaldoraportti</option>
        </select>
      </div>

      {/* Renderöidään valittu raportti */}
      <div>
        {selected === "period" && <PeriodReport />}
        {/* {selected === "yearly" && <YearlyReport />} */}
        {/* {selected === "vat" && <VATReport />} */}
        {/* {selected === "products" && <ProductReport />} */}
        {selected === "trips" && <TripReport />} 
        {selected === "stock" && <StockReport />} 
      </div>

    </div>
  );
}
