"use client";

import { useState, useEffect } from "react";
import { registerLocale } from "react-datepicker";
import { fi } from "date-fns/locale";
registerLocale("fi", fi);

import StandupForm from "@/app/admin/standup/StandupForm";

import StandupList from "@/app/admin/standup/StandupList";
import ConfirmModal from "@/components/common/ConfirmModal";

type Gig = {
  id: string;
  title: string;
  placeDetails: string;
  address: string;
  date: string;
  time: string;
};

export default function AdminStandupPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const [editingGig, setEditingGig] = useState<Gig | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [search, setSearch] = useState("");

  // 🔹 Lisää-lomakkeen state
  const [form, setForm] = useState({
    title: "",
    placeDetails: "",
    address: "",
    date: null as Date | null,
    time: null as Date | null,
  });

  // 🔹 Muokkauslomakkeen state
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

      setShowAddForm(false);
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
      time:
        gig.time && gig.time.includes(":")
          ? (() => {
              const [h, m] = gig.time.split(":").map(Number);
              const d = new Date();
              d.setHours(h, m, 0, 0);
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

    const res = await fetch(`/api/standup?id=${deleteId}`, { method: "DELETE" });

    if (res.ok) {
      setGigs(gigs.filter((g) => g.id !== deleteId));
      setNotification("Keikka poistettu.");
    } else {
      setNotification("Virhe poistossa.");
    }

    setDeleteId(null);
    setTimeout(() => setNotification(null), 4000);
  };

  // 🔹 Haku
  const filteredGigs = gigs.filter((g) => {
    const q = search.toLowerCase();
    return (
      g.title.toLowerCase().includes(q) ||
      g.placeDetails?.toLowerCase().includes(q) ||
      g.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-3xl mx-auto text-center">
      {/* 🔹 Yläosan header: otsikko + haku + nappi */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h3 className="text-2xl font-semibold text-yellow-400">Stand Up -keikat</h3>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hae keikkoja..."
            className="w-full sm:w-48 p-2 bg-black/40 border border-yellow-600/40 rounded-md 
              text-white placeholder-gray-400 outline-none focus:border-yellow-400 transition"
          />

          <button
            onClick={() => setShowAddForm(true)}
            className="bg-yellow-500 text-black font-semibold px-6 py-2 rounded-md 
              hover:bg-yellow-400 transition flex items-center gap-2"
          >
            <span className="text-lg font-bold">+</span> Uusi keikka
          </button>
        </div>
      </div>

      {/* 🔹 Ilmoitus */}
      {notification && (
        <div className="bg-yellow-900/40 text-yellow-300 py-2 mb-6 rounded-md border border-yellow-700/40">
          {notification}
        </div>
      )}

      {/* 🔹 Lisää-lomake */}
      {showAddForm && (
        <StandupForm
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* 🔹 Listaus (vain jos ei olla lisäämässä) */}
      {!showAddForm && (
        <StandupList
         
          filteredGigs={filteredGigs}
          editingGig={editingGig}
          editForm={editForm}
          setEditForm={setEditForm}
          startEditing={startEditing}
          handleUpdate={handleUpdate}
          setDeleteId={setDeleteId}
          setEditingGig={setEditingGig}
        />
      )}

      {/* 🔹 Deletemodal */}
      <ConfirmModal
        show={deleteId !== null}
        message="Haluatko varmasti poistaa tämän keikan?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
