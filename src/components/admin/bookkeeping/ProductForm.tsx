"use client";
import { useState } from "react";
import CustomSelect from "@/components/common/CustomSelect";

type Product = {
  id?: number;
  name: string;
  code?: string;
  category: string;
  hours?: number;
  minutes?: number;
  quantity?: number;
  price: number;
  vatRate: number;
  vatIncluded: boolean;
  description?: string;
};

export default function ProductForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState<Product>({
    name: "",
    code: "",
    category: "",
    hours: 0,
    minutes: 0,
    quantity: 0,
    price: 0,
    vatRate: 25.5,
    vatIncluded: true,
    description: "",
  });

 
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage(null);

    try {
      const res = await fetch("/api/bookkeeping/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          hours: parseInt(form.hours?.toString() || "0"),
          minutes: parseInt(form.minutes?.toString() || "0"),
          quantity: parseInt(form.quantity?.toString() || "0"),
          price: parseFloat(form.price.toString()),
          vatRate: parseFloat(form.vatRate.toString()),
        }),
      });

      if (res.ok) {
        setMessage("✅ Tuote lisätty onnistuneesti!");
        setForm({
          name: "",
          code: "",
          category: "",
          hours: 0,
          minutes: 0,
          quantity: 0,
          price: 0,
          vatRate: 25.5,
          vatIncluded: true,
          description: "",
        });
        onSuccess();
      } else {
        setMessage("❌ Virhe tallennuksessa");
      }
    } catch {
      setMessage("⚠️ Yhteysvirhe tallennuksessa");
    } finally {

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
        {/* 🔹 Tuotteen nimi ja tuotekoodi */}
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

        {/* 🔹 Kategoria (CustomSelect) */}
        <CustomSelect
          label="Tyyppi"
          value={form.category}
          onChange={(val) => setForm({ ...form, category: val })}
          options={[
            { value: "", label: "Valitse tyyppi" },
            { value: "Palvelu", label: "Palvelu" },
            { value: "Tuote", label: "Tuote" },
          ]}
        />

        {/* 🔹 ALV sisältyy hintaan - toggle */}
        <div className="flex items-center gap-3">
          <label className="text-gray-300">ALV sisältyy hintaan</label>
          <button
            type="button"
            onClick={() => setForm({ ...form, vatIncluded: !form.vatIncluded })}
            className={`w-12 h-6 rounded-full transition-colors duration-300 ${
              form.vatIncluded ? "bg-yellow-500" : "bg-gray-600"
            } relative`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
                form.vatIncluded ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* 🔹 Hinta ja ALV */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Kokonaishinta (sis. ALV)
          </label>
          <input
            type="number"
            placeholder="Hinta..."
            min="0"
            step="0.01"
            value={form.price === 0 ? "" : form.price}
            onChange={(e) =>
              setForm({ ...form, price: parseFloat(e.target.value) || 0 })
            }
            className="w-full bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white focus:border-yellow-400"
            required
          />
        </div>

        {/* 🔹 ALV-valikko (CustomSelect) */}
        <CustomSelect
          label="ALV (%)"
          value={form.vatRate.toString()}
          onChange={(val) => setForm({ ...form, vatRate: parseFloat(val) })}
          options={[
            { value: "25.5", label: "25.5 %" },
            { value: "14", label: "14 %" },
            { value: "10", label: "10 %" },
            { value: "0", label: "0 %" },
          ]}
        />
      </div>

      {/* 🔹 Kesto (vain palvelu) */}
      {form.category === "Palvelu" && (
        <div className="flex space-x-3">
          <input
            type="number"
            min="0"
            placeholder="Tunnit"
            value={form.hours || ""}
            onChange={(e) =>
              setForm({ ...form, hours: parseInt(e.target.value) || 0 })
            }
            className="w-full bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white focus:border-yellow-400"
          />
          <input
            type="number"
            min="0"
            max="59"
            step="5"
            placeholder="Minuutit"
            value={form.minutes || ""}
            onChange={(e) =>
              setForm({ ...form, minutes: parseInt(e.target.value) || 0 })
            }
            className="w-full bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white focus:border-yellow-400"
          />
        </div>
      )}

      {/* 🔹 Varasto (vain tuote) */}
      {form.category === "Tuote" && (
        <input
          type="number"
          min="0"
          placeholder="Varasto (kpl)"
          value={form.quantity || ""}
          onChange={(e) =>
            setForm({ ...form, quantity: parseInt(e.target.value) || 0 })
          }
          className="w-full bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white focus:border-yellow-400"
        />
      )}

      {/* 🔹 Kuvaus (vain palvelu) */}
      {form.category === "Palvelu" && (
        <textarea
          placeholder="Kuvaus"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white focus:border-yellow-400"
        />
      )}

      <div className="flex justify-end gap-4">
        {/* 🔹 Peruuta */}
        <button
          type="button"
          onClick={() => window.location.reload()} // tai jos haluat vain sulkea lomakkeen, korvaa myöhemmin onCancel-propilla
          className="bg-black/40 hover:bg-yellow-700/20 text-yellow-400 
               border border-yellow-700/40 font-semibold 
               px-7 py-2 rounded-md transition"
        >
          Peruuta
        </button>
        {/* 🔹 Tallenna */}
        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold 
               px-3 py-1.5 text-sm rounded-md transition disabled:opacity-50"
        >
          Tallenna tuote
        </button>
      </div>
    </form>
  );
}
