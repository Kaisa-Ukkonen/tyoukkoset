"use client";


import { useState, useEffect } from "react";
import DatePickerField from "@/components/common/DatePickerField";

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
    date: "",
    description: "",
    type: "meno",
    account: "",
    amount: "",
    vatRate: "24",
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
    formData.append("date", form.date);
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

        // 🟢 Lähetetään uusi rivi parent-komponentille
       if (onSuccess) onSuccess(result.data || result);

        setForm({
          date: "",
          description: "",
          type: "meno",
          account: "",
          amount: "",
          vatRate: "24",
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
        <div>
          <label className="block text-sm text-gray-300 mb-1">Päivämäärä</label>
          <DatePickerField
  
  selected={form.date ? new Date(form.date) : null}
  onChange={(date) =>
    setForm({
      ...form,
      date: date ? date.toISOString().split("T")[0] : "",
    })
  }
/>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Tyyppi</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
          >
            <option value="tulo">Tulo</option>
            <option value="meno">Meno</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Tili</label>
          <select
            value={form.account}
            onChange={(e) => setForm({ ...form, account: e.target.value })}
            className="w-full bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
            required
          >
            <option value="">Valitse tili</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.name}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Maksutapa</label>
          <select
            value={form.paymentMethod}
            onChange={(e) =>
              setForm({ ...form, paymentMethod: e.target.value })
            }
            className="w-full bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
          >
            <option value="">Valitse</option>
            <option value="SumUp">SumUp</option>
            <option value="Käteinen">Käteinen</option>
            <option value="Yrityskortti">Yrityskortti</option>
            <option value="Yrittäjän maksu">Yrittäjän maksu</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Summa (€)</label>
          <input
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">ALV (%)</label>
          <input
            type="number"
            value={form.vatRate}
            onChange={(e) => setForm({ ...form, vatRate: e.target.value })}
            className="w-full bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Kuvaus</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full bg-transparent border border-yellow-700/40 rounded-md px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
          rows={3}
        />
      </div>

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

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2 rounded-md transition disabled:opacity-50"
        >
          {loading ? "Tallennetaan..." : "+ Lisää tapahtuma"}
        </button>
      </div>
    </form>
  );
}
