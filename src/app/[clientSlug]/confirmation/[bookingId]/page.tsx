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

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-center">
      {/* Status icon */}
      {isConfirmed && (
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-3xl text-white">
          &#10003;
        </div>
      )}

      {isPending && (
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-3xl text-white">
          &#8987;
        </div>
      )}

      {/* Heading */}
      <h2 className="mb-2 text-2xl font-bold text-[var(--color-primary)]">
        {isConfirmed ? "Booking Confirmed!" : isPending ? "Payment Processing" : `Status: ${booking.status.replace("_", " ")}`}
      </h2>
      <p className="text-[var(--color-text)]">
        Thank you, <span className="font-semibold text-[var(--color-primary)]">{booking.customer.fullName}</span>!
      </p>
      <p className="mb-8 text-sm text-[var(--color-text-light)]">
        {isConfirmed
          ? "Your appointment has been successfully booked. We can't wait to see you!"
          : "Your payment is being processed. You'll receive a confirmation email shortly."}
      </p>

      {/* Appointment details card */}
      <div className="rounded-2xl bg-white p-6 text-left shadow-sm">
        <h3 className="mb-4 font-semibold text-[var(--color-text)]">
          Appointment Details
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between border-b border-dashed border-[var(--color-border)] pb-3">
            <span className="text-sm text-[var(--color-text-light)]">Service</span>
            <span className="font-medium text-[var(--color-text)]">{booking.service.name}</span>
          </div>
          <div className="flex justify-between border-b border-dashed border-[var(--color-border)] pb-3">
            <span className="text-sm text-[var(--color-text-light)]">Duration</span>
            <span className="font-medium text-[var(--color-text)]">{booking.service.durationMinutes} minutes</span>
          </div>
          <div className="flex justify-between border-b border-dashed border-[var(--color-border)] pb-3">
            <span className="text-sm text-[var(--color-text-light)]">Date</span>
            <span className="font-medium text-[var(--color-text)]">{dateStr}</span>
          </div>
          <div className="flex justify-between border-b border-dashed border-[var(--color-border)] pb-3">
            <span className="text-sm text-[var(--color-text-light)]">Time</span>
            <span className="font-medium text-[var(--color-text)]">{timeStr}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="font-semibold text-[var(--color-text)]">Total Amount</span>
            <span className="text-lg font-bold text-[var(--color-primary)]">
              ${Number(booking.service.price).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-blue-50 px-5 py-4 text-left">
          <p className="text-xs text-blue-600">Confirmation email sent to:</p>
          <p className="font-medium text-blue-800">{booking.customer.email}</p>
        </div>
        {client.businessSettings?.address && (
          <div className="rounded-xl bg-green-50 px-5 py-4 text-left">
            <p className="text-xs text-green-600">Location:</p>
            <p className="font-medium text-green-800">{client.businessSettings.address}</p>
          </div>
        )}
      </div>

      {/* Book another */}
      <Link
        href={`/${clientSlug}`}
        className="mt-8 inline-block w-full rounded-xl bg-[var(--color-primary)] px-8 py-3.5 text-center font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
      >
        Book Another Appointment
      </Link>

      {client.businessSettings?.phone && (
        <p className="mt-4 text-sm text-[var(--color-text-light)]">
          Need to make changes? Contact us at {client.businessSettings.phone}
        </p>
      )}
    </div>
  );
}
