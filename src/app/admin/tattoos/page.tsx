"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ConfirmModal from "@/components/common/ConfirmModal";

type Tattoo = {
  id: string;
  imageUrl: string;
};

export default function AdminTattoosPage() {
  const [tattoos, setTattoos] = useState<Tattoo[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 🪄 ref tiedostokentälle
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 🔹 Hae tatuoinnit API:sta
  useEffect(() => {
    fetch("/api/tattoos")
      .then((res) => res.json())
      .then((data) => setTattoos(data))
      .catch((err) => console.error("Virhe haussa:", err));
  }, []);

  // 🔹 Lähetä kuva
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setNotification("Valitse kuva ensin!");
      setIsError(true);
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/tattoos", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const newTattoo = await res.json();
        setTattoos([newTattoo, ...tattoos]);
        setFile(null);

        // 🪄 Nollataan tiedostokenttä
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        setNotification("Kuva lisätty onnistuneesti!");
        setIsError(false);
      } else {
        setNotification("Virhe lähetyksessä.");
        setIsError(true);
      }
    } catch (err) {
      console.error(err);
      setNotification("Verkkovirhe — yritä uudelleen.");
      setIsError(true);
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // 🔹 Poisto
  // 🔹 Avaa vahvistus
  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  // 🔹 Vahvista poisto
  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/tattoos?id=${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTattoos(tattoos.filter((t) => t.id !== deleteId));
        setNotification("Kuva poistettu onnistuneesti.");
        setIsError(false);
      } else {
        setNotification("Virhe poistossa.");
        setIsError(true);
      }
    } catch (err) {
      console.error(err);
      setNotification("Yhteysvirhe — poisto epäonnistui.");
      setIsError(true);
    } finally {
      setDeleteId(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold text-yellow-400 mb-6 text-center">
        Tatuointien hallinta
      </h1>

      {notification && (
        <div
          className={`text-center py-2 mb-6 rounded-md transition-all duration-500 ${
            isError
              ? "bg-red-900/60 text-red-300 border border-red-500/40"
              : "bg-yellow-900/40 text-yellow-300 border border-yellow-500/40"
          }`}
        >
          {notification}
        </div>
      )}

      <form
        onSubmit={handleUpload}
        className="bg-black/25 backdrop-blur-sm border border-yellow-700/40 rounded-xl p-6 mb-10 text-center shadow-[0_0_15px_rgba(0,0,0,0.4)] transition-all duration-300"
      >
        <h2 className="text-xl font-semibold mb-4 text-yellow-300">
          Lisää uusi tatuointikuva
        </h2>
        {/* --- Tyylikäs tiedostonvalitsin ja lähetysnappi --- */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {/* Käyttäjän klikkaama nappi */}
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2 rounded-md transition-all duration-300"
          >
            📁 Valitse kuva
          </label>

          {/* Piilotettu tiedostonvalitsin */}
          <input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />

          {/* Näytetään tiedoston nimi (tai viesti jos ei valittua) */}
          <span className="text-sm text-gray-400 min-w-[180px] text-center sm:text-left">
            {file ? file.name : "Ei valittua tiedostoa"}
          </span>

          {/* Lähetysnappi */}
          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-500 text-black font-semibold px-6 py-2 rounded-md hover:bg-yellow-400 transition disabled:opacity-50"
          >
            {loading ? "Ladataan..." : "Lähetä kuva"}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {tattoos.map((tattoo) => (
          <div
            key={tattoo.id}
            className="bg-black/25 backdrop-blur-sm border border-yellow-700/30 rounded-lg p-4 flex flex-col items-center text-center shadow-[0_0_12px_rgba(0,0,0,0.4)] transition-all duration-300 hover:bg-black/40 hover:border-yellow-400"
          >
            <div className="relative w-full aspect-square overflow-hidden rounded-lg mb-3">
              <Image
                src={tattoo.imageUrl}
                alt="Tatuointi"
                fill
                sizes="(max-width: 640px) 50vw,
         (max-width: 1024px) 33vw,
         25vw"
                priority={tattoo.imageUrl.includes("selka")} // 🔥 LCP-kuva eageriksi
                loading={tattoo.imageUrl.includes("selka") ? "eager" : "lazy"}
                className="object-cover"
              />
            </div>

            <button
              onClick={() => handleDelete(tattoo.id)}
              className="mt-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-md transition-all duration-300"
            >
              Poista
            </button>
          </div>
        ))}
      </div>

      <ConfirmModal
        show={deleteId !== null}
        message="Haluatko varmasti poistaa tämän tatuointikuvan?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
