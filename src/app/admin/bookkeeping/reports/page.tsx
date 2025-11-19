"use client";

import { useState } from "react";
import PeriodReport from "./PeriodReport";
import VATReport from "./VATReport";
import TripReport from "./TripReport";
import StockReport from "./StockReport";

import CustomSelect from "@/components/common/CustomSelect";

export default function ReportsPage() {
  const [selected, setSelected] = useState("period");

  const reportOptions = [
    { value: "period", label: "Tapahtumaraportti" },
    { value: "vat", label: "ALV-raportti" },
    { value: "trips", label: "Matkaraportti" },
    { value: "stock", label: "Varastoraportti" },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl text-yellow-400 font-bold mb-7">
  Raportit
</h1>

      <div className="mb-6">
        <CustomSelect
          label="Valitse raportti"
          options={reportOptions}
          value={selected}
          onChange={(val) => setSelected(val)}
        />
      </div>

      <div>
        {selected === "period" && <PeriodReport />}
        {selected === "vat" && <VATReport />} 
        {selected === "trips" && <TripReport />} 
        {selected === "stock" && <StockReport />} 
      </div>
    </div>
  );
}
