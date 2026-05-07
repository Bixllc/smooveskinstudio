import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import Link from "next/link";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ clientSlug: string; bookingId: string }>;
}) {
  const { clientSlug, bookingId } = await params;

  const client = await prisma.client.findUnique({
    where: { slug: clientSlug, active: true },
    include: { businessSettings: true },
  });

  if (!client) notFound();

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, clientId: client.id },
    include: {
      service: { select: { name: true, durationMinutes: true, price: true } },
      customer: { select: { fullName: true, email: true } },
      payments: { select: { amount: true, status: true } },
    },
  });

  if (!booking) notFound();

  const timezone = client.businessSettings?.timezone ?? "America/New_York";
  const zonedStart = toZonedTime(booking.startTimeUtc, timezone);
  const dateStr = format(zonedStart, "EEEE, MMMM d, yyyy");
  const timeStr = format(zonedStart, "h:mm a");

  const isPending = booking.status === "PENDING_PAYMENT";
  const isConfirmed = booking.status === "CONFIRMED";
  const payment = booking.payments[0];

  return (
    <div className="mx-auto max-w-lg">
      {/* Status banner */}
      {isConfirmed && (
        <div className="mb-6 rounded-xl bg-green-50 p-4 text-center">
          <div className="text-2xl">&#10003;</div>
          <h2 className="mt-1 text-lg font-semibold text-green-800">
            Booking Confirmed
          </h2>
          <p className="text-sm text-green-700">
            A confirmation email has been sent to {booking.customer.email}
          </p>
        </div>
      )}

      {isPending && (
        <div className="mb-6 rounded-xl bg-yellow-50 p-4 text-center">
          <h2 className="text-lg font-semibold text-yellow-800">
            Payment Processing
          </h2>
          <p className="text-sm text-yellow-700">
            Your payment is being processed. You&apos;ll receive a confirmation
            email shortly.
          </p>
        </div>
      )}

      {!isConfirmed && !isPending && (
        <div className="mb-6 rounded-xl bg-gray-50 p-4 text-center">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Booking Status: {booking.status.replace("_", " ")}
          </h2>
        </div>
      )}

      {/* Booking details */}
      <div className="space-y-4 rounded-xl border border-[var(--color-border)] bg-white p-6">
        <div>
          <p className="text-xs font-medium uppercase text-[var(--color-text-light)]">
            Service
          </p>
          <p className="text-sm font-medium text-[var(--color-text)]">
            {booking.service.name}
          </p>
          <p className="text-xs text-[var(--color-text-light)]">
            {booking.service.durationMinutes} minutes
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase text-[var(--color-text-light)]">
            Date & Time
          </p>
          <p className="text-sm font-medium text-[var(--color-text)]">
            {dateStr}
          </p>
          <p className="text-sm text-[var(--color-text)]">{timeStr}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase text-[var(--color-text-light)]">
            Customer
          </p>
          <p className="text-sm text-[var(--color-text)]">
            {booking.customer.fullName}
          </p>
          <p className="text-sm text-[var(--color-text)]">
            {booking.customer.email}
          </p>
        </div>

        {payment && (
          <div className="border-t border-[var(--color-border)] pt-4">
            <p className="text-xs font-medium uppercase text-[var(--color-text-light)]">
              Payment
            </p>
            <p className="text-sm font-medium text-[var(--color-text)]">
              ${Number(payment.amount).toFixed(2)} &mdash;{" "}
              <span className="capitalize">
                {payment.status.toLowerCase()}
              </span>
            </p>
          </div>
        )}

        {/* Policies */}
        {client.businessSettings && (
          <div className="border-t border-[var(--color-border)] pt-4">
            <p className="text-xs font-medium uppercase text-[var(--color-text-light)]">
              Policies
            </p>
            <div className="mt-2 space-y-2 text-xs text-[var(--color-text-light)]">
              {client.businessSettings.cancellationPolicy && (
                <p>
                  <strong>Cancellation:</strong>{" "}
                  {client.businessSettings.cancellationPolicy}
                </p>
              )}
              {client.businessSettings.latePolicy && (
                <p>
                  <strong>Late Arrival:</strong>{" "}
                  {client.businessSettings.latePolicy}
                </p>
              )}
              {client.businessSettings.noShowPolicy && (
                <p>
                  <strong>No Show:</strong>{" "}
                  {client.businessSettings.noShowPolicy}
                </p>
              )}
              {client.businessSettings.depositPolicy && (
                <p>
                  <strong>Deposit:</strong>{" "}
                  {client.businessSettings.depositPolicy}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Address */}
        {client.businessSettings?.address && (
          <div className="border-t border-[var(--color-border)] pt-4">
            <p className="text-xs font-medium uppercase text-[var(--color-text-light)]">
              Location
            </p>
            <p className="text-sm text-[var(--color-text)]">
              {client.businessSettings.address}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link
          href={`/${clientSlug}`}
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          Book Another Appointment
        </Link>
      </div>
    </div>
  );
}
