"use client";

import { useEffect, useState } from "react";

import { Trash2 } from "lucide-react";
import CustomInputField from "@/components/common/CustomInputField";
import CustomSelect from "@/components/common/CustomSelect";

type Product = {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  price: number;
  category: {
    name: string;
  };
};

type UsageRow = {
  productId: number;
  quantity: number;
};

type Props = {
  usages: UsageRow[];
  setUsages: (rows: UsageRow[]) => void;
};

export default function ProductUsageSelector({ usages, setUsages }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);

  // 🔹 Hae vain “Tuote”-kategoriat
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch("/api/bookkeeping/usage?type=stock");
      const json: Product[] = await res.json();

      // ⭐ Suodatetaan vain tuotteet joiden category.name === "Tuote"
      setProducts(json);
    };
    fetchProducts();
  }, []);

  // ➕ Lisää uusi rivi
  const addUsage = () => {
    if (!selected) return;
    const newRow = { productId: selected.id, quantity: qty };
    setUsages([...usages, newRow]);
    setQty(1);
    setSelected(null);
  };

  return (
    <div className="bg-black/30 p-4 border border-yellow-700/40 rounded-lg mb-4">
      {/* Tuote dropdown */}
      <CustomSelect
  label="Käytetty tuote"
  value={selected ? String(selected.id) : ""}
  onChange={(value) => {
    const product = products.find((p) => String(p.id) === value);
    setSelected(product || null);
  }}
  options={products.map((p) => ({
    value: String(p.id),
    label: `${p.name} — ${p.quantity} kpl varastossa — ${p.price.toFixed(2)} €`,
  }))}
/>

      {/* Määrä + lisää */}
      <div className="flex gap-3 items-end mt-4">
        <div className="flex-1">

          <CustomInputField
            id="usage-qty"
            label="Määrä"
            type="number"
            value={String(qty)}
            onChange={(e) => setQty(Number(e.target.value))}
          />
        </div>

        <button
          disabled={!selected}
          onClick={addUsage}
          className="
            bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 
            disabled:text-gray-400 disabled:cursor-not-allowed
            text-black px-4 py-2 rounded-md font-semibold
          "
        >
          Lisää
        </button>
      </div>

      {/* List of added usages */}
      {usages.map((u, i) => {
        const product = products.find((p) => p.id === u.productId);

        return (
          <div
            key={i}
            className="flex justify-between items-center py-1 border-b border-yellow-700/20"
          >
            {/* Tuotteen nimi */}
            <span className="text-gray-200">
              {product?.name ?? `Tuote #${u.productId}`}
            </span>

            <div className="flex items-center gap-4">
              {/* Määrä */}
              <span className="text-gray-400">{u.quantity} kpl</span>

              {/* Poistonappi */}
              <button
                type="button"
                onClick={() => setUsages(usages.filter((x) => x !== u))}
                className="text-red-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
