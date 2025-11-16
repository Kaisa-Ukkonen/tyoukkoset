"use client";

import { useEffect, useState } from "react";
import CustomSelect from "@/components/common/CustomSelect";
import CustomInputField from "@/components/common/CustomInputField";
import CustomTextareaField from "@/components/common/CustomTextareaField";

/////////////////////////////////////////////////////
// ACCOUNT TYPE
/////////////////////////////////////////////////////
interface Account {
  id: number;
  number: number;
  name: string;
  type: "tulo" | "meno";
  instruction?: string | null;
  vatHandling: string;
  vatRate: number;
  openingBalance: number;
  createdAt: string;
}

/////////////////////////////////////////////////////
// PROPS
/////////////////////////////////////////////////////
interface AccountFormProps {
  accountId: number | null;
  onClose: () => void;
  onSaved: (acc: Account) => void;
}

/////////////////////////////////////////////////////
// SELECT-LISTAT
/////////////////////////////////////////////////////

const typeOptions = [
  { value: "tulo", label: "Tulo" },
  { value: "meno", label: "Meno" },
];

const vatHandlingOptions = [
  { value: "Kotimaan verollinen myynti", label: "Kotimaan verollinen myynti" },
  { value: "Veroton", label: "Veroton" },
  { value: "Nollaverokannan myynti", label: "Nollaverokannan myynti" },
];

const vatRateOptions = [
  { value: "25.5", label: "25.5 %" },
  { value: "14", label: "14 %" },
  { value: "10", label: "10 %" },
  { value: "0", label: "0 %" },
];

/////////////////////////////////////////////////////
// KOMPONENTTI
/////////////////////////////////////////////////////

export default function AccountForm({
  accountId,
  onClose,
  onSaved,
}: AccountFormProps) {
  const [form, setForm] = useState({
    number: 0,
    name: "",
    type: "tulo",
    instruction: "",
    vatHandling: "Kotimaan verollinen myynti",
    vatRate: "0",
    openingBalance: "0",
  });

  /////////////////////////////////////////////////////
  // Lataa olemassa oleva tili jos muokataan
  /////////////////////////////////////////////////////

  useEffect(() => {
    if (accountId) {
      fetch(`/api/bookkeeping/accounts`)
        .then((r) => r.json())
        .then((list: Account[]) => {
          const acc = list.find((a) => a.id === accountId);
          if (acc) {
            setForm({
              number: acc.number,
              name: acc.name,
              type: acc.type,
              instruction: acc.instruction ?? "",
              vatHandling: acc.vatHandling,
              vatRate: acc.vatRate.toString(),
              openingBalance: acc.openingBalance.toString(),
            });
          }
        });
    }
  }, [accountId]);

  /////////////////////////////////////////////////////
  // Lähetä data APIlle
  /////////////////////////////////////////////////////

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      number: Number(form.number),
      name: form.name,
      type: form.type,
      instruction: form.instruction,
      vatHandling: form.vatHandling,
      vatRate: Number(form.vatRate),
      openingBalance: Number(form.openingBalance),
    };

    let response: Response;

    if (accountId) {
      response = await fetch(`/api/bookkeeping/accounts/${accountId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      response = await fetch(`/api/bookkeeping/accounts`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    const data = await response.json();

    if (response.ok) {
      onSaved(data); // ilmoitetaan listalle
      onClose(); // suljetaan lomake
    }
  };

  /////////////////////////////////////////////////////
  // UI
  /////////////////////////////////////////////////////

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black/80 border border-yellow-700/40 rounded-xl p-6 w-full max-w-md shadow-[0_0_20px_rgba(0,0,0,0.6)]">
        <h2 className="text-xl font-bold text-yellow-400 mb-4">
          {accountId ? "Muokkaa tiliä" : "Lisää uusi tili"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tilinumero */}
          <CustomInputField
            id="accountNumber"
            label="Tilinumero"
            type="number"
            value={form.number?.toString() ?? ""}
            onChange={(e) =>
              setForm({ ...form, number: Number(e.target.value) })
            }
          />

          {/* Nimi */}
          <CustomInputField
            id="accountName"
            label="Nimi"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          {/* Tyyppi */}
          <CustomSelect
            label="Tyyppi"
            value={form.type}
            onChange={(value) => setForm({ ...form, type: value })}
            options={typeOptions}
          />

          {/* ALV-käsittely */}
          <CustomSelect
            label="ALV-käsittely"
            value={form.vatHandling}
            onChange={(value) => setForm({ ...form, vatHandling: value })}
            options={vatHandlingOptions}
          />

          {/* ALV-prosentti */}
          <CustomSelect
            label="ALV-prosentti"
            value={form.vatRate}
            onChange={(value) => setForm({ ...form, vatRate: value })}
            options={vatRateOptions}
          />

          {/* Kirjausohje */}
          <CustomTextareaField
            id="instruction"
            label="Kirjausohje"
            value={form.instruction ?? ""}
            onChange={(e) => setForm({ ...form, instruction: e.target.value })}
            rows={4}
          />

          {/* Alkusaldo */}
          <CustomInputField
            id="openingBalance"
            label="Alkusaldo (€)"
            type="number"
            step="0.01"
            value={form.openingBalance?.toString() ?? ""}
            onChange={(e) =>
              setForm({ ...form, openingBalance: e.target.value })
            }
          />

          {/* NAPPULAT */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-black/40 hover:bg-yellow-700/20 text-yellow-400 border border-yellow-700/40 
         font-semibold px-7 py-2 rounded-md transition"
            >
              Peruuta
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-yellow-600 hover:bg-yellow-500 text-black font-semibold"
            >
              Tallenna
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
