"use client";

import { useEffect, useState } from "react";
import { MoreVertical } from "lucide-react";
import ConfirmModal from "@/components/common/ConfirmModal";

type Category = {
  id: number;
  name: string;
  type: string;
  defaultVat: number;
};

export default function CategoryList({
  refreshKey,
  searchTerm,
  setShowForm,
  setFormCategoryId,
}: {
  refreshKey: number;
  searchTerm: string;
  setShowForm: (v: boolean) => void;
  setFormCategoryId: (id: number | null) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);


  
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch("/api/bookkeeping/categories");
      const data = await res.json();
      setCategories(data);
    };

    fetchCategories();
  }, [refreshKey]);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
  if (!deleteId) return;

  await fetch(`/api/bookkeeping/categories/${deleteId}`, {
    method: "DELETE",
  });

  // 🔥 Poista rivin näkyvistä välittömästi
  setCategories((prev) => prev.filter((c) => c.id !== deleteId));

  setShowDelete(false);
  setDeleteId(null);
};

  return (
    <div className="bg-black/40 border border-yellow-700/40 rounded-xl p-6">
      {filtered.length === 0 ? (
        <p className="text-gray-400 italic">Ei kategorioita.</p>
      ) : (
        <table className="w-full text-sm text-gray-300 border-collapse relative">
          <thead>
            <tr className="border-b border-yellow-700/40 text-yellow-400 text-left">
              <th className="py-2 px-3">Nimi</th>
              <th className="py-2 px-3">Tyyppi</th>
              <th className="py-2 px-3">ALV-oletus</th>
              <th className="py-2 px-3 w-10"></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((cat) => (
              <tr
                key={cat.id}
                className="border-b border-yellow-700/20 hover:bg-yellow-700/10 transition"
              >
                <td className="py-2 px-3">{cat.name}</td>
                <td className="py-2 px-3">
                  {cat.type === "TULO" ? "Tulo" : "Meno"}
                </td>
                <td className="py-2 px-3">{cat.defaultVat} %</td>

                {/* ⋯ MENU */}
                <td className="py-2 px-3 relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === cat.id ? null : cat.id)
                    }
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenuId === cat.id && (
                    <div className="absolute right-6 top-6 bg-black border border-yellow-700/40 rounded-md shadow-lg z-20 w-32">
                      <button
                        onClick={() => {
                          setFormCategoryId(cat.id);
                          setShowForm(true);
                          setOpenMenuId(null);
                        }}
                        className="block w-full text-left px-3 py-2 text-sm text-yellow-400 hover:bg-yellow-700/20"
                      >
                        Muokkaa
                      </button>

                      <button
                        onClick={() => {
                          setDeleteId(cat.id);
                          setShowDelete(true);
                          setOpenMenuId(null);
                        }}
                        className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-700/20"
                      >
                        Poista
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 🔥 POISTO MODAALI */}
      <ConfirmModal
        show={showDelete}
        message="Haluatko varmasti poistaa tämän kategorian?"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
