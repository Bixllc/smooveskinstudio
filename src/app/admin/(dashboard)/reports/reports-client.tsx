"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface ServiceRow {
  name: string;
  quantity: number;
  totalRevenue: number;
  totalMinutes: number;
}

interface Props {
  month: number;
  year: number;
  summary: {
    totalAppointments: number;
    revenue: number;
    cancelled: number;
    noShows: number;
  };
  rows: ServiceRow[];
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export default function ReportsClient({ month, year, summary, rows }: Props) {
  const router = useRouter();

  function navigate(m: number, y: number) {
    router.push(`/admin/reports?month=${m}&year=${y}`);
  }

  function downloadCSV() {
    const headers = ["Service", "Quantity", "Total Revenue", "Hours"];
    const dataRows = rows.map((r) => [
      `"${r.name}"`,
      r.quantity,
      `"$${r.totalRevenue.toFixed(2)}"`,
      `"${(r.totalMinutes / 60).toFixed(1)}h"`,
    ]);
    const totalRow = [
      '"Total"',
      rows.reduce((s, r) => s + r.quantity, 0),
      `"$${rows.reduce((s, r) => s + r.totalRevenue, 0).toFixed(2)}"`,
      `"${(rows.reduce((s, r) => s + r.totalMinutes, 0) / 60).toFixed(1)}h"`,
    ];
    const csv = [headers.join(","), ...dataRows.map((r) => r.join(",")), totalRow.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports-${year}-${String(month).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalQty = rows.reduce((s, r) => s + r.quantity, 0);
  const totalRev = rows.reduce((s, r) => s + r.totalRevenue, 0);
  const totalHrs = rows.reduce((s, r) => s + r.totalMinutes, 0);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex h-11 flex-shrink-0 items-center gap-3 border-b border-[#e8e6e1] bg-white px-4">
        <span className="text-sm font-medium text-[#1a1814]">Reports</span>
        <div className="flex-1" />
        {/* Month / Year selectors */}
        <select
          value={month}
          onChange={(e) => navigate(Number(e.target.value), year)}
          className="rounded-lg border border-[#e8e6e1] px-2 py-1 text-[11px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => navigate(month, Number(e.target.value))}
          className="rounded-lg border border-[#e8e6e1] px-2 py-1 text-[11px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button
          onClick={downloadCSV}
          className="flex h-[26px] items-center gap-1.5 rounded-full border border-[#e8e6e1] px-3 text-[11px] text-[#6b6860] hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 pb-20 md:pb-4 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatCard label="Total Appointments" value={String(summary.totalAppointments)} gold />
          <StatCard label="Revenue" value={`$${summary.revenue.toFixed(2)}`} gold />
          <StatCard label="Cancelled" value={String(summary.cancelled)} />
          <StatCard label="No-Shows" value={String(summary.noShows)} />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-[#e8e6e1] bg-white overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#e8e6e1] bg-[#faf9f7]">
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#9a9890]">Service</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium text-[#9a9890]">Qty</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium text-[#9a9890]">Revenue</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium text-[#9a9890]">Hours</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[11px] text-[#9a9890]">
                    No appointments for {MONTHS[month - 1]} {year}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.name} className="border-b border-[#e8e6e1] last:border-b-0 hover:bg-[#faf9f7]">
                    <td className="px-4 py-2.5 text-[#1a1814]">{row.name}</td>
                    <td className="px-4 py-2.5 text-right text-[#1a1814]">{row.quantity}</td>
                    <td className="px-4 py-2.5 text-right text-[#C9A96E] font-medium">
                      ${row.totalRevenue.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-[#6b6860]">
                      {(row.totalMinutes / 60).toFixed(1)}h
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="bg-[#faf9f7] border-t-2 border-[#e8e6e1]">
                  <td className="px-4 py-2.5 text-[11px] font-semibold text-[#1a1814]">Total</td>
                  <td className="px-4 py-2.5 text-right text-[11px] font-semibold text-[#1a1814]">{totalQty}</td>
                  <td className="px-4 py-2.5 text-right text-[11px] font-semibold text-[#C9A96E]">
                    ${totalRev.toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-[11px] font-semibold text-[#6b6860]">
                    {(totalHrs / 60).toFixed(1)}h
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="rounded-lg border border-[#e8e6e1] bg-white p-3">
      <p className="mb-1 text-[10px] text-[#9a9890]">{label}</p>
      <p className={`text-xl font-medium ${gold ? "text-[#C9A96E]" : "text-[#1a1814]"}`}>
        {value}
      </p>
    </div>
  );
}
