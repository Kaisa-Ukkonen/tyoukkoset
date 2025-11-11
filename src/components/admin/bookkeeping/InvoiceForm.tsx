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
  netPrice?: number; // ✅ lisätty kenttä (veroton hinta)
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

export type InvoiceLineData = InvoiceLine & {
  product?: Product | null;
};

export type InvoiceFormData = {
  id?: number;
  
  date: Date;
  dueDate: Date;
  paymentTerm: number;
  customerId: number | null;
  customCustomer: string;
  notes: string;
  lines: InvoiceLineData[];
  netAmount: number;
  vatAmount: number;
  totalAmount: number;
  vatRate: number;
};

export default function InvoiceForm({
  onSaved,
  onCancel,
}: {
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<InvoiceFormData>({
    
    date: new Date(),
    dueDate: new Date(),
    paymentTerm: 14,
    customerId: null,
    customCustomer: "",
    notes: "",
    lines: [],
    netAmount: 0,
    vatAmount: 0,
    totalAmount: 0,
    vatRate: 24,
  });

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

  // 🔹 Päivitä laskurivin tiedot ja summat
  const updateLine = (index: number, updated: Partial<InvoiceLine>) => {
    setForm((prev) => {
      const lines = [...prev.lines];
      lines[index] = { ...lines[index], ...updated };

      const net = lines.reduce(
        (sum, l) => sum + (l.unitPrice / (1 + l.vatRate / 100)) * l.quantity,
        0
      );
      const vat = lines.reduce(
        (sum, l) =>
          sum +
          (l.unitPrice - l.unitPrice / (1 + l.vatRate / 100)) * l.quantity,
        0
      );
      const total = net + vat;

      return {
        ...prev,
        lines,
        netAmount: net,
        vatAmount: vat,
        totalAmount: total,
      };
    });
  };
  // 🔹 Päivitä eräpäivä automaattisesti maksuehdon mukaan
  useEffect(() => {
    if (!form.date || !form.paymentTerm) return;
    const calculatedDueDate = new Date(form.date);
    calculatedDueDate.setDate(calculatedDueDate.getDate() + form.paymentTerm);

    if (form.dueDate.getTime() !== calculatedDueDate.getTime()) {
      queueMicrotask(() =>
        setForm((prev) => ({ ...prev, dueDate: calculatedDueDate }))
      );
    }
  }, [form.date, form.paymentTerm, form.dueDate]);

  // 🔹 Lähetä lomake
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Muodosta lähetettävä lasku selkeästi backendin odottamaan muotoon
    const payload = {
      ...form,
      lines: form.lines.map((line) => ({
        productId: line.productId || null,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        vatRate: line.vatRate,
        total: line.unitPrice * line.quantity, // laske varmuuden vuoksi backendille
      })),
    };

    console.log("📤 Lähetettävä lasku:", payload);
    

    const response = await fetch("/api/bookkeeping/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      
    });

    if (response.ok) {
      onSaved();
    } else {
      console.error("❌ Virhe tallennettaessa laskua");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-black/40 border border-yellow-700/40 rounded-xl p-6 mb-10 space-y-6"
    >
      <h2 className="text-xl text-yellow-400 font-semibold">Uusi lasku</h2>


      {/* 🔹 Laskun perustiedot */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">


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
          options={contacts.map((c) => ({
            value: String(c.id),
            label: c.name,
          }))}
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
                    if (!product) return;

                    // ✅ Käytetään ensisijaisesti tuotteen verotonta hintaa
                    // Jos sitä ei ole, lasketaan se kokonaishinnasta ja ALV:sta
                    const netPrice =
                      product.netPrice ??
                      product.price / (1 + product.vatRate / 100);

                    setForm((prev) => {
                      const newLines = [...prev.lines];
                      newLines[index] = {
                        ...newLines[index],
                        productId: product.id,
                        description: product.name,
                        unitPrice: netPrice, // 🔹 nyt veroton hinta
                        vatRate: product.vatRate,
                        total: netPrice * (1 + product.vatRate / 100), // ALV lisätään vain näyttöön
                      };

                      // 🔹 Päivitä summat automaattisesti
                      const net = newLines.reduce(
                        (sum, l) => sum + l.unitPrice * l.quantity,
                        0
                      );
                      const vat = newLines.reduce(
                        (sum, l) =>
                          sum + l.unitPrice * (l.vatRate / 100) * l.quantity,
                        0
                      );
                      const total = net + vat;

                      return {
                        ...prev,
                        lines: newLines,
                        netAmount: net,
                        vatAmount: vat,
                        totalAmount: total,
                      };
                    });
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
                <label className="text-gray-300 text-sm">A-hinta</label>
                <input
                  type="number"
                  step="0.01"
                  value={Number(line.unitPrice).toFixed(2)}
                  onChange={(e) =>
                    updateLine(index, {
                      unitPrice:
                        parseFloat(Number(e.target.value).toFixed(2)) || 0,
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

              {/* 🔹 Rivin yhteissumma (sis. ALV) */}
              <div className="flex flex-col items-end justify-center text-right">
                <label className="text-xs text-yellow-500 uppercase tracking-wide mb-1">
                  Yhteensä (sis. ALV)
                </label>
                <div className="border border-yellow-600/60 rounded-md px-3 py-1 text-yellow-300 font-semibold min-w-[110px] text-right">
                  {(
                    line.unitPrice *
                    line.quantity *
                    (1 + line.vatRate / 100)
                  ).toFixed(2)}{" "}
                  €
                </div>
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
