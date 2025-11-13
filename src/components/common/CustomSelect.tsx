"use client";

import { Fragment } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Transition,
} from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";

type Option = {
  value: string;
  label: string;
};

interface CustomSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  required?: boolean;
  placeholder?: string;
}

export default function CustomSelect({
  label,
  value,
  onChange,
  options,
}: CustomSelectProps) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full">
      {/* 🔹 Pysyvä label joka “katkaisee” viivan */}
      {label && (
        <label className="absolute -top-2.5 left-3 px-1 text-xs text-yellow-400 font-medium bg-[#0a0a0a] z-10 pointer-events-none">
          {label}
        </label>
      )}

      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          {/* 🔹 Itse valintalaatikko */}
          <ListboxButton
            className="relative w-full cursor-pointer rounded-md bg-black/40 
             border border-yellow-500/60 hover:border-yellow-400 focus:border-yellow-400 
             py-2 pl-3 pr-10 text-left text-white 
             focus:outline-none transition-all"
          >
            <span
              className={`block truncate ${
                !selectedOption ? "text-gray-400" : ""
              }`}
            >
              {selectedOption ? selectedOption.label : "Valitse..."}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown
                className="h-4 w-4 text-yellow-400"
                aria-hidden="true"
              />
            </span>
          </ListboxButton>

          {/* 🔹 Alasvetovalikko */}
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions
              className="absolute mt-1 max-h-52 w-full overflow-auto rounded-md bg-[#0a0a0a] 
                         border border-yellow-400/50 text-sm shadow-lg ring-1 ring-black/30 
                         focus:outline-none z-20"
            >
              {options.map((option) => (
                <ListboxOption
                  key={option.value}
                  value={option.value}
                  className={({ active, selected }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 
                     ${
                       active
                         ? "bg-yellow-700/30 text-yellow-300"
                         : "text-gray-200"
                     } 
                     ${selected ? "bg-yellow-700/40" : ""}`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected
                            ? "font-medium text-yellow-300"
                            : "font-normal"
                        }`}
                      >
                        {option.label}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-2 flex items-center text-yellow-400">
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
