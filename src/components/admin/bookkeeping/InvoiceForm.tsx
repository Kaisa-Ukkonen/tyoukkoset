"use client";

import { useState, useEffect } from "react";
import CustomSelect from "@/components/common/CustomSelect";
import DatePickerField from "@/components/common/DatePickerField";
import CustomInputField from "@/components/common/CustomInputField";
import { Plus, Trash2 } from "lucide-react";
import FieldError from "@/components/common/FieldError";

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
  vatIncluded: boolean;
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
const [fieldErrors, setFieldErrors] = useState<{ customer?: string; product?: string }>({});
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
  const updateLine = (
    index: number,
    updated: Partial<InvoiceLine>,
    isGrossInput: boolean = false // 🔹 uusi valinnainen parametri
  ) => {
    setForm((prev) => {
      const lines = [...prev.lines];
      lines[index] = { ...lines[index], ...updated };

      let netTotal = 0;
      let vatTotal = 0;
      let grossTotal = 0;

      lines.forEach((l) => {
        const product = products.find((p) => p.id === l.productId);
        const vatIncluded = product?.vatIncluded ?? true;

        // 🔹 jos käyttäjä syötti bruttosumman (Yhteensä € -kenttä)
        // käytetään l.total sellaisenaan
        const lineTotal = isGrossInput ? l.total : l.unitPrice * l.quantity;

        if (vatIncluded) {
          const net = lineTotal / (1 + l.vatRate / 100);
          const vat = lineTotal - net;
          netTotal += net;
          vatTotal += vat;
          grossTotal += lineTotal;
        } else {
          const vat = (lineTotal * l.vatRate) / 100;
          netTotal += lineTotal;
          vatTotal += vat;
          grossTotal += lineTotal + vat;
        }
      });

      return {
        ...prev,
        lines,
        netAmount: netTotal,
        vatAmount: vatTotal,
        totalAmount: grossTotal,
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
  // 🔹 Lähetä lomake
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault(); // Estetään lomakkeen oletustoiminto heti alussa

  // 🔹 Tyhjennetään aiemmat virheet ennen tarkistuksia
  setFieldErrors({});

  // 🔹 Tarkista, että asiakas on valittu
  if (!form.customerId && !form.customCustomer.trim()) {
    setFieldErrors({ customer: "Valitse asiakas." });
    return;
  }

  // 🔹 Tarkista, että vähintään yksi tuote on valittu
  const invalidLine = form.lines.some((line) => !line.productId);
  if (invalidLine || form.lines.length === 0) {
    setFieldErrors({ product: "Valitse vähintään yksi tuote." });
    return;
  }

  // ✅ Muodosta lähetettävä lasku backendin odottamaan muotoon
  const payload = {
    ...form,
    lines: form.lines.map((line) => ({
      productId: line.productId || null,
      description: line.description,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      vatRate: line.vatRate,
      total: line.unitPrice * line.quantity,
    })),
  };

  console.log("📤 Lähetettävä lasku:", payload);

  // 🔹 Lähetä tiedot backendille
  try {
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
  } catch (error) {
    console.error("⚠️ Yhteysvirhe tallennuksessa:", error);
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
        {/* 🔹 Laskun päivämäärä */}
        <DatePickerField
          label="Laskun päivämäärä"
          selected={form.date}
          onChange={(date) => {
            const newDate = date as Date;
            setForm({
              ...form,
              date: newDate,
              dueDate: new Date(
                newDate.getTime() + form.paymentTerm * 24 * 60 * 60 * 1000
              ),
            });
          }}
        />

        {/* 🔹 Eräpäivä + maksuehto vierekkäin */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <DatePickerField
              label="Eräpäivä"
              selected={form.dueDate}
              onChange={(date) => setForm({ ...form, dueDate: date as Date })}
            />
          </div>
          <div className="col-span-1">
            <CustomInputField
              id="paymentTerm"
              label="Maksuehto (pv)"
              type="number"
              value={form.paymentTerm.toString()}
              onChange={(e) => {
                const newTerm = parseInt(e.target.value) || 0;
                setForm({
                  ...form,
                  paymentTerm: newTerm,
                  dueDate: new Date(
                    new Date(form.date).getTime() +
                      newTerm * 24 * 60 * 60 * 1000
                  ),
                });
              }}
            />
          </div>
        </div>

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
              setFieldErrors({}); // poista virhe jos korjataan
            } else {
              setForm({ ...form, customerId: null, customCustomer: value });
            }
          }}
          options={contacts.map((c) => ({
            value: String(c.id),
            label: c.name,
          }))}
        />
        <FieldError message={fieldErrors.customer} />
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
              {/* 🔸 Tuote */}
              <div className="sm:col-span-2">
                
                <CustomSelect
                
                  label="Tuote"
                  
                  value={line.productId ? String(line.productId) : ""}
                  onChange={(value) => {
                    const product = products.find(
                      (p) => String(p.id) === value
                    );
                    if (!product) return;

                    const vatIncluded = product.vatIncluded;
                    const unitPrice = vatIncluded
                      ? product.price / (1 + product.vatRate / 100) // jos hinta sis. alv → laske veroton
                      : product.price; // jos ei sis. alv → suoraan

                    setForm((prev) => {
                      const newLines = [...prev.lines];
                      newLines[index] = {
                        ...newLines[index],
                        productId: product.id,
                        description: product.name,
                        unitPrice: unitPrice,
                        vatRate: product.vatRate,
                        total: vatIncluded
                          ? product.price // verollinen
                          : product.price * (1 + product.vatRate / 100), // veroton → lisää alv
                      };

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
                {fieldErrors.product && <FieldError message={fieldErrors.product} />}
              </div>

              {/* 🔸 Määrä (vain luettavissa) */}
              <CustomInputField
                id={`qty-${index}`}
                label="Määrä"
                type="number"
                value={line.quantity.toString()}
                onChange={() => {}}
                readOnly
              />

              {/* 🔸 A-hinta (€) (vain luettavissa) */}
              <CustomInputField
                id={`price-${index}`}
                label="A-hinta (€)"
                type="text"
                value={Number(line.unitPrice).toFixed(2) + " €"}
                onChange={() => {}}
                readOnly
              />

              {/* 🔸 ALV % (vain luettavissa) */}
              <CustomInputField
                id={`vat-${index}`}
                label="ALV %"
                type="number"
                value={line.vatRate.toString()}
                onChange={() => {}}
                readOnly
              />

              {/* 🔸 Yhteensä (€) — muokattava */}
              <CustomInputField
                id={`total-${index}`}
                label="Yhteensä (€)"
                type="number"
                step="0.01"
                min="0"
                value={line.total.toFixed(2)}
                onChange={(e) => {
                  const newTotal = Math.max(parseFloat(e.target.value) || 0, 0);

                  const product = products.find((p) => p.id === line.productId);
                  const vatIncluded = product?.vatIncluded ?? true;

                  let unitPrice = 0;

                  if (vatIncluded) {
                    unitPrice = newTotal / (1 + line.vatRate / 100);
                  } else {
                    unitPrice = newTotal;
                  }

                  // 🔹 huomaa kolmas parametri = true
                  updateLine(index, { total: newTotal, unitPrice }, true);
                }}
              />

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
