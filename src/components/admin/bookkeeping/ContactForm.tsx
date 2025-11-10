"use client";

import { useState } from "react";
import CustomSelect from "@/components/common/CustomSelect";

type Contact = {
  id?: number;
  name: string;
  type: string;
  customerCode?: string;
  enableBilling: boolean;
  email?: string;
  address?: string;
  zip?: string;
  city?: string;
  notes?: string;
  altNames?: string;
};

export default function ContactForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState<Contact>({
    name: "",
    type: "",
    customerCode: "",
    enableBilling: false,
    email: "",
    address: "",
    zip: "",
    city: "",
    notes: "",
    altNames: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/bookkeeping/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage("Kontakti tallennettu!");
        setTimeout(() => {
          onSuccess();
        }, 800);
      } else {
        setMessage("Virhe tallennuksessa.");
      }
    } catch {
      setMessage("Yhteysvirhe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-black/40 border border-yellow-700/40 rounded-xl p-6 space-y-4 shadow-[0_0_15px_rgba(0,0,0,0.4)] max-w-2xl mx-auto"
    >
      <h2 className="text-center text-yellow-400 text-lg font-semibold">
        Lisää uusi kontakti
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 🔹 Nimi */}
        <input
          type="text"
          placeholder="Nimi"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white 
                     focus:outline-none focus:border-yellow-400"
        />

        {/* 🔹 Tyyppi */}
        <CustomSelect
          value={form.type}
          onChange={(value) => setForm({ ...form, type: value })}
          options={[
            { value: "Yksityishenkilö", label: "Yksityishenkilö" },
            { value: "Yritys", label: "Yritys" },
          ]}
        />

        {/* 🔹 Sähköposti */}
        <input
          type="email"
          placeholder="Sähköposti (esim. asiakas@email.com)"
          value={form.email || ""}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="col-span-full bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white
                     focus:outline-none focus:border-yellow-400"
        />

        {/* 🔹 Osoitetiedot */}
        <input
          type="text"
          placeholder="Katuosoite"
          value={form.address || ""}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white
                     focus:outline-none focus:border-yellow-400"
        />

        <input
          type="text"
          placeholder="Postinumero"
          value={form.zip || ""}
          onChange={(e) => setForm({ ...form, zip: e.target.value })}
          className="bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white
                     focus:outline-none focus:border-yellow-400"
        />

        <input
          type="text"
          placeholder="Kaupunki"
          value={form.city || ""}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          className="bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white
                     focus:outline-none focus:border-yellow-400"
        />

        {/* 🔹 Asiakastunnus */}
        <input
          type="text"
          placeholder="Asiakastunnus / Y-tunnus"
          value={form.customerCode}
          onChange={(e) => setForm({ ...form, customerCode: e.target.value })}
          className="bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white
                     focus:outline-none focus:border-yellow-400"
        />

        {/* 🔹 Laskutus-valinta */}
        <label className="flex items-center gap-2 text-gray-300">
          <input
            type="checkbox"
            checked={form.enableBilling}
            onChange={(e) =>
              setForm({ ...form, enableBilling: e.target.checked })
            }
            className="accent-yellow-500"
          />
          Aktivoi laskutus
        </label>

        {/* 🔹 Muistiinpanot */}
        <textarea
          placeholder="Muistiinpanot"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="col-span-full bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 
                     text-white focus:outline-none focus:border-yellow-400"
          rows={3}
        />

        {/* 🔹 Vaihtoehtoiset nimet */}
        <textarea
          placeholder="Vaihtoehtoiset nimet"
          value={form.altNames}
          onChange={(e) => setForm({ ...form, altNames: e.target.value })}
          className="col-span-full bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 
                     text-white focus:outline-none focus:border-yellow-400"
          rows={3}
        />
      </div>

      {message && (
        <p className="text-center text-yellow-400 font-medium">{message}</p>
      )}

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold 
                     px-8 py-2 rounded-md transition disabled:opacity-50"
        >
          {loading ? "Tallennetaan..." : "Tallenna"}
        </button>
      </div>
    </form>
  );
}
