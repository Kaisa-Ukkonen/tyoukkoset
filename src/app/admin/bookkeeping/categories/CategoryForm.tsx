"use client";

import { useEffect, useState } from "react";
import CustomInputField from "@/components/common/CustomInputField";
import CustomSelect from "@/components/common/CustomSelect";
import CustomTextareaField from "@/components/common/CustomTextareaField";
import FieldError from "@/components/common/FieldError";

export default function CategoryForm({
  categoryId,
  onClose,
  onSaved,
}: {
  categoryId: number | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"TULO" | "MENO">("TULO");
  const [defaultVat, setDefaultVat] = useState<string>("0");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // -----------------------------
  // Load existing category
  // -----------------------------
  useEffect(() => {
    if (!categoryId) return;

    const fetchCategory = async () => {
      const res = await fetch(`/api/bookkeeping/categories/${categoryId}`);
      const data = await res.json();

      setName(data.name);
      setType(data.type);
      setDefaultVat(String(data.defaultVat));
      setDescription(data.description ?? "");
    };

    fetchCategory();
  }, [categoryId]);

  // -----------------------------
  // Submit
  // -----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Nimi on pakollinen";
    if (!defaultVat.trim()) newErrors.defaultVat = "Anna ALV-oletus";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const payload = {
      name,
      type,
      defaultVat: parseFloat(defaultVat),
      description,
    };

    await fetch(
      `/api/bookkeeping/categories${categoryId ? `/${categoryId}` : ""}`,
      {
        method: categoryId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    onSaved();
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* NIMI */}
      <CustomInputField
        id="category-name"
        label="Nimi"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
        }}
      />
      <FieldError message={errors.name} />

      {/* TYYPPI */}
      <CustomSelect
        label="Tyyppi"
        value={type}
        onChange={(val) => setType(val as "TULO" | "MENO")}
        options={[
          { value: "TULO", label: "Tulo" },
          { value: "MENO", label: "Meno" },
        ]}
      />

      {/* ALV-OLETUS */}
     <CustomSelect
  label="ALV-oletus (%)"
  value={defaultVat}
  onChange={(val) => {
    setDefaultVat(val);
    if (errors.defaultVat) setErrors((prev) => ({ ...prev, defaultVat: "" }));
  }}
  options={[
    { value: "0", label: "0 %" },
    { value: "10", label: "10 %" },
    { value: "14", label: "14 %" },
    { value: "25.5", label: "25.5 %" },
  ]}
/>
<FieldError message={errors.defaultVat} />

      {/* KUVAUS */}
      <CustomTextareaField
        id="category-description"
        label="Kuvaus"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* NAPIT */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-black/40 hover:bg-yellow-700/20 text-yellow-400 
                     border border-yellow-700/40 font-semibold 
                     px-6 py-2 rounded-md transition"
        >
          Peruuta
        </button>

        <button
          type="submit"
          className="bg-yellow-600 hover:bg-yellow-500 text-black 
                     font-semibold px-6 py-2 rounded-md transition"
        >
          Tallenna
        </button>
      </div>
    </form>
  );
}
