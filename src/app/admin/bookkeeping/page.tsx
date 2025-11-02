"use client";

import { useState } from "react";

export default function BookkeepingPage() {
  const [activeTab, setActiveTab] = useState<"invoices" | "expenses">("invoices");

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold text-yellow-400 mb-8 text-center">
        Kirjanpito ja laskutus
      </h1>

      {/* Välilehdet */}
      <div className="flex justify-center gap-4 mb-10">
        <button
          onClick={() => setActiveTab("invoices")}
          className={`px-5 py-2 rounded-lg font-semibold transition ${
            activeTab === "invoices"
              ? "bg-yellow-500 text-black"
              : "bg-yellow-700/20 border border-yellow-700/40 hover:bg-yellow-700/40"
          }`}
        >
          Laskut
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          className={`px-5 py-2 rounded-lg font-semibold transition ${
            activeTab === "expenses"
              ? "bg-yellow-500 text-black"
              : "bg-yellow-700/20 border border-yellow-700/40 hover:bg-yellow-700/40"
          }`}
        >
          Kulut
        </button>
      </div>

      {/* Välilehden sisältö */}
      {activeTab === "invoices" ? (
        <section className="max-w-2xl mx-auto bg-black/40 border border-yellow-700/40 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">
            Lähetetyt laskut
          </h2>

          {/* Tähän lisätään laskulista myöhemmin */}
          <p className="text-gray-400">
            Täällä näkyvät lähetetyt laskut. Myöhemmin tänne lisätään mahdollisuus
            luoda uusi lasku ja lähettää se asiakkaalle (SumUp API -integraatio).
          </p>

          <button className="mt-6 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2 rounded-md transition">
            + Luo uusi lasku
          </button>
        </section>
      ) : (
        <section className="max-w-2xl mx-auto bg-black/40 border border-yellow-700/40 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">
            Kulu- ja ostotapahtumat
          </h2>

          <p className="text-gray-400">
            Tänne voi myöhemmin lisätä yrityksen kulut (esim. tarvikkeet, matkat,
            maksut SumUpin kautta) ja tallentaa ne kirjanpitoa varten.
          </p>

          <button className="mt-6 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2 rounded-md transition">
            + Lisää kulu
          </button>
        </section>
      )}
    </main>
  );
}
