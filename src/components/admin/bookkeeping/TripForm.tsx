"use client";
import { useState } from "react";
import DatePickerField from "@/components/common/DatePickerField";
import CustomSelect from "@/components/common/CustomSelect";

export default function TripForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    allowance: "",
    date: "",
    startAddress: "",
    endAddress: "",
    kilometers: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/bookkeeping/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({
        allowance: "",
        date: "",
        startAddress: "",
        endAddress: "",
        kilometers: "",
        notes: "",
      });
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-black/40 border border-yellow-700/40 rounded-xl p-6 space-y-4 shadow-[0_0_15px_rgba(0,0,0,0.4)] max-w-2xl mx-auto"
    >
      <div>
        <label className="block text-yellow-300 font-semibold">Päiväraha</label>
        <CustomSelect
          value={form.allowance}
          onChange={(val) => setForm({ ...form, allowance: val })}
          options={[
            { value: "", label: "Valitse..." },
            { value: "full", label: "Kokopäiväraha 53€" },
            { value: "half", label: "Osapäiväraha 24€" },
            { value: "none", label: "Ei päivärahaa" },
          ]}
        />
      </div>

      <div>
        <label className="block text-yellow-300 font-semibold mt-4"></label>
        <DatePickerField
          label="Päivämäärä"
          selected={form.date ? new Date(form.date) : null}
          onChange={(date) =>
            setForm({
              ...form,
              date: date ? date.toISOString().split("T")[0] : "",
            })
          }
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-yellow-300 font-semibold">
            Lähtöosoite
          </label>
          <input
            type="text"
            value={form.startAddress}
            onChange={(e) => setForm({ ...form, startAddress: e.target.value })}
            placeholder="Esim. Kuopio"
            className="w-full p-3 bg-black/40 border border-yellow-700/40 rounded-lg text-yellow-100"
          />
        </div>
        <div>
          <label className="block text-yellow-300 font-semibold">
            Määränpää
          </label>
          <input
            type="text"
            value={form.endAddress}
            onChange={(e) => setForm({ ...form, endAddress: e.target.value })}
            placeholder="Esim. Joensuu"
            className="w-full p-3 bg-black/40 border border-yellow-700/40 rounded-lg text-yellow-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-yellow-300 font-semibold mt-4">
          Kilometrit yhteensä
        </label>
        <input
          type="number"
          min="0"
          step="0.1"
          value={form.kilometers}
          onChange={(e) => {
            // Estetään negatiiviset ja useampi desimaali
            const val = e.target.value;

            // 🔹 Salli tyhjä kenttä tai numerot, joilla max 1 desimaali
            if (val === "" || /^\d*\.?\d{0,1}$/.test(val)) {
              setForm({ ...form, kilometers: val });
            }
          }}
          onBlur={(e) => {
            // 🔹 Pyöristetään automaattisesti 1 desimaaliin kun kenttä menettää fokuksen
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) {
              setForm({ ...form, kilometers: val.toFixed(1) });
            }
          }}
          placeholder="Esim. 178.5"
          className="w-full p-3 bg-black/40 border border-yellow-700/40 rounded-lg text-yellow-100 focus:border-yellow-400 outline-none"
          required
        />
      </div>

      {/* 🟡 UUSI LISÄTIETOKENTTÄ */}
      <div>
        <label className="block text-yellow-300 font-semibold mt-4">
          Lisätiedot
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Lisätietoja matkasta..."
          rows={3}
          className="w-full p-3 bg-black/40 border border-yellow-700/40 rounded-lg text-yellow-100 focus:border-yellow-400 outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-yellow-600 hover:bg-yellow-500 text-black font-semibold 
             px-6 py-2 rounded-md shadow-md transition 
             flex items-center justify-center gap-2 mx-auto"
      >
        {loading ? "Tallennetaan..." : "💾 Tallenna matka"}
      </button>
    </form>
  );
}
