//Kalenteri

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
  const hasValue = !!selected;

  return (
    <div className={`relative w-full ${className}`}>
      <DatePicker
  selected={selected}
  onChange={onChange}
  dateFormat="dd.MM.yyyy"
  locale={fi}
  placeholderText={placeholder}
  className="peer w-full bg-black/40 border border-yellow-700/40 rounded-md px-3 py-2 text-white
             placeholder-transparent focus:border-yellow-400 focus:outline-none transition-all cursor-pointer"
  withPortal
/>

      {/* 🔹 Liukuva otsikko */}
      {label && (
        <label
          className={`absolute left-3 text-sm bg-black/60 px-1 transition-all
            ${
              hasValue
                ? "-top-2 text-xs text-yellow-400"
                : "top-2.5 text-gray-500"
            }
            peer-focus:-top-2 peer-focus:text-xs peer-focus:text-yellow-400`}
        >
          {label}
        </label>
      )}
    </div>
  );
}
