//Uusi matka
"use client";

import { useState } from "react";
import CustomSelect from "@/components/common/CustomSelect";
import FieldError from "@/components/common/FieldError";
import DatePickerField from "@/components/common/DatePickerField";
import CustomInputField from "@/components/common/CustomInputField";
import CustomTextareaField from "@/components/common/CustomTextareaField";


type TripFormData = {
  allowance: string; // Päiväraha
  date: string; // Päivämäärä
  startAddress: string; // Lähtöosoite
  endAddress: string; // Määränpää
  kilometers: string; // Kilometrit yhteensä (tekstinä, koska käsitellään inputista)
  notes: string; // Lisätiedot
};

export default function TripForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState<TripFormData>({
    allowance: "",
    date: "",
    startAddress: "",
    endAddress: "",
    kilometers: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // 🔹 Tarkistetaan pakolliset kentät
    if (!form.allowance) newErrors.allowance = "Valitse päiväraha";
    if (!form.date) newErrors.date = "Valitse päivämäärä";
    if (!form.startAddress.trim()) newErrors.startAddress = "Anna lähtöosoite";
    if (!form.endAddress.trim()) newErrors.endAddress = "Anna määränpää";
    if (!form.kilometers || Number(form.kilometers) <= 0)
      newErrors.kilometers = "Anna kilometrit yhteensä";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Estää lähetyksen, jos virheitä
    }

    setErrors({});

    try {
      const res = await fetch("/api/bookkeeping/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          kilometers: Number(form.kilometers),
        }),
      });

      if (res.ok) {
        setMessage("✅ Matka tallennettu onnistuneesti!");
        setForm({
          allowance: "",
          date: "",
          startAddress: "",
          endAddress: "",
          kilometers: "",
          notes: "",
        });
        onSuccess();
      } else {
        setMessage("❌ Virhe tallennuksessa");
      }
    } catch {
      setMessage("⚠️ Yhteysvirhe tallennuksessa");
    } finally {
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-black/40 border border-yellow-700/40 rounded-xl p-6 space-y-4 
                 shadow-[0_0_15px_rgba(0,0,0,0.4)] max-w-3xl mx-auto"
    >
      <h2 className="text-center text-yellow-400 text-lg font-semibold mb-4">
        Lisää keikkamatka
      </h2>

      {message && (
        <p className="text-center text-sm text-yellow-300 font-medium mb-3">
          {message}
        </p>
      )}

      {/* 🔹 Päiväraha */}
   <CustomSelect
  label="Päiväraha"
  value={form.allowance}
  onChange={(val) => {
    setForm({ ...form, allowance: val });
    if (errors.allowance)
      setErrors((prev) => ({ ...prev, allowance: "" }));
  }}
  options={[
    { value: "", label: "Valitse..." },
    { value: "full", label: "Kokopäiväraha 53€" },
    { value: "half", label: "Osapäiväraha 24€" },
    { value: "none", label: "Ei päivärahaa" },
  ]}
/>
<FieldError message={errors.allowance} />


      {/* 🔹 Päivämäärä */}
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
<FieldError message={errors.date} />

      {/* 🔹 Lähtöosoite ja määränpää */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <CustomInputField
    id="startAddress"
    label="Lähtöosoite"
    value={form.startAddress}
    onChange={(e) => {
      setForm({ ...form, startAddress: e.target.value });
      if (errors.startAddress)
        setErrors((prev) => ({ ...prev, startAddress: "" }));
    }}
    placeholder="Esim. Kuopio"
  />

  <CustomInputField
    id="endAddress"
    label="Määränpää"
    value={form.endAddress}
    onChange={(e) => {
      setForm({ ...form, endAddress: e.target.value });
      if (errors.endAddress)
        setErrors((prev) => ({ ...prev, endAddress: "" }));
    }}
    placeholder="Esim. Joensuu"
  />
</div>
<FieldError message={errors.startAddress || errors.endAddress} />

      {/* 🔹 Kilometrit yhteensä */}
      <CustomInputField
  id="kilometers"
  label="Kilometrit yhteensä"
  type="number"
  step="0.1"
  value={form.kilometers}
  onChange={(e) => {
    setForm({ ...form, kilometers: e.target.value });
    if (errors.kilometers)
      setErrors((prev) => ({ ...prev, kilometers: "" }));
  }}
  placeholder="Esim. 178.5"
/>
<FieldError message={errors.kilometers} />

      {/* 🔹 Lisätiedot */}
      <CustomTextareaField
  id="notes"
  label="Lisätiedot"
  value={form.notes}
  onChange={(e) => setForm({ ...form, notes: e.target.value })}
  placeholder="Lisätietoja matkasta..."
/>

      {/* 🔹 Painikkeet */}
      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          onClick={() => onSuccess()}
          className="bg-black/40 hover:bg-yellow-700/20 text-yellow-400 border border-yellow-700/40 
                     font-semibold px-8 py-2 rounded-md transition"
        >
          Peruuta
        </button>
        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold 
                     px-6 py-2 rounded-md transition disabled:opacity-50"
        >
          Tallenna matka
        </button>
      </div>
    </form>
  );
}
