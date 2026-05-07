"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface BookingActionsProps {
  bookingId: string;
  currentStatus: string;
}

export function BookingActions({ bookingId, currentStatus }: BookingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const canCancel = !["CANCELLED", "COMPLETED", "NO_SHOW"].includes(currentStatus);
  const canComplete = currentStatus === "CONFIRMED";
  const canNoShow = currentStatus === "CONFIRMED";

  async function handleAction(status: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
      setConfirmAction(null);
    }
  }

  if (!canCancel && !canComplete && !canNoShow) return null;

  return (
    <div className="mt-6">
      <p className="mb-3 text-xs font-medium uppercase text-[var(--color-text-light)]">
        Actions
      </p>

      {confirmAction && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm font-medium text-yellow-800">
            Are you sure you want to mark this booking as{" "}
            {confirmAction.replace("_", " ").toLowerCase()}?
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={loading}
              onClick={() => handleAction(confirmAction)}
            >
              {loading ? "Updating..." : "Yes, confirm"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmAction(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {!confirmAction && (
        <div className="flex flex-wrap gap-2">
          {canComplete && (
            <Button
              size="sm"
              onClick={() => setConfirmAction("COMPLETED")}
            >
              Mark Complete
            </Button>
          )}
          {canNoShow && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmAction("NO_SHOW")}
            >
              Mark No-Show
            </Button>
          )}
          {canCancel && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setConfirmAction("CANCELLED")}
            >
              Cancel Booking
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
