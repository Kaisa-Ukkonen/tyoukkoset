"use client";
import { fi } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type DatePickerFieldProps = {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  label?: string;
  className?: string;
};

export default function DatePickerField({
  selected,
  onChange,
  placeholder = "Valitse päivä",
  label,
  className = "",
}: DatePickerFieldProps) {
  return (
    <div className={`flex flex-col text-left ${className}`}>
      {label && (
        <label className="block text-yellow-300 font-semibold mb-1">{label}</label>
      )}
      <div className="relative inline-block w-full sm:w-[260px]">
        <DatePicker
          selected={selected}
          onChange={onChange}
          dateFormat="dd.MM.yyyy"
          placeholderText={placeholder}
          locale={fi}
          className="w-full p-2.5 bg-black/40 border border-yellow-600/40 rounded-md 
                     text-white placeholder-gray-400 outline-none focus:border-yellow-400 
                     focus:ring-1 focus:ring-yellow-400 transition text-left cursor-pointer"
          calendarClassName="bg-[#111] border border-yellow-600/50 text-yellow-100 rounded-md shadow-lg"
          dayClassName={() =>
            "hover:bg-yellow-600/40 rounded-full transition text-center"
          }
          popperClassName="z-[9999]"
          portalId="root-portal"
        />
      </div>
    </div>
  );
}
