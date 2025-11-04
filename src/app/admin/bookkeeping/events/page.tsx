"use client";

import { useEffect, useState } from "react";
import BookkeepingForm from "@/components/admin/bookkeeping/BookkeepingForm";
import BookkeepingList from "@/components/admin/bookkeeping/BookkeepingList";

type Entry = {
  id: number;
  date: string;
  description: string | null;
  type: string;
  amount: number;
  vatRate: number;
  paymentMethod: string | null;
  account: { name: string };
};

export default function EventsPage() {
  const [entries, setEntries] = useState<Entry[]>([]);

  // 🔹 Hakee tapahtumat tietokannasta
  const fetchEntries = async () => {
    try {
      const res = await fetch("/api/bookkeeping");
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error("Virhe tapahtumien haussa:", err);
    }
  };

  // 🔹 Suorita haku kerran sivun latautuessa
 useEffect(() => {
  const load = async () => {
    await fetchEntries();
  };
  load();
}, []);

  // 🔹 Lomake kutsuu tätä, kun uusi tapahtuma on tallennettu
 const handleNewEntry = (newEntry: Entry) => {
  setEntries((prev) =>
    [...prev, newEntry].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  );
};

  return (
    <main className="text-white p-8">
      <h1 className="text-3xl font-bold text-yellow-400 mb-8 text-center">
        Kirjanpidon tapahtumat
      </h1>

      {/* Lomake */}
      <BookkeepingForm onSuccess={handleNewEntry} />

      {/* Lista */}
      <div className="mt-10">
        <BookkeepingList entries={entries} />
      </div>
    </main>
  );
}
