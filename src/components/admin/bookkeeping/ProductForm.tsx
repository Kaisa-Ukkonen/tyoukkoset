"use client";
import { useState } from "react";

type Product = {
  id?: number;
  name: string;
  code?: string;
  category: string;
  hours?: number;
  minutes?: number;
  price: number;
  vatRate: number;
  description?: string;
};

export default function ProductForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: "",
    code: "",
    category: "Tatuointi",
    hours: "",
    minutes: "",
    price: "",
    vatRate: "25.5",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/bookkeeping/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          code: form.code,
          category: form.category,
          hours: parseInt(form.hours || "0"),
          minutes: parseInt(form.minutes || "0"),
          price: parseFloat(form.price),
          vatRate: parseFloat(form.vatRate),
          description: form.description,
        }),
      });

      if (res.ok) {
        setMessage("✅ Tuote lisätty onnistuneesti!");
        setForm({
          name: "",
          code: "",
          category: "Tatuointi",
          hours: "",
          minutes: "",
          price: "",
          vatRate: "25.5",
          description: "",
        });
        onSuccess();
      } else {
        setMessage("❌ Virhe tallennuksessa");
      }
    } catch {
      setMessage("⚠️ Yhteysvirhe tallennuksessa");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-black/40 border border-yellow-700/40 rounded-xl p-6 space-y-4 shadow-[0_0_15px_rgba(0,0,0,0.4)] max-w-2xl mx-auto"
    >
      <h2 className="text-xl font-semibold text-yellow-400 text-center mb-4">
        Lisää uusi tuote
      </h2>

      {message && <p className="text-center text-gray-300">{message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 🔸 Tuotteen nimi ja koodi */}
        <input
          type="text"
          placeholder="Tuotteen nimi"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white focus:border-yellow-400"
          required
        />
        <input
          type="text"
          placeholder="Tuotekoodi"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          className="bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white"
        />

        {/* 🔸 Kategoria */}
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="bg-black/40 border border-yellow-700/40 rounded-md px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
        >
          <option value="Tatuointi">Tatuointi</option>
          <option value="Stand Up">Stand Up</option>
          <option value="Huoltotyö">Huoltotyö</option>
        </select>

        {/* 🔹 Kesto: tunnit ja minuutit */}
        <div className="flex space-x-3 col-span-2 md:col-span-2">
          <div className="w-1/2">
            <label className="block text-sm text-gray-300 mb-1"></label>
            <input
              type="number"
              min="0"
              value={form.hours}
              onChange={(e) => setForm({ ...form, hours: e.target.value })}
              placeholder="Tunnit"
              className="w-full bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
            />
          </div>

          <div className="w-1/2">
            <label className="block text-sm text-gray-300 mb-1"></label>
            <input
              type="number"
              min="0"
              max="59"
              step="5"
              value={form.minutes}
              onChange={(e) => setForm({ ...form, minutes: e.target.value })}
              placeholder="Minuutit"
              className="w-full bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
            />
          </div>
        </div>

        {/* 🔸 Hinta ja ALV */}
        <input
          type="number"
          min="0" // 🔸 Estää negatiiviset luvut
          step="0.01" // 🔸 Sallii desimaalit kuten 0.95 tai 12.50
          placeholder="Yksikön hinta €"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white"
          required
        />

        <select
          value={form.vatRate}
          onChange={(e) => setForm({ ...form, vatRate: e.target.value })}
          className="bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white"
        >
          <option value="25.5">25.5 %</option>
          <option value="14">14 %</option>
          <option value="10">10 %</option>
          <option value="0">0 %</option>
        </select>
      </div>

      {/* 🔸 Kuvaus */}
      <textarea
        placeholder="Kuvaus"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white"
      />

      {/* 🔸 Tallenna */}
      <div className="flex justify-center">
        <button
          disabled={loading}
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2 rounded-md transition disabled:opacity-50"
        >
          {loading ? "Tallennetaan..." : "Tallenna tuote"}
        </button>
      </div>
    </form>
  );
}
