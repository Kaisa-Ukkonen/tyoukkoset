"use client";
import { useState } from "react";

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
      {/* 🔹 Nimi ja tuotekoodi */}
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

      {/* 🔹 Kategoria */}
      <select
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        className="bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white"
      >
        <option value="">Valitse tyyppi</option>
        <option value="Palvelu">Palvelu</option>
        <option value="Tuote">Tuote</option>
      </select>

      {/* 🔹 Palvelu: kesto (tunnit/minuutit) */}
      {form.category === "Palvelu" && (
        <div className="flex space-x-3 col-span-2 md:col-span-2">
          <input
            type="number"
            min="0"
            value={form.hours || ""}
            onChange={(e) =>
              setForm({ ...form, hours: parseInt(e.target.value) || 0 })
            }
            placeholder="Tunnit"
            className="w-full bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
          />
          <input
            type="number"
            min="0"
            max="59"
            step="5"
            value={form.minutes || ""}
            onChange={(e) =>
              setForm({ ...form, minutes: parseInt(e.target.value) || 0 })
            }
            placeholder="Minuutit"
            className="w-full bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
          />
        </div>
      )}

      {/* 🔹 Tuote: varasto (kpl) */}
      {form.category === "Tuote" && (
        <input
          type="number"
          min="0"
          value={form.quantity || ""}
          onChange={(e) =>
            setForm({ ...form, quantity: parseInt(e.target.value) || 0 })
          }
          placeholder="Varasto (kpl)"
          className="col-span-2 bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
        />
      )}

      {/* 🔹 ALV sisältyy hintaan */}
      <div className="flex items-center gap-3 col-span-2 md:col-span-1">
        <label className="text-gray-300">ALV sisältyy hintaan</label>
        <button
          type="button"
          onClick={() =>
            setForm({ ...form, vatIncluded: !form.vatIncluded })
          }
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
      <input
        type="number"
        min="0"
        step="0.01"
        placeholder={
          form.category === "Tuote"
            ? "Kappalehinta (sis. ALV) €"
            : "Hinta (sis. ALV) €"
        }
        value={form.price === 0 ? "" : form.price}
        onChange={(e) =>
          setForm({ ...form, price: parseFloat(e.target.value) || 0 })
        }
        className="bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white"
        required
      />

      <select
        value={form.vatRate}
        onChange={(e) =>
          setForm({ ...form, vatRate: parseFloat(e.target.value) })
        }
        className="bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white"
      >
        <option value="25.5">25.5 %</option>
        <option value="14">14 %</option>
        <option value="10">10 %</option>
        <option value="0">0 %</option>
      </select>

      {/* 🔹 Näytä varaston arvo tuotteilla (ei muokattava) */}
      {form.category === "Tuote" && (
        <div className="col-span-2 text-right text-yellow-400 font-semibold">
          Varaston arvo:{" "}
          {((form.quantity || 0) * (form.price || 0)).toFixed(2)} €
        </div>
      )}
    </div>

    {/* 🔹 Kuvaus vain palveluille */}
    {form.category === "Palvelu" && (
      <textarea
        placeholder="Kuvaus"
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
        className="w-full bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white"
      />
    )}

    {/* 🔹 Tallenna */}
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
