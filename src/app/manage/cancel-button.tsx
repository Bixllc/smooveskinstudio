"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelButton({
  token,
  clientSlug,
}: {
  token: string;
  clientSlug: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: "cancel" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex w-full items-center justify-center rounded-xl border border-[#e8e6e1] py-3 text-[13px] font-medium text-[#6b6860] transition-colors hover:border-red-300 hover:text-red-500"
      >
        Cancel Appointment
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
      <p className="mb-1 text-[13px] font-semibold text-[#1a1814]">Cancel this appointment?</p>
      <p className="mb-4 text-[12px] text-[#6b6860]">This action cannot be undone. Please review the cancellation policy above before proceeding.</p>
      {error && <p className="mb-3 text-[12px] text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="flex-1 rounded-xl border border-[#e8e6e1] bg-white py-2.5 text-[13px] font-medium text-[#6b6860] transition-colors hover:border-[#1a1814] hover:text-[#1a1814]"
        >
          Keep Appointment
        </button>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="flex-1 rounded-xl bg-red-500 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
        >
          {loading ? "Cancelling…" : "Yes, Cancel"}
        </button>
      </div>
    </div>
  );
}
