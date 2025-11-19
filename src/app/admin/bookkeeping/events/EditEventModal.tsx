"use client";

import { useState, useEffect } from "react";
import DatePickerField from "@/components/common/DatePickerField";
import CustomInputField from "@/components/common/CustomInputField";
import CustomSelect from "@/components/common/CustomSelect";
import CustomTextareaField from "@/components/common/CustomTextareaField";
import ProductUsageSelector from "@/components/admin/ProductUsageSelector";
import type { Entry } from "./types/Entry";
import { X } from "lucide-react";

type Category = {
  id: number;
  name: string;
  type: string;
  defaultVat: number;
};

type Contact = {
  id: number;
  name: string;
};

export default function EditEventModal({
  entry,
  onClose,
  onSaved,
}: {
  entry: Entry;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    id: entry.id,
    date: new Date(entry.date),
    type: entry.type, // ⭐ LISÄÄ
    paymentMethod: entry.paymentMethod || "", // ⭐ LISÄÄ
    description: entry.description || "",
    amount: String(entry.amount),
    vatRate: String(entry.vatRate),
    contactId: entry.contact?.id ?? 0,
    categoryId: entry.category?.id ?? 0,

    // ⭐ Nyt productUsage tulee datasta
    usages:
      entry.productUsage?.map((u) => ({
        productId: u.productId,
        quantity: u.quantity,
      })) ?? [],
  });

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function load() {
      setCategories(
        await fetch("/api/bookkeeping/categories").then((r) => r.json())
      );
      setContacts(
        await fetch("/api/bookkeeping/contacts").then((r) => r.json())
      );
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/bookkeeping/events/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      onSaved();
      onClose();
    } else {
      alert("Virhe tallennuksessa.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-black border border-yellow-700/40 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-yellow-400"
        >
          <X size={22} />
        </button>

        <h2 className="text-yellow-400 text-xl font-semibold mb-6">
          Muokkaa kirjanpitotapahtumaa
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <DatePickerField
            label="Päivämäärä"
            selected={form.date}
            onChange={(date) => date && setForm({ ...form, date })}
          />
          <CustomSelect
            label="Tyyppi"
            value={form.type}
            onChange={(val) => setForm({ ...form, type: val })}
            options={[
              { value: "tulo", label: "Tulo" },
              { value: "meno", label: "Meno" },
            ]}
          />

          <CustomSelect
            label="Kategoria"
            value={String(form.categoryId)}
            onChange={(v) => setForm({ ...form, categoryId: Number(v) })}
            options={categories.map((c) => ({
              value: String(c.id),
              label: c.name,
            }))}
          />

          <CustomSelect
            label="Kontakti"
            value={String(form.contactId)}
            onChange={(v) => setForm({ ...form, contactId: Number(v) })}
            options={[
              { value: "0", label: "Ei kontaktia" },
              ...contacts.map((c) => ({ value: String(c.id), label: c.name })),
            ]}
          />
          <CustomSelect
            label="Maksutapa"
            value={form.paymentMethod}
            onChange={(val) => setForm({ ...form, paymentMethod: val })}
            options={[
              { value: "SumUp", label: "SumUp" },
              { value: "Käteinen", label: "Käteinen" },
              { value: "Yrityskortti", label: "Yrityskortti" },
              { value: "Yrittäjän maksu", label: "Yrittäjän maksu" },
            ]}
          />

          <CustomInputField
            id="edit-summa"
            label="Summa (€)"
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />

          <CustomSelect
            label="ALV (%)"
            value={form.vatRate}
            onChange={(v) => setForm({ ...form, vatRate: v })}
            options={[
              { value: "25.5", label: "25.5 %" },
              { value: "14", label: "14 %" },
              { value: "10", label: "10 %" },
              { value: "0", label: "0 %" },
            ]}
          />

          <CustomTextareaField
            id="edit-kuvaus"
            label="Kuvaus"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />

          <h3 className="text-yellow-400 font-semibold mt-6 mb-2">
            Käytetyt tuotteet (sisäinen kirjanpito)
          </h3>

          <ProductUsageSelector
            usages={form.usages}
            setUsages={(u) => setForm({ ...form, usages: u })}
          />

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-black/40 text-yellow-400 border border-yellow-700/40 px-6 py-2 rounded-md hover:bg-yellow-700/10"
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
