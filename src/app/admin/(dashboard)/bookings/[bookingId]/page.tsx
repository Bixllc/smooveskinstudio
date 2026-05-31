import { redirect, notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { BookingActions } from "./booking-actions";
import { parseFields, parseAnswers } from "@/lib/forms";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { bookingId } = await params;

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, clientId: session.clientId },
    include: {
      service: { select: { name: true, durationMinutes: true, price: true } },
      customer: { select: { fullName: true, email: true, phone: true } },
      payments: { select: { amount: true, status: true, paidAt: true } },
    },
  });

  if (!booking) notFound();

  const [settings, formSubmissions] = await Promise.all([
    prisma.businessSettings.findUnique({
      where: { clientId: session.clientId },
      select: { timezone: true },
    }),
    prisma.formSubmission.findMany({
      where: { bookingId },
      include: {
        formTemplate: { select: { name: true, type: true, fields: true } },
      },
      orderBy: { submittedAt: "asc" },
    }),
  ]);

  const timezone = settings?.timezone ?? "America/New_York";
  const zonedStart = toZonedTime(booking.startTimeUtc, timezone);
  const zonedEnd = toZonedTime(booking.endTimeUtc, timezone);

  return (
    <div className="max-w-2xl">
      <a
        href="/admin/bookings"
        className="mb-4 inline-block text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)]"
      >
        &larr; Back to Bookings
      </a>

      <h2 className="mb-6 text-2xl font-semibold text-[var(--color-text)]">
        Booking Details
      </h2>

      <div className="space-y-6 rounded-xl border border-[var(--color-border)] bg-white p-6">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-[var(--color-text-light)]">
              Status
            </p>
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {booking.status.replace("_", " ")}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-[var(--color-text-light)]">
              Payment
            </p>
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {booking.paymentStatus}
            </p>
          </div>
        </div>

        {/* Customer */}
        <div>
          <p className="text-xs font-medium uppercase text-[var(--color-text-light)]">
            Customer
          </p>
          <p className="text-sm font-medium text-[var(--color-text)]">
            {booking.customer.fullName}
          </p>
          <p className="text-sm text-[var(--color-text-light)]">
            {booking.customer.email}
          </p>
          {booking.customer.phone && (
            <p className="text-sm text-[var(--color-text-light)]">
              {booking.customer.phone}
            </p>
          )}
        </div>

        {/* Service */}
        <div>
          <p className="text-xs font-medium uppercase text-[var(--color-text-light)]">
            Service
          </p>
          <p className="text-sm font-medium text-[var(--color-text)]">
            {booking.service.name}
          </p>
          <p className="text-sm text-[var(--color-text-light)]">
            {booking.service.durationMinutes} min &middot; $
            {Number(booking.service.price).toFixed(2)}
          </p>
        </div>

        {/* Date & Time */}
        <div>
          <p className="text-xs font-medium uppercase text-[var(--color-text-light)]">
            Date & Time
          </p>
          <p className="text-sm font-medium text-[var(--color-text)]">
            {format(zonedStart, "EEEE, MMMM d, yyyy")}
          </p>
          <p className="text-sm text-[var(--color-text-light)]">
            {format(zonedStart, "h:mm a")} &ndash; {format(zonedEnd, "h:mm a")}
          </p>
        </div>

        {/* Payment info */}
        {booking.payments.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase text-[var(--color-text-light)]">
              Payment Details
            </p>
            {booking.payments.map((payment, i) => (
              <p key={i} className="text-sm text-[var(--color-text)]">
                ${Number(payment.amount).toFixed(2)} &mdash; {payment.status}
                {payment.paidAt &&
                  ` (${format(toZonedTime(payment.paidAt, timezone), "MMM d, h:mm a")})`}
              </p>
            ))}
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div>
            <p className="text-xs font-medium uppercase text-[var(--color-text-light)]">
              Notes
            </p>
            <p className="text-sm text-[var(--color-text)]">{booking.notes}</p>
          </div>
        )}

        {/* Form Submissions */}
        {formSubmissions.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase text-[var(--color-text-light)]">
              Form Submissions
            </p>
            <div className="mt-2 space-y-4">
              {formSubmissions.map((sub) => {
                const fields = parseFields(sub.formTemplate.fields);
                const answers = parseAnswers(sub.answers);
                return (
                  <div
                    key={sub.id}
                    className="rounded-lg border border-[var(--color-border)] p-4"
                  >
                    <p className="mb-3 text-sm font-medium text-[var(--color-text)]">
                      {sub.formTemplate.name}
                    </p>
                    <div className="space-y-3">
                      {fields.map((field) => {
                        const answer = answers[field.id];
                        return (
                          <div key={field.id}>
                            <p className="text-xs font-medium text-[var(--color-text-light)]">
                              {field.label}
                            </p>
                            {field.type === "signature" ? (
                              answer ? (
                                <img
                                  src={String(answer)}
                                  alt="Signature"
                                  className="mt-1 max-h-24 rounded border border-[var(--color-border)]"
                                />
                              ) : (
                                <p className="text-sm text-[var(--color-text-light)]">
                                  No signature
                                </p>
                              )
                            ) : field.type === "checkbox" ? (
                              <p className="text-sm text-[var(--color-text)]">
                                {answer === true ? "Yes" : "No"}
                              </p>
                            ) : (
                              <p className="text-sm text-[var(--color-text)]">
                                {answer !== undefined && answer !== null
                                  ? String(answer)
                                  : "—"}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <BookingActions bookingId={booking.id} currentStatus={booking.status} />
    </div>
  );
}
