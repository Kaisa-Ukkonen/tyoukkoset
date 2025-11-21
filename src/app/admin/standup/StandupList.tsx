//Tämä komponentti näyttää kaikki Stand Up -keikat listana ja mahdollistaa yksittäisten keikkojen muokkaamisen ja poistamisen inline-muokkaustilassa eli muokkaus tapahtuu suoraan listan sisällä.

import DatePicker from "react-datepicker";
import DatePickerField from "@/components/common/DatePickerField";

type Gig = {
  id: string;
  title: string;
  placeDetails: string;
  address: string;
  date: string;
  time: string;
};

type EditForm = {
  title: string;
  placeDetails: string;
  address: string;
  date: Date | null;
  time: Date | null;
};

type StandupListProps = {
  filteredGigs: Gig[];
  editingGig: Gig | null;
  editForm: EditForm;
  setEditForm: React.Dispatch<React.SetStateAction<EditForm>>;
  startEditing: (gig: Gig) => void;
  handleUpdate: (e: React.FormEvent<HTMLFormElement>) => void;
  setDeleteId: (id: string) => void;
  setEditingGig: React.Dispatch<React.SetStateAction<Gig | null>>;
};

export default function StandupList({
  filteredGigs,
  editingGig,
  editForm,
  setEditForm,
  startEditing,
  handleUpdate,
  setDeleteId,
  setEditingGig,
}: StandupListProps) {
  return (
    <>
      {filteredGigs.map((gig) => (
        <div
          key={gig.id}
          className="bg-black/25 backdrop-blur-sm border border-yellow-700/30 rounded-lg p-4 shadow-[0_0_12px_rgba(0,0,0,0.4)] transition-all duration-300 hover:bg-black/40 hover:border-yellow-400"
        >
          {editingGig?.id === gig.id ? (
            /* 🔹 MUOKKAUSLOMAKE */
            <form
              onSubmit={handleUpdate}
              className="bg-black/20 backdrop-blur-sm border border-yellow-700/40 rounded-xl p-6 mb-4 space-y-5 shadow-[0_0_15px_rgba(0,0,0,0.4)] transition-all duration-300"
            >
              {/* Keikan nimi */}
              <div className="relative">
                <label className="absolute -top-2.5 left-3 px-1 text-xs text-yellow-400 bg-black rounded-sm z-10">
                  Keikan nimi
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md focus:border-yellow-400 text-white"
                  required
                />
              </div>

              {/* Tarkempi paikka */}

              <div className="relative">
                <label className="absolute -top-2.5 left-3 px-1 text-xs text-yellow-400 bg-black rounded-sm z-10">
                  Tarkempi paikka
                </label>
                <input
                  type="text"
                  value={editForm.placeDetails}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      placeDetails: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md focus:border-yellow-400 text-white"
                />
              </div>

              {/* Osoite */}
              <div className="relative">
                <label className="absolute -top-2.5 left-3 px-1 text-xs text-yellow-400 bg-black rounded-sm z-10">
                  Paikka ja osoite
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                  className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md focus:border-yellow-400 text-white"
                  required
                />
              </div>

              {/* Päivämäärä + aika */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="w-full sm:w-auto sm:max-w-[200px]">
                  <DatePickerField
                    label="Päivämäärä"
                    selected={editForm.date}
                    onChange={(d) => setEditForm({ ...editForm, date: d })}
                  />
                </div>

                <div className="w-full sm:w-auto sm:max-w-[150px] relative">
                  <label className="absolute -top-2.5 left-3 px-1 text-xs text-yellow-400 bg-black rounded-sm z-10">
                    Kellonaika
                  </label>

                  <DatePicker
                    selected={editForm.time}
                    onChange={(t) => setEditForm({ ...editForm, time: t })}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    dateFormat="HH:mm"
                    placeholderText="Valitse kellonaika"
                    locale="fi"
                    wrapperClassName="w-full !h-12"
                    className="w-full h-11! py-1! px-3 bg-black/40 border border-yellow-600/40 
      rounded-md text-white placeholder-gray-400 outline-none 
      focus:border-yellow-400 transition"
                  />
                </div>
              </div>

              {/* Nappirivi */}
              <div className="flex justify-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingGig(null)}
                  className="bg-black/40 hover:bg-yellow-700/20 text-yellow-400 border border-yellow-700/40 px-7 py-2 rounded-md"
                >
                  Peruuta
                </button>

                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2 rounded-md"
                >
                  Tallenna
                </button>
              </div>
            </form>
          ) : (
            /* 🔹 LISTATILA */
            <>
              <h2 className="text-lg text-white font-semibold mb-2">
                {gig.title}
              </h2>

              {gig.placeDetails && (
                <p className="text-white">{gig.placeDetails}</p>
              )}

              <p className="text-gray-200">{gig.address}</p>

              <p className="text-sm text-gray-400">
                {new Date(gig.date).toLocaleDateString("fi-FI")}
                {gig.time ? ` klo ${gig.time}` : ""}
              </p>

              <div className="flex justify-center gap-2 mt-3">
                <button
                  onClick={() => startEditing(gig)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-1 rounded-md"
                >
                  Muokkaa
                </button>

                <button
                  onClick={() => setDeleteId(gig.id)}
                  className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-1 rounded-md"
                >
                  Poista
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </>
  );
}
