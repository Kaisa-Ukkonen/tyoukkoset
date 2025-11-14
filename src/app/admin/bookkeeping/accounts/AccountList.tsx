"use client";

import { useEffect, useState } from "react";
import { MoreVertical } from "lucide-react";

interface Account {
  id: number;
  number: number;
  name: string;
  type: "tulo" | "meno";
  vatHandling: string;
  vatRate: number;
  openingBalance: number;
}

interface AccountListProps {
  refreshKey: number;
  searchTerm: string;
  setShowForm: (value: boolean) => void;
  setFormAccountId: (id: number | null) => void;
}

export default function AccountList({
  refreshKey,
  searchTerm,
  setShowForm,
  setFormAccountId,
}: AccountListProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  // 🔹 Hae tilit
  useEffect(() => {
    fetch("/api/bookkeeping/accounts")
      .then((r) => r.json())
      .then((data) => setAccounts(data));
  }, [refreshKey]);

  // 🔹 Suodatus
  const filtered = accounts.filter((acc) =>
    acc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔹 Muokkaus
  const handleEdit = (id: number) => {
    setFormAccountId(id);
    setShowForm(true);
  };

  return (
    <div className="bg-black/40 border border-yellow-700/40 rounded-xl p-4 shadow-lg">
      {filtered.length === 0 ? (
        <p className="text-gray-400 italic">Ei tilejä haulla.</p>
      ) : (
        <table className="w-full text-sm text-gray-300 border-collapse">
          <thead>
            <tr className="border-b border-yellow-700/40 text-yellow-400 uppercase text-xs tracking-wider">
              <th className="py-2 px-3 text-left">#</th>
              <th className="py-2 px-3 text-left">Nimi</th>
              <th className="py-2 px-3 text-left">Tyyppi</th>
              <th className="py-2 px-3 text-left">ALV</th>
              <th className="py-2 px-3 text-right"></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((acc) => (
              <tr
                key={acc.id}
                className="border-b border-yellow-700/20 hover:bg-yellow-700/10"
              >
                <td className="py-2 px-3">{acc.number}</td>
                <td className="py-2 px-3">{acc.name}</td>
                <td className="py-2 px-3">{acc.type}</td>
                <td className="py-2 px-3">{acc.vatRate} %</td>

                <td className="py-2 px-3 text-right relative">
                  {/* ⋯ valikko */}
                  <button
                    onClick={() =>
                      setMenuOpenId(menuOpenId === acc.id ? null : acc.id)
                    }
                  >
                    <MoreVertical className="text-gray-400 hover:text-yellow-400" />
                  </button>

                  {menuOpenId === acc.id && (
                    <div className="absolute right-3 top-7 bg-black/90 border border-yellow-700/40 rounded-md shadow-lg z-20">
                      <button
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-yellow-700/20"
                        onClick={() => handleEdit(acc.id)}
                      >
                        Muokkaa
                      </button>

                      {/* Poisto lisätään myöhemmin */}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
