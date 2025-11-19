"use client";
import { motion, AnimatePresence } from "framer-motion";

type ConfirmModalProps = {
  show: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;

  // ⭐ Lisätty mutta valinnainen
  confirmLabel?: string;
  confirmColor?: "red" | "yellow" | "orange";
};

export default function ConfirmModal({
  show,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Poista",       // ⭐ Oletus: Poista
  confirmColor = "red",          // ⭐ Oletus: punainen
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-black border border-yellow-700/50 rounded-xl p-8 shadow-[0_0_25px_rgba(0,0,0,0.7)] text-center max-w-sm mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <p className="text-white text-base font-semibold mb-6">
              {message}
            </p>

<div className="flex justify-center gap-4">
  {/* ✔ Joustava vahvistusnappi */}
  <button
    onClick={onConfirm}
    className={`
      font-semibold px-7 py-2 rounded-md transition border bg-black/40
      ${
        confirmColor === "red"
          ? "hover:bg-red-700/20 text-red-400 border-red-700/40"
          : confirmColor === "orange"
          ? "hover:bg-orange-700/20 text-orange-400 border-orange-700/20"
          : "hover:bg-yellow-700/20 text-yellow-400 border-yellow-700/40"
      }
    `}
  >
    {confirmLabel}
  </button>

              {/* ✔ Peruuta-nappi */}
              <button
                onClick={onCancel}
                className="bg-black/40 hover:bg-yellow-700/20 text-yellow-400 
                           border border-yellow-700/40 font-semibold 
                           px-7 py-2 rounded-md transition"
              >
                Peruuta
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
