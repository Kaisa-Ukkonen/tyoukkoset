"use client";

import { useState, useEffect } from "react";
import DatePickerField from "@/components/common/DatePickerField";
import CustomSelect from "@/components/common/CustomSelect";
import CustomTextareaField from "@/components/common/CustomTextareaField";
import CustomInputField from "@/components/common/CustomInputField";

type Entry = {
  id: number;
  date: string;
  description: string | null;
  type: string;
  amount: number;
  vatRate: number;
  paymentMethod: string | null;
  account: { name: string };
};

export default function BookkeepingForm({
  onSuccess,
}: {
  onSuccess?: (entry: Entry) => void;
}) {
  type Account = {
    id: number;
    name: string;
    type: string;
    description?: string;
    createdAt: string;
  };

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [form, setForm] = useState({
  date: new Date(), // 🔹 tämän päivän päivämäärä oletuksena
  description: "",
  type: "meno",
  account: "",
  amount: "",
  vatRate: "25.5",
  paymentMethod: "",
  receipt: null as File | null,
});

  // 🔹 Hae tilit tietokannasta
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("/api/bookkeeping/accounts");
        const data = await res.json();
        setAccounts(data);
      } catch (err) {
        console.error("Virhe tilien haussa:", err);
      }
    };
    fetchAccounts();
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
    formData.append("account", form.account);
    formData.append("amount", form.amount);
    formData.append("vatRate", form.vatRate);
    formData.append("paymentMethod", form.paymentMethod);
    if (form.receipt) formData.append("receipt", form.receipt);

    try {
      const res = await fetch("/api/bookkeeping", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setNotification({
          type: "success",
          message: "Kirjanpitotapahtuma tallennettu onnistuneesti!",
        });

        if (onSuccess) onSuccess(result.data || result);

        setForm({
  date: new Date(), // palautetaan oletusarvo
  description: "",
  type: "meno",
  account: "",
  amount: "",
  vatRate: "25.5",
  paymentMethod: "",
  receipt: null,
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
    <form
      onSubmit={handleSubmit}
      className="bg-black/40 border border-yellow-700/40 rounded-xl p-6 space-y-4 max-w-2xl mx-auto shadow-[0_0_15px_rgba(0,0,0,0.4)]"
    >
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

        {/* 🔹 Tili */}
        <CustomSelect
          label="Tili"
          value={form.account}
          onChange={(val) => setForm({ ...form, account: val })}
          options={accounts.map((acc) => ({
            value: acc.name,
            label: acc.name,
          }))}
          placeholder="Valitse tili"
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
        <label className="block text-sm text-gray-300 mb-1">
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
               px-8 py-2 rounded-md transition"
        >
          Peruuta
        </button>
        {/* 🔹 Tallenna */}
        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold 
               px-2 py-1.5 rounded-md transition disabled:opacity-50"
        >
          Lisää tapahtuma
        </button>
      </div>
    </form>
  );
}
