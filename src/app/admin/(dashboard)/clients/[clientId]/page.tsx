"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { IconArrowLeft, IconStar } from "@tabler/icons-react";
import Link from "next/link";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-[#eaf3de] text-[#3B6D11]",
  COMPLETED: "bg-[#eaf3de] text-[#3B6D11]",
  CANCELLED: "bg-[#fce8e8] text-[#8c2020]",
  NO_SHOW: "bg-[#f0e8d4] text-[#7a5c1a]",
  PENDING_PAYMENT: "bg-[#f5f4f2] text-[#9a9890]",
};

export default function ClientProfilePage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () =>
      fetch(`/api/admin/clients/${clientId}`).then((r) => r.json()),
  });

  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (data?.adminNotes) setNotes(data.adminNotes);
  }, [data?.adminNotes]);

  const toggleVip = useMutation({
    mutationFn: (isVip: boolean) =>
      fetch(`/api/admin/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVip }),
      }),
    onSuccess: () => {
      toast.success("Client updated");
      qc.invalidateQueries({ queryKey: ["client", clientId] });
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  async function saveNotes() {
    const res = await fetch(`/api/admin/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes: notes }),
    });
    if (res.ok) {
      toast.success("Notes saved");
    } else {
      toast.error("Failed to save notes");
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col overflow-hidden">
        <div className="h-11 border-b border-[#e8e6e1] bg-white" />
        <div className="flex-1 p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-[#f5f4f2]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="p-6 text-sm text-red-500">Client not found</div>
    );
  }

  const tz = data.timezone ?? "America/Chicago";
  const confirmedBookings = data.bookings.filter((b: any) =>
    ["CONFIRMED", "COMPLETED"].includes(b.status)
  );
  const totalSpend = confirmedBookings.reduce(
    (s: number, b: any) => s + Number(b.service.price),
    0
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex h-11 flex-shrink-0 items-center gap-2 border-b border-[#e8e6e1] bg-white px-4">
        <Link
          href="/admin/clients"
          className="text-[#9a9890] hover:text-[#C9A96E]"
        >
          <IconArrowLeft size={16} />
        </Link>
        <span className="text-sm font-medium text-[#1a1814]">
          {data.fullName}
        </span>
        <button
          onClick={() => toggleVip.mutate(!data.isVip)}
          title={data.isVip ? "Remove VIP" : "Mark as VIP"}
          className="ml-0.5"
        >
          <IconStar
            size={14}
            className={
              data.isVip
                ? "text-[#C9A96E] fill-[#C9A96E]"
                : "text-[#9a9890]"
            }
            fill={data.isVip ? "#C9A96E" : "none"}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 pb-20 md:pb-4 space-y-4 max-w-2xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard
            label="Total visits"
            value={String(confirmedBookings.length)}
          />
          <StatCard label="Total spend" value={`$${totalSpend.toFixed(0)}`} gold />
          <StatCard label="Phone" value={data.phone ?? "—"} />
        </div>

        {/* Contact */}
        <div className="rounded-lg border border-[#e8e6e1] bg-white p-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[#9a9890]">
            Contact
          </p>
          <p className="text-[12px] text-[#1a1814]">{data.email}</p>
          {data.phone && (
            <p className="text-[12px] text-[#9a9890]">{data.phone}</p>
          )}
        </div>

        {/* Private notes */}
        <div className="rounded-lg border border-[#e8e6e1] bg-white p-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[#9a9890]">
            Private Notes
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes visible only to Anisha…"
            rows={3}
            className="w-full resize-none rounded-lg border border-[#e8e6e1] p-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
          />
          <button
            onClick={saveNotes}
            className="mt-2 rounded-lg bg-[#C9A96E] px-3 py-1.5 text-[11px] font-medium text-[#1a1814] hover:bg-[#b8954f] transition-colors"
          >
            Save notes
          </button>
        </div>

        {/* Booking history */}
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[#9a9890]">
            Appointment history
          </p>
          <div className="space-y-1">
            {data.bookings.length === 0 ? (
              <p className="text-sm text-[#9a9890]">No appointments yet</p>
            ) : (
              data.bookings.map((b: any) => {
                const local = toZonedTime(new Date(b.startTimeUtc), tz);
                return (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 rounded-lg border border-[#e8e6e1] bg-white px-3 py-2"
                  >
                    <span className="w-24 flex-shrink-0 text-[11px] text-[#9a9890]">
                      {format(local, "MMM d, yyyy")}
                    </span>
                    <span className="flex-1 truncate text-[12px] text-[#1a1814]">
                      {b.service.name}
                    </span>
                    <span className="flex-shrink-0 text-[11px] font-medium text-[#C9A96E]">
                      ${Number(b.service.price).toFixed(0)}
                    </span>
                    <span
                      className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        STATUS_STYLES[b.status] ?? ""
                      }`}
                    >
                      {b.status.replace(/_/g, " ")}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  gold,
}: {
  label: string;
  value: string;
  gold?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#e8e6e1] bg-white p-3">
      <p className="mb-1 text-[10px] text-[#9a9890]">{label}</p>
      <p
        className={`text-lg font-medium leading-tight ${
          gold ? "text-[#C9A96E]" : "text-[#1a1814]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
