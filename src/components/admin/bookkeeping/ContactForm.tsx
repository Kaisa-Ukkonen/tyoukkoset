"use client";

import { useState } from "react";
import CustomSelect from "@/components/common/CustomSelect";
import CustomInputField from "@/components/common/CustomInputField";
import CustomTextareaField from "@/components/common/CustomTextareaField";

type Contact = {
  id?: number;
  name: string;
  type: string;
  customerCode?: string;
  email?: string;
  address?: string;
  zip?: string;
  city?: string;
  notes?: string;
};

type YTJPostOffice = {
  city: string;
  languageCode: string;
  municipalityCode?: string;
};

type YTJAddress = {
  type: string;
  street?: string;
  buildingNumber?: string;
  entrance?: string;
  apartmentNumber?: string;
  apartmentIdSuffix?: string;
  postCode?: string;
  postOffices?: YTJPostOffice[];
};

type YTJCompany = {
  businessId?: { value?: string };
  names?: { name?: string }[];
  addresses?: YTJAddress[];
};

export default function ContactForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState<Contact>({
    name: "",
    type: "",
    customerCode: "",
    email: "",
    address: "",
    zip: "",
    city: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<YTJCompany[]>([]);

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
        setTimeout(onSuccess, 800);
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

      <div className="grid grid-cols-1 gap-4">
  {/* 🔹 Tyyppi */}
  <div>
    <CustomSelect
      value={form.type}
      onChange={(value) =>
        setForm({ ...form, type: value, customerCode: "" })
      }
      options={[
        { value: "", label: "Valitse..." },
        { value: "Yksityishenkilö", label: "Yksityishenkilö" },
        { value: "Yritys", label: "Yritys" },
      ]}
    />
  </div>
   {/* 🔹 Nimi */}
        <CustomInputField
          id="name"
          label="Nimi"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {/* 🔹 YTJ-haku vain yrityksille */}
        {form.type === "Yritys" && (
          <div className="col-span-full">
            <button
              type="button"
              onClick={async () => {
                if (!form.name.trim()) {
                  alert("Anna yrityksen nimi ennen hakua.");
                  return;
                }
                setLoading(true);
                setMessage("Haetaan YTJ-tietoja...");
                try {
                  const res = await fetch(
                    `/api/bookkeeping/ytj?query=${encodeURIComponent(
                      form.name
                    )}`
                  );
                  const data = await res.json();
                  if (data?.companies?.length > 0) {
                    setSearchResults(data.companies); // näytä kaikki tulokset
                    setMessage(`Löytyi ${data.companies.length} osumaa.`);
                  } else setMessage("Ei löytynyt yrityksiä annetulla nimellä.");
                } catch (err) {
                  console.error("YTJ-hakuvirhe:", err);
                  setMessage("Virhe YTJ-haussa.");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className={`text-sm px-3 py-1 rounded-md transition ${
                loading
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-yellow-700 hover:bg-yellow-600 text-black"
              }`}
            >
              {loading ? "⏳ Haetaan..." : "🔍 Hae yritys YTJ:stä"}
            </button>

            {/* 🔹 Näytä hakutulokset */}
            {searchResults.length > 0 && (
              <ul
                className="mt-3 bg-black/60 border border-yellow-700/40 rounded-md divide-y divide-yellow-700/20
             max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-700/50 scrollbar-track-transparent"
              >
                {searchResults.map((c, idx) => {
                  const name = c.names?.[0]?.name || "Tuntematon";
                  const yid = c.businessId?.value || "-";
                  const addr = c.addresses?.[0];
                  const city = addr?.postOffices?.[0];
                  const street = addr?.street || "";

                  return (
                    <li
                      key={idx}
                      onClick={() => {
                        const address: YTJAddress | undefined =
                          c.addresses?.find(
                            (a: YTJAddress) => a.type === "RegisteredOffice"
                          ) || c.addresses?.[0];

                        const streetParts = [
                          address?.street,
                          address?.buildingNumber,
                          address?.entrance,
                          address?.apartmentNumber,
                          address?.apartmentIdSuffix,
                        ].filter(Boolean);
                        const fullAddress = streetParts.join(" ");

                        setForm({
                          ...form,
                          name,
                          customerCode: yid,
                          address: fullAddress || "",
                          zip: address?.postCode || "",
                          city:
                            typeof address?.postOffices?.[0] === "object"
                              ? address?.postOffices?.[0]?.city ?? ""
                              : (address
                                  ?.postOffices?.[0] as unknown as string) ??
                                "",
                        });

                        setSearchResults([]);
                        setMessage(`✅ Yritys "${name}" valittu YTJ:stä.`);
                      }}
                      className="px-3 py-2 cursor-pointer hover:bg-yellow-700/20 text-yellow-300"
                    >
                      <div className="font-semibold">{name}</div>
                      <div className="text-xs text-gray-400">
                        {yid} • {street}{" "}
                        {typeof city === "string" ? city : city?.city || ""}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {message && (
              <div className="mt-2 flex items-center justify-between text-yellow-400 text-sm">
                <p>{message}</p>
                {searchResults.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSearchResults([])}
                    className="ml-4 text-xs px-2 py-1 border border-yellow-700/50 rounded-md hover:bg-yellow-700/20 transition"
                  >
                    Tyhjennä lista ✖
                  </button>
                )}
              </div>
            )}
          </div>
        )}

       

        {/* 🔹 Sähköposti */}
        <CustomInputField
          id="email"
          label="Sähköposti"
          type="email"
          value={form.email || ""}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        {/* 🔹 Osoitetiedot */}
        <CustomInputField
          id="address"
          label="Katuosoite"
          value={form.address || ""}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <CustomInputField
          id="zip"
          label="Postinumero"
          value={form.zip || ""}
          onChange={(e) => setForm({ ...form, zip: e.target.value })}
        />

        <CustomInputField
          id="city"
          label="Kaupunki"
          value={form.city || ""}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />

        {/* 🔹 Y-tunnus vain yrityksille */}
        {form.type === "Yritys" && (
          <CustomInputField
            id="customerCode"
            label="Y-tunnus"
            value={form.customerCode || ""}
            onChange={(e) => setForm({ ...form, customerCode: e.target.value })}
          />
        )}

        {/* 🔹 Muistiinpanot */}
        <CustomTextareaField
          id="notes"
          label="Muistiinpanot"
          value={form.notes || ""}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>

      <div className="flex justify-center gap-3">
  <button
    type="submit"
    disabled={loading}
    className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold 
               px-8 py-2 rounded-md transition disabled:opacity-50"
  >
    {loading ? "Tallennetaan..." : "Tallenna"}
  </button>

  <button
    type="button"
    onClick={() => onSuccess()} // sulkee lomakkeen kuten tallennuksen jälkeen
    className="bg-black/40 hover:bg-yellow-700/20 text-yellow-400 border border-yellow-700/40 
               font-semibold px-8 py-2 rounded-md transition"
  >
    Peruuta
  </button>
</div>
    </form>
  );
}
