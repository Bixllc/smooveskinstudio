"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { IconSearch } from "@tabler/icons-react";
import { AppointmentDrawer } from "@/components/admin/appointment-drawer";

type Tab = "upcoming" | "past" | "cancelled";

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-[#eaf3de] text-[#3B6D11]",
  COMPLETED: "bg-[#eaf3de] text-[#3B6D11]",
  CANCELLED: "bg-[#fce8e8] text-[#8c2020]",
  NO_SHOW: "bg-[#f0e8d4] text-[#7a5c1a]",
  PENDING_PAYMENT:
    "bg-[#f5f4f2] text-[#9a9890] border border-[#e8e6e1]",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
        STATUS_STYLES[status] ?? "bg-[#f5f4f2] text-[#9a9890]"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default function AppointmentsPage() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState<any>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["appointments", tab, search],
    queryFn: () =>
      fetch(
        `/api/admin/appointments?tab=${tab}&search=${encodeURIComponent(search)}`
      ).then((r) => r.json()),
  });

  const tz = data?.timezone ?? "America/Chicago";
  const bookings: any[] = data?.bookings ?? [];

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex h-11 flex-shrink-0 items-center gap-3 border-b border-[#e8e6e1] bg-white px-4">
        <span className="text-sm font-medium text-[#1a1814]">Appointments</span>
        <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-[#e8e6e1] px-2.5 max-w-[220px]">
          <IconSearch size={12} className="text-[#9a9890]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="flex-1 bg-transparent text-[12px] text-[#1a1814] outline-none placeholder:text-[#b0aea8]"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[#e8e6e1] bg-white px-4">
        {(["upcoming", "past", "cancelled"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`h-[30px] border-b-2 px-3.5 text-[11px] font-medium capitalize transition-colors ${
              tab === t
                ? "border-[#C9A96E] text-[#C9A96E]"
                : "border-transparent text-[#9a9890] hover:text-[#1a1814]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto pb-20 md:pb-0">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg bg-[#f5f4f2]"
              />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-[#9a9890]">
              No {tab} appointments
            </p>
            {tab === "upcoming" && (
              <p className="mt-1 text-xs text-[#b0aea8]">
                Enjoy the break ✨
              </p>
            )}
          </div>
        ) : (
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr>
                {[
                  "Client",
                  "Service",
                  "Date & Time",
                  "Duration",
                  "Price",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="border-b border-[#e8e6e1] bg-white px-3 py-2 text-left text-[10px] font-medium text-[#9a9890] sticky top-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const local = toZonedTime(new Date(b.startTimeUtc), tz);
                return (
                  <tr
                    key={b.id}
                    onClick={() => setDrawer(b)}
                    className="cursor-pointer border-b border-[#e8e6e1] bg-white hover:bg-[#f9f8f6]"
                  >
                    <td className="px-3 py-2.5 font-medium text-[#1a1814]">
                      {b.customer.fullName}
                    </td>
                    <td className="px-3 py-2.5 text-[#9a9890] max-w-[140px] truncate">
                      {b.service.name}
                    </td>
                    <td className="px-3 py-2.5 text-[#9a9890] whitespace-nowrap">
                      {format(local, "MMM d · h:mm a")}
                    </td>
                    <td className="px-3 py-2.5 text-[#9a9890]">
                      {b.service.durationMinutes} min
                    </td>
                    <td className="px-3 py-2.5 font-medium text-[#C9A96E]">
                      ${Number(b.service.price).toFixed(0)}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {drawer && (
        <AppointmentDrawer
          booking={drawer}
          timezone={tz}
          onClose={() => setDrawer(null)}
          onAction={() => {
            refetch();
            setDrawer(null);
          }}
        />
      )}
    </div>
  );
}
