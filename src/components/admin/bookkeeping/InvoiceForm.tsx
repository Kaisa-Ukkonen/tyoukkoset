"use client";

import { useState, useEffect } from "react";
import CustomSelect from "@/components/common/CustomSelect";
import DatePickerField from "@/components/common/DatePickerField";
import { Plus, Trash2 } from "lucide-react";

type Contact = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  price: number;
  vatRate: number;
};

type InvoiceLine = {
  id?: number;
  productId?: number | null;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
};

export type InvoiceLineData = {
  id?: number;
  productId?: number | null;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;

  // ✅ Tämä lisätään
  product?: {
    id: number;
    name: string;
    price: number;
    vatRate: number;
  } | null;
};

export type InvoiceFormData = {
  id?: number;
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  paymentTerm: number;
  customerId: number | null;
  customCustomer: string;
  notes: string;
  lines: InvoiceLineData[]; // ✅ tämä kertoo mitä "lines" sisältää
  netAmount: number;
  vatAmount: number;
  totalAmount: number;
  vatRate: number;
};

export default function InvoiceForm({
  onSaved,
  onCancel,
  editData,
}: {
  onSaved: () => void;
  onCancel: () => void;
  editData?: InvoiceFormData | null;
}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<InvoiceFormData>(
    editData ?? {
      id: undefined,
      invoiceNumber: "",
      date: new Date(),
      dueDate: new Date(),
      paymentTerm: 14,
      customerId: null,
      customCustomer: "",
      notes: "",
      lines: [], // ✅ tyhjä taulukko oikealla tyypillä
      netAmount: 0,
      vatAmount: 0,
      totalAmount: 0,
      vatRate: 24,
    }
  );
  // ✅ Kun tuotteet on ladattu ja muokataan laskua
  useEffect(() => {
    if (editData && products.length > 0) {
      const timer = setTimeout(() => {
        setForm((prev) => ({
          ...prev,
          lines: editData.lines.map((line) => {
            const product = products.find((p) => p.id === line.productId);
            return {
              ...line,
              productId: line.productId ?? product?.id ?? null,
              description: line.description || product?.name || "",
              unitPrice: line.unitPrice ?? product?.price ?? 0,
              vatRate: line.vatRate ?? product?.vatRate ?? 24,
              total:
                line.total ??
                (product
                  ? product.price * (1 + (product.vatRate ?? 24) / 100)
                  : 0),
            };
          }),
        }));
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [editData, products]);

  // 🔹 Hae kontaktit ja tuotteet
  useEffect(() => {
    const fetchData = async () => {
      const [contactsRes, productsRes] = await Promise.all([
        fetch("/api/bookkeeping/contacts"),
        fetch("/api/bookkeeping/products"),
      ]);
      setContacts(await contactsRes.json());
      setProducts(await productsRes.json());
    };
    fetchData();
  }, []);

  // 🔹 Lisää laskurivi
  const addLine = () => {
    setForm({
      ...form,
      lines: [
        ...form.lines,
        { description: "", quantity: 1, unitPrice: 0, vatRate: 24, total: 0 },
      ],
    });
  };

  // 🔹 Poista laskurivi
  const removeLine = (index: number) => {
    setForm({
      ...form,
      lines: form.lines.filter((_, i) => i !== index),
    });
  };

  // 🔹 Päivitä laskurivin tiedot
  const updateLine = (index: number, updated: Partial<InvoiceLine>) => {
    const lines = [...form.lines];
    lines[index] = { ...lines[index], ...updated };

    // 🔹 Jos halutaan että hinta sisältää ALV:n
    const net = lines.reduce(
      (sum, l) => sum + (l.unitPrice / (1 + l.vatRate / 100)) * l.quantity,
      0
    );
    const vat = lines.reduce(
      (sum, l) =>
        sum + (l.unitPrice - l.unitPrice / (1 + l.vatRate / 100)) * l.quantity,
      0
    );
    const total = net + vat;

    setForm({
      ...form,
      lines,
      netAmount: net,
      vatAmount: vat,
      totalAmount: total,
    });
  };


  useEffect(() => {
    if (!form.date || !form.paymentTerm) return;

    const calculatedDueDate = new Date(form.date);
    calculatedDueDate.setDate(calculatedDueDate.getDate() + form.paymentTerm);

    if (form.dueDate.getTime() !== calculatedDueDate.getTime()) {
      queueMicrotask(() => {
        setForm((prev) => ({ ...prev, dueDate: calculatedDueDate }));
      });
    }
}, [form.date, form.paymentTerm, form.dueDate]);

  // 🔹 Lähetä lomake
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/bookkeeping/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form), // ✅ Tämä sisältää myös id:n
    });

    if (response.ok) {
      onSaved();
    } else {
      console.error("Virhe tallennettaessa laskua");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-black/40 border border-yellow-700/40 rounded-xl p-6 mb-10 space-y-6"
    >
      <h2 className="text-xl text-yellow-400 font-semibold">
        {editData ? "Muokkaa laskua" : "Uusi lasku"}
      </h2>

      {/* 🔹 Laskun perustiedot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-gray-300 text-sm">Laskun numero</label>
          <input
            type="text"
            value={form.invoiceNumber}
            onChange={(e) =>
              setForm({ ...form, invoiceNumber: e.target.value })
            }
            className="w-full bg-black/40 border border-yellow-700/40 rounded-md p-2 text-white"
          />
        </div>

        <DatePickerField
          label="Laskun päivämäärä"
          selected={form.date}
          onChange={(date) => setForm({ ...form, date: date as Date })}
        />

        <DatePickerField
          label="Eräpäivä"
          selected={form.dueDate}
          onChange={(date) => setForm({ ...form, dueDate: date as Date })}
        />

        <div>
          <label className="text-gray-300 text-sm">Maksuehto (päivää)</label>
          <input
            type="number"
            value={form.paymentTerm}
            onChange={(e) =>
              setForm({ ...form, paymentTerm: parseInt(e.target.value) })
            }
            className="w-full bg-black/40 border border-yellow-700/40 rounded-md p-2 text-white"
          />
        </div>

        {/* 🔹 Asiakas */}
        <CustomSelect
          label="Asiakas (valitse tai kirjoita nimi)"
          value={form.customerId ? String(form.customerId) : ""}
          onChange={(value) => {
            const selected = contacts.find((c) => String(c.id) === value);
            if (selected) {
              setForm({
                ...form,
                customerId: selected.id,
                customCustomer: "",
              });
            } else {
              setForm({ ...form, customerId: null, customCustomer: value });
            }
          }}
          options={[
            ...contacts.map((c) => ({ value: String(c.id), label: c.name })),
          ]}
        />
      </div>

      {/* 🔹 Laskurivit */}
      <div>
        <h3 className="text-yellow-400 font-semibold mb-2">Laskurivit</h3>
        <div className="space-y-3">
          {form.lines.map((line, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-center bg-black/30 p-3 rounded-md border border-yellow-700/30"
            >
              <div className="sm:col-span-2">
                <CustomSelect
                  label="Tuote"
                  value={line.productId ? String(line.productId) : ""}
                  onChange={(value) => {
                    const product = products.find(
                      (p) => String(p.id) === value
                    );
                    if (product) {
                      updateLine(index, {
                        productId: product.id,
                        description: product.name,
                        unitPrice: product.price,
                        vatRate: product.vatRate,
                        total:
                          product.price +
                          product.price * (product.vatRate / 100),
                      });
                    }
                  }}
                  options={products.map((p) => ({
                    value: String(p.id),
                    label: p.name,
                  }))}
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm">Määrä</label>
                <input
                  type="number"
                  value={line.quantity}
                  onChange={(e) =>
                    updateLine(index, {
                      quantity: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-black/40 border border-yellow-700/40 rounded-md p-2 text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm">Hinta (€)</label>
                <input
                  type="number"
                  value={line.unitPrice}
                  onChange={(e) =>
                    updateLine(index, {
                      unitPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-black/40 border border-yellow-700/40 rounded-md p-2 text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm">ALV %</label>
                <input
                  type="number"
                  value={line.vatRate}
                  onChange={(e) =>
                    updateLine(index, {
                      vatRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-black/40 border border-yellow-700/40 rounded-md p-2 text-white"
                />
              </div>

              <div className="text-right font-semibold text-yellow-300">
                {(line.unitPrice * line.quantity).toFixed(2)} €
              </div>

              <button
                type="button"
                onClick={() => removeLine(index)}
                className="text-red-500 hover:text-red-400 ml-auto"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addLine}
          className="flex items-center gap-2 mt-3 text-yellow-400 hover:text-yellow-300"
        >
          <Plus size={18} /> Lisää rivi
        </button>
      </div>

      {/* 🔹 Yhteenveto */}
      <div className="border-t border-yellow-700/30 pt-3 flex justify-end gap-10 text-sm text-gray-300">
        <div>
          <span className="text-gray-400">Veroton: </span>
          {form.netAmount.toFixed(2)} €
        </div>
        <div>
          <span className="text-gray-400">ALV: </span>
          {form.vatAmount.toFixed(2)} €
        </div>
        <div className="text-yellow-300 font-semibold">
          Yhteensä: {form.totalAmount.toFixed(2)} €
        </div>
      </div>

      {/* 🔹 Toimintopainikkeet */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300"
        >
          Peruuta
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-md text-black font-semibold"
        >
          Tallenna lasku
        </button>
      </div>
    </form>
  );
}
