"use client";
import { useState } from "react";

type Contact = {
  id?: number;
  name: string;
  type: string;
  customerCode?: string;
  enableBilling: boolean;
  notes?: string;
  altNames?: string;
};

export default function ContactForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState<Contact>({
    name: "",
    type: "",
    customerCode: "",
    enableBilling: false,
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
        }, 500);
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
      className="bg-black/50 border border-yellow-700/40 rounded-xl p-6 space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nimi"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white"
        />

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white"
        >
          <option value="">Valitse tyyppi</option>
          <option value="Yksityishenkilö">Yksityishenkilö</option>
          <option value="Yritys">Yritys</option>
        </select>

        <input
          type="text"
          placeholder="Asiakastunnus"
          value={form.customerCode}
          onChange={(e) => setForm({ ...form, customerCode: e.target.value })}
          className="bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white"
        />

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

        <textarea
          placeholder="Muistiinpanot"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="col-span-full bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white"
        />

        <textarea
          placeholder="Vaihtoehtoiset nimet"
          value={form.altNames}
          onChange={(e) => setForm({ ...form, altNames: e.target.value })}
          className="col-span-full bg-black/40 border border-yellow-700/50 rounded-md px-3 py-2 text-white"
        />
      </div>

      {message && <p className="text-center text-yellow-400">{message}</p>}

      <div className="flex justify-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-600 hover:bg-yellow-500 text-black font-semibold px-5 py-2 rounded-md transition"
        >
          {loading ? "Tallennetaan..." : "Tallenna"}
        </button>
      </div>
    </form>
  );
}
