"use client";
import { useState,useEffect } from "react";
import CustomSelect from "@/components/common/CustomSelect";
import FieldError from "@/components/common/FieldError";
import CustomInputField from "@/components/common/CustomInputField";

type Product = {
  id?: number;
  name: string;
  code?: string;
  category: string;
  hours?: number;
  minutes?: number;
  quantity?: number;
  price: number | string;
  vatRate: number;
  vatIncluded: boolean;
  description?: string;
  vatHandling: string;
};

export default function ProductForm({
  onSuccess,
  editingProduct,
}: {
  onSuccess: () => void;
  editingProduct?: Product | null;
}) {
   useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        code: editingProduct.code || "",
        category: editingProduct.category,
        hours: editingProduct.hours || 0,
        minutes: editingProduct.minutes || 0,
        quantity: editingProduct.quantity || 0,
        price: editingProduct.price.toString(),
        vatRate: editingProduct.vatRate,
        vatIncluded: editingProduct.vatIncluded,
        description: editingProduct.description || "",
        vatHandling: editingProduct.vatHandling,
      });
    }
  }, [editingProduct]);

  const [form, setForm] = useState<Product>({
    name: "",
    code: "",
    category: "",
    hours: 0,
    minutes: 0,
    quantity: 0,
    price: "",
    vatRate: 25.5,
    vatIncluded: true,
    description: "",
    vatHandling: "Kotimaan verollinen myynti",
  });

  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = "Anna tuotteen nimi";
    if (!form.category)
      newErrors.category = "Valitse tyyppi (tuote tai palvelu)";
    const priceNum = parseFloat(form.price.toString());

    if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = "Anna hinta euroina";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // estää lähetyksen jos virheitä
    }

    setErrors({});
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
          vatRate:
            form.vatHandling === "Kotimaan verollinen myynti"
              ? parseFloat(form.vatRate.toString())
              : 0, // 🔥 UUSI: jos veroton → ALV 0 %
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
          vatHandling: "Kotimaan verollinen myynti",
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
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-yellow-400 text-start mb-4">
        Lisää uusi tuote tai palvelu
      </h2>

      {message && <p className="text-center text-gray-300">{message}</p>}

<div className="grid sm:grid-cols-[1.2fr_1fr] gap-4">
        {/* 🔹 Tuotteen nimi */}
        <div>
          <CustomInputField
            id="name"
            label="Nimi"
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
          />
          <FieldError message={errors.name} />
        </div>

        <CustomInputField
          id="code"
          label="Tuotekoodi"
          value={form.code ?? ""}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
        />

        {/* 🔥 UUSI: ALV-käsittely */}
        <CustomSelect
          label="ALV-käsittely"
          
          value={form.vatHandling}
          onChange={(value) => setForm({ ...form, vatHandling: value })}
          options={[
            {
              value: "Kotimaan verollinen myynti",
              label: "Kotimaan verollinen myynti",
            },
            { value: "Veroton", label: "Veroton" },
            {
              value: "Nollaverokannan myynti",
              label: "Nollaverokannan myynti",
            },
          ]}
        />

        {/* 🔹 Kategoria */}
        <div>
          <CustomSelect
            label="Tyyppi"
            value={form.category}
            onChange={(value) => {
              setForm({ ...form, category: value });
              if (errors.category)
                setErrors((prev) => ({ ...prev, category: "" }));
            }}
            options={[
              { value: "Palvelu", label: "Palvelu" },
              { value: "Tuote", label: "Tuote" },
            ]}
            placeholder="Valitse tyyppi"
          />
          <FieldError message={errors.category} />
        </div>

        {/* 🔹 ALV sisältyy hintaan */}
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

        {/* 🔹 Hinta */}
        <CustomInputField
          id="price"
          label="Kokonaishinta (€)"
          type="text"
          value={form.price === 0 ? "" : form.price.toString()}
          onChange={(e) => {
            const val = e.target.value;

            // Tyhjä sallitaan
            if (val === "") {
              setForm({ ...form, price: "" });
              return;
            }

            // Vain numerot + 0–2 desimaalia
            if (/^\d*([.,]\d{0,2})?$/.test(val)) {
              const formatted = val.replace(",", ".");
              setForm({ ...form, price: formatted });
            }
          }}
        />
        <FieldError message={errors.price} />

        {/* 🔥 ALV % näkyy vain verolliselle */}
        {form.vatHandling === "Kotimaan verollinen myynti" && (
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
        )}
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
               px-8 py-1.5 text-sm rounded-md transition disabled:opacity-50"
        >
          Tallenna
        </button>
      </div>
    </form>
  );
}
