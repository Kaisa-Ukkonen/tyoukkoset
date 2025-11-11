"use client";
import React from "react";

interface CustomInputFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean; // 🔹 uusi lisäys
}

export default function CustomInputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder = " ",
  readOnly = false, // 🔹 oletuksena false
}: CustomInputFieldProps) {
  return (
    <div className="relative w-full">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly} // 🔹 tärkeä lisäys!
        className={`peer w-full bg-black/40 border border-yellow-700/40 rounded-md px-3 py-2 text-white
          placeholder-transparent focus:border-yellow-400 focus:outline-none transition-all
          ${readOnly ? "text-gray-400 cursor-default" : ""}`} // 🔹 visuaalinen ero
      />

      <label
        htmlFor={id}
        className={`absolute left-3 text-sm bg-black/60 px-1 transition-all
          ${value
            ? "-top-2 text-xs text-yellow-400"
            : "top-2.5 text-gray-500"} 
          peer-focus:-top-2 peer-focus:text-xs peer-focus:text-yellow-400`}
      >
        {label}
      </label>
    </div>
  );
}
