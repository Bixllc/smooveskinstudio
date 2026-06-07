"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { IconSearch } from "@tabler/icons-react";
import { AppointmentDrawer } from "@/components/admin/appointment-drawer";

type Tab = "upcoming" | "past" | "cancelled";

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-[#e8f7ee] text-[#2e7d50]",
  COMPLETED: "bg-[#e8f7ee] text-[#2e7d50]",
  CANCELLED: "bg-[#fdecea] text-[#b53a2e]",
  NO_SHOW: "bg-[#fef3e2] text-[#a0620a]",
  PENDING_PAYMENT: "bg-[#fef3e2] text-[#a0620a]",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap px-[10px] py-[3px] rounded-full text-[11px] font-semibold tracking-[0.04em] ${
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
      <header className="flex h-[80px] flex-shrink-0 items-center justify-between border-b border-black/[0.07] bg-white px-4 md:px-8">
        <h1 className="text-[18px] md:text-[24px] font-semibold text-[#1b1814]">Appointments</h1>
        <div className="hidden md:flex items-center gap-2 bg-white border border-black/[0.07] rounded-[9px] px-3 h-9">
          <IconSearch size={15} className="text-[#a8a39c] flex-shrink-0" strokeWidth={1.8} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="border-none outline-none bg-transparent text-[13px] text-[#1b1814] placeholder:text-[#a8a39c] w-[180px]"
          />
        </div>
      </header>

      {/* Tab nav */}
      <div className="flex border-b border-black/[0.07] bg-white px-4 md:px-8">
        {(["upcoming", "past", "cancelled"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-[18px] py-[9px] text-[13px] font-medium border-b-2 -mb-px cursor-pointer bg-transparent transition-colors capitalize ${
              tab === t
                ? "text-[#b8892a] border-[#c9a96e]"
                : "text-[#7a756e] border-transparent hover:text-[#1b1814]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table area */}
      <div className="flex-1 overflow-auto px-4 md:px-8 py-6 md:py-8 pb-20 md:pb-8">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-[14px] bg-[#f5f4f2]"
              />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-[14px] text-[#a8a39c]">
              No {tab} appointments
            </p>
            {tab === "upcoming" && (
              <p className="mt-1 text-[13px] text-[#a8a39c]">
                Enjoy the break ✦
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white border border-black/[0.07] rounded-[14px] overflow-hidden">
              {/* Table header */}
              <div className="grid bg-[#edeae5] border-b border-black/[0.07] px-6 py-[14px]"
                style={{ gridTemplateColumns: "1.4fr 1.6fr 1.1fr 80px 80px 120px" }}
              >
                {["Client", "Service", "Date & Time", "Duration", "Paid", "Status"].map((h) => (
                  <div
                    key={h}
                    className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#a8a39c]"
                  >
                    {h}
                  </div>
                ))}
              </div>
              {/* Data rows */}
              {bookings.map((b) => {
                const local = toZonedTime(new Date(b.startTimeUtc), tz);
                return (
                  <div
                    key={b.id}
                    onClick={() => setDrawer(b)}
                    className="grid px-6 py-[16px] border-b border-black/[0.07] last:border-0 hover:bg-[#f8f6f3] cursor-pointer items-center transition-colors"
                    style={{ gridTemplateColumns: "1.4fr 1.6fr 1.1fr 80px 80px 120px" }}
                  >
                    <div className="text-[15px] font-medium text-[#1b1814] truncate pr-2">
                      {b.customer.fullName}
                    </div>
                    <div className="text-[14px] text-[#7a756e] truncate pr-2">
                      {b.service.name}
                    </div>
                    <div className="text-[14px] text-[#7a756e] whitespace-nowrap pr-2">
                      {format(local, "MMM d · h:mm a")}
                    </div>
                    <div className="text-[14px] text-[#7a756e]">
                      {b.service.durationMinutes} min
                    </div>
                    <div className="text-[15px] font-medium text-[#b8892a]">
                      ${(b.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) ?? 0).toFixed(0)}
                    </div>
                    <div>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {bookings.map((b) => {
                const local = toZonedTime(new Date(b.startTimeUtc), tz);
                const paid = (b.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) ?? 0);
                return (
                  <div
                    key={b.id}
                    onClick={() => setDrawer(b)}
                    className="bg-white border border-black/[0.07] rounded-[14px] px-4 py-4 cursor-pointer active:bg-[#f8f6f3] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[15px] font-semibold text-[#1b1814] leading-tight">{b.customer.fullName}</span>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="text-[13px] text-[#7a756e] mb-1">{b.service.name} · {b.service.durationMinutes} min</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#a8a39c]">{format(local, "EEE MMM d · h:mm a")}</span>
                      {paid > 0 && <span className="text-[13px] font-semibold text-[#b8892a]">${paid.toFixed(0)} paid</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
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
