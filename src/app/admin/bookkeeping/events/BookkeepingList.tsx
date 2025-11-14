"use client";

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

export default function BookkeepingList({
  entries = [],
}: {
  entries: Entry[];
}) {
  if (entries.length === 0) {
    return (
      <p className="text-gray-500 text-center mt-6">
        Ei vielä kirjattuja tapahtumia.
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-6 bg-black/40 border border-yellow-700/40 rounded-xl p-6 shadow-[0_0_15px_rgba(0,0,0,0.4)] overflow-x-auto">
      <h3 className="text-xl font-semibold text-yellow-400 mb-4 text-center">
        Kirjatut tapahtumat
      </h3>

      <table className="w-full text-sm text-gray-300 border-collapse">
        <thead>
          <tr className="border-b border-yellow-700/40 text-yellow-400 text-left">
            <th className="py-2 px-3">Päivämäärä</th>
            <th className="py-2 px-3">Tili</th>
            <th className="py-2 px-3">Kuvaus</th>
            <th className="py-2 px-3 text-right">Summa (€)</th>
            <th className="py-2 px-3 text-right">ALV (%)</th>
            <th className="py-2 px-3">Maksutapa</th>
          </tr>
        </thead>

        <tbody>
          {entries.map((entry, index) => (
            <tr
              key={entry.id || `temp-${index}`}
              className="border-b border-gray-800 hover:bg-yellow-700/10 transition"
            >
              <td className="py-2 px-3">
                {entry.date
                  ? new Date(entry.date).toLocaleDateString("fi-FI")
                  : "-"}
              </td>
              <td className="py-2 px-3 text-yellow-300 font-medium">
                {entry.account?.name || "-"}
              </td>
              <td className="py-2 px-3 text-gray-400">
                {entry.description || "-"}
              </td>
              <td className="py-2 px-3 text-right">
                {entry.amount ? Number(entry.amount).toFixed(2) : "-"}
              </td>
              <td className="py-2 px-3 text-right">{entry.vatRate}</td>
              <td className="py-2 px-3 text-gray-400">
                {entry.paymentMethod || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
