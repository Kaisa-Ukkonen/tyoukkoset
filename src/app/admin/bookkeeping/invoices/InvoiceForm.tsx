//Laskun luonti, Laskun muokkaus, Laskurivien lisääminen / poistaminen, Tuotevalinnat ja hintalogiikka, Lopullinen tallennus backendille

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
  vatHandling: string;
};

type InvoiceLine = {
  id?: number;
  productId?: number | null;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
  vatHandling: string;
  vatCode?: string | null;
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
  const [fieldErrors, setFieldErrors] = useState<{
    customer?: string;
    product?: string;
  }>({});
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
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          vatRate: 0,
          total: 0,
          vatHandling: "Kotimaan verollinen myynti", // 🔥 LISÄÄ
        },
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

      let netTotal = 0;
      let vatTotal = 0;
      let grossTotal = 0;

      lines.forEach((l) => {
        const isVerollinen = l.vatHandling === "Kotimaan verollinen myynti";

        const gross = l.total; // 🔹 käytä aina rivin total-arvoa

        const net = isVerollinen ? gross / (1 + l.vatRate / 100) : gross;
        const vat = isVerollinen ? gross - net : 0;

        netTotal += net;
        vatTotal += vat;
        grossTotal += gross;
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
        vatHandling: line.vatHandling || null, // ⭐ uusi
        vatCode: line.vatCode || null, // ⭐ uusi
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
      <div className="space-y-4">
        {/* 🔹 Päivämäärät & maksuehto samalle riville */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Laskun päivämäärä */}
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

          {/* Eräpäivä */}
          <DatePickerField
            label="Eräpäivä"
            selected={form.dueDate}
            onChange={(date) => setForm({ ...form, dueDate: date as Date })}
          />

          {/* Maksuehto (pv) */}
          <CustomInputField
            id="paymentTerm"
            label="Maksuehto (pv)"
            type="number"
            className="w-28" // 👈 lisäys
            value={form.paymentTerm.toString()}
            onChange={(e) => {
              const newTerm = parseInt(e.target.value) || 0;
              setForm({
                ...form,
                paymentTerm: newTerm,
                dueDate: new Date(
                  new Date(form.date).getTime() + newTerm * 24 * 60 * 60 * 1000
                ),
              });
            }}
          />
        </div>

        {/* 🔹 Asiakas-valikko alle */}
        <div className="w-56">
          <CustomSelect
            label="Asiakas"
            value={form.customerId ? String(form.customerId) : ""}
            onChange={(value) => {
              const selected = contacts.find((c) => String(c.id) === value);
              if (selected) {
                setForm({
                  ...form,
                  customerId: selected.id,
                  customCustomer: "",
                });
                setFieldErrors({});
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
      </div>

      {/* 🔹 Laskurivit */}

      <div>
        <h3 className="text-yellow-400 font-semibold mb-2">Laskurivit</h3>

        <div className="space-y-4">
          {form.lines.map((line, index) => (
            <div
              key={index}
              className="bg-black/40 p-4 rounded-lg border border-yellow-700/40 shadow"
            >
              {/* 🔶 Ylärivi */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tuote */}
                <CustomSelect
                  label="Tuote"
                  value={line.productId ? String(line.productId) : ""}
                  onChange={(value) => {
                    const product = products.find(
                      (p) => String(p.id) === value
                    );
                    if (!product) return;

                    const vatIncluded = product.vatIncluded;
                    const isVerollinen =
                      product.vatHandling === "Kotimaan verollinen myynti";

                    // 🔹 Lasketaan yksikköhinta Yhteensä-kenttää varten
                    const unitPrice = vatIncluded
                      ? product.price / (1 + product.vatRate / 100)
                      : product.price;

                    const total = vatIncluded
                      ? product.price
                      : product.price * (1 + product.vatRate / 100);

                    updateLine(index, {
                      productId: product.id,
                      description: product.name,
                      unitPrice: unitPrice,
                      vatRate: isVerollinen ? product.vatRate : 0,
                      total,
                      vatHandling: product.vatHandling,
                    });
                  }}
                  options={products.map((p) => ({
                    value: String(p.id),
                    label: p.name,
                  }))}
                />

                <CustomSelect
                  label="ALV-käsittely"
                  value={line.vatHandling || "Kotimaan verollinen myynti"}
                  onChange={(val) => {
                    const isVerollinen = val === "Kotimaan verollinen myynti";
                    updateLine(index, {
                      vatHandling: val,
                      vatRate: isVerollinen ? line.vatRate : 0,
                      total: line.total,
                      unitPrice: line.unitPrice,
                    });
                  }}
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

                {/* ALV % (näkyy vain verollisessa) */}
                {line.vatHandling === "Kotimaan verollinen myynti" && (
                  <CustomInputField
                    id={`vat-${index}`}
                    label="ALV %"
                    type="text"
                    readOnly // 🔥 nyt käyttäjä ei voi muuttaa
                    value={line.vatRate.toFixed(1) + " %"}
                    onChange={() => {}} // 🔥 poistetaan muutokset
                  />
                )}
              </div>

              {/* 🔶 Alarivi */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 items-end">
                {/* Määrä */}
                <CustomInputField
                  id={`qty-${index}`}
                  label="Määrä"
                  type="number"
                  value={line.quantity.toString()}
                  onChange={(e) => {
                    const qty = Math.max(parseFloat(e.target.value) || 1, 1);

                    const unit = line.unitPrice;
                    const vatHandling = line.vatHandling;
                    const isVerollinen =
                      vatHandling === "Kotimaan verollinen myynti";

                    const total = isVerollinen
                      ? unit * qty * (1 + line.vatRate / 100)
                      : unit * qty;

                    updateLine(index, {
                      quantity: qty,
                      total,
                    });
                  }}
                />

                {/* A-hinta (readOnly) */}
                <CustomInputField
                  id={`unit-${index}`}
                  label="A-hinta (€)"
                  type="text"
                  readOnly
                  value={line.unitPrice.toFixed(2) + " €"}
                  onChange={() => {}}
                />

                {/* Yhteensä (muokattavissa) */}
                <CustomInputField
                  id={`total-${index}`}
                  label="Yhteensä (€)"
                  type="number"
                  step="0.01"
                  value={line.total.toFixed(2)}
                  onChange={(e) => {
                    const newTotal = Math.max(
                      parseFloat(e.target.value) || 0,
                      0
                    );

                    const vatHandling = line.vatHandling;
                    const isVerollinen =
                      vatHandling === "Kotimaan verollinen myynti";

                    const unitPrice = isVerollinen
                      ? newTotal / (1 + line.vatRate / 100)
                      : newTotal;

                    updateLine(index, {
                      total: newTotal,
                      unitPrice,
                    });
                  }}
                />
                {/* 🔹 Näytä ALV 0 % -syykoodi vain verottomille riveille */}
                {line.vatHandling === "Veroton" && (
                  <div className="col-span-full mt-2">
                    <CustomSelect
                      label="ALV 0 % -syy"
                      value={line.vatCode || ""}
                      onChange={(value) =>
                        updateLine(index, { vatCode: value })
                      }
                      options={[
                        {
                          value: "AE",
                          label: "AE – Kotimaan käännetty verovelvollisuus",
                        },
                        {
                          value: "E",
                          label: "E – Verosta vapautettu myynti",
                        },
                        {
                          value: "G",
                          label:
                            "G – Kauppa kolmansien maiden yritysten kanssa",
                        },
                        {
                          value: "K",
                          label: "K – Tavaroiden ja palveluiden yhteisökauppa",
                        },
                        {
                          value: "O",
                          label: "O – Arvolisäveron ulkopuolinen myynti",
                        },
                        {
                          value: "Z",
                          label: "Z – Nollaverokannan alainen myynti",
                        },
                      ]}
                    />
                  </div>
                )}

                {/* Poista rivi */}
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  className="text-red-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Lisää rivi */}
        <button
          type="button"
          onClick={addLine}
          className="flex items-center gap-2 mt-3 text-yellow-400 hover:text-yellow-300"
        >
          <Plus size={18} /> Lisää rivi
        </button>
      </div>
      {/* 🔹 Yhteenveto */}
      <div className="border-t border-yellow-700/30 pt-3 flex justify-end gap-10 text-sm text-gray-300 mt-6">
        <div>
          <span className="text-gray-400">Veroton hinta: </span>
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
      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="bg-black/40 hover:bg-yellow-700/20 text-yellow-400 border border-yellow-700/40 
         font-semibold px-8 py-2 rounded-md transition"
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
