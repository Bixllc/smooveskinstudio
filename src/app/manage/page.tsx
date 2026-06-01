import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import Link from "next/link";
import { CancelButton } from "./cancel-button";

export default async function ManagePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) notFound();

  const booking = await prisma.booking.findUnique({
    where: { manageToken: token },
    include: {
      service: { select: { name: true, durationMinutes: true, price: true } },
      customer: { select: { fullName: true, email: true } },
      client: {
        select: {
          slug: true,
          businessSettings: {
            select: { timezone: true, address: true, cancellationPolicy: true, phone: true },
          },
        },
      },
    },
  });

  if (!booking) notFound();

  const timezone = booking.client.businessSettings?.timezone ?? "America/Chicago";
  const zonedStart = toZonedTime(booking.startTimeUtc, timezone);
  const dateStr = format(zonedStart, "EEEE, MMMM d, yyyy");
  const timeStr = format(zonedStart, "h:mm a");
  const firstName = booking.customer.fullName.split(" ")[0];
  const isCancelled = booking.status === "CANCELLED";
  const isPast = booking.startTimeUtc < new Date();
  const clientSlug = booking.client.slug;

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e6e1]">
        <div className="mx-auto max-w-xl px-4 py-4">
          <Link
            href={`/${clientSlug}`}
            className="flex items-center gap-1.5 text-[12px] text-[#9a9890] transition-colors hover:text-[#C9A96E]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to site
          </Link>
        </div>
      </div>

      <div className="px-4 py-10">
        <div className="mx-auto max-w-xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[#1a1814]">Manage Appointment</h1>
            <p className="mt-2 text-[14px] text-[#6b6860]">
              {isCancelled
                ? "This appointment has been cancelled."
                : `Hi ${firstName}, here are your appointment details.`}
            </p>
          </div>

          {/* Booking card */}
          <div className="overflow-hidden rounded-2xl border border-[#e8e6e1] bg-white shadow-sm">
            <div className="bg-[#1a1814] px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#C9A96E]">
                  Appointment Details
                </p>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  isCancelled
                    ? "bg-red-900/30 text-red-300"
                    : booking.status === "CONFIRMED"
                    ? "bg-emerald-900/30 text-emerald-300"
                    : "bg-yellow-900/30 text-yellow-300"
                }`}>
                  {booking.status.replace("_", " ")}
                </span>
              </div>
            </div>
            <div className="divide-y divide-dashed divide-[#e8e6e1] px-6">
              <div className="flex items-center justify-between py-4">
                <span className="text-[12px] text-[#9a9890]">Service</span>
                <span className="text-[14px] font-semibold text-[#1a1814]">{booking.service.name}</span>
              </div>
              <div className="flex items-center justify-between py-4">
                <span className="text-[12px] text-[#9a9890]">Date</span>
                <span className="text-[14px] font-medium text-[#1a1814]">{dateStr}</span>
              </div>
              <div className="flex items-center justify-between py-4">
                <span className="text-[12px] text-[#9a9890]">Time</span>
                <span className="text-[14px] font-medium text-[#1a1814]">{timeStr}</span>
              </div>
              <div className="flex items-center justify-between py-4">
                <span className="text-[12px] text-[#9a9890]">Duration</span>
                <span className="text-[14px] font-medium text-[#1a1814]">{booking.service.durationMinutes} min</span>
              </div>
              <div className="flex items-center justify-between py-4">
                <span className="text-[12px] text-[#9a9890]">Total</span>
                <span className="text-[18px] font-bold text-[#1a1814]">
                  ${Number(booking.service.price).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Location */}
          {booking.client.businessSettings?.address && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#e8e6e1] bg-white p-5 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f4f2]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <p className="text-[12px] font-medium text-[#1a1814]">Studio Location</p>
                <p className="text-[13px] text-[#6b6860]">{booking.client.businessSettings.address}</p>
              </div>
            </div>
          )}

          {/* Cancellation policy */}
          {booking.client.businessSettings?.cancellationPolicy && !isCancelled && (
            <div className="mt-4 rounded-2xl border border-[#e8e6e1] bg-white p-5 shadow-sm">
              <p className="mb-2 text-[12px] font-medium text-[#1a1814]">Cancellation Policy</p>
              <p className="text-[12px] leading-relaxed text-[#6b6860]">
                {booking.client.businessSettings.cancellationPolicy}
              </p>
            </div>
          )}

          {/* Actions */}
          {!isCancelled && !isPast && (
            <div className="mt-6 flex flex-col gap-3">
              <CancelButton token={token} clientSlug={clientSlug} />
              {booking.client.businessSettings?.phone && (
                <p className="text-center text-[12px] text-[#9a9890]">
                  To reschedule, call us at{" "}
                  <a
                    href={`tel:${booking.client.businessSettings.phone}`}
                    className="font-medium text-[#1a1814] hover:text-[#C9A96E]"
                  >
                    {booking.client.businessSettings.phone}
                  </a>
                </p>
              )}
            </div>
          )}

          {isCancelled && (
            <div className="mt-6">
              <Link
                href={`/${clientSlug}/book`}
                className="flex w-full items-center justify-center rounded-xl bg-[#C9A96E] py-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#b8954f]"
              >
                Book a New Appointment
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
