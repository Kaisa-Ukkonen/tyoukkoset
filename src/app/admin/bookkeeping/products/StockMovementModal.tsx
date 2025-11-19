"use client";

import { useState } from "react";
import { X } from "lucide-react";
import CustomInputField from "@/components/common/CustomInputField";
import CustomTextareaField from "@/components/common/CustomTextareaField";

export default function StockMovementModal({
  product,
  onClose,
  onSaved,
}: {
  product: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  };
  onClose: () => void;
  onSaved: () => void;
}) {
  const [change, setChange] = useState<string>("");
  const [note, setNote] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const numericChange = Number(change);

    const res = await fetch("/api/bookkeeping/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        change: numericChange,
        note,
      }),
    });

    if (res.ok) {
      onSaved();
      onClose();
    } else {
      alert("Varaston päivitys epäonnistui.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-black border border-yellow-700/40 rounded-xl p-6 w-full max-w-md">
        {/* 🔹 Otsikko */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-yellow-400 text-lg font-semibold">
            Muuta varastosaldoa — {product.name}
          </h2>

          <button onClick={onClose}>
            <X className="text-gray-300 hover:text-yellow-400" />
          </button>
        </div>

        {/* 🔹 Nykyinen saldo */}
        <div className="text-gray-300 mb-4">
          Nykyinen saldo:{" "}
          <span className="text-yellow-400 font-semibold">
            {product.quantity} kpl
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 🔹 Määrän muutos */}
          <CustomInputField
            id="stock-change"
            type="number"
            label="Määrä"
            value={change}
            onChange={(e) => setChange(e.target.value)}
            
          />
          {/* 🔹 Selite */}
          <CustomTextareaField
            id="stock-note"
            label="Selite"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Esim. Varastotilaus"
          />

          {/* 🔹 Napit */}
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-black/40 text-yellow-400 border border-yellow-700/40 px-6 py-2 rounded-md hover:bg-yellow-700/20"
            >
              Peruuta
            </button>

            <button
              type="submit"
              className="bg-yellow-500 text-black font-semibold px-6 py-2 rounded-md hover:bg-yellow-400"
            >
              Tallenna
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
