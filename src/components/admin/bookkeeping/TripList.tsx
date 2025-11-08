"use client";
import { useEffect, useState } from "react";
import { MoreVertical, ChevronDown, ChevronRight } from "lucide-react";
import ConfirmModal from "@/components/common/ConfirmModal";
import DatePickerField from "@/components/common/DatePickerField";

type Trip = {
  id: number;
  date: string;
  startAddress: string;
  endAddress: string;
  kilometers: number;
  allowance: string;
  notes?: string;
};
type MonthGroup = {
  [month: string]: Trip[];
};

type YearGroup = {
  [year: string]: MonthGroup;
};

export default function TripList({
  refreshKey,
  searchTerm,
}: {
  refreshKey: number;
  searchTerm: string;
}) {
  const [notification, setNotification] = useState<string | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [editForm, setEditForm] = useState({
    allowance: "",
    date: "",
    startAddress: "",
    endAddress: "",
    kilometers: "",
    notes: "",
  });

  const [openYears, setOpenYears] = useState<string[]>([]);
  const [openMonths, setOpenMonths] = useState<string[]>([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const res = await fetch("/api/bookkeeping/trips");
      const data = await res.json();

      // 🔹 Järjestetään uusin ensin
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

  const startEditing = (trip: Trip) => {
    setEditingTrip(trip);
    setEditForm({
      allowance: trip.allowance,
      date: trip.date,
      startAddress: trip.startAddress,
      endAddress: trip.endAddress,
      kilometers: trip.kilometers.toString(),
      notes: trip.notes || "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrip) return;

    try {
      const payload = {
        id: editingTrip.id,
        allowance: editForm.allowance,
        date: editForm.date,
        startAddress: editForm.startAddress,
        endAddress: editForm.endAddress,
        kilometers: parseFloat(editForm.kilometers) || 0,
        notes: editForm.notes,
      };

      const res = await fetch("/api/bookkeeping/trips", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setTrips(trips.map((t) => (t.id === updated.id ? updated : t)));
        setNotification("✅ Matka päivitetty onnistuneesti!");
        setEditingTrip(null);
      } else {
        setNotification("❌ Virhe päivityksessä, tarkista kentät.");
      }
    } catch (err) {
      console.error("Virhe:", err);
      setNotification("⚠️ Yhteysvirhe päivityksessä.");
    } finally {
      setTimeout(() => setNotification(null), 4000);
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

  // 🔹 Suodatetaan hakusanan mukaan
  const filteredGrouped = Object.entries(groupedTrips)
    .map(([year, months]): [string, MonthGroup] => {
      const filteredMonths: MonthGroup = {};

      Object.entries(months).forEach(([month, list]) => {
        const filteredList = (list as Trip[]).filter(
          (t) =>
            t.startAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.endAddress.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filteredList.length > 0) filteredMonths[month] = filteredList;
      });

      return [year, filteredMonths];
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, months]) => Object.keys(months).length > 0) as [
    string,
    MonthGroup
  ][];

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-4">
      {notification && (
        <div className="bg-yellow-900/40 border border-yellow-600/40 text-yellow-300 rounded-md p-2 text-center font-semibold">
          {notification}
        </div>
      )}

      {filteredGrouped.length > 0 ? (
        filteredGrouped
          .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA)) // 🔹 Uusin vuosi ensin
          .map(([year, months]) => (
            <div
              key={year}
              className="bg-black/40 rounded-xl border border-yellow-700/40 p-4"
            >
              {/* 🔹 Vuosiotsikko */}
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

              {/* 🔹 Kuukaudet */}
              {openYears.includes(year) && (
                <div className="mt-3 space-y-3">
                  {Object.entries(months)
                    .sort(
                      ([a], [b]) =>
                        new Date(`${b} 1, ${year}`).getTime() -
                        new Date(`${a} 1, ${year}`).getTime()
                    )
                    .map(([month, list]: [string, Trip[]]) => (
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
                            {list.map((trip: Trip) => (
                              <div
                                key={trip.id}
                                className="border border-yellow-800/40 rounded-lg p-4 hover:bg-black/40 transition relative"
                              >
                                {editingTrip?.id === trip.id ? (
                                  /* 🟡 Muokkaustila */
                                  <form
                                    onSubmit={handleUpdate}
                                    className="space-y-3"
                                  >
                                    <DatePickerField
                                      label="Päivämäärä"
                                      selected={
                                        editForm.date
                                          ? new Date(editForm.date)
                                          : null
                                      }
                                      onChange={(date) =>
                                        setEditForm({
                                          ...editForm,
                                          date: date
                                            ? date.toISOString().split("T")[0]
                                            : "",
                                        })
                                      }
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-yellow-300 font-semibold">
                                          Lähtöosoite
                                        </label>
                                        <input
                                          type="text"
                                          value={editForm.startAddress}
                                          onChange={(e) =>
                                            setEditForm({
                                              ...editForm,
                                              startAddress: e.target.value,
                                            })
                                          }
                                          className="w-full p-2 bg-black/40 border border-yellow-700/40 rounded-md text-yellow-100"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-yellow-300 font-semibold">
                                          Määränpää
                                        </label>
                                        <input
                                          type="text"
                                          value={editForm.endAddress}
                                          onChange={(e) =>
                                            setEditForm({
                                              ...editForm,
                                              endAddress: e.target.value,
                                            })
                                          }
                                          className="w-full p-2 bg-black/40 border border-yellow-700/40 rounded-md text-yellow-100"
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-yellow-300 font-semibold">
                                          Päiväraha
                                        </label>
                                        <select
                                          value={editForm.allowance}
                                          onChange={(e) =>
                                            setEditForm({
                                              ...editForm,
                                              allowance: e.target.value,
                                            })
                                          }
                                          className="w-full p-2 bg-black/40 border border-yellow-700/40 rounded-md text-yellow-100"
                                        >
                                          <option value="">Valitse</option>
                                          <option value="full">
                                            Kokopäiväraha 53€
                                          </option>
                                          <option value="half">
                                            Osapäiväraha 24€
                                          </option>
                                          <option value="none">
                                            Ei päivärahaa
                                          </option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-yellow-300 font-semibold">
                                          Kilometrit
                                        </label>
                                        <input
                                          type="number"
                                          min="0"
                                          step="0.1"
                                          value={editForm.kilometers}
                                          onChange={(e) =>
                                            setEditForm({
                                              ...editForm,
                                              kilometers: e.target.value,
                                            })
                                          }
                                          className="w-full p-2 bg-black/40 border border-yellow-700/40 rounded-md text-yellow-100"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-yellow-300 font-semibold">
                                        Lisätiedot
                                      </label>
                                      <textarea
                                        value={editForm.notes}
                                        onChange={(e) =>
                                          setEditForm({
                                            ...editForm,
                                            notes: e.target.value,
                                          })
                                        }
                                        placeholder="Lisätietoja matkasta..."
                                        className="w-full p-2 bg-black/40 border border-yellow-700/40 rounded-md text-yellow-100"
                                        rows={3}
                                      />
                                    </div>

                                    <div className="flex justify-center gap-3 mt-3">
                                      <button
                                        type="submit"
                                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-5 py-2 rounded-md"
                                      >
                                        Tallenna
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingTrip(null)}
                                        className="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-5 py-2 rounded-md"
                                      >
                                        Peruuta
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  /* 🟢 Normaali tila */

                                  <>
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

                                        {/* Kolmen pisteen menu */}
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
                                                  startEditing(trip);
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
                                  </>
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
