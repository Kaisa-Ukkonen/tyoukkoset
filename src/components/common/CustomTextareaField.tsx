//isompi kirjoituskenttä 
"use client";
import React from "react";

interface CustomTextareaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}

export default function CustomTextareaField({
  id,
  label,
  value,
  onChange,
  rows = 3,
}: CustomTextareaFieldProps) {
  return (
    <div className="relative w-full">
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder=" "
        rows={rows}
        className="peer w-full bg-black/40 border border-yellow-700/40 rounded-md px-3 py-2 text-white
                   placeholder-transparent focus:border-yellow-400 focus:outline-none transition-all resize-none"
      />
      <label
        htmlFor={id}
        className={`absolute left-3 text-sm text-gray-400 bg-black/60 px-1 transition-all
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
