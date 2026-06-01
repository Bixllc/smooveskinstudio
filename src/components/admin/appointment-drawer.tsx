"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { IconX } from "@tabler/icons-react";
import { toast } from "sonner";

export function AppointmentDrawer({
  booking,
  timezone,
  onClose,
  onAction,
}: {
  booking: any;
  timezone: string;
  onClose: () => void;
  onAction: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const local = toZonedTime(new Date(booking.startTimeUtc), timezone);

  async function updateStatus(status: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/bookings/${booking.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(
        `Appointment marked as ${status.toLowerCase().replace("_", " ")}`
      );
      onAction();
      onClose();
    } else {
      toast.error("Failed to update status");
    }
    setLoading(false);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-[280px] flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e8e6e1] px-4 py-3">
          <p className="text-[13px] font-medium text-[#1a1814]">
            {booking.customer.fullName}
          </p>
          <button
            onClick={onClose}
            className="text-[#9a9890] hover:text-[#1a1814]"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-0">
          <DrawerRow label="Service" value={booking.service.name} />
          <DrawerRow
            label="Time"
            value={`${format(local, "h:mm a")} · ${booking.service.durationMinutes} min`}
          />
          <DrawerRow label="Date" value={format(local, "EEEE, MMM d")} />
          <DrawerRow
            label="Status"
            value={booking.status.replace(/_/g, " ")}
          />
          {booking.customer.email && (
            <DrawerRow label="Email" value={booking.customer.email} />
          )}
          {booking.customer.phone && (
            <DrawerRow label="Phone" value={booking.customer.phone} />
          )}
          {booking.notes && (
            <DrawerRow label="Notes" value={booking.notes} />
          )}
        </div>

        <div className="border-t border-[#e8e6e1] p-4 space-y-2">
          <button
            onClick={() => updateStatus("CONFIRMED")}
            disabled={loading || booking.status === "CONFIRMED"}
            className="w-full rounded-lg border border-[#C9A96E55] bg-[#C9A96E18] py-2 text-[12px] font-medium text-[#7a5c1a] disabled:opacity-40"
          >
            Confirm
          </button>
          <button
            onClick={() => updateStatus("COMPLETED")}
            disabled={loading || booking.status === "COMPLETED"}
            className="w-full rounded-lg border border-[#e8e6e1] py-2 text-[12px] font-medium text-[#1a1814] disabled:opacity-40"
          >
            Mark Complete
          </button>
          <button
            onClick={() => updateStatus("NO_SHOW")}
            disabled={loading}
            className="w-full rounded-lg border border-[#e8e6e1] py-2 text-[12px] font-medium text-[#9a9890] disabled:opacity-40"
          >
            Mark No-Show
          </button>
          <button
            onClick={() => updateStatus("CANCELLED")}
            disabled={loading}
            className="w-full rounded-lg border border-[#f0c0c0] bg-[#fce8e8] py-2 text-[12px] font-medium text-[#8c2020] disabled:opacity-40"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

function DrawerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between border-b border-[#e8e6e1] py-2">
      <span className="text-[10px] text-[#9a9890] mt-0.5">{label}</span>
      <span className="text-[11px] text-[#1a1814] text-right max-w-[160px]">
        {value}
      </span>
    </div>
  );
}
