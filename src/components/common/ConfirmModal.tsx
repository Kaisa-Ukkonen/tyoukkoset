//Haluatko varmasti poistaa- nappi
"use client";
import { motion, AnimatePresence } from "framer-motion";


type ConfirmModalProps = {
  show: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  show,
  message,
  onConfirm,
  onCancel,
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
            <p className="text-gray-200 mb-6">{message}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={onConfirm}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-md transition"
              >
                Kyllä, poista
              </button>
              <button
                onClick={onCancel}
                className="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded-md transition"
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
