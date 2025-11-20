"use client";

import { useState } from "react";
import CustomInputField from "@/components/common/CustomInputField";

type SendInvoiceModalProps = {
  invoiceId: number | null;
  defaultEmail: string | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function SendInvoiceModal({
  invoiceId,
  defaultEmail,
  onClose,
  onSuccess,
}: SendInvoiceModalProps) {
  const [email, setEmail] = useState(defaultEmail || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!invoiceId) return null;

  const handleSend = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/bookkeeping/invoices/${invoiceId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Lähetys epäonnistui.");
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess();
      onClose();
    } catch (err) {
  console.error("SendInvoiceModal error:", err);
  setError("Sähköpostin lähetys epäonnistui.");
  setLoading(false);
}

  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-black border border-yellow-700/40 rounded-xl p-6 w-full max-w-md mx-4 shadow-lg">
        <h2 className="text-yellow-400 text-lg font-semibold mb-4">
          Lähetä lasku sähköpostilla
        </h2>

        <CustomInputField
          id="sendEmail"
          label="Sähköpostiosoite"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700/40 hover:bg-gray-600/40 text-gray-200 rounded-md"
          >
            Peruuta
          </button>

          <button
            onClick={handleSend}
            disabled={loading}
            className="
              px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black rounded-md
              font-semibold disabled:opacity-50
            "
          >
            {loading ? "Lähetetään..." : "Lähetä"}
          </button>
        </div>
      </div>
    </div>
  );
}
