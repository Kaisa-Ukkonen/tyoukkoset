"use client";

import { useState, useEffect } from "react";

type Gig = {
  id: string;
  title: string;
  venue: string;
  city: string;
  address: string; // 🆕 lisätty
  date: string;
  time: string;
};

export default function AdminStandupPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [form, setForm] = useState({
    title: "",
    address: "",
    date: "",
    time: "",
  });
  const [notification, setNotification] = useState<string | null>(null);
  const [editingGig, setEditingGig] = useState<Gig | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    address: "",
    date: "",
    time: "",
  });

  const startEditing = (gig: Gig) => {
    setEditingGig(gig);
    setEditForm({
      title: gig.title,
      address: gig.address,
      date: gig.date.split("T")[0],
      time: gig.time || "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGig) return;

    const res = await fetch("/api/standup", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingGig.id, ...editForm }),
    });

    if (res.ok) {
      const updated = await res.json();
      setGigs(gigs.map((g) => (g.id === updated.id ? updated : g)));
      setEditingGig(null);
      setNotification("Keikka päivitetty onnistuneesti!");
      setTimeout(() => setNotification(null), 4000);
    } else {
      setNotification("Virhe päivityksessä.");
      setTimeout(() => setNotification(null), 4000);
    }
  };

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
    const res = await fetch("/api/standup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form), // 🟡 address mukana
    });

    if (res.ok) {
      const newGig = await res.json();
      setGigs([newGig, ...gigs]);
      setForm({ title: "", address: "", date: "", time: "" });
      setNotification("Keikka lisätty onnistuneesti!");
      setTimeout(() => setNotification(null), 4000);
    } else {
      setNotification("Virhe lisäyksessä.");
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // 🔹 Poista keikka
  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/standup?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setGigs(gigs.filter((g) => g.id !== id));
      setNotification("Keikka poistettu.");
      setTimeout(() => setNotification(null), 4000);
    }
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
        className="bg-black/40 border border-yellow-700/40 rounded-xl p-6 mb-10 space-y-4"
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
          placeholder="Paikka ja osoite (esim. Kuopio, Kauppakatu 25)"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md 
             focus:border-yellow-400 text-white placeholder-gray-400 outline-none transition"
          required
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md 
             focus:border-yellow-400 text-white placeholder-gray-400 outline-none transition"
          required
        />
        <input
          type="time"
          value={form.time || ""}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          className="w-full p-3 bg-black/40 border border-yellow-700/40 rounded-md text-white"
          placeholder="Kellonaika"
        />
        <button
          type="submit"
          className="bg-yellow-500 text-black font-semibold px-6 py-2 rounded-md hover:bg-yellow-400 transition"
        >
          Lisää keikka
        </button>
      </form>

      {/* 🔹 Keikkalista */}

      {gigs.map((gig) => (
        <div
          key={gig.id}
          className="bg-black/40 border border-yellow-700/30 rounded-lg p-4"
        >
          {editingGig?.id === gig.id ? (
            // 🔹 MUOKKAUSTILA
            <form
              onSubmit={handleUpdate}
              className="bg-black/40 border border-yellow-700/40 rounded-lg p-4 space-y-4"
            >
              <input
                type="text"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md 
             focus:border-yellow-400 text-white placeholder-gray-400 outline-none transition"
                placeholder="Keikan nimi (esim. Haaska Stand Up)"
                required
              />

              <input
                type="text"
                value={editForm.address}
                onChange={(e) =>
                  setEditForm({ ...editForm, address: e.target.value })
                }
                className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md 
             focus:border-yellow-400 text-white placeholder-gray-400 outline-none transition"
                placeholder="Paikka ja osoite (esim. Kuopio, Kauppakatu 25)"
                required
              />

              <input
                type="date"
                value={editForm.date}
                onChange={(e) =>
                  setEditForm({ ...editForm, date: e.target.value })
                }
                className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md 
             focus:border-yellow-400 text-white placeholder-gray-400 outline-none transition"
                required
              />

              {/* 🔹 Kellonaikakenttä */}
              <div className="relative">
                <input
                  type="time"
                  value={editForm.time || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, time: e.target.value })
                  }
                  className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md 
               focus:border-yellow-400 text-white placeholder-gray-400 outline-none transition pr-10"
                />
                <span className="absolute right-3 top-3 text-yellow-500 pointer-events-none">
                  🕒
                </span>
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
            // 🔹 NORMAALITILA
            <>
              <h2 className="text-lg text-white font-semibold mb-2">
                {gig.title}
              </h2>
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
                  onClick={() => handleDelete(gig.id)}
                  className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-1 rounded-md transition"
                >
                  Poista
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
