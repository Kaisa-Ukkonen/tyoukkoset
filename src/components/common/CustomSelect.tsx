"use client";

import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
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
}

export default function CustomSelect({
  label,
  value,
  onChange,
  options,
}: CustomSelectProps) {
  const selected = options.find((opt) => opt.value === value);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-gray-300 mb-1">{label}</label>
      )}
      <Listbox value={value} onChange={onChange}>
        <div className="relative mt-1">
          {/* --- Suljettu tila --- */}
          <Listbox.Button
            className={`relative w-full cursor-pointer rounded-md bg-black/40 border border-[rgba(255,215,0,0.4)] 
py-2 pl-3 pr-10 text-left text-white shadow-sm focus:outline-none 
focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] sm:text-sm transition-colors`}
          >
            <span className="block truncate">
              {selected ? selected.label : "Valitse..."}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </span>
          </Listbox.Button>

          {/* --- Avattu dropdown --- */}
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
  className="ListboxOptions absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-black/90 
  py-1 text-base ring-1 ring-[#facc15]/40 border border-[#facc15]/40 focus:outline-none sm:text-sm 
  shadow-[0_0_10px_rgba(250,204,21,0.2)] scrollbar-thin"
>
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-8 pr-4 transition-colors ${
                      active
                        ? "bg-yellow-700/20 text-yellow-300"
                        : "text-gray-300"
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-semibold text-yellow-300" : ""
                        }`}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-2 flex items-center text-yellow-400">
                          <Check className="h-4 w-4" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
