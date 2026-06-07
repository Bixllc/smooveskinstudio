"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { IconSearch, IconUserPlus, IconStar } from "@tabler/icons-react";
import Link from "next/link";

const AVATAR_COLORS = [
  "bg-[#f0d4cf] text-[#7a2f22]",
  "bg-[#d4e8d8] text-[#2a5c38]",
  "bg-[#f0e8d4] text-[#7a5c1a]",
  "bg-[#d4d8f0] text-[#2a2c7a]",
  "bg-[#e8d4f0] text-[#5a2a7a]",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients", search],
    queryFn: () =>
      fetch(
        `/api/admin/clients?search=${encodeURIComponent(search)}`
      ).then((r) => r.json()),
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <header className="h-[80px] bg-white border-b border-black/[0.07] px-4 md:px-8 flex items-center justify-between flex-shrink-0">
        <h1 className="text-[18px] md:text-[24px] font-semibold text-[#1b1814]">Clients</h1>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 bg-white border border-black/[0.07] rounded-[9px] px-3 h-9">
            <IconSearch size={14} className="text-[#a8a39c] flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients…"
              className="border-none outline-none bg-transparent text-[13px] placeholder:text-[#a8a39c] text-[#1b1814] w-[180px]"
            />
          </div>
          <button className="bg-[#c9a96e] text-[#1b1814] rounded-[9px] px-[18px] py-[9px] text-[13px] font-semibold inline-flex items-center gap-1.5 hover:opacity-85 transition-opacity cursor-pointer border-none">
            <IconUserPlus size={14} /> Add client
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 pb-20 md:pb-8">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-[14px] bg-[#f5f4f2]"
              />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-[14px] text-[#a8a39c]">No clients found</p>
          </div>
        ) : (
          <>
          <div className="hidden md:block bg-white border border-black/[0.07] rounded-[14px] overflow-hidden">
            {/* Header row */}
            <div className="grid bg-[#edeae5] border-b border-black/[0.07] px-6 py-[14px]" style={{ gridTemplateColumns: "2fr 100px 80px 110px 1.2fr 60px" }}>
              {["Client", "Last visit", "Visits", "Total spend", "Fav service", ""].map((h) => (
                <span key={h} className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#a8a39c]">
                  {h}
                </span>
              ))}
            </div>

            {/* Data rows */}
            {clients.map((c: any, idx: number) => (
              <div
                key={c.id}
                className="grid px-6 py-[16px] border-b border-black/[0.07] last:border-0 hover:bg-[#f8f6f3] cursor-pointer items-center transition-colors"
                style={{ gridTemplateColumns: "2fr 100px 80px 110px 1.2fr 60px" }}
              >
                {/* Client cell */}
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0 ${
                      AVATAR_COLORS[idx % AVATAR_COLORS.length]
                    }`}
                  >
                    {initials(c.fullName)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[15px] font-medium text-[#1b1814]">
                      {c.fullName}
                    </span>
                    {c.isVip && (
                      <IconStar
                        size={12}
                        className="text-[#c9a96e] fill-[#c9a96e]"
                        fill="#c9a96e"
                      />
                    )}
                  </div>
                </div>

                {/* Last visit */}
                <span className="text-[14px] text-[#7a756e]">
                  {c.lastVisit ? format(new Date(c.lastVisit), "MMM d") : "—"}
                </span>

                {/* Visits */}
                <span className="text-[14px] text-[#7a756e]">{c.totalVisits}</span>

                {/* Total spend */}
                <span className="text-[15px] font-medium text-[#b8892a]">
                  ${c.totalSpend.toFixed(0)}
                </span>

                {/* Fav service */}
                <span className="text-[14px] text-[#7a756e] truncate pr-2">
                  {c.favService ?? "—"}
                </span>

                {/* View link */}
                <div>
                  <Link
                    href={`/admin/clients/${c.id}`}
                    className="text-[13px] font-medium text-[#c9a96e] hover:opacity-75 transition-opacity"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {clients.map((c: any, idx: number) => (
              <Link
                key={c.id}
                href={`/admin/clients/${c.id}`}
                className="flex items-center gap-3 bg-white border border-black/[0.07] rounded-[14px] px-4 py-4 active:bg-[#f8f6f3] transition-colors"
              >
                <span
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0 ${
                    AVATAR_COLORS[idx % AVATAR_COLORS.length]
                  }`}
                >
                  {initials(c.fullName)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[15px] font-semibold text-[#1b1814] truncate">{c.fullName}</span>
                    {c.isVip && <IconStar size={12} className="text-[#c9a96e] fill-[#c9a96e] flex-shrink-0" fill="#c9a96e" />}
                  </div>
                  <p className="text-[12px] text-[#a8a39c]">
                    {c.totalVisits} visit{c.totalVisits !== 1 ? "s" : ""}
                    {c.lastVisit ? ` · Last ${format(new Date(c.lastVisit), "MMM d")}` : ""}
                  </p>
                </div>
                <span className="text-[14px] font-semibold text-[#b8892a] flex-shrink-0">${c.totalSpend.toFixed(0)}</span>
              </Link>
            ))}
          </div>
          </>
        )}
      </div>
    </div>
  );
}
