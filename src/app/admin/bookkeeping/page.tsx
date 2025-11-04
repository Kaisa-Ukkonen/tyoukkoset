"use client";

import Link from "next/link";

export default function BookkeepingPage() {
  return (
    <main className="text-white p-8 text-center">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">
        Kirjanpito ja laskutus
      </h1>
      <p className="text-gray-400 max-w-2xl mx-auto mb-10">
        Hallinnoi yrityksen kirjanpitoa, laskutusta ja raportteja helposti yhdestä paikasta.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/admin/bookkeeping/events"
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-3 rounded-md transition"
        >
          Tapahtumat
        </Link>
        <Link
          href="/admin/bookkeeping/invoices"
          className="bg-yellow-700/20 border border-yellow-700/40 hover:bg-yellow-700/40 text-yellow-300 font-semibold px-6 py-3 rounded-md transition"
        >
          Laskut
        </Link>
      </div>
    </main>
  );
}
