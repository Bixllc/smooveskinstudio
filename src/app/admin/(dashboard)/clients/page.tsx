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
      <div className="flex h-11 flex-shrink-0 items-center gap-3 border-b border-[#e8e6e1] bg-white px-4">
        <span className="text-sm font-medium text-[#1a1814]">Clients</span>
        <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-[#e8e6e1] px-2.5 max-w-[220px]">
          <IconSearch size={12} className="text-[#9a9890]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="flex-1 bg-transparent text-[12px] text-[#1a1814] outline-none placeholder:text-[#b0aea8]"
          />
        </div>
        <div className="flex-1" />
        <button className="flex h-[26px] items-center gap-1 rounded-full bg-[#C9A96E] px-2.5 text-[11px] font-medium text-[#1a1814]">
          <IconUserPlus size={11} /> Add client
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto pb-20 md:pb-0">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg bg-[#f5f4f2]"
              />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-[#9a9890]">No clients found</p>
          </div>
        ) : (
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr>
                {[
                  "Client",
                  "Last visit",
                  "Visits",
                  "Total spend",
                  "Fav service",
                  "",
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
              {clients.map((c: any, idx: number) => (
                <tr
                  key={c.id}
                  className="border-b border-[#e8e6e1] bg-white hover:bg-[#f9f8f6]"
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full text-[9px] font-medium ${
                          AVATAR_COLORS[idx % AVATAR_COLORS.length]
                        }`}
                      >
                        {initials(c.fullName)}
                      </span>
                      <Link
                        href={`/admin/clients/${c.id}`}
                        className="font-medium text-[#1a1814] hover:text-[#C9A96E]"
                      >
                        {c.fullName}
                      </Link>
                      {c.isVip && (
                        <IconStar
                          size={10}
                          className="text-[#C9A96E] fill-[#C9A96E]"
                          fill="#C9A96E"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[#9a9890]">
                    {c.lastVisit
                      ? format(new Date(c.lastVisit), "MMM d")
                      : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-[#1a1814]">
                    {c.totalVisits}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-[#C9A96E]">
                    ${c.totalSpend.toFixed(0)}
                  </td>
                  <td className="px-3 py-2.5 text-[#9a9890] max-w-[120px] truncate">
                    {c.favService ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Link
                      href={`/admin/clients/${c.id}`}
                      className="text-[10px] text-[#9a9890] hover:text-[#C9A96E]"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
