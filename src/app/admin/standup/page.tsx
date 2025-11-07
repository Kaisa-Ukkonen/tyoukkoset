"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { fi } from "date-fns/locale";
registerLocale("fi", fi);
import ConfirmModal from "@/components/common/ConfirmModal";
import DatePickerField from "@/components/common/DatePickerField";

type Gig = {
  id: string;
  title: string;
  placeDetails: string;
  venue?: string;
  city?: string;
  address: string;
  date: string;
  time: string;
};

export default function AdminStandupPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [editingGig, setEditingGig] = useState<Gig | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 🔹 Lomakkeiden tilat
  const [form, setForm] = useState({
    title: "",
    placeDetails: "",
    address: "",
    date: null as Date | null,
    time: null as Date | null,
  });
  const [editForm, setEditForm] = useState<{
    title: string;
    placeDetails: string;
    address: string;
    date: Date | null;
    time: Date | null;
  }>({
    title: "",
    placeDetails: "",
    address: "",
    date: null,
    time: null,
  });

  // 🔹 Hae keikat
  useEffect(() => {
    fetch("/api/standup")
      .then((res) => res.json())
      .then((data) => setGigs(data))
      .catch((err) => console.error("Virhe haussa:", err));
  }, []);

  // 🔹 Lisää keikka
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.date) return;

    const dateString = form.date.toISOString().split("T")[0];
    const timeString = form.time
      ? form.time.toLocaleTimeString("fi-FI", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    const res = await fetch("/api/standup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        placeDetails: form.placeDetails,
        address: form.address,
        date: dateString,
        time: timeString,
      }),
    });

    if (res.ok) {
      const newGig = await res.json();
      setGigs([newGig, ...gigs]);
      setForm({
        title: "",
        placeDetails: "",
        address: "",
        date: null,
        time: null,
      });
      setNotification("Keikka lisätty onnistuneesti!");
    } else {
      setNotification("Virhe lisäyksessä.");
    }
    setTimeout(() => setNotification(null), 4000);
  };

  // 🔹 Aloita muokkaus
  const startEditing = (gig: Gig) => {
    setEditingGig(gig);
    setEditForm({
      title: gig.title,
      placeDetails: gig.placeDetails || "",
      address: gig.address,
      date: gig.date ? new Date(gig.date) : null,
      time: gig.time
        ? (() => {
            const [h, m] = gig.time.split(":");
            const d = new Date();
            d.setHours(parseInt(h), parseInt(m));
            return d;
          })()
        : null,
    });
  };

  // 🔹 Päivitä keikka
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGig) return;

    const dateString = editForm.date
      ? editForm.date.toISOString().split("T")[0]
      : "";
    const timeString = editForm.time
      ? editForm.time.toLocaleTimeString("fi-FI", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    const res = await fetch("/api/standup", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingGig.id,
        title: editForm.title,
        placeDetails: editForm.placeDetails,
        address: editForm.address,
        date: dateString,
        time: timeString,
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      setGigs(gigs.map((g) => (g.id === updated.id ? updated : g)));
      setEditingGig(null);
      setNotification("Keikka päivitetty onnistuneesti!");
    } else {
      setNotification("Virhe päivityksessä.");
    }
    setTimeout(() => setNotification(null), 4000);
  };

  // 🔹 Poista keikka
  const confirmDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/standup?id=${deleteId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setGigs(gigs.filter((g) => g.id !== deleteId));
      setNotification("Keikka poistettu.");
    } else {
      setNotification("Virhe poistossa.");
    }
    setDeleteId(null);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-semibold text-yellow-400 mb-6">
        Stand Up -keikkojen hallinta
      </h1>

      {notification && (
        <div className="bg-yellow-900/40 text-yellow-300 py-2 mb-6 rounded-md border border-yellow-700/40">
          {notification}
        </div>
      )}

      {/* 🔹 Lisää keikka -lomake */}
      <form
        onSubmit={handleSubmit}
        className="bg-black/20 backdrop-blur-sm border border-yellow-700/40 rounded-xl p-6 mb-10 space-y-4 shadow-[0_0_15px_rgba(0,0,0,0.4)] transition-all duration-300"
      >
        <input
          type="text"
          placeholder="Keikan nimi (esim. Haaska Stand Up)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md 
             focus:border-yellow-400 text-white placeholder-gray-400 outline-none transition"
          required
        />

        <input
          type="text"
          placeholder="Tarkempi paikka (esim. Pannuhuoneella)"
          value={form.placeDetails}
          onChange={(e) => setForm({ ...form, placeDetails: e.target.value })}
          className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md 
             focus:border-yellow-400 text-white placeholder-gray-400 outline-none transition"
        />

        <input
          type="text"
          placeholder="Paikka ja osoite (esim. Kuopio, Kauppakatu 25)"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md 
             focus:border-yellow-400 text-white placeholder-gray-400 outline-none transition"
          required
        />

        {/* 🔹 Päivämäärä ja kellonaika */}
        <div className="flex flex-col sm:flex-row gap-1 justify-start text-left">
          <div className="sm:w-[32%]">
            <DatePickerField

              selected={form.date}
              onChange={(date) => setForm({ ...form, date })}
            />
          </div>

          <div className="sm:w-[23%]">
            <DatePicker
              selected={form.time}
              onChange={(time) => setForm({ ...form, time })}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Kellonaika"
              dateFormat="HH:mm"
              placeholderText="Valitse kellonaika"
              locale="fi"
              className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md 
        text-white placeholder-gray-400 outline-none focus:border-yellow-400 transition"
              popperClassName="z-[9999]"
              portalId="root-portal"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-yellow-500 text-black font-semibold px-6 py-2 rounded-md hover:bg-yellow-400 transition"
        >
          Lisää keikka
        </button>
      </form>

      {/* 🔹 Muokkauslomake*/}
      {gigs.map((gig) => (
        <div
          key={gig.id}
          className="bg-black/25 backdrop-blur-sm border border-yellow-700/30 rounded-lg p-4 shadow-[0_0_12px_rgba(0,0,0,0.4)] transition-all duration-300 hover:bg-black/40 hover:border-yellow-400"
        >
          {editingGig?.id === gig.id ? (
            <form
              onSubmit={handleUpdate}
              className="bg-black/20 backdrop-blur-sm border border-yellow-700/40 rounded-xl p-6 mb-10 space-y-4 shadow-[0_0_15px_rgba(0,0,0,0.4)] transition-all duration-300"
            >
              <input
                type="text"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md 
                  focus:border-yellow-400 text-white placeholder-gray-400 outline-none transition"
                placeholder="Keikan nimi"
                required
              />

              <input
                type="text"
                value={editForm.placeDetails}
                onChange={(e) =>
                  setEditForm({ ...editForm, placeDetails: e.target.value })
                }
                className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md 
                  focus:border-yellow-400 text-white placeholder-gray-400 outline-none transition"
                placeholder="Tarkempi paikka"
              />

              <input
                type="text"
                value={editForm.address}
                onChange={(e) =>
                  setEditForm({ ...editForm, address: e.target.value })
                }
                className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md 
                  focus:border-yellow-400 text-white placeholder-gray-400 outline-none transition"
                placeholder="Osoite"
                required
              />

              {/* 🔹 Päivämäärä ja kellonaika */}
              <div className="flex flex-col sm:flex-row gap-1 justify-start text-left">
                <div className="sm:w-[32%]">
                  <DatePickerField
                    label="Päivämäärä"
                    selected={editForm.date}
                    onChange={(date) => setEditForm({ ...editForm, date })}
                  />
                </div>

                <div className="sm:w-[23%]">
                  <DatePicker
                    selected={form.time}
                    onChange={(time) => setForm({ ...form, time })}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Kellonaika"
                    dateFormat="HH:mm"
                    placeholderText="Valitse kellonaika"
                    locale="fi"
                    className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md 
                              text-white placeholder-gray-400 outline-none focus:border-yellow-400 transition"
                    popperClassName="z-[9999]"
                    portalId="root-portal"
                  />
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  type="submit"
                  className="bg-yellow-500 text-black font-semibold px-6 py-2 rounded-md hover:bg-yellow-400 transition"
                >
                  Tallenna
                </button>
                <button
                  type="button"
                  onClick={() => setEditingGig(null)}
                  className="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-6 py-2 rounded-md transition"
                >
                  Peruuta
                </button>
              </div>
            </form>
          ) : (
            // 🔸 NORMAALITILA
            <>
              <h2 className="text-lg text-white font-semibold mb-2">
                {gig.title}
              </h2>
              {gig.placeDetails && (
                <p className="text-white">{gig.placeDetails}</p>
              )}
              <p className="text-gray-200">{gig.address}</p>
              <p className="text-sm text-gray-400">
                {new Date(gig.date).toLocaleDateString("fi-FI")}
                {gig.time ? ` klo ${gig.time}` : ""}
              </p>

              <div className="flex justify-center gap-2 mt-3">
                <button
                  onClick={() => startEditing(gig)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-1 rounded-md transition"
                >
                  Muokkaa
                </button>
                <button
                  onClick={() => setDeleteId(gig.id)}
                  className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-1 rounded-md transition"
                >
                  Poista
                </button>
              </div>
            </>
          )}
        </div>
      ))}
      <ConfirmModal
        show={deleteId !== null}
        message="Haluatko varmasti poistaa tämän keikan?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
