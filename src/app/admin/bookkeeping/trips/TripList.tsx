//Kaikki matkat — listanäkymä
"use client";
import { useEffect, useState } from "react";
import { MoreVertical, ChevronDown, ChevronRight } from "lucide-react";
import ConfirmModal from "@/components/common/ConfirmModal";

type Trip = {
  id: number;
  date: string;
  startAddress: string;
  endAddress: string;
  kilometers: number;
  allowance: string;
  notes?: string;
};

type MonthGroup = { [month: string]: Trip[] };
type YearGroup = { [year: string]: MonthGroup };

export default function TripList({
  refreshKey,
  searchTerm,
  setShowForm,
  setEditingTrip,
}: {
  refreshKey: number;
  searchTerm: string;
  setShowForm: (v: boolean) => void;
  setEditingTrip: (trip: Trip | null) => void;
}) {

  const [trips, setTrips] = useState<Trip[]>([]);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [openYears, setOpenYears] = useState<string[]>([]);
  const [openMonths, setOpenMonths] = useState<string[]>([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const res = await fetch("/api/bookkeeping/trips");
      const data = await res.json();

      const sorted = data.sort(
        (a: Trip, b: Trip) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setTrips(sorted);
    };
    fetchTrips();
  }, [refreshKey]);

  const allowanceLabel = (a: string) => {
    if (a === "full") return "Kokopäiväraha 53€";
    if (a === "half") return "Osapäiväraha 24€";
    return "Ei päivärahaa";
  };

  const handleDelete = async (id: number | null) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/bookkeeping/trips?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTrips(trips.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("Virhe poistossa:", err);
    } finally {
      setDeleteId(null);
    }
  };

  // 🔹 Ryhmittely vuosi -> kuukausi
  const groupedTrips = trips.reduce<YearGroup>((acc, trip) => {
    const date = new Date(trip.date);
    const year = date.getFullYear();
    const month = date.toLocaleString("fi-FI", { month: "long" });
    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
    acc[year][month].push(trip);
    return acc;
  }, {});

  // 🔹 Suodatus
  const filteredGrouped = Object.entries(groupedTrips)
    .map(([year, months]): [string, MonthGroup] => {
      const filteredMonths: MonthGroup = {};

      Object.entries(months).forEach(([month, list]) => {
        const filteredList = list.filter(
          (t) =>
            t.startAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.endAddress.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filteredList.length > 0) filteredMonths[month] = filteredList;
      });

      return [year, filteredMonths];
    })
    .filter(([, months]) => Object.keys(months).length > 0);

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-4">
      {filteredGrouped.length > 0 ? (
        filteredGrouped
          .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
          .map(([year, months]) => (
            <div
              key={year}
              className="bg-black/40 rounded-xl border border-yellow-700/40 p-4"
            >
              {/* Vuosiotsikko */}
              <button
                onClick={() =>
                  setOpenYears((prev) =>
                    prev.includes(year)
                      ? prev.filter((y) => y !== year)
                      : [...prev, year]
                  )
                }
                className="w-full flex justify-between items-center text-yellow-400 text-lg font-bold"
              >
                <span>{year}</span>
                {openYears.includes(year) ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>

              {/* Kuukaudet */}
              {openYears.includes(year) && (
                <div className="mt-3 space-y-3">
                  {Object.entries(months)
                    .sort(
                      ([a], [b]) =>
                        new Date(`${b} 1, ${year}`).getTime() -
                        new Date(`${a} 1, ${year}`).getTime()
                    )
                    .map(([month, list]) => (
                      <div
                        key={month}
                        className="bg-black/30 rounded-lg p-3 border border-yellow-800/30"
                      >
                        <button
                          onClick={() =>
                            setOpenMonths((prev) =>
                              prev.includes(`${year}-${month}`)
                                ? prev.filter((m) => m !== `${year}-${month}`)
                                : [...prev, `${year}-${month}`]
                            )
                          }
                          className="w-full flex justify-between items-center text-yellow-300 font-semibold"
                        >
                          <span className="capitalize">{month}</span>
                          {openMonths.includes(`${year}-${month}`) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>

                        {openMonths.includes(`${year}-${month}`) && (
                          <div className="mt-2 space-y-2">
                            {list.map((trip) => (
                              <div
                                key={trip.id}
                                className="border border-yellow-800/40 rounded-lg p-4 hover:bg-black/40 transition relative"
                              >
                                {/* 🔸 Näytä matka normaalisti */}
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-yellow-300 gap-2">
                                  <div className="flex-1">
                                    <span>
                                      {new Date(
                                        trip.date
                                      ).toLocaleDateString("fi-FI")}
                                    </span>
                                    <div className="text-sm text-yellow-100 mt-1">
                                      Päiväraha:{" "}
                                      {allowanceLabel(trip.allowance)}
                                    </div>
                                  </div>

                                  <div className="flex-1 text-center sm:text-left">
                                    {trip.startAddress} → {trip.endAddress}
                                  </div>

                                  <div className="flex items-center justify-end gap-3">
                                    <span className="text-yellow-400">
                                      {trip.kilometers} km
                                    </span>

                                    {/* 3 pisteen menu */}
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setMenuOpenId(
                                            menuOpenId === trip.id
                                              ? null
                                              : trip.id
                                          )
                                        }
                                        className="p-1 rounded-full hover:bg-yellow-600/20 transition"
                                      >
                                        <MoreVertical className="w-5 h-5 text-yellow-400" />
                                      </button>

                                      {menuOpenId === trip.id && (
                                        <div className="absolute right-0 top-7 w-32 bg-black border border-yellow-700/50 rounded-md shadow-lg z-30">
                                          <button
                                            onClick={() => {
                                              setMenuOpenId(null);
                                              setEditingTrip(trip); // ⭐ popup-muokkaus
                                              setShowForm(true);
                                            }}
                                            className="block w-full text-left px-3 py-2 text-yellow-200 hover:bg-yellow-700/20"
                                          >
                                            Muokkaa
                                          </button>

                                          <button
                                            onClick={() => {
                                              setMenuOpenId(null);
                                              setDeleteId(trip.id);
                                            }}
                                            className="block w-full text-left px-3 py-2 text-red-400 hover:bg-red-700/20"
                                          >
                                            Poista
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {trip.notes && (
                                  <div className="text-sm text-yellow-200 italic mt-2 border-t border-yellow-700/30 pt-2">
                                    {trip.notes}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))
      ) : (
        <p className="text-gray-400 italic text-center">
          Ei vielä tallennettuja keikkamatkoja.
        </p>
      )}

      <ConfirmModal
        show={deleteId !== null}
        message="Haluatko varmasti poistaa tämän matkan?"
        onConfirm={() => handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}