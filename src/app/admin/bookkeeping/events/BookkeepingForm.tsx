"use client";

import { useState, useEffect } from "react";
import DatePickerField from "@/components/common/DatePickerField";
import CustomSelect from "@/components/common/CustomSelect";
import CustomTextareaField from "@/components/common/CustomTextareaField";
import CustomInputField from "@/components/common/CustomInputField";
import type { Entry } from "./types/Entry";

export default function BookkeepingForm({
  onSuccess,
}: {
  onSuccess?: (entry: Entry) => void;
}) {
  type Category = {
    id: number;
    name: string;
    type: "TULO" | "MENO";
    defaultVat: number;
    description?: string | null;
  };
  type Contact = {
    id: number;
    name: string;
  };

  const [contacts, setContacts] = useState<Contact[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [form, setForm] = useState({
    date: new Date(),
    description: "",
    type: "meno",
    categoryId: 0,
    amount: "",
    vatRate: "25.5",
    paymentMethod: "",
    receipt: null as File | null,
    contactId: 0, // ⭐ UUSI
  });

  // 🔹 Hae kategoriat tietokannasta

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/bookkeeping/categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Virhe kategorioiden haussa:", err);
      }
    };

    const fetchContacts = async () => {
      try {
        const res = await fetch("/api/bookkeeping/contacts");
        const data = await res.json();
        setContacts(data);
      } catch (err) {
        console.error("Virhe kontaktien haussa:", err);
      }
    };

    fetchCategories();
    fetchContacts();
  }, []);

  // 🔹 Lähetys
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    const formData = new FormData();
    formData.append("date", form.date.toISOString().split("T")[0]);
    formData.append("description", form.description);
    formData.append("type", form.type);
    formData.append("contactId", String(form.contactId));
    formData.append("amount", form.amount);
    formData.append("categoryId", String(form.categoryId));
    formData.append("vatRate", form.vatRate);
    formData.append("paymentMethod", form.paymentMethod);
    if (form.receipt) formData.append("receipt", form.receipt);

    try {
      const res = await fetch("/api/bookkeeping/events", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setNotification({
          type: "success",
          message: "Kirjanpitotapahtuma tallennettu onnistuneesti!",
        });

        if (onSuccess) onSuccess(result);

        setForm({
          date: new Date(), // palautetaan oletusarvo
          description: "",
          type: "meno",
          categoryId: 0,
          amount: "",
          vatRate: "25.5",
          paymentMethod: "",
          receipt: null,
          contactId: 0,
        });
      } else {
        setNotification({
          type: "error",
          message: result.error || "Virhe tallennuksessa.",
        });
      }
    } catch (err) {
      console.error("Virhe:", err);
      setNotification({
        type: "error",
        message: "Yhteysvirhe tallennuksessa.",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-yellow-400 mb-4 text-center">
        Lisää kirjanpitotapahtuma
      </h2>

      {notification && (
        <div
          className={`text-center p-3 rounded-md font-semibold ${
            notification.type === "success"
              ? "bg-green-700/50 text-green-300 border border-green-600/40"
              : "bg-red-700/50 text-red-300 border border-red-600/40"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DatePickerField
          label="Päivämäärä"
          selected={form.date}
          onChange={(date) => {
            if (!date) return;
            setForm({ ...form, date });
          }}
        />

        {/* Tyyppi */}
        <CustomSelect
          label="Tyyppi"
          value={form.type}
          onChange={(val) => setForm({ ...form, type: val })}
          options={[
            { value: "tulo", label: "Tulo" },
            { value: "meno", label: "Meno" },
          ]}
        />

        {/* 🔹 kategoria */}
        <CustomSelect
          label="Kategoria"
          value={String(form.categoryId)}
          onChange={(val) => setForm({ ...form, categoryId: Number(val) })}
          options={categories.map((cat) => ({
            value: String(cat.id),
            label: `${cat.name} (${cat.type === "TULO" ? "Tulo" : "Meno"})`,
          }))}
          placeholder="Valitse kategoria"
        />
        <CustomSelect
          label="Kontakti"
          value={String(form.contactId)}
          onChange={(val) => setForm({ ...form, contactId: Number(val) })}
          options={[
            { value: "0", label: "Ei kontaktia" },
            ...contacts.map((c) => ({
              value: String(c.id),
              label: c.name,
            })),
          ]}
        />

        {/* 🔹 Maksutapa */}
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
          placeholder="Valitse maksutapa"
        />

        {/* 🔹 Summa (€) */}
        <CustomInputField
          id="amount"
          label="Summa (€)"
          type="number"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />

        {/* ALV */}
        <CustomSelect
          label="ALV (%)"
          value={form.vatRate}
          onChange={(val) => setForm({ ...form, vatRate: val })}
          options={[
            { value: "25.5", label: "25.5 %" },
            { value: "14", label: "14 %" },
            { value: "10", label: "10 %" },
            { value: "0", label: "0 %" },
          ]}
        />
      </div>

      {/* 🔹 Kuvaus */}
      <CustomTextareaField
        id="description"
        label="Kuvaus"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={3}
      />

      {/* Tosite */}
      <div>
        <label className="block text-sm text-yellow-400 mb-1 font-semibold">
          Tosite (valinnainen)
        </label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={(e) =>
            setForm({ ...form, receipt: e.target.files?.[0] || null })
          }
          className="w-full text-gray-300"
        />
      </div>

      <div className="flex justify-end gap-4">
        {/* 🔹 Peruuta */}
        <button
          type="button"
          onClick={() => window.location.reload()} // tai halutessasi voit sulkea lomakkeen eri tavalla
          className="bg-black/40 hover:bg-yellow-700/20 text-yellow-400 
               border border-yellow-700/40 font-semibold 
               px-7 py-2 rounded-md transition"
        >
          Peruuta
        </button>
        {/* 🔹 Tallenna */}
        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold 
               px-8 py-1.5 rounded-md transition disabled:opacity-50"
        >
          Tallenna
        </button>
      </div>
    </form>
  );
}
