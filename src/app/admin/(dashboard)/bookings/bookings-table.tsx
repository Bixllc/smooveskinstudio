"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BookingRow {
  id: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  startTimeUtc: string;
  status: string;
  paymentStatus: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "PENDING_PAYMENT", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "NO_SHOW", label: "No Show" },
];

function statusBadgeVariant(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "default";
    case "COMPLETED":
      return "secondary";
    case "CANCELLED":
    case "NO_SHOW":
      return "destructive";
    default:
      return "outline";
  }
}

export function BookingsTable({
  bookings,
  currentStatus,
  timezone,
}: {
  bookings: BookingRow[];
  currentStatus: string;
  timezone: string;
}) {
  const router = useRouter();

  return (
    <div>
      {/* Status filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() =>
              router.push(
                opt.value === "all"
                  ? "/admin/bookings"
                  : `/admin/bookings?status=${opt.value}`
              )
            }
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              currentStatus === opt.value
                ? "bg-[var(--color-primary)] text-white"
                : "bg-white text-[var(--color-text-light)] border border-[var(--color-border)] hover:border-[var(--color-primary)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <p className="text-sm text-[var(--color-text-light)]">
          No bookings found.
        </p>
      ) : (
        <div className="rounded-xl border border-[var(--color-border)] bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => {
                const zonedDate = toZonedTime(
                  new Date(booking.startTimeUtc),
                  timezone
                );
                return (
                  <TableRow key={booking.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="block"
                      >
                        <p className="font-medium text-[var(--color-text)]">
                          {booking.customerName}
                        </p>
                        <p className="text-xs text-[var(--color-text-light)]">
                          {booking.customerEmail}
                        </p>
                      </Link>
                    </TableCell>
                    <TableCell>{booking.serviceName}</TableCell>
                    <TableCell>
                      <p>{format(zonedDate, "MMM d, yyyy")}</p>
                      <p className="text-xs text-[var(--color-text-light)]">
                        {format(zonedDate, "h:mm a")}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(booking.status)}>
                        {booking.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {booking.paymentStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
