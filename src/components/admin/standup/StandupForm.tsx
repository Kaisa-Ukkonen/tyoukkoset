import DatePickerField from "@/components/common/DatePickerField";
import DatePicker from "react-datepicker";

type StandupFormProps = {
  form: {
    title: string;
    placeDetails: string;
    address: string;
    date: Date | null;
    time: Date | null;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      title: string;
      placeDetails: string;
      address: string;
      date: Date | null;
      time: Date | null;
    }>
  >;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export default function StandupForm({
  form,
  setForm,
  onSubmit,
  onCancel,
}: StandupFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-black/20 backdrop-blur-sm border border-yellow-700/40 rounded-xl p-6 mb-10 space-y-4 shadow-[0_0_15px_rgba(0,0,0,0.4)] transition-all duration-300"
    >
      {/* 🔹 Keikan nimi */}
      <div className="relative">
        <label className="absolute -top-2.5 left-3 px-1 text-xs text-yellow-400 bg-black rounded-sm z-10">
          Keikan nimi
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Esim. Haaska Stand Up"
          className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md 
            focus:border-yellow-400 text-white placeholder-gray-400 outline-none transition"
          required
        />
      </div>

      {/* 🔹 Tarkempi paikka */}
      <div className="relative">
        <label className="absolute -top-2.5 left-3 px-1 text-xs text-yellow-400 bg-black rounded-sm z-10">
          Tarkempi paikka
        </label>
        <input
          type="text"
          value={form.placeDetails}
          onChange={(e) =>
            setForm({ ...form, placeDetails: e.target.value })
          }
          placeholder="Esim. Pannuhuoneella"
          className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md 
            focus:border-yellow-400 text-white placeholder-gray-400 outline-none transition"
        />
      </div>

      {/* 🔹 Osoite */}
      <div className="relative">
        <label className="absolute -top-2.5 left-3 px-1 text-xs text-yellow-400 bg-black rounded-sm z-10">
          Paikka ja osoite
        </label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Kuopio, Kauppakatu 25"
          className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md 
            focus:border-yellow-400 text-white placeholder-gray-400 outline-none transition"
          required
        />
      </div>

      {/* 🔹 Päivämäärä + kellonaika */}
      <div className="flex flex-col sm:flex-row gap-3 text-left">
        <div className="sm:w-[32%]">
          <DatePickerField
            label="Päivämäärä"
            selected={form.date}
            onChange={(date) => setForm({ ...form, date })}
          />
        </div>

        <div className="sm:w-[25%] relative">
          <label className="absolute -top-2.5 left-3 px-1 text-xs text-yellow-400 bg-black rounded-sm z-10">
            Kellonaika
          </label>
          <DatePicker
            selected={form.time}
            onChange={(time) => setForm({ ...form, time })}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            dateFormat="HH:mm"
            placeholderText="Valitse kellonaika"
            locale="fi"
            className="w-full p-3 bg-black/40 border border-yellow-600/40 rounded-md 
              text-white placeholder-gray-400 outline-none focus:border-yellow-400 transition"
          />
        </div>
      </div>

      {/* 🔹 Nappulat */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-black/40 hover:bg-yellow-700/20 text-yellow-400 
            border border-yellow-700/40 font-semibold 
            px-7 py-2 rounded-md transition"
        >
          Peruuta
        </button>

        <button
          type="submit"
          className="bg-yellow-500 text-black font-semibold px-5 py-2 rounded-md hover:bg-yellow-400 transition"
        >
          Lisää keikka
        </button>
      </div>
    </form>
  );
}
